# 🚨 IMPORTANTE: Configuração de Build para Produção

## ⚠️ ANTES DE FAZER DEPLOY NO S3

O frontend precisa saber a URL do backend ECS para funcionar em produção.

### Passo 1: Encontre a URL do ALB do Backend

1. Acesse **AWS Console** → **EC2** → **Load Balancers**
2. Encontre o ALB do backend (ex: `tasks-backend-alb`)
3. Copie o **DNS name** completo

Exemplo: `tasks-backend-alb-123456789.us-east-1.elb.amazonaws.com`

### Passo 2: Configure o buildspec.yml

Edite o arquivo `frontend/buildspec.yml` e adicione a linha com a URL do ALB:

```yaml
build:
  commands:
    - echo Building React app...
    # ⚠️ SUBSTITUA PELA URL REAL DO SEU ALB
    - export REACT_APP_API_URL=http://tasks-backend-alb-123456789.us-east-1.elb.amazonaws.com
    - npm run build
```

**IMPORTANTE:**
- Use `http://` (não `https://` a menos que tenha certificado SSL)
- NÃO termine com `/`
- NÃO inclua `/api` na URL

### Passo 3: Commit e Push

```bash
git add frontend/buildspec.yml
git commit -m "Configure backend URL for production"
git push
```

---

## 🔧 Build Local para Testes

Para testar o build de produção localmente:

```bash
# Build com Docker
docker build \
  --build-arg REACT_APP_API_URL=http://SEU-ALB-AQUI.elb.amazonaws.com \
  -t tasks-frontend:prod \
  ./frontend

# Rodar localmente
docker run -p 3000:3000 tasks-frontend:prod
```

Ou sem Docker:

```bash
cd frontend
export REACT_APP_API_URL=http://SEU-ALB-AQUI.elb.amazonaws.com
npm run build
npx serve -s build -l 3000
```

---

## ✅ Verificação

Após o deploy, verifique:

1. **Backend está acessível:**
   ```bash
   curl http://SEU-ALB.elb.amazonaws.com/api/tarefas
   ```
   Deve retornar JSON com tarefas

2. **Frontend carrega:**
   Abra `http://seu-bucket.s3-website-us-east-1.amazonaws.com`

3. **Sem erros de CORS:**
   - Abra DevTools (F12) → Console
   - Não deve ter erros de CORS
   - Network tab deve mostrar requisições para o ALB com status 200

---

## 🔒 CORS Já Configurado

O backend já tem CORS aberto (`cors()` sem restrições), então não haverá problemas de CORS desde que:

- A URL do backend esteja correta
- O ALB esteja acessível publicamente
- O Security Group permita tráfego HTTP na porta 8080

---

## 📚 Documentação Completa

Veja `DEPLOYMENT_COMPLETE.md` para instruções detalhadas de:
- Setup do S3
- Configuração do CodePipeline
- Troubleshooting
- Monitoramento
- Segurança
