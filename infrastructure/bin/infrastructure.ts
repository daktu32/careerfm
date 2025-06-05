#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/auth-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';

const app = new cdk.App();

// 環境設定
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'ap-northeast-1'
};

// 環境名の取得（dev, staging, prod）
const stage = app.node.tryGetContext('stage') || 'dev';
const projectName = 'careerfm';

// 共通タグ
const tags = {
  Project: projectName,
  Stage: stage,
  ManagedBy: 'CDK'
};

// スタックのインスタンス化
const authStack = new AuthStack(app, `${projectName}-auth-${stage}`, {
  env,
  stage,
  projectName,
  tags
});

const storageStack = new StorageStack(app, `${projectName}-storage-${stage}`, {
  env,
  stage,
  projectName,
  tags
});

const apiStack = new ApiStack(app, `${projectName}-api-${stage}`, {
  env,
  stage,
  projectName,
  userPool: authStack.userPool,
  audioCardTable: storageStack.audioCardTable,
  audioBucket: storageStack.audioBucket,
  tags
});

// Temporarily commented out until frontend is implemented
// const frontendStack = new FrontendStack(app, `${projectName}-frontend-${stage}`, {
//   env,
//   stage,
//   projectName,
//   api: apiStack.api,
//   userPoolId: authStack.userPool.userPoolId,
//   userPoolClientId: authStack.userPoolClient.userPoolClientId,
//   tags
// });

// const monitoringStack = new MonitoringStack(app, `${projectName}-monitoring-${stage}`, {
//   env,
//   stage,
//   projectName,
//   api: apiStack.api,
//   audioCardTable: storageStack.audioCardTable,
//   tags
// });

// スタック間の依存関係設定
apiStack.addDependency(authStack);
apiStack.addDependency(storageStack);
// frontendStack.addDependency(apiStack);
// monitoringStack.addDependency(apiStack);
// monitoringStack.addDependency(storageStack);