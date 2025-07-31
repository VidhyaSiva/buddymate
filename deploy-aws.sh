#!/bin/bash

# AWS Deployment Script for BuddyMate
# Usage: ./deploy-aws.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BUCKET_NAME=${1:-"your-unique-bucket-name"}
CLOUDFRONT_ID=${2:-""}

echo -e "${GREEN}🚀 Starting AWS Deployment for BuddyMate${NC}"
echo "=========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building application...${NC}"
npm run build:aws

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}🌐 Deploying to S3 bucket: ${BUCKET_NAME}${NC}"

# Check if bucket exists, create if it doesn't
if ! aws s3 ls "s3://${BUCKET_NAME}" &> /dev/null; then
    echo -e "${YELLOW}📦 Creating S3 bucket: ${BUCKET_NAME}${NC}"
    aws s3 mb "s3://${BUCKET_NAME}"
    
    # Enable static website hosting
    aws s3 website "s3://${BUCKET_NAME}" --index-document index.html --error-document index.html
    
    echo -e "${YELLOW}🔒 Setting up bucket policy...${NC}"
    # Create bucket policy
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket "${BUCKET_NAME}" --policy file://bucket-policy.json
    rm bucket-policy.json
fi

# Sync files to S3
aws s3 sync dist/ "s3://${BUCKET_NAME}" --delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment to S3 completed successfully${NC}"
else
    echo -e "${RED}❌ Deployment to S3 failed${NC}"
    exit 1
fi

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_ID" ]; then
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_ID}" --paths "/*"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ CloudFront cache invalidation completed${NC}"
    else
        echo -e "${RED}❌ CloudFront cache invalidation failed${NC}"
    fi
fi

# Get the website URL
REGION=$(aws configure get region)
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=========================================="
echo -e "${GREEN}🌐 Your app is now live at:${NC}"
echo -e "${YELLOW}   ${WEBSITE_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Set up CloudFront for better performance"
echo "2. Configure a custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Review the AWS_DEPLOYMENT_GUIDE.md for more details"
echo ""
echo -e "${GREEN}💰 Estimated cost: $1-5/month${NC}" 