# Tasks App - Aplicação de Gerenciamento de Tarefas

Aplicação full-stack para gerenciamento de tarefas com React (frontend), Node.js/Express (backend) e PostgreSQL (banco de dados).

## 🏗️ Arquitetura

- **Frontend**: React 17 com React Router
- **Backend**: Node.js + Express + Sequelize ORM
- **Banco de Dados**: PostgreSQL 13
- **Containerização**: Docker + Docker Compose
- **Deploy**: AWS ECS + S3 + CodePipeline

## 🚀 Executando Localmente

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (opcional, para desenvolvimento)

### Iniciar a aplicação

```bash
# Subir todos os containers
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Parar a aplicação

```bash
# Parar e remover containers
docker compose down

# Parar, remover containers e volumes (limpa banco de dados)
docker compose down -v
```

## 🔧 Configuração de Ambiente

### Desenvolvimento Local

O frontend usa **proxy** configurado no `package.json` para se comunicar com o backend:

```json
"proxy": "http://backend:8080"
```

Isso significa que `REACT_APP_API_URL` fica vazio e as requisições são automaticamente redirecionadas.

### Build para Produção

Para fazer build do frontend apontando para um backend específico (ex: ECS):

```bash
# Build com URL customizada
docker build \
  --build-arg REACT_APP_API_URL=http://seu-alb.us-east-1.elb.amazonaws.com \
  -t tasks-frontend:prod \
  ./frontend
```

**Importante**: 
- A URL do backend **NÃO** deve terminar com `/`
- O backend já está configurado com CORS aberto (`cors()` sem restrições)
- Não é necessário incluir `/api` na URL base

### Variáveis de Ambiente

#### Frontend (`REACT_APP_API_URL`)

- **Local**: Vazio (usa proxy)
- **Produção S3**: URL do ALB do ECS (ex: `http://tasks-alb-123456.us-east-1.elb.amazonaws.com`)

#### Backend

Configurado via `backend/config/default.json`:

```json
{
  "server": {
    "port": 8080
  },
  "database": {
    "username": "postgres",
    "password": "postgres",
    "database": "tasks_db",
    "host": "db",
    "dialect": "postgres"
  }
}
```

## 📦 Estrutura do Projeto

```
tasks-app/
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── App.js         # Componente principal (contém API_URL)
│   │   └── components/    # Componentes React
│   ├── Dockerfile         # Build de produção com ARG
│   ├── buildspec.yml      # AWS CodeBuild spec
│   └── DEPLOYMENT.md      # Instruções de deploy
├── backend/               # API Node.js/Express
│   ├── api/
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── models/        # Modelos Sequelize
│   │   └── routes/        # Rotas da API
│   ├── config/
│   │   ├── express.js     # Configuração Express (CORS)
│   │   └── default.json   # Configurações padrão
│   ├── Dockerfile
│   └── buildspec.yml
└── docker-compose.yml     # Orquestração local
```

## 🌐 Endpoints da API

### Português (padrão)
- `GET /api/tarefas` - Lista todas as tarefas
- `GET /api/tarefas/:id` - Busca tarefa por ID
- `POST /api/tarefas` - Cria nova tarefa
- `PUT /api/tarefas/:id` - Atualiza tarefa
- `DELETE /api/tarefas/:id` - Remove tarefa

### Inglês
- `GET /api/tasks` - Lista todas as tarefas
- `GET /api/tasks/:id` - Busca tarefa por ID
- `POST /api/tasks` - Cria nova tarefa
- `PUT /api/tasks/:id` - Atualiza tarefa
- `DELETE /api/tasks/:id` - Remove tarefa

## 🔒 CORS

O backend está configurado com CORS aberto para facilitar desenvolvimento:

```javascript
app.use(cors()); // Aceita requisições de qualquer origem
```

**Para produção**, considere restringir as origens permitidas:

```javascript
app.use(cors({
  origin: ['http://seu-bucket.s3-website-us-east-1.amazonaws.com']
}));
```

## 🐛 Troubleshooting

### Erro de CORS

Se encontrar erro de CORS:

1. Verifique se `REACT_APP_API_URL` está correta (sem `/` no final)
2. Confirme que o backend tem `cors()` habilitado
3. Verifique se o ALB/ECS está acessível publicamente
4. Use DevTools do navegador para ver a requisição exata

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs frontend
docker compose logs backend
docker compose logs db

# Reconstruir imagens
docker compose build --no-cache
docker compose up -d
```

### Banco de dados não conecta

```bash
# Verificar se o container do banco está healthy
docker compose ps

# Acessar o banco diretamente
docker compose exec db psql -U postgres -d tasks_db
```

## 📚 Documentação Adicional

- [Frontend Deployment Guide](frontend/DEPLOYMENT.md) - Instruções detalhadas de deploy do frontend
- [Backend API Documentation](backend/README.md) - Documentação da API (se existir)

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
