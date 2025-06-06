import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN!,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN!],
          redirectSignOut: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT!],
          responseType: 'code' as const,
        },
        username: true,
        email: true,
      },
    },
  },
  API: {
    REST: {
      careerfmApi: {
        endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
        region: process.env.NEXT_PUBLIC_AWS_REGION!,
      },
    },
  },
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET!,
      region: process.env.NEXT_PUBLIC_AWS_REGION!,
    },
  },
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;