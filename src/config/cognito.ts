// Cognito User Pool config. Sourced from CDK outputs and the deployed account.
// Override at build time via .env / app.json extra if you want.
export const cognitoConfig = {
  userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? 'ap-southeast-2_2LDJB1VZw',
  userPoolClientId:
    process.env.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? 'l0qll7o5i4ksigjr29so222bb',
  region: process.env.EXPO_PUBLIC_AWS_REGION ?? 'ap-southeast-2',
};
