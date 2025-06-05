import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { StorageStackProps } from '../types';

export class StorageStack extends Stack {
  public readonly audioBucket: s3.IBucket;
  public readonly audioCardTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    // S3 Bucket for audio files
    this.audioBucket = new s3.Bucket(this, 'AudioBucket', {
      bucketName: `${props.projectName}-audio-${props.stage}-${props.env?.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: this.getAllowedOrigins(props.stage),
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'delete-incomplete-multipart-uploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      removalPolicy: props.stage === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== 'prod',
    });

    // DynamoDB Table for Audio Cards
    this.audioCardTable = new dynamodb.Table(this, 'AudioCardTable', {
      tableName: `${props.projectName}-audio-cards-${props.stage}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: props.stage === 'prod' 
        ? dynamodb.BillingMode.PAY_PER_REQUEST
        : dynamodb.BillingMode.PROVISIONED,
      readCapacity: props.stage === 'prod' ? undefined : 5,
      writeCapacity: props.stage === 'prod' ? undefined : 5,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: props.stage === 'prod',
      },
      removalPolicy: props.stage === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI for public cards
    this.audioCardTable.addGlobalSecondaryIndex({
      indexName: 'PublicCardsIndex',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: props.stage === 'prod' ? undefined : 5,
      writeCapacity: props.stage === 'prod' ? undefined : 5,
    });

    // GSI for user cards
    this.audioCardTable.addGlobalSecondaryIndex({
      indexName: 'UserCardsIndex',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: props.stage === 'prod' ? undefined : 5,
      writeCapacity: props.stage === 'prod' ? undefined : 5,
    });

    // Outputs
    new cdk.CfnOutput(this, 'AudioBucketName', {
      value: this.audioBucket.bucketName,
      exportName: `${props.projectName}-${props.stage}-audio-bucket-name`,
    });

    new cdk.CfnOutput(this, 'AudioCardTableName', {
      value: this.audioCardTable.tableName,
      exportName: `${props.projectName}-${props.stage}-audio-card-table-name`,
    });
  }

  private getAllowedOrigins(stage: string): string[] {
    const origins = ['http://localhost:3000'];
    
    if (stage === 'prod') {
      origins.push('https://career.fm');
    } else if (stage === 'staging') {
      origins.push('https://staging.career.fm');
    }
    
    return origins;
  }
}