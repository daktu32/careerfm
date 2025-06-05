import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { FrontendStackProps } from '../types';

export class FrontendStack extends Stack {
  public readonly distribution: cloudfront.IDistribution;
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3 bucket for static website hosting
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${props.projectName}-frontend-${props.stage}-${props.env?.account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: props.stage === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== 'prod',
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${props.projectName} ${props.stage}`,
    });

    // Grant read permissions to CloudFront
    this.bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [this.bucket.arnForObjects('*')],
      principals: [originAccessIdentity.grantPrincipal],
    }));

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      domainNames: this.getDomainNames(props.stage),
      certificate: undefined, // TODO: Add ACM certificate
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(this.bucket, {
          originAccessIdentity,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new cloudfrontOrigins.HttpOrigin(
            cdk.Fn.select(2, cdk.Fn.split('/', props.api.url))
          ),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      enabled: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // Deploy site contents
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../packages/frontend/out')],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    // Environment config file deployment
    const envConfig = {
      NEXT_PUBLIC_API_URL: props.api.url,
      NEXT_PUBLIC_USER_POOL_ID: props.userPoolId,
      NEXT_PUBLIC_USER_POOL_CLIENT_ID: props.userPoolClientId,
      NEXT_PUBLIC_STAGE: props.stage,
    };

    new s3deploy.BucketDeployment(this, 'DeployEnvConfig', {
      sources: [
        s3deploy.Source.jsonData('config.json', envConfig),
      ],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/config.json'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      exportName: `${props.projectName}-${props.stage}-distribution-url`,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      exportName: `${props.projectName}-${props.stage}-frontend-bucket`,
    });
  }

  private getDomainNames(stage: string): string[] | undefined {
    if (stage === 'prod') {
      return ['career.fm', 'www.career.fm'];
    } else if (stage === 'staging') {
      return ['staging.career.fm'];
    }
    return undefined;
  }
}