import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { AuthStackProps } from '../types';

export class AuthStack extends Stack {
  public readonly userPool: cognito.IUserPool;
  public readonly userPoolClient: cognito.IUserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${props.projectName}-${props.stage}`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        avatar: new cognito.StringAttribute({ mutable: true }),
        bio: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: props.stage === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // User Pool Domain
    const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: `${props.projectName}-${props.stage}`,
      },
    });

    // User Pool Client (Web App)
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `${props.projectName}-web-${props.stage}`,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: this.getCallbackUrls(props.stage),
        logoutUrls: this.getLogoutUrls(props.stage),
      },
      preventUserExistenceErrors: true,
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
    });

    // OAuth providers will be added later when we have real credentials
    // For now, we'll deploy with basic email/password authentication

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      exportName: `${props.projectName}-${props.stage}-user-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      exportName: `${props.projectName}-${props.stage}-user-pool-client-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolDomainName', {
      value: userPoolDomain.domainName,
      exportName: `${props.projectName}-${props.stage}-user-pool-domain`,
    });
  }

  private getCallbackUrls(stage: string): string[] {
    const urls = ['http://localhost:3000/auth/callback'];
    
    if (stage === 'prod') {
      urls.push('https://career.fm/auth/callback');
    } else if (stage === 'staging') {
      urls.push('https://staging.career.fm/auth/callback');
    }
    
    return urls;
  }

  private getLogoutUrls(stage: string): string[] {
    const urls = ['http://localhost:3000'];
    
    if (stage === 'prod') {
      urls.push('https://career.fm');
    } else if (stage === 'staging') {
      urls.push('https://staging.career.fm');
    }
    
    return urls;
  }
}