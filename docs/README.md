# Tasks Application - ECS Architecture

## Overview
Task management application with decoupled backend/frontend architecture, ready for AWS ECS deployment with i18n support (PT-BR/EN) and dark mode.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│  PostgreSQL  │
│  (React)    │      │  (Node.js)  │      │   Database   │
│  Port 3000  │      │  Port 8080  │      │   Port 5432  │
└─────────────┘      └─────────────┘      └──────────────┘
```

## Project Structure

```
tasks-app/
├── backend/
│   ├── api/
│   │   ├── controllers/tasks.js
│   │   ├── models/tasks.js
│   │   └── routes/tasks.js
│   ├── config/
│   │   ├── database.js
│   │   ├── config.json (Sequelize)
│   │   └── express.js
│   ├── database/migrations/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js (with i18n)
│   │   └── components/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## Quick Start

### Local Development
```bash
cd tasks-app
docker compose up -d --build

# Run migrations
docker exec tasks-backend npx sequelize-cli db:migrate
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api/tarefas
- Database: localhost:5432

## Features
- ✅ i18n support (Portuguese/English)
- ✅ Dark mode toggle
- ✅ Task CRUD operations
- ✅ Priority management
- ✅ Responsive design

## Database
- **Name**: tasks
- **Table**: Tasks
- **Columns**: uuid, titulo, dia_atividade, importante

## API Endpoints
- `GET /api/tarefas` - List all tasks
- `POST /api/tarefas` - Create task
- `GET /api/tarefas/:uuid` - Get task
- `PUT /api/tarefas/update_priority/:uuid` - Update priority
- `DELETE /api/tarefas/:uuid` - Delete task

## Environment Variables

### Backend
- `DB_HOST` - Database host (default: database)
- `DB_USER` - Database user (default: postgres)
- `DB_PWD` - Database password (default: postgres)
- `PORT` - Server port (default: 80)

## Deployment to ECS

See `infrastructure/` directory for:
- ECS task definitions
- Service configurations
- Load balancer setup
- RDS configuration

## AWS Setup

### Prerequisites
```bash
# Assume role
./assume-role.sh

# Verify credentials
aws sts get-caller-identity
```

### Infrastructure
Located in `infrastructure/` directory with CDK/Terraform configurations.

## Development Notes

### File Naming Convention
- Backend files: English (tasks.js, not tarefas.js)
- API routes: Portuguese for frontend compatibility (/api/tarefas)
- Database columns: Portuguese (titulo, dia_atividade, importante)
- Frontend: i18n translations for both languages

### Docker Compose Services
1. **database** - PostgreSQL 17-alpine
2. **backend** - Node.js 18-alpine
3. **frontend** - React + Nginx

## Troubleshooting

### Database Connection
```bash
docker exec tasks-db psql -U postgres -d tasks
```

### View Logs
```bash
docker logs tasks-backend
docker logs tasks-frontend
docker logs tasks-db
```

### Reset Database
```bash
docker exec tasks-db psql -U postgres -d tasks -c "DROP TABLE IF EXISTS \"Tasks\", \"SequelizeMeta\" CASCADE;"
docker exec tasks-backend npx sequelize-cli db:migrate
```

## Security Best Practices
- Use IAM roles with least privilege
- Store secrets in AWS Secrets Manager
- Enable VPC endpoints for private communication
- Use security groups to restrict access
- Enable CloudWatch logging

## Monitoring
- CloudWatch Logs for application logs
- CloudWatch Metrics for performance
- X-Ray for distributed tracing
- RDS Performance Insights for database

## Next Steps
1. Set up CI/CD pipeline (see PIPELINE_SETUP.md)
2. Configure auto-scaling policies
3. Set up CloudWatch alarms
4. Implement backup strategy
5. Configure SSL/TLS certificates
