# 🎓 UniDash — University Management Dashboard

> Plataforma de gestão universitária full-stack, construída com Node.js, Fastify, React e PostgreSQL.

---

## 📌 Visão Geral

**UniDash** é um sistema de gerenciamento acadêmico de produção que centraliza o controle de departamentos, disciplinas, turmas, matrículas e usuários em uma única interface moderna e responsiva. Desenvolvido com foco em escalabilidade, segurança de tipos e performance, a aplicação combina uma API de alta performance com um frontend reativo e componentizado.

---

## ✨ Funcionalidades

### 🔐 Autenticação Multi-Role
Sistema de autenticação com roteamento seguro entre três perfis de acesso:
- **Estudante** — visualiza turmas, realiza matrículas e acompanha o progresso acadêmico
- **Professor** — gerencia turmas, disciplinas e alunos
- **Administrador** — controle total sobre departamentos, usuários e relatórios

### 📊 Dashboard em Tempo Real
Painel central com métricas ao vivo:
- Total de estudantes ativos
- Turmas em andamento
- Estatísticas do corpo docente
- Indicadores de performance acadêmica

### 🏛️ Gestão Acadêmica Completa
- **Departamentos** — criação, edição e visualização com drill-down detalhado
- **Disciplinas (Subjects)** — vinculação a departamentos e professores responsáveis
- **Turmas (Classes)** — gerenciamento de horários, capacidade e status

### 🎟️ Matrículas com Código de Convite
Estudantes ingressam em turmas por meio de **códigos de convite exclusivos**, simplificando o fluxo de matrícula sem burocracia manual.

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnologia | Função |
|---|---|
| **Node.js + Fastify** | Servidor e roteamento da API REST de alta performance |
| **TypeScript** | Tipagem estática e segurança de código |
| **Drizzle ORM** | Modelagem e queries no banco de dados |
| **PostgreSQL** | Banco de dados relacional principal |

### Frontend
| Tecnologia | Função |
|---|---|
| **React** | Interface do usuário |
| **Tailwind CSS** | Estilização utilitária |
| **shadcn/ui** | Componentes acessíveis e reutilizáveis |
| **Refine Core** | Gerenciamento de estado, autenticação e rotas |

### Infraestrutura e Serviços
| Ferramenta | Categoria | Função |
|---|---|---|
| **Better-Auth** | Autenticação | Fluxos de login complexos e gestão de sessões |
| **Cloudinary** | Mídia | Otimização e entrega de imagens via CDN |
| **Arcjet** | Segurança | Proteção contra bots e ataques DDoS |
| **Site24x7** | Monitoramento | APM e RUM — análise de performance em tempo real |
| **CodeRabbit** | Qualidade | Revisão de código automatizada |

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/unidash.git
cd unidash
```

### 2. Configure as variáveis de ambiente
```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

Preencha as variáveis necessárias:
```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/unidash

# Autenticação
BETTER_AUTH_SECRET=your_secret_key

# Mídia
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Segurança
ARCJET_KEY=ajkey_...
```

### 3. Instale as dependências
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Execute as migrations
```bash
cd server
npm run db:migrate
```

### 5. Inicie os servidores
```bash
# Backend (porta 5000)
cd server && npm run dev

# Frontend (porta 3000)
cd client && npm run dev
```

---

## 📁 Estrutura do Projeto

```
unidash/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas por role (admin, professor, student)
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilitários e configurações
│   └── package.json
│
├── server/                    # Backend Node.js + Fastify
│   ├── src/
│   │   ├── routes/            # Rotas da API
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── db/                # Schema Drizzle e migrations
│   │   └── plugins/           # Plugins Fastify (auth, rate limit, etc.)
│   └── package.json
│
└── README.md
```

---

## 🔒 Segurança

- Rotas protegidas por middleware de autenticação via **Better-Auth**
- Proteção contra bots e ataques DDoS via **Arcjet**
- Tipagem estática com **TypeScript** prevenindo erros em runtime
- Validação de schema nas camadas de API e banco de dados

---

## 📈 Monitoramento

A aplicação utiliza **Site24x7** para observabilidade em dois níveis:
- **APM (Application Performance Monitoring)** — rastreamento de latência, throughput e erros no backend
- **RUM (Real User Monitoring)** — métricas de experiência real dos usuários no frontend

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-funcionalidade`)
3. Commit suas mudanças seguindo [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m 'feat: descrição da mudança'`
4. Push para a branch (`git push origin feat/nova-funcionalidade`)
5. Abra um Pull Request

> Pull Requests passam por revisão automatizada via **CodeRabbit** antes da revisão humana.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](./LICENSE) para mais informações.

---

<div align="center">
  <sub>Construído com Node.js · Fastify · React · PostgreSQL</sub>
</div>
