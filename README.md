# Tasks Application - Full Stack CI/CD on AWS

Complete full-stack application with automated CI/CD pipeline deploying to AWS ECS (backend) and S3 (frontend).

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│ CodePipeline │─────▶│  CodeBuild  │
│ Repository  │      │              │      │  (Backend)  │
└─────────────┘      └──────────────┘      └──────┬──────┘
                            │                      │
                            │                      ▼
                            │              ┌─────────────┐
                            │              │     ECR     │
                            │              │   (Docker)  │
                            │              └──────┬──────┘
                            │                     │
                            │                     ▼
                            │              ┌─────────────┐
                            │              │     ECS     │
                            │              │  (Backend)  │
                            │              └──────┬──────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌─────────────┐
                     │  CodeBuild   │     │     ALB     │
                     │  (Frontend)  │     │  (Public)   │
                     └──────┬───────┘     └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │      S3      │
                     │  (Frontend)  │
                     └──────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18 (Alpine)
- **Framework**: Express.js
- **Database**: PostgreSQL (RDS)
- **Container**: Docker
- **Hosting**: AWS ECS (EC2 launch type)
- **Load Balancer**: Application Load Balancer
- **Image Registry**: Amazon ECR

### Frontend
- **Framework**: React 18
- **Build Tool**: Create React App
- **Hosting**: Amazon S3 (Static Website)
- **State Management**: React Hooks

### CI/CD
- **Source Control**: GitHub
- **Pipeline**: AWS CodePipeline
- **Build**: AWS CodeBuild
- **Deployment**: Automated (ECS + S3)

## Project Structure

```
.
├── tasks-app/
│   ├── backend/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   ├── config/
│   │   ├── aws/
│   │   │   └── task-definition.json
│   │   ├── buildspec.yml
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── index.js
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── App.js
│       │   └── index.js
│       ├── public/
│       ├── buildspec.yml
│       └── package.json
└── infrastructure/
    └── pipeline/
        └── codepipeline.yml
```

## AWS Resources

### Compute
- **ECS Cluster**: `cluster-alb-tasks`
- **ECS Service**: `service-alb-tasks`
- **Task Definition**: `task-def-alb-tasks`
- **EC2 Instances**: 2x t3.micro

### Networking
- **ALB**: `alb-tasks`
- **Target Group**: `tg-bia`
- **Health Check**: `/api/tasks` (30s interval)
- **Deregistration Delay**: 30 seconds

### Storage & Registry
- **ECR Repository**: `tasks-app`
- **S3 Bucket**: `tasks-app-frontend-prod`
- **RDS Database**: PostgreSQL

### CI/CD
- **Pipeline**: `tasks-pipeline-ecs`
- **Backend Build**: `tasks-backend-build`
- **Frontend Build**: `tasks-frontend-build`

### Configuration (SSM Parameters)
- `/tasks-app/prod/ecr-repository-uri`
- `/tasks-app/prod/ecs-cluster`
- `/tasks-app/prod/ecs-service`
- `/tasks-app/prod/api-url`
- `/tasks-app/prod/db-username`
- `/tasks-app/prod/db-password`
- `/tasks-app/prod/db-host`
- `/tasks-app/prod/db-name`
- `/tasks-app/frontend/s3-bucket`

## Deployment Flow

### 1. Source Stage
- Triggered by push to `main` branch
- GitHub webhook notifies CodePipeline
- Source code downloaded as artifact

### 2. Build Stage (Parallel)

#### Backend Build
1. Login to Amazon ECR
2. Build Docker image with commit hash tag
3. Push to ECR (`:latest` and `:commit-hash`)
4. Register new ECS task definition
5. Update ECS service with new task definition
6. Generate `imagedefinitions.json` artifact

#### Frontend Build
1. Fetch API URL from SSM Parameter Store
2. Install npm dependencies
3. Build React application (production mode)
4. Sync build files to S3 bucket
5. Generate build artifacts

### 3. Deploy Stage
- ECS performs rolling update (30s deregistration delay)
- New tasks start with updated Docker image
- Old tasks drain connections and terminate
- Frontend immediately available on S3

