import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuthStack } from '../lib/stacks/auth-stack';
import { StorageStack } from '../lib/stacks/storage-stack';

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
});