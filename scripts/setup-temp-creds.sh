#!/bin/bash

# Get temporary credentials from SSO
PROFILE=${1:-AdministratorAccess-875551125050}

# Export credentials
CREDS=$(aws configure export-credentials --profile $PROFILE --format env-no-export)

# Parse credentials
AWS_ACCESS_KEY_ID=$(echo "$CREDS" | grep AWS_ACCESS_KEY_ID | cut -d= -f2)
AWS_SECRET_ACCESS_KEY=$(echo "$CREDS" | grep AWS_SECRET_ACCESS_KEY | cut -d= -f2)
AWS_SESSION_TOKEN=$(echo "$CREDS" | grep AWS_SESSION_TOKEN | cut -d= -f2)

# Create temporary profile
cat >> ~/.aws/credentials << EOF

[careerfm-temp]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
aws_session_token = $AWS_SESSION_TOKEN
EOF

echo "Temporary credentials created as profile 'careerfm-temp'"
echo "Run: cd infrastructure && cdk bootstrap --profile careerfm-temp"