## Build Configuration

### Backend (`tasks-app/backend/buildspec.yml`)

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo "Logging in to Amazon ECR..."
      - aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - export IMAGE_TAG=${COMMIT_HASH:=latest}

  build:
    commands:
      - cd tasks-app/backend
      - docker build -t $ECR_REPOSITORY_URI:latest .
      - docker tag $ECR_REPOSITORY_URI:latest $ECR_REPOSITORY_URI:$IMAGE_TAG

  post_build:
    commands:
      - docker push $ECR_REPOSITORY_URI:latest
      - docker push $ECR_REPOSITORY_URI:$IMAGE_TAG
      - sed "s|IMAGE_TAG|$IMAGE_TAG|g" aws/task-definition.json > /tmp/task-def.json
      - NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file:///tmp/task-def.json --query 'taskDefinition.taskDefinitionArn' --output text)
      - aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --task-definition $NEW_TASK_DEF_ARN
      - printf '[{"name":"tasks","imageUri":"%s"}]' $ECR_REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json

env:
  parameter-store:
    ECR_REPOSITORY_URI: /tasks-app/prod/ecr-repository-uri
    ECS_CLUSTER_NAME: /tasks-app/prod/ecs-cluster
    ECS_SERVICE_NAME: /tasks-app/prod/ecs-service
```

### Frontend (`tasks-app/frontend/buildspec.yml`)

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18

  pre_build:
    commands:
      - export REACT_APP_API_URL=$(aws ssm get-parameter --name /tasks-app/prod/api-url --query Parameter.Value --output text)
      - cd tasks-app/frontend
      - npm install

  build:
    commands:
      - export NODE_OPTIONS=--openssl-legacy-provider
      - npm run build

  post_build:
    commands:
      - aws s3 sync build/ s3://$S3_BUCKET_NAME --delete
      - cd ../..

artifacts:
  files:
    - tasks-app/frontend/build/**/*

env:
  variables:
    NODE_ENV: production
    GENERATE_SOURCEMAP: "false"
    CI: "false"
  parameter-store:
    S3_BUCKET_NAME: /tasks-app/frontend/s3-bucket
```

## Access URLs

- **Frontend**: http://tasks-app-frontend-prod.s3-website-us-east-1.amazonaws.com
- **Backend API**: http://alb-tasks-480038577.us-east-1.elb.amazonaws.com
- **Health Check**: http://alb-tasks-480038577.us-east-1.elb.amazonaws.com/api/tasks

## API Endpoints

### Tasks (English)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:uuid` - Get task by ID
- `PUT /api/tasks/update_priority/:uuid` - Update task priority
- `DELETE /api/tasks/:uuid` - Delete task

### Tarefas (Portuguese)
- `GET /api/tarefas` - List all tasks
- `POST /api/tarefas` - Create new task
- `GET /api/tarefas/:uuid` - Get task by ID
- `PUT /api/tarefas/update_priority/:uuid` - Update task priority
- `DELETE /api/tarefas/:uuid` - Delete task

## Troubleshooting

### Pipeline Failures

#### Check Pipeline Status
```bash
aws codepipeline get-pipeline-state \
  --name tasks-pipeline-ecs \
  --region us-east-1 \
  --query 'stageStates[*].{Stage:stageName,Status:latestExecution.status}' \
  --output table
```

#### Get Build Logs (Backend)
```bash
BUILD_ID=$(aws codebuild list-builds-for-project \
  --project-name tasks-backend-build \
  --region us-east-1 \
  --sort-order DESCENDING \
  --query 'ids[0]' \
  --output text)

aws codebuild batch-get-builds \
  --ids $BUILD_ID \
  --region us-east-1 \
  --query 'builds[0].logs.streamName' \
  --output text | xargs -I {} \
  aws logs get-log-events \
  --log-group-name "/aws/codebuild/tasks-backend-build" \
  --log-stream-name {} \
  --region us-east-1 \
  --start-from-head \
  --query 'events[*].message' \
  --output text
```

