# Frontend Deployment Guide

Este guia detalha o processo de deploy do frontend da aplicação Tasks App no AWS S3 com hospedagem estática.

## 📋 Pré-requisitos

- AWS CLI configurado
- Conta AWS com permissões para S3, CodeBuild e CodePipeline
- Repositório Git (GitHub, CodeCommit, etc.)
- Backend ECS já deployado e rodando

## 🏗️ Arquitetura de Deploy

```
GitHub/CodeCommit → CodePipeline → CodeBuild → S3 Bucket (Static Website)
                                              ↓
                                    Frontend React (build estático)
                                              ↓
                                    Backend ECS via ALB
```

## 🔧 Configuração da URL da API

### Como Funciona

O frontend usa a variável `REACT_APP_API_URL` definida em **build time** para se comunicar com o backend:

```javascript
// frontend/src/App.js (linha 56)
const API_URL = process.env.REACT_APP_API_URL || '';
```

### Ambientes

| Ambiente | REACT_APP_API_URL | Como Funciona |
|----------|-------------------|---------------|
| **Local (Docker Compose)** | `''` (vazio) | Usa proxy do `package.json`: `"proxy": "http://backend:8080"` |
| **Produção (S3)** | `http://seu-alb.elb.amazonaws.com` | Aponta diretamente para o ALB do ECS |

### ⚠️ Regras Importantes

1. **NÃO** termine a URL com `/` (ex: ❌ `http://alb.com/` → ✅ `http://alb.com`)
2. **NÃO** inclua `/api` na URL base (o código já adiciona)
3. A URL deve ser o **DNS name do ALB** do backend ECS

## 🐳 Dockerfile com Build Args

O Dockerfile foi atualizado para aceitar a URL da API como argumento de build:

```dockerfile
# Build argument for API URL - can be overridden at build time
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React app for production
RUN npm run build

# Serve the production build
CMD ["serve", "-s", "build", "-l", "3000"]
```

### Exemplo de Build Local

```bash
# Build para desenvolvimento (usa proxy)
docker build -t tasks-frontend:dev ./frontend

# Build para produção (aponta para ECS)
docker build \
  --build-arg REACT_APP_API_URL=http://tasks-alb-123456.us-east-1.elb.amazonaws.com \
  -t tasks-frontend:prod \
  ./frontend

# Testar o build localmente
docker run -p 3000:3000 tasks-frontend:prod
```

## 📦 CodeBuild Configuration

O arquivo `buildspec.yml` define o processo de build no AWS CodeBuild.

### ⚠️ PASSO CRÍTICO: Configurar a URL do Backend

**Antes de fazer deploy**, você DEVE editar o `buildspec.yml` e adicionar a URL do seu ALB:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Installing dependencies...
      - npm install
  
  build:
    commands:
      - echo Building React app...
      # ⚠️ SUBSTITUA PELA URL REAL DO SEU ALB DO ECS
      - export REACT_APP_API_URL=http://tasks-backend-alb-123456789.us-east-1.elb.amazonaws.com
      - npm run build
  
  post_build:
    commands:
      - echo Build completed successfully

artifacts:
  files:
    - '**/*'
  base-directory: build
```

### Como Encontrar a URL do ALB

1. Acesse o **AWS Console** → **EC2** → **Load Balancers**
2. Encontre o ALB do backend (ex: `tasks-backend-alb`)
3. Copie o **DNS name** (ex: `tasks-backend-alb-123456789.us-east-1.elb.amazonaws.com`)
4. Cole no `buildspec.yml` **SEM** `http://` ou `/` no final

**Exemplo correto:**
```yaml
- export REACT_APP_API_URL=http://tasks-backend-alb-123456789.us-east-1.elb.amazonaws.com
```

## 🪣 S3 Bucket Setup

### 1. Criar Bucket

```bash
aws s3 mb s3://tasks-app-frontend --region us-east-1
```

### 2. Configurar Website Hosting

```bash
aws s3 website s3://tasks-app-frontend \
  --index-document index.html \
  --error-document index.html
```

### 3. Configurar Política de Acesso Público

Crie um arquivo `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tasks-app-frontend/*"
    }
  ]
}
```

Aplique a política:

```bash
aws s3api put-bucket-policy \
  --bucket tasks-app-frontend \
  --policy file://bucket-policy.json
```

### 4. Desabilitar Block Public Access

```bash
aws s3api put-public-access-block \
  --bucket tasks-app-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

## 🚀 Deploy Manual

Para fazer deploy manual do build:

```bash
# 1. Build local com URL de produção
cd frontend
export REACT_APP_API_URL=http://seu-alb-ecs.us-east-1.elb.amazonaws.com
npm run build

# 2. Sync para S3
aws s3 sync build/ s3://tasks-app-frontend --delete

# 3. Invalidar cache (se usar CloudFront)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 🔄 CodePipeline Setup

### 1. Criar Pipeline

```bash
aws codepipeline create-pipeline --cli-input-json file://pipeline-config.json
```

### 2. Estrutura do Pipeline

```
Source (GitHub) → Build (CodeBuild) → Deploy (S3)
```

### 3. Configuração do Deploy Stage

