import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuthStack } from '../lib/stacks/auth-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { ApiStack } from '../lib/stacks/api-stack';

describe('Infrastructure Stacks', () => {
  test('AuthStack creates Cognito User Pool', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'TestAuthStack', {
      env: { account: '123456789012', region: 'ap-northeast-1' },
      stage: 'test',
      projectName: 'careerfm',
    });
    
    const template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolName: 'careerfm-test',
    });
  });

  test('StorageStack creates S3 Bucket and DynamoDB Table', () => {
    const app = new cdk.App();
    const stack = new StorageStack(app, 'TestStorageStack', {
      env: { account: '123456789012', region: 'ap-northeast-1' },
      stage: 'test',
      projectName: 'careerfm',
    });
    
    const template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'careerfm-audio-test-123456789012',
    });
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'careerfm-audio-cards-test',
    });
  });

  test('ApiStack creates HealthFunction and GET /health endpoint', () => {
    const app = new cdk.App();

    const auth = new AuthStack(app, 'MockAuthStack', {
      env: { account: '123456789012', region: 'ap-northeast-1' },
      stage: 'test',
      projectName: 'careerfm',
    });

    const storage = new StorageStack(app, 'MockStorageStack', {
      env: { account: '123456789012', region: 'ap-northeast-1' },
      stage: 'test',
      projectName: 'careerfm',
    });

    const stack = new ApiStack(app, 'TestApiStack', {
      env: { account: '123456789012', region: 'ap-northeast-1' },
      stage: 'test',
      projectName: 'careerfm',
      userPool: auth.userPool,
      audioBucket: storage.audioBucket,
      audioCardTable: storage.audioCardTable,
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'nodejs18.x',
    });

    const healthResourceId = template.getResourceId('AWS::ApiGateway::Resource', {
      Properties: { PathPart: 'health' }
    });

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      ResourceId: { Ref: healthResourceId },
    });
  });
});