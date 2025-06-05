import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ApiStackProps } from '../types';

export class ApiStack extends Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `${props.projectName}-api-${props.stage}`,
      description: `Career.fm API - ${props.stage}`,
      deployOptions: {
        stageName: props.stage,
        tracingEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: props.stage !== 'prod',
        metricsEnabled: true,
        throttlingBurstLimit: 1000,
        throttlingRateLimit: 500,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: this.getAllowedOrigins(props.stage),
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // Cognito Authorizer (temporarily commented out)
    // const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
    //   cognitoUserPools: [props.userPool],
    //   authorizerName: `${props.projectName}-authorizer-${props.stage}`,
    // });

    // Lambda Layer for shared code (temporarily commented out)
    // const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
    //   code: lambda.Code.fromAsset('../packages/backend/dist/layers/shared'),
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    //   description: 'Shared utilities and libraries',
    // });

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions
    props.audioCardTable.grantReadWriteData(lambdaRole);
    
    // S3 permissions
    props.audioBucket.grantReadWrite(lambdaRole);

    // API Resources (temporarily commented out until backend is implemented)
    // const v1 = this.api.root.addResource('v1');
    
    // // Auth endpoints
    // const auth = v1.addResource('auth');
    // this.addAuthEndpoints(auth, lambdaRole, sharedLayer, props);

    // // User endpoints
    // const users = v1.addResource('users');
    // this.addUserEndpoints(users, lambdaRole, sharedLayer, props, authorizer);

    // // Card endpoints
    // const cards = v1.addResource('cards');
    // this.addCardEndpoints(cards, lambdaRole, sharedLayer, props, authorizer);

    // // Upload endpoints
    // const upload = v1.addResource('upload');
    // this.addUploadEndpoints(upload, lambdaRole, sharedLayer, props, authorizer);

    // Health check (simple inline version)
    const health = this.api.root.addResource('health');
    const healthLambda = new lambda.Function(this, 'HealthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              stage: process.env.STAGE || 'unknown'
            })
          };
        };
      `),
      environment: {
        STAGE: props.stage,
      },
      timeout: cdk.Duration.seconds(10),
    });
    
    health.addMethod('GET', new apigateway.LambdaIntegration(healthLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      exportName: `${props.projectName}-${props.stage}-api-url`,
    });
  }

  private addAuthEndpoints(
    auth: apigateway.IResource,
    role: iam.IRole,
    layer: lambda.ILayerVersion,
    props: ApiStackProps
  ) {
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'auth.handler',
      code: lambda.Code.fromAsset('../packages/backend/dist/functions'),
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        STAGE: props.stage,
      },
      role,
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
    });

    auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(authFunction));
    auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(authFunction));
    auth.addResource('refresh').addMethod('POST', new apigateway.LambdaIntegration(authFunction));
    auth.addResource('logout').addMethod('DELETE', new apigateway.LambdaIntegration(authFunction));
  }

  private addUserEndpoints(
    users: apigateway.IResource,
    role: iam.IRole,
    layer: lambda.ILayerVersion,
    props: ApiStackProps,
    authorizer: apigateway.IAuthorizer
  ) {
    const userFunction = new lambda.Function(this, 'UserFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.handler',
      code: lambda.Code.fromAsset('../packages/backend/dist/functions'),
      environment: {
        TABLE_NAME: props.audioCardTable.tableName,
        STAGE: props.stage,
      },
      role,
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
    });

    const me = users.addResource('me');
    me.addMethod('GET', new apigateway.LambdaIntegration(userFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    me.addMethod('PUT', new apigateway.LambdaIntegration(userFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    me.addMethod('DELETE', new apigateway.LambdaIntegration(userFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }

  private addCardEndpoints(
    cards: apigateway.IResource,
    role: iam.IRole,
    layer: lambda.ILayerVersion,
    props: ApiStackProps,
    authorizer: apigateway.IAuthorizer
  ) {
    const cardFunction = new lambda.Function(this, 'CardFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'cards.handler',
      code: lambda.Code.fromAsset('../packages/backend/dist/functions'),
      environment: {
        TABLE_NAME: props.audioCardTable.tableName,
        BUCKET_NAME: props.audioBucket.bucketName,
        STAGE: props.stage,
      },
      role,
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
    });

    // List cards
    cards.addMethod('GET', new apigateway.LambdaIntegration(cardFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Create card
    cards.addMethod('POST', new apigateway.LambdaIntegration(cardFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Single card operations
    const cardId = cards.addResource('{cardId}');
    cardId.addMethod('GET', new apigateway.LambdaIntegration(cardFunction));
    cardId.addMethod('PUT', new apigateway.LambdaIntegration(cardFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    cardId.addMethod('DELETE', new apigateway.LambdaIntegration(cardFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }

  private addUploadEndpoints(
    upload: apigateway.IResource,
    role: iam.IRole,
    layer: lambda.ILayerVersion,
    props: ApiStackProps,
    authorizer: apigateway.IAuthorizer
  ) {
    const uploadFunction = new lambda.Function(this, 'UploadFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'upload.handler',
      code: lambda.Code.fromAsset('../packages/backend/dist/functions'),
      environment: {
        BUCKET_NAME: props.audioBucket.bucketName,
        STAGE: props.stage,
      },
      role,
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
    });

    upload.addResource('presigned-url').addMethod('POST', 
      new apigateway.LambdaIntegration(uploadFunction), {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    upload.addResource('complete').addMethod('POST', 
      new apigateway.LambdaIntegration(uploadFunction), {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
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