# Dockerfile Rules - Tasks Application Project

## Development Philosophy
- **Target Audience:** Students learning AWS and DevOps
- **Approach:** Simplicity over complexity
- **Goal:** Facilitate understanding for those in the initial learning stage

## Mandatory Rules for Dockerfiles

### 1. Mandatory Prior Analysis
- **ALWAYS** check the root package.json
- **ALWAYS** check the client package.json (if exists)
- **IDENTIFY** required Node.js version
- **IDENTIFY** all technologies involved (React, Vite, etc.)
- **VERIFY** build scripts and dependencies
- **VERIFY** required environment variables (e.g., VITE_API_URL, REACT_APP_API_URL)
- **ANALYZE** original Dockerfile for specific configurations

### 2. Important Configurations (DO NOT IGNORE)
- **Base image:** Always use ECR (`public.ecr.aws/docker/library/node:XX-slim`)
- **npm upgrade:** Include to stay updated
- **WORKDIR:** Work with (`/usr/src/app`)
- **curl installation:** Include for health checks
- **npm flags:** Keep `--loglevel=error`, `--legacy-peer-deps` if needed

### 3. Single Stage Always
- **NEVER** use multi-stage builds
- **NEVER** suggest complex optimizations
- Keep a single build stage

### 4. Maximum Simplicity
- **AVOID** permission changes (chmod, chown)
- **AVOID** creating non-root users
- **AVOID** advanced layer optimizations
- Use basic and direct commands

### 5. Validation Process
- **ALWAYS** ask if the Dockerfile should be tested
- **WHEN TESTING:** Run the project and verify the health check route
- **HEALTH ROUTE:** Confirm that `/api/tarefas` is responding correctly

### 6. File Creation
- **NEVER** overwrite existing Dockerfile
- **ALWAYS** notify the user where the new Dockerfile is being created
- **SUGGEST** alternative name if it already exists (e.g., Dockerfile.new, Dockerfile.backup)

## Test Commands
```bash
# Build image
docker build -t tasks-app .

# Run container
docker run -p 80:80 tasks-app

# Test health check
curl http://localhost:80/api/tarefas
```

## What NOT to do
- ❌ Multi-stage builds
- ❌ Complex security optimizations
- ❌ User/permission changes
- ❌ Advanced networking configurations

## What to ALWAYS do
- ✅ Single stage
- ✅ Simple and clear commands
- ✅ Ask about testing
- ✅ Validate health check when testing
