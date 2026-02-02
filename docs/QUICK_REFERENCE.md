# Tasks Application - Quick Reference

## Project Structure
```
challenge1/
├── .amazonq/              # Amazon Q configuration
│   ├── cli-agents/        # Custom DevOps agent
│   └── rules/             # Infrastructure, Dockerfile, Pipeline rules
├── frontend/              # React app
├── backend/               # Node.js API
├── infrastructure/        # AWS CloudFormation templates
└── docs/                  # Documentation
```

## Architecture
- **Frontend:** S3 + CloudFront (CDN)
- **Backend:** ECS (Fargate/EC2) + ECR + ALB
- **Database:** RDS PostgreSQL
- **DNS:** Route 53
- **Security:** Secrets Manager for credentials
- **CI/CD:** CodePipeline + CodeBuild

## AWS Resources Naming
- Prefix: `tasks-*`
- ECR: `tasks-backend`
- ECS Cluster: `tasks-cluster`
- ECS Service: `tasks-service`
- ALB: `tasks-alb`
- RDS: `tasks-db`
- S3: `tasks-frontend-bucket`
- Security Groups: `tasks-db-sg`, `tasks-ecs-sg`, `tasks-alb-sg`

## Secrets Manager
- Secret Name: `tasks-app/database`
- Keys: host, port, database, username, password

## API Endpoints
- `GET /api/tarefas` - List all tasks
- `POST /api/tarefas` - Create task
- `PUT /api/tarefas/update_priority/:id` - Update task
- `DELETE /api/tarefas/:id` - Delete task

## STS Assume Role (from modaug2025)
```bash
# Usage
source assume-role.sh <profile> <role-arn>

# Example
source assume-role.sh my-profile arn:aws:iam::123456789012:role/DevOpsRole
```

## Quick Commands
```bash
# Build Docker image
docker build -t tasks-app .

# Run locally
docker run -p 80:80 tasks-app

# Test API
curl http://localhost:80/api/tarefas

# Frontend build
cd frontend && npm run build

# Backend start
cd backend && npm start
```

## Environment Variables
**Backend:**
- NODE_ENV=production
- PORT=80
- DATABASE_HOST (from Secrets Manager)
- DATABASE_NAME (from Secrets Manager)
- DATABASE_USER (from Secrets Manager)
- DATABASE_PASSWORD (from Secrets Manager)

## Related Projects
- BIA project: `~/projectchallenge/modjan2026/challenge1/bia/`
- August 2025 challenges: `~/projectchallenge/modaug2025/`
