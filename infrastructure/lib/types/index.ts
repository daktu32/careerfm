import { StackProps } from 'aws-cdk-lib';
import { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

export interface BaseStackProps extends StackProps {
  stage: string;
  projectName: string;
}

export interface AuthStackProps extends BaseStackProps {}

export interface StorageStackProps extends BaseStackProps {}

export interface ApiStackProps extends BaseStackProps {
  userPool: IUserPool;
  audioCardTable: Table;
  audioBucket: IBucket;
}

export interface FrontendStackProps extends BaseStackProps {
  api: RestApi;
  userPoolId: string;
  userPoolClientId: string;
}

export interface MonitoringStackProps extends BaseStackProps {
  api: RestApi;
  audioCardTable: Table;
}