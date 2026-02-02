# Infrastructure Rules - Tasks Application Project

## Base Architecture
- **Frontend:** S3 + CloudFront (CDN)
- **Backend:** ECS (Fargate or EC2) with ALB
- **Container Registry:** ECR
- **Database:** RDS PostgreSQL
- **DNS:** Route 53
- **Pipeline:** CodePipeline + CodeBuild

## Instance Types
- **RDS (Database):** t3.micro
- **ECS (Backend):** Fargate (0.5 vCPU, 1GB RAM) or EC2 t3.micro

## Simplicity Philosophy
- **Target Audience:** Students learning
- **Approach:** Balance simplicity with real-world practices
- **Goal:** Facilitate understanding while using production-ready patterns

## Security Best Practices
- **Secrets Manager:** Use for database credentials and sensitive data
- **Parameter Store:** Use for non-sensitive configuration
- **Multi-AZ deployments:** Keep configuration simple (single AZ for learning)
- **Complex Auto Scaling:** Use basic configurations

## Naming Convention

### Standard Prefix
- **Prefix:** `tasks` (project name)

### Resource Naming
- **S3 Bucket (Frontend):** `tasks-frontend-bucket`
- **CloudFront Distribution:** `tasks-cdn`
- **ECR Repository:** `tasks-backend`
- **ECS Cluster:** `tasks-cluster`
- **ECS Service:** `tasks-service`
- **ECS Task Definition:** `tasks-task`
- **Application Load Balancer:** `tasks-alb`
- **Target Group:** `tasks-tg`
- **RDS Instance:** `tasks-db`
- **Route 53 Hosted Zone:** Your domain
- **CodePipeline:** `tasks-pipeline`
- **CodeBuild Project (Frontend):** `tasks-frontend-build`
- **CodeBuild Project (Backend):** `tasks-backend-build`

### Security Group Suffixes
- **Database (RDS):** `tasks-db-sg`
- **ECS Tasks:** `tasks-ecs-sg`
- **Application Load Balancer:** `tasks-alb-sg`

## Security Group Rules

### Description Pattern for Inbound Rules
- **Mandatory format:** "access from (security group name)"
- **Example:** "access from tasks-alb-sg"
- **Application:** ONLY for inbound rules

### Database (tasks-db-sg)
**Inbound Rules:**
- **Port:** 5432 (PostgreSQL)
- **Source:** `tasks-ecs-sg` → Description: "access from tasks-ecs-sg"

### ECS Tasks (tasks-ecs-sg)
**Inbound Rules:**
- **Port:** 80 (or your app port)
- **Source:** `tasks-alb-sg` → Description: "access from tasks-alb-sg"

### Application Load Balancer (tasks-alb-sg)
**Inbound Rules:**
- **Port:** 80
- **Source:** 0.0.0.0/0 → Description: "public HTTP access"
- **Port:** 443
- **Source:** 0.0.0.0/0 → Description: "public HTTPS access"

## Database
- **Type:** RDS PostgreSQL
- **Instance Class:** db.t3.micro
- **Storage:** 20 GB
- **Multi-AZ:** No (keep simple)
- **Public Access:** No

## Frontend (S3 + CloudFront)
- **S3 Bucket:** Static website hosting
- **CloudFront:** CDN for global distribution
- **HTTPS:** Enabled by default
- **CORS:** Configured for backend API calls

## Backend (ECS + ECR + ALB)
- **Container Registry:** ECR for Docker images
- **Compute:** ECS Fargate (serverless) or ECS EC2
- **Load Balancer:** Application Load Balancer
- **Task Definition:**
  - CPU: 512 (0.5 vCPU)
  - Memory: 1024 (1 GB)
  - Port: 80
- **Service:**
  - Desired Count: 1
  - Launch Type: FARGATE or EC2
- **Environment Variables:**
  - NODE_ENV=production
  - PORT=80
- **Secrets (from Secrets Manager):**
  - DATABASE_URL (RDS connection string)
  - DATABASE_HOST
  - DATABASE_NAME
  - DATABASE_USER
  - DATABASE_PASSWORD

## Route 53
- **Purpose:** DNS management for custom domain
- **Records:**
  - A record for ALB (backend API)
  - CNAME/Alias for CloudFront (frontend)

## Secrets Manager Configuration
- **Secret Name:** `tasks-app/database`
- **Secret Type:** Key-value pairs
- **Keys:**
  - `host`: RDS endpoint
  - `port`: 5432
  - `database`: Database name
  - `username`: Database user
  - `password`: Database password
- **Access:** ECS Task Execution Role needs `secretsmanager:GetSecretValue` permission

### Notes
- Rules follow the principle of least privilege
- Security Groups reference other Security Groups for flexibility
- Configuration allows architecture evolution without major changes
- ECS provides better container orchestration than Elastic Beanstalk
- ALB enables advanced routing and health checks