No console do CodePipeline:
1. Adicione um stage "Deploy"
2. Action provider: "Amazon S3"
3. Bucket: `tasks-app-frontend`
4. Extract file before deploy: ✅ Yes

## 🌐 Acessar a Aplicação

Após o deploy, acesse via:

```
http://tasks-app-frontend.s3-website-us-east-1.amazonaws.com
```

Ou configure um domínio customizado com Route 53 + CloudFront.

## 🔒 CORS - Garantia de Funcionamento

### Backend Já Configurado ✅

O backend já tem CORS aberto em `backend/config/express.js`:

```javascript
app.use(cors()); // Aceita requisições de qualquer origem
```

Isso significa que **não haverá erro de CORS** desde que:
1. A URL do backend esteja correta
2. O ALB do ECS esteja acessível publicamente
3. O Security Group do ECS permita tráfego HTTP (porta 8080)

### Verificar CORS

Teste se o backend aceita requisições cross-origin:

```bash
# Teste básico
curl http://seu-alb.us-east-1.elb.amazonaws.com/api/tarefas

# Teste com CORS headers
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://seu-alb.us-east-1.elb.amazonaws.com/api/tarefas
```

**Resposta esperada:**
```
access-control-allow-origin: *
access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE
```

## 🔍 Verificação Pós-Deploy

### 1. Testar Backend Diretamente

```bash
# Listar tarefas
curl http://seu-alb.us-east-1.elb.amazonaws.com/api/tarefas

# Deve retornar JSON com array de tarefas
```

### 2. Testar Frontend no S3

1. Abra o navegador em `http://tasks-app-frontend.s3-website-us-east-1.amazonaws.com`
2. Abra DevTools (F12) → **Network tab**
3. Recarregue a página
4. Verifique se há requisições para `http://seu-alb.../api/tarefas`
5. Status deve ser **200 OK**

### 3. Verificar Variável de Ambiente

Inspecione o código JavaScript no navegador:

1. DevTools → **Sources tab**
2. Abra `static/js/main.*.js`
3. Procure por `REACT_APP_API_URL`
4. Deve conter a URL do seu ALB

## 🐛 Troubleshooting

### ❌ Erro: "Failed to fetch"

**Causa**: Backend não está acessível ou URL incorreta

**Solução**:
1. Teste o backend diretamente: `curl http://seu-alb.com/api/tarefas`
2. Verifique se o ECS está rodando: AWS Console → ECS → Tasks
3. Confirme que o Security Group permite tráfego na porta 8080
4. Verifique se `REACT_APP_API_URL` foi definida no build

### ❌ Erro: CORS Policy

**Causa**: Improvável, mas pode ser Security Group bloqueando

**Solução**:
1. Verifique o Security Group do ALB
2. Deve permitir **Inbound HTTP (80)** de `0.0.0.0/0`
3. O Target Group deve apontar para a porta **8080** do ECS

### ❌ Página em Branco no S3

**Causa**: `REACT_APP_API_URL` não foi definida no build

**Solução**:
1. Edite `buildspec.yml` e adicione `export REACT_APP_API_URL=...`
2. Commit e push para disparar novo build
3. Verifique os logs do CodeBuild

### ❌ Build Falha no CodeBuild

**Causa**: Dependências ou variáveis de ambiente faltando

**Solução**:
1. Verifique os logs no CodeBuild console
2. Confirme que `NODE_OPTIONS=--openssl-legacy-provider` está definido
3. Teste o build localmente primeiro:
   ```bash
   cd frontend
   npm install
   export REACT_APP_API_URL=http://seu-alb.com
   npm run build
   ```

### ❌ API retorna 502 Bad Gateway

**Causa**: Backend ECS não está healthy

**Solução**:
1. AWS Console → ECS → Clusters → Tasks
2. Verifique se a task está **RUNNING**
3. Veja os logs da task no CloudWatch
4. Confirme que o Target Group está **healthy**

## 📊 Monitoramento

### CloudWatch Logs

Os logs do CodeBuild ficam em:
```
/aws/codebuild/tasks-frontend-build
```

### S3 Access Logs

Habilite logs de acesso para monitorar tráfego:

```bash
aws s3api put-bucket-logging \
  --bucket tasks-app-frontend \
  --bucket-logging-status file://logging-config.json
```

## 🔐 Segurança para Produção

### Recomendações

1. **Use CloudFront**: Adicione CDN para melhor performance e segurança
2. **HTTPS**: Configure certificado SSL via ACM
3. **Restrinja CORS**: No backend, limite origens permitidas:
   ```javascript
   app.use(cors({
     origin: ['http://tasks-app-frontend.s3-website-us-east-1.amazonaws.com']
   }));
   ```
4. **WAF**: Adicione AWS WAF para proteção contra ataques
5. **Bucket Policy**: Restrinja acesso apenas ao CloudFront

## 📚 Recursos Adicionais

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CodePipeline User Guide](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [CORS no Express.js](https://expressjs.com/en/resources/middleware/cors.html)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do CodeBuild
2. Teste a aplicação localmente primeiro
3. Confirme que todas as variáveis de ambiente estão corretas
4. Verifique Security Groups e Target Groups no ECS
5. Abra uma issue no repositório
