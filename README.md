# Plataforma de Mentoria — Lucas Magalhães

Plataforma de mentoria com área de alunos e painel administrativo. Built with Next.js 14 + Supabase.

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o conteúdo de `supabase/schema.sql`
3. Anote a URL e a `anon key` do projeto

### 2. Variáveis de ambiente

Edite `.env.local` com suas credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

### 4. Deploy no Vercel

1. Conecte o repositório no Vercel
2. Adicione as variáveis de ambiente no painel do Vercel
3. Deploy automático

---

## Criando o primeiro admin

1. Crie um usuário em Supabase: Authentication > Users > Add user
2. No Table Editor > profiles, edite o perfil:
   - `role` → `admin`
   - `mentoria_access` → `{COMERCIAL,ENTREGA}`

---

## Produtos e Acesso

| Produto | Conteúdo visível |
|---|---|
| `COMERCIAL` | Mentoria Comercial |
| `ENTREGA` | Mentoria de Entrega |
| `COMPLETA` | Ambas as mentorias |

Configure em `/admin/alunos`.

---

## Panda Video

Informe o **Video ID** do Panda Video ao cadastrar aulas ou lives.
O player é embutido via iframe. Atualize a URL base do player em `src/components/lessons/VideoPlayer.tsx` conforme sua conta.

---

## Estrutura de páginas

```
/login                  — Login
/aulas                  — Biblioteca de módulos e aulas
/aulas/[id]             — Aula com player, materiais e comentários
/lives                  — Gravações e programação de lives
/suporte                — Tickets de suporte
/perfil                 — Perfil do aluno
/admin                  — Dashboard admin
/admin/modulos          — CRUD de módulos
/admin/aulas            — CRUD de aulas
/admin/lives            — CRUD de lives
/admin/alunos           — Gerenciar alunos e acessos
/admin/suporte          — Responder tickets
```
