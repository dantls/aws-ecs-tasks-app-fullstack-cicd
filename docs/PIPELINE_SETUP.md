# 🚀 Pipeline AWS - Tasks Application

## 📊 Arquitetura do Pipeline

```
GitHub Repository
       │
       ▼
┌─────────────────┐
│  CodePipeline   │
│   (Trigger)     │
└─────────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ CodeBuild   │   │ CodeBuild   │   │   Deploy    │
│ Frontend    │   │ Backend     │   │  Parallel   │
│ (React)     │   │ (Node.js)   │   │             │
└─────────────┘   └─────────────┘   └─────────────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│     S3      │   │     ECS     │   │ CloudFront  │
│  (Static)   │   │   (API)     │   │   (CDN)     │
└─────────────┘   └─────────────┘   └─────────────┘
```

## 🛠️ Componentes Criados

### **1. Estrutura Separada**
```
modjan2026/challenge1/
├── frontend/              # React App
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── buildspec.yml     # ← Build para S3
├── backend/               # Node.js API
│   ├── api/
│   ├── config/
│   ├── package.json
│   └── buildspec.yml     # ← Build para ECS
└── infrastructure/
    └── pipeline/
        └── codepipeline.yml  # ← Pipeline completo
```

### **2. Pipeline Automático**
- **Source**: GitHub (trigger automático)
- **Build Frontend**: React → S3 + CloudFront
- **Build Backend**: Node.js → ECS
- **Deploy Paralelo**: Frontend e Backend independentes

### **3. Infraestrutura AWS**
- **S3**: Hospedagem React (estáticos)
- **CloudFront**: CDN global
- **ECS**: APIs Node.js (containers)
- **CodePipeline**: Orquestração
- **CodeBuild**: Build automático

## 🚀 Deploy do Pipeline

### **1. Preparar Repositório**
```bash
# Criar repositório no GitHub
# Fazer push do código

git init
git add .
git commit -m "Initial commit - Separated architecture"
git remote add origin https://github.com/SEU_USUARIO/tasks-application.git
git push -u origin main
```

### **2. Deploy da Infraestrutura**
```bash
aws cloudformation create-stack \
  --stack-name tasks-app-pipeline \
  --template-body file://infrastructure/pipeline/codepipeline.yml \
  --parameters \
    ParameterKey=GitHubOwner,ParameterValue=SEU_USUARIO \
    ParameterKey=GitHubToken,ParameterValue=SEU_TOKEN \
  --capabilities CAPABILITY_IAM
```

### **3. Configurar Parâmetros**
```bash
# Parâmetros do Systems Manager
aws ssm put-parameter --name "/tasks-app/frontend/s3-bucket" --value "tasks-app-frontend-ACCOUNT"
aws ssm put-parameter --name "/tasks-app/frontend/cloudfront-id" --value "DISTRIBUTION_ID"
aws ssm put-parameter --name "/tasks-app/backend/eb-application" --value "tasks-app-backend"
```

## ✅ **Benefícios Alcançados**

### **Performance**
- ✅ Frontend via CloudFront (CDN global)
- ✅ Cache automático de assets
- ✅ Backend otimizado (só APIs)

### **DevOps**
- ✅ Deploy automático no push
- ✅ Build paralelo (frontend/backend)
- ✅ Rollback independente
- ✅ Zero downtime

### **Custo**
- ✅ S3 muito mais barato
- ✅ CloudFront free tier
- ✅ ECS menor (só backend)

### **Escalabilidade**
- ✅ S3 escala infinitamente
- ✅ CloudFront global
- ✅ Backend auto-scaling

## 🔄 **Fluxo de Desenvolvimento**

1. **Developer** faz push para `main`
2. **CodePipeline** detecta mudança
3. **CodeBuild** builda frontend e backend em paralelo
4. **Frontend** → S3 + invalidação CloudFront
5. **Backend** → Deploy Beanstalk
6. **Aplicação** atualizada automaticamente

## 🎯 **Próximos Passos**

1. Configurar repositório GitHub
2. Obter GitHub Personal Access Token
3. Deploy do CloudFormation
4. Configurar parâmetros SSM
5. Testar pipeline com primeiro push
6. Configurar CORS entre frontend/backend
7. Adicionar testes automatizados
8. Configurar notificações (SNS/Slack)

Esta nova arquitetura segue as melhores práticas AWS e será muito mais eficiente e escalável!