#### Get Build Logs (Frontend)
```bash
BUILD_ID=$(aws codebuild list-builds-for-project \
  --project-name tasks-frontend-build \
  --region us-east-1 \
  --sort-order DESCENDING \
  --query 'ids[0]' \
  --output text)

aws codebuild batch-get-builds \
  --ids $BUILD_ID \
  --region us-east-1 \
  --query 'builds[0].logs.streamName' \
  --output text | xargs -I {} \
  aws logs get-log-events \
  --log-group-name "/aws/codebuild/tasks-frontend-build" \
  --log-stream-name {} \
  --region us-east-1 \
  --start-from-head \
  --query 'events[*].message' \
  --output text
```

### ECS Deployment Issues

#### Check Service Status
```bash
aws ecs describe-services \
  --cluster cluster-alb-tasks \
  --services service-alb-tasks \
  --region us-east-1 \
  --query 'services[0].deployments[*].{Status:status,TaskDef:taskDefinition,Running:runningCount,Desired:desiredCount}' \
  --output table
```

#### Check Service Events
```bash
aws ecs describe-services \
  --cluster cluster-alb-tasks \
  --services service-alb-tasks \
  --region us-east-1 \
  --query 'services[0].events[:10].{Time:createdAt,Message:message}' \
  --output table
```

#### Check Task Failures
```bash
TASK_ARN=$(aws ecs list-tasks \
  --cluster cluster-alb-tasks \
  --desired-status STOPPED \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text)

aws ecs describe-tasks \
  --cluster cluster-alb-tasks \
  --tasks $TASK_ARN \
  --region us-east-1 \
  --query 'tasks[0].{StoppedReason:stoppedReason,Container:containers[0].reason}' \
  --output json
```

#### View Container Logs
```bash
aws logs tail /ecs/task-def-alb-tasks \
  --follow \
  --region us-east-1
```

### ECR Issues

#### List Images
```bash
aws ecr describe-images \
  --repository-name tasks-app \
  --region us-east-1 \
  --query 'sort_by(imageDetails, &imagePushedAt)[-5:].{Tags:imageTags,Pushed:imagePushedAt}' \
  --output table
```

#### Check Latest Image
```bash
aws ecr describe-images \
  --repository-name tasks-app \
  --region us-east-1 \
  --query 'sort_by(imageDetails, &imagePushedAt)[-1].imageTags' \
  --output json
```

### S3 Frontend Issues

#### List Bucket Contents
```bash
aws s3 ls s3://tasks-app-frontend-prod/ --recursive --human-readable
```

#### Check Bucket Website Configuration
```bash
aws s3api get-bucket-website \
  --bucket tasks-app-frontend-prod \
  --region us-east-1
```

#### Verify Public Access
```bash
aws s3api get-public-access-block \
  --bucket tasks-app-frontend-prod \
  --region us-east-1
```

### CORS Issues

#### Test CORS Headers
```bash
curl -I -X OPTIONS \
  http://alb-tasks-480038577.us-east-1.elb.amazonaws.com/api/tasks \
  -H "Origin: http://tasks-app-frontend-prod.s3-website-us-east-1.amazonaws.com" \
  -H "Access-Control-Request-Method: GET"
```

#### Check Backend Response Headers
```bash
curl -v http://alb-tasks-480038577.us-east-1.elb.amazonaws.com/api/tasks \
  -H "Origin: http://test.com" 2>&1 | grep -i "access-control"
```

### Database Connection Issues

#### Test Database Connectivity
```bash
# From ECS task (exec into container)
aws ecs execute-command \
  --cluster cluster-alb-tasks \
  --task <TASK_ID> \
  --container tasks \
  --interactive \
  --command "/bin/sh"

# Inside container
nc -zv <DB_HOST> 5432
```

#### Check SSM Parameters
```bash
aws ssm get-parameter \
  --name /tasks-app/prod/db-host \
  --region us-east-1 \
  --query 'Parameter.Value' \
  --output text
```

## Useful Scripts

### Force New Deployment
```bash
aws ecs update-service \
  --cluster cluster-alb-tasks \
  --service service-alb-tasks \
  --force-new-deployment \
  --region us-east-1
```

