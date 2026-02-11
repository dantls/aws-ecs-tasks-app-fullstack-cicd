# 🚀 Tasks App - Full Stack CI/CD on AWS ECS

A production-ready task management application with automated CI/CD pipeline, deployed on AWS using ECS (EC2 launch type), Application Load Balancer, and RDS PostgreSQL.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Infrastructure](#-infrastructure)
- [Getting Started](#-getting-started)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Database Migrations](#-database-migrations)
- [Monitoring](#-monitoring)
- [Cost Optimization](#-cost-optimization)

## 🏗️ Architecture

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              AWS CodePipeline                            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Source  │─▶│ Build Backend│─▶│Build Frontend│     │
│  └──────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────┘
       │                    │                │
       ▼                    ▼                ▼
┌─────────────┐    ┌──────────────┐   ┌──────────┐
│     ECR     │    │  ECS Cluster │   │    S3    │
│  (Backend)  │    │  (EC2 Type)  │   │(Frontend)│
└─────────────┘    └──────┬───────┘   └──────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │     ALB     │
                   │  (Port 80)  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │     RDS     │
                   │ PostgreSQL  │
                   └─────────────┘
```

## ✨ Features

- ✅ **Full Stack Application**: React frontend + Node.js/Express backend
- ✅ **Automated CI/CD**: GitHub → CodePipeline → ECS deployment
- ✅ **High Availability**: Multi-AZ deployment with Application Load Balancer
- ✅ **Database Migrations**: Sequelize ORM with automated migrations
- ✅ **Security**: VPC isolation, Security Groups, Secrets Manager
- ✅ **Scalability**: Auto Scaling Groups for ECS instances
- ✅ **Monitoring**: CloudWatch Logs integration

## 🛠️ Tech Stack

### Frontend
- React 18
- Axios for API calls
- Hosted on S3 Static Website

### Backend
- Node.js 18
- Express.js
- Sequelize ORM
- PostgreSQL
- Docker containerized

### Infrastructure
- **Compute**: ECS (EC2 launch type)
- **Load Balancer**: Application Load Balancer
- **Database**: RDS PostgreSQL
- **Storage**: ECR (Docker images), S3 (frontend)
- **CI/CD**: CodePipeline, CodeBuild
- **Secrets**: AWS Secrets Manager
- **Networking**: VPC with public/private subnets, NAT Gateway, VPC Endpoints

## 🏛️ Infrastructure

### Network Architecture
- **VPC**: Default VPC or custom VPC
- **Public Subnets**: 3 AZs for high availability
- **Internet Gateway**: For ALB public access
- **NAT Gateway**: For private resources outbound access
- **VPC Endpoints**: S3, SSM, Secrets Manager (cost optimization)

### Security Groups
- **ALB SG**: Port 80 from 0.0.0.0/0
- **ECS SG**: All ports from ALB SG
- **RDS SG**: Port 5432 from ECS SG + CodeBuild SG
- **CodeBuild SG**: Outbound to RDS and AWS services

### Key Resources
| Resource | Name/ID | Purpose |
|----------|---------|---------|
| ALB | `alb-tasks` | Load balancer for backend |
| Target Group | `tg-tasks` | ECS tasks registration |
| ECS Cluster | `cluster-alb-tasks` | Container orchestration |
| ECS Service | `task-def-alb-tasks-service` | Service management |
| RDS Instance | `tasks` | PostgreSQL database |
| ECR Repository | `tasks-app-repo` | Docker images |
| S3 Bucket | `tasks-app-frontend-<account-id>` | Frontend hosting |

## 🚀 Getting Started

### Prerequisites
- AWS Account with appropriate permissions
- GitHub repository with AWS CodeConnections configured
- AWS CLI configured locally

### Environment Variables (SSM Parameter Store)
```bash
/tasks-app/prod/ecr-repository-uri
/tasks-app/prod/ecs-cluster
/tasks-app/prod/ecs-service
/tasks-app/prod/api-url
```

### Secrets (AWS Secrets Manager)
```json
{
  "host": "<rds-endpoint>",
  "port": "5432",
  "dbname": "tasks",
  "username": "postgres",
  "password": "<secret>"
}
```

### Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Pipeline automatically triggers**
   - Source stage: Pulls code from GitHub
   - Build Backend: Builds Docker image, pushes to ECR, updates ECS
   - Build Frontend: Builds React app, deploys to S3

3. **Access the application**
   - Frontend: `http://<s3-bucket-name>.s3-website-<region>.amazonaws.com`
   - Backend API: `http://<alb-dns-name>/api/tasks`

## 🔄 CI/CD Pipeline

### Pipeline Stages

#### 1. Source
- **Trigger**: GitHub push to `main` branch
- **Connection**: AWS CodeConnections (GitHub App)
- **Output**: Source code artifact

#### 2. Build Backend
- **CodeBuild Project**: `tasks-app-backend-cicd`
- **Steps**:
  1. Login to ECR
  2. Build Docker image
  3. Tag with commit hash
  4. Push to ECR
  5. Register new ECS task definition
  6. Update ECS service
- **Buildspec**: `tasks-app/backend/buildspec.yml`

#### 3. Build Frontend
- **CodeBuild Project**: `tasks-app-frontend-cicd`
- **Steps**:
  1. Install dependencies
  2. Build React app
  3. Sync to S3 bucket
- **Buildspec**: `tasks-app/frontend/buildspec.yml`

### Build Configuration

**Backend Build Environment**:
- Image: `aws/codebuild/amazonlinux-x86_64-standard:5.0`
- Privileged mode: Enabled (for Docker)
- VPC: Enabled (for RDS access)

**Frontend Build Environment**:
- Image: `aws/codebuild/standard:7.0`
- Node.js 18

## 🗄️ Database Migrations

### Running Migrations

Migrations are managed with Sequelize CLI and can be run via CodeBuild Session Manager:

1. **Start a build with Session Manager enabled**
2. **Connect to the build container**
3. **Run migrations**:
   ```bash
   cd tasks-app/backend
   
   # Export database credentials
   SECRET=$(aws secretsmanager get-secret-value --secret-id tasks-app/prod-ci-cd/database --region us-east-1 --query SecretString --output text)
   export DB_HOST=$(echo $SECRET | jq -r .host)
   export DB_PORT=$(echo $SECRET | jq -r .port)
   export DB_NAME=$(echo $SECRET | jq -r .dbname)
   export DB_USERNAME=$(echo $SECRET | jq -r .username)
   export DB_PASSWORD=$(echo $SECRET | jq -r .password)
   export NODE_ENV=production
   
   # Run migrations
   npx sequelize-cli db:migrate
   ```

### Migration Files
- Location: `tasks-app/backend/database/migrations/`
- Configuration: `tasks-app/backend/.sequelizerc`
- Config file: `tasks-app/backend/config/config.js`

### Creating New Migrations
```bash
npx sequelize-cli migration:generate --name migration-name
```

## 📊 Monitoring

### CloudWatch Logs
- **ECS Tasks**: `/ecs/task-def-alb-tasks`
- **CodeBuild Backend**: `/aws/codebuild/tasks-app-backend-cicd`
- **CodeBuild Frontend**: `/aws/codebuild/tasks-app-frontend-cicd`

### Health Checks
- **ALB Health Check**: `GET /` (accepts 200-499)
- **Target Health**: Monitored every 30 seconds
- **Healthy Threshold**: 2 consecutive successes
- **Unhealthy Threshold**: 3 consecutive failures

### Viewing Logs
```bash
# ECS logs
aws logs tail /ecs/task-def-alb-tasks --follow --region us-east-1

# CodeBuild logs
aws logs tail /aws/codebuild/tasks-app-backend-cicd --follow --region us-east-1
```

## 💰 Cost Optimization

### Current Setup
- **ECS**: 2 t2.micro instances (~$15/month)
- **RDS**: db.t3.micro (~$15/month)
- **ALB**: ~$20/month
- **NAT Gateway**: ~$35/month
- **VPC Endpoints**: ~$7/month each (5 endpoints = ~$35/month)
- **Total**: ~$120/month

### Stopping Infrastructure When Not in Use

```bash
# Stop ECS tasks
aws ecs update-service --cluster cluster-alb-tasks --service task-def-alb-tasks-service --desired-count 0 --region us-east-1

# Stop RDS
aws rds stop-db-instance --db-instance-identifier tasks --region us-east-1

# Scale down Auto Scaling Group
aws autoscaling update-auto-scaling-group --auto-scaling-group-name <ASG_NAME> --min-size 0 --max-size 0 --desired-capacity 0 --region us-east-1
```

### Starting Infrastructure

```bash
# Start RDS
aws rds start-db-instance --db-instance-identifier tasks --region us-east-1

# Scale up Auto Scaling Group
aws autoscaling update-auto-scaling-group --auto-scaling-group-name <ASG_NAME> --min-size 2 --max-size 2 --desired-capacity 2 --region us-east-1

# ECS service will automatically start tasks
```

### Cost Saving Tips
- ✅ Use VPC Endpoints instead of NAT Gateway for AWS services
- ✅ Stop RDS when not in use (saves ~50%)
- ✅ Use t3.micro instead of t2.micro (better performance/cost)
- ✅ Enable S3 lifecycle policies for old artifacts
- ✅ Use CloudWatch Logs retention policies

## 🔧 Troubleshooting

### Common Issues

#### 1. ALB Returns 503
- Check target health: `aws elbv2 describe-target-health --target-group-arn <TG_ARN>`
- Verify ECS tasks are running: `aws ecs list-tasks --cluster cluster-alb-tasks`
- Check security groups allow ALB → ECS traffic

#### 2. CodeBuild Timeout
- Verify VPC Endpoints are available
- Check CodeBuild security group allows outbound HTTPS
- Ensure subnets have proper routing (NAT or IGW)

#### 3. Database Connection Failed
- Verify RDS is running: `aws rds describe-db-instances --db-instance-identifier tasks`
- Check RDS security group allows ECS SG on port 5432
- Verify Secrets Manager credentials are correct

#### 4. Frontend Can't Connect to Backend
- Verify ALB DNS is correct in frontend environment
- Check ALB is in public subnets with IGW route
- Verify ALB security group allows port 80 from 0.0.0.0/0

## 📝 API Endpoints

### Tasks API
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:uuid` - Get task by ID
- `DELETE /api/tasks/:uuid` - Delete task
- `PUT /api/tasks/update_priority/:uuid` - Update task priority

### Portuguese Routes (Legacy)
- `GET /api/tarefas`
- `POST /api/tarefas`
- `GET /api/tarefas/:uuid`
- `DELETE /api/tarefas/:uuid`
- `PUT /api/tarefas/update_priority/:uuid`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your name here

## 🙏 Acknowledgments

- AWS Documentation
- Sequelize ORM
- React Community
- Express.js Team

---

**Live URLs:**
- 🌐 Frontend: `http://<s3-bucket-name>.s3-website-<region>.amazonaws.com`
- 🔌 Backend API: `http://<alb-dns-name>/api/tasks`
- 📊 Pipeline: AWS Console → CodePipeline

**Built with ❤️ using AWS**
