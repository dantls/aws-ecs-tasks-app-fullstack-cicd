#!/bin/bash
set -e

# Carrega configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy.config"

# Pega os 7 primeiros caracteres do commit
COMMIT_HASH=$(git rev-parse --short=7 HEAD)

echo "🚀 Deploy Backend - Commit: $COMMIT_HASH"

# Login no ECR
echo "🔐 Login no ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY

# Build da imagem (volta para o diretório do backend)
echo "🐳 Building Docker image..."
cd "$SCRIPT_DIR/.."
docker build -t $ECR_REPOSITORY:latest .
docker tag $ECR_REPOSITORY:latest $ECR_REPOSITORY:$COMMIT_HASH

# Push para ECR
echo "📤 Pushing to ECR..."
docker push $ECR_REPOSITORY:latest
docker push $ECR_REPOSITORY:$COMMIT_HASH

# Deploy no ECS
echo "🚢 Updating ECS service..."
# Cria nova task definition com a tag do commit
TASK_DEF=$(cat "$SCRIPT_DIR/task-definition.json" | sed "s|IMAGE_TAG|$COMMIT_HASH|g")
NEW_TASK_DEF_ARN=$(echo "$TASK_DEF" | aws ecs register-task-definition --cli-input-json file:///dev/stdin --region $REGION --query 'taskDefinition.taskDefinitionArn' --output text)
echo "📋 New task definition: $NEW_TASK_DEF_ARN"

# Atualiza o serviço com a nova task definition
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition $NEW_TASK_DEF_ARN --region $REGION --query 'service.taskDefinition' --output text

echo "✅ Deploy completed! Image: $ECR_REPOSITORY:$COMMIT_HASH"
