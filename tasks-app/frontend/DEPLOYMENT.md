# Frontend Deployment Guide

## 🏠 Local Development

```bash
# Usa proxy do package.json automaticamente
docker compose up -d
```

Acesse: http://localhost:3000

---

## ☁️ Production Build (S3 + CloudFront)

### 1. Build com variável de ambiente

```bash
cd frontend

# Build para produção
REACT_APP_API_URL=https://api.seu-dominio.com npm run build
```

### 2. Deploy para S3

```bash
# Sync para S3
aws s3 sync build/ s3://seu-bucket-frontend/ --delete

# Invalidar cache do CloudFront
aws cloudfront create-invalidation \
  --distribution-id SEU_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🔧 Como Funciona

### Desenvolvimento Local
```javascript
const API_URL = process.env.REACT_APP_API_URL || '';
// API_URL = '' (vazio)
// fetch('/api/tarefas') → proxy redireciona para backend:8080
```

### Produção
```javascript
const API_URL = process.env.REACT_APP_API_URL || '';
// API_URL = 'https://api.seu-dominio.com'
// fetch('https://api.seu-dominio.com/api/tarefas')
```

---

## 📝 Variáveis de Ambiente

| Variável | Desenvolvimento | Produção |
|----------|----------------|----------|
| `REACT_APP_API_URL` | Não definida (usa proxy) | URL do backend ECS |

---

## ✅ Checklist para Deploy

- [ ] Backend rodando no ECS com ALB
- [ ] CORS configurado no backend
- [ ] Bucket S3 criado e configurado para hosting
- [ ] CloudFront distribution criada
- [ ] Build com `REACT_APP_API_URL` correto
- [ ] Deploy para S3
- [ ] Invalidação do cache CloudFront
