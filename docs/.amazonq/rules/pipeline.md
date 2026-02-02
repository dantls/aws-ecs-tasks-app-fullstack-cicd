# Pipeline Rules - Tasks Application Project

## Pipeline Definition
When we talk about **pipeline** for this project, we are referring to the combination of:
- **AWS CodePipeline** (orchestration)
- **AWS CodeBuild** (build and deploy)

## Pipeline Architecture

### Main Components
1. **Source Stage:** GitHub as code repository
2. **Build Stage:** CodeBuild for application build
3. **Deploy Stage:** Automatic deploy to S3 (frontend) and Elastic Beanstalk (backend)

### Base Configuration
- **Buildspec:** Configured in `buildspec.yml` files in frontend/ and backend/ directories
- **S3:** Static hosting for React frontend
- **CloudFront:** CDN for frontend distribution
- **ECR:** Container registry for Docker images
- **ECS:** Backend API deployment target with ALB

## Pipeline Flow

### 1. Source (GitHub)
- Automatic trigger on push to main branch
- Webhook configured to detect changes

### 2. Build (CodeBuild)
- Executes commands defined in `buildspec.yml`
- **Frontend:** Build React app and deploy to S3
- **Backend:** Build Docker image, push to ECR, deploy to ECS

### 3. Deploy
- **Frontend:** Sync to S3 + CloudFront invalidation
- **Backend:** Update ECS service with new Docker image from ECR
- Health check of application via ALB

## Important Configurations

### Environment Variables
- Configured in CodeBuild project
- Environment-specific variables (dev/prod)
- **Frontend:**
  - S3_BUCKET_NAME
  - CLOUDFRONT_DISTRIBUTION_ID
- **Backend:**
  - ECR_REPOSITORY_URI
  - ECS_CLUSTER_NAME
  - ECS_SERVICE_NAME
  - AWS_REGION

### IAM Permissions
- CodeBuild role with permissions for:
  - S3 (sync frontend files)
  - CloudFront (cache invalidation)
  - ECR (push Docker images)
  - ECS (update service)
  - Secrets Manager (read database credentials)
  - Parameter Store (read configuration)

### Monitoring
- CloudWatch Logs for build logs
- Build and deploy metrics

## Best Practices

### Performance
- npm dependencies cache
- Docker layer optimization

### Reliability
- Health checks after deploy
- Automatic rollback on failure

## Common Troubleshooting

### Build Failures
- Check CloudWatch logs
- Validate IAM permissions
- Confirm buildspec.yml configuration

### Deploy Issues
- Verify ECS service health checks
- Validate task definition configuration
- Confirm RDS connectivity from ECS tasks
- Check ALB target group health

## Pipeline Evolution

### Initial Phase
- Simple pipeline: Source → Build → Deploy
- Direct deploy to S3 and ECS

### Advanced Phase
- Multiple environments (dev/staging/prod)
- Manual approvals for production
- Automated testing stages
