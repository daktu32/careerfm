#!/bin/bash

# CDK with SSO wrapper script
PROFILE=${1:-AdministratorAccess-875551125050}
shift

# Export AWS credentials from SSO
eval $(aws configure export-credentials --profile $PROFILE --format env-no-export)

# Debug: Check if credentials are set
echo "AWS_ACCESS_KEY_ID is set: ${AWS_ACCESS_KEY_ID:+YES}"
echo "AWS_SECRET_ACCESS_KEY is set: ${AWS_SECRET_ACCESS_KEY:+YES}"
echo "AWS_SESSION_TOKEN is set: ${AWS_SESSION_TOKEN:+YES}"

# Run CDK with the remaining arguments
cd infrastructure && cdk "$@"