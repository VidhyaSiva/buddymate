# AWS Deployment Guide for BuddyMate

This guide will help you deploy your BuddyMate application to AWS using S3 + CloudFront for optimal performance and cost-effectiveness.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI
3. **Node.js**: Ensure you have Node.js installed (already done)

## Step 1: Install AWS CLI

### macOS (using Homebrew):
```bash
brew install awscli
```

### Or download from AWS:
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

## Step 2: Configure AWS CLI

```bash
aws configure
```

You'll need to enter:
- **AWS Access Key ID**: Your AWS access key (get from AWS Console)
- **AWS Secret Access Key**: Your AWS secret key (get from AWS Console)
- **Default region**: Your preferred region (e.g., `us-east-1`)
- **Default output format**: `json`

## Step 3: Create S3 Bucket

```bash
# Replace 'your-unique-bucket-name' with a globally unique name
aws s3 mb s3://buddy-mate

# Enable static website hosting
aws s3 website s3://buddy-mate --index-document index.html --error-document index.html
```

## Step 4: Configure S3 Bucket Policy

Create a file named `bucket-policy.json`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::buddy-mate/*"
        }
    ]
}
```

Apply the policy:
```bash
aws s3api put-bucket-policy --bucket your-unique-bucket-name --policy file://bucket-policy.json
```

## Step 5: Build and Deploy

### Install additional dependencies:
```bash
npm install --save-dev terser-webpack-plugin css-minimizer-webpack-plugin
```

### Build the application:
```bash
npm run build:aws
```

### Deploy to S3:
```bash
aws s3 sync dist/ s3://your-unique-bucket-name --delete
```

## Step 6: Set up CloudFront (Optional but Recommended)

### Create CloudFront Distribution:

1. Go to AWS CloudFront console
2. Click "Create Distribution"
3. Set **Origin Domain** to your S3 bucket website endpoint
4. Set **Default Root Object** to `index.html`
5. Configure **Error Pages**:
   - HTTP Error Code: `403`
   - Response Page Path: `/index.html`
   - Response Code: `200`
6. Click "Create Distribution"

### Update your deployment script:

Edit `package.json` and update the deploy script:
```json
{
  "scripts": {
    "deploy:aws": "npm run build:aws && aws s3 sync dist/ s3://your-unique-bucket-name --delete && aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'"
  }
}
```

## Step 7: Environment Variables (Optional)

If you need environment variables, create a `.env.production` file:

```env
REACT_APP_API_URL=https://your-api-endpoint.com
REACT_APP_ENVIRONMENT=production
```

## Step 8: Custom Domain (Optional)

### Using Route 53:

1. Register a domain in Route 53 or transfer existing domain
2. Create an SSL certificate in AWS Certificate Manager
3. Update CloudFront distribution to use your custom domain
4. Update Route 53 to point to CloudFront distribution

## Deployment Commands

### Quick Deploy:
```bash
npm run deploy:aws
```

### Manual Deploy:
```bash
# Build
npm run build:aws

# Deploy to S3
aws s3 sync dist/ s3://your-unique-bucket-name --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'
```

## Cost Estimation

### S3 Storage:
- ~50MB for your app: $0.023/month

### CloudFront:
- Free tier: 1TB data transfer/month
- Additional: $0.085/GB

### Total estimated cost: $1-5/month

## Security Best Practices

1. **Enable S3 Bucket Versioning**:
```bash
aws s3api put-bucket-versioning --bucket your-unique-bucket-name --versioning-configuration Status=Enabled
```

2. **Enable S3 Bucket Encryption**:
```bash
aws s3api put-bucket-encryption --bucket your-unique-bucket-name --server-side-encryption-configuration '{
    "Rules": [
        {
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }
    ]
}'
```

3. **Set up CloudTrail** for monitoring:
```bash
aws cloudtrail create-trail --name buddy-mate-trail --s3-bucket-name your-logging-bucket
```

## Monitoring and Analytics

### Set up CloudWatch Alarms:
```bash
# Monitor S3 bucket size
aws cloudwatch put-metric-alarm \
    --alarm-name "S3BucketSize" \
    --alarm-description "Monitor S3 bucket size" \
    --metric-name "BucketSizeBytes" \
    --namespace "AWS/S3" \
    --statistic "Average" \
    --period 300 \
    --threshold 1000000000 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 2
```

## Troubleshooting

### Common Issues:

1. **403 Forbidden Error**:
   - Check bucket policy
   - Ensure bucket is configured for static website hosting

2. **CORS Issues**:
   - Add CORS configuration to S3 bucket if needed

3. **CloudFront Not Updating**:
   - Create invalidation: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/*'`

4. **Build Errors**:
   - Check Node.js version compatibility
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Next Steps

1. **Set up CI/CD** with GitHub Actions
2. **Configure monitoring** with CloudWatch
3. **Set up alerts** for downtime
4. **Implement backup strategy**
5. **Add analytics** (Google Analytics, AWS Pinpoint)

## Support

For AWS-specific issues:
- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: https://aws.amazon.com/support/

For application-specific issues:
- Check the logs in CloudWatch
- Review the `.kiro/` documentation files 