### Restart Pipeline
```bash
aws codepipeline start-pipeline-execution \
  --name tasks-pipeline-ecs \
  --region us-east-1
```

### Update SSM Parameter
```bash
# Update API URL
aws ssm put-parameter \
  --name /tasks-app/prod/api-url \
  --value "https://api.yourdomain.com" \
  --overwrite \
  --region us-east-1
```

### Scale ECS Service
```bash
aws ecs update-service \
  --cluster cluster-alb-tasks \
  --service service-alb-tasks \
  --desired-count 3 \
  --region us-east-1
```

### Update Target Group Deregistration Delay
```bash
TG_ARN=$(aws elbv2 describe-target-groups \
  --names tg-bia \
  --region us-east-1 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

aws elbv2 modify-target-group-attributes \
  --target-group-arn $TG_ARN \
  --attributes Key=deregistration_delay.timeout_seconds,Value=30 \
  --region us-east-1
```

### Clean Up Old ECR Images
```bash
# Keep only last 10 images
aws ecr list-images \
  --repository-name tasks-app \
  --region us-east-1 \
  --query 'imageIds[:-10]' \
  --output json | jq -r '.[] | .imageDigest' | \
  xargs -I {} aws ecr batch-delete-image \
  --repository-name tasks-app \
  --image-ids imageDigest={} \
  --region us-east-1
```

## Performance Optimization

### Backend
- **Container Resources**: 1024 CPU units, 512 MB memory reservation
- **Health Check**: 30s interval, 2 consecutive successes required
- **Deregistration Delay**: 30s (reduced from 300s default)
- **Docker Image**: Using public ECR to avoid Docker Hub rate limits

### Frontend
- **Build Optimization**: Source maps disabled in production
- **S3 Sync**: `--delete` flag removes old files
- **Node Options**: `--openssl-legacy-provider` for Webpack 4 compatibility

## Security Best Practices

### Secrets Management
- Database credentials stored in SSM Parameter Store (SecureString)
- No hardcoded secrets in code or buildspecs
- IAM roles with least privilege access

### Network Security
- Backend in private subnets (via ECS)
- ALB in public subnets
- Security groups restrict traffic flow
- CORS configured for frontend origin

### Container Security
- Using official Node.js Alpine images
- Regular image updates via CI/CD
- No root user in containers

## Monitoring

### CloudWatch Logs
- **Backend Logs**: `/ecs/task-def-alb-tasks`
- **Backend Build**: `/aws/codebuild/tasks-backend-build`
- **Frontend Build**: `/aws/codebuild/tasks-frontend-build`

### Metrics to Monitor
- ECS CPU/Memory utilization
- ALB target health
- Request count and latency
- 4xx/5xx error rates
- Build success/failure rates

## Cost Optimization

### Current Resources
- 2x t3.micro EC2 instances (ECS)
- 1x Application Load Balancer
- 1x RDS PostgreSQL (db.t3.micro)
- S3 Standard storage
- ECR storage (pay per GB)

### Optimization Tips
- Use ECR lifecycle policies to delete old images
- Enable S3 lifecycle policies for old frontend versions
- Consider Fargate for variable workloads
- Use Reserved Instances for predictable workloads

## Future Enhancements

- [ ] Add CloudFront distribution for frontend
- [ ] Implement custom domain with Route 53
- [ ] Add SSL/TLS certificates (ACM)
- [ ] Implement blue/green deployments
- [ ] Add automated testing in pipeline
- [ ] Implement container insights
- [ ] Add X-Ray tracing
- [ ] Implement auto-scaling policies
- [ ] Add CloudWatch alarms and SNS notifications
- [ ] Implement backup strategy for RDS

## Contributing

1. Create feature branch from `main`
2. Make changes and test locally
3. Push to GitHub
4. Pipeline automatically deploys to production
5. Monitor deployment in AWS Console

## License

This project is part of a DevOps training challenge.

## Support

For issues or questions, check the troubleshooting section above or review CloudWatch logs for detailed error messages.
# aws-ecs-tasks-app-fullstack-cicd
