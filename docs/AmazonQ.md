# Tasks Application - Context and Analysis

## Project Overview
**Name:** Tasks Application  
**Version:** 1.0.0  
**Type:** Full-stack task management application  
**Repository:** Challenge 1 - January 2026

## Project Description
The Tasks Application is a full-stack web application designed to demonstrate modern cloud architecture patterns and CI/CD best practices on AWS.

The project showcases the evolution from a monolithic architecture to a separated, scalable architecture with independent frontend and backend deployments.

The main focus is to provide an educational structure where students can gradually evolve from simple deployments to more complex cloud-native architectures.

---

## Technical Analysis (Amazon Q)

### Identified Architecture
- **Frontend:** React 17.0.2 with Create React App
- **Backend:** Node.js with Express 4.17.1
- **Database:** PostgreSQL (RDS)
- **ORM:** Sequelize 6.6.5
- **Deployment:** Separated architecture (S3+CloudFront for frontend, Elastic Beanstalk for backend)

### Technology Stack
**Frontend:**
- React with React Router DOM
- React Icons for UI icons
- Bilingual support (EN/PT)
- Dark/Light theme toggle

**Backend:**
- Express.js as web framework
- Sequelize as ORM
- Morgan for logging
- CORS enabled
- Express Session for session management
- Method Override for REST API

**Infrastructure:**
- Docker containerized
- AWS CodePipeline for CI/CD
- AWS CodeBuild for builds
- S3 + CloudFront for frontend
- Elastic Beanstalk for backend
- RDS PostgreSQL as database

### Project Structure
```
/challenge1
├── frontend/           # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── buildspec.yml
├── backend/            # Node.js API
│   ├── api/
│   ├── config/
│   ├── database/
│   ├── lib/
│   ├── package.json
│   └── buildspec.yml
├── infrastructure/     # AWS resources
│   ├── pipeline/
│   └── cloudformation/
├── docs/              # Documentation
├── .amazonq/          # Amazon Q configuration
├── Dockerfile         # Container definition
└── Dockerrun.aws.json # Elastic Beanstalk config
```

### AWS Resources Identified
- **S3:** Static hosting for React frontend
- **CloudFront:** CDN for global distribution
- **Elastic Beanstalk:** Backend API hosting
- **RDS PostgreSQL:** Database
- **CodePipeline:** CI/CD orchestration
- **CodeBuild:** Build automation
- **Parameter Store:** Configuration management

### Key Points
1. **Architecture:** Separated frontend/backend for better scalability
2. **CI/CD:** Automated pipeline with CodePipeline and CodeBuild
3. **Security:** Environment variables managed through Parameter Store
4. **Monitoring:** CloudWatch integration for logs and metrics

### API Routes for Testing
- **`/api/tarefas`:** Returns tasks from PostgreSQL database (ideal for testing RDS connectivity)
- **`GET /api/tarefas`:** List all tasks
- **`POST /api/tarefas`:** Create new task
- **`PUT /api/tarefas/update_priority/:id`:** Update task priority
- **`DELETE /api/tarefas/:id`:** Delete task