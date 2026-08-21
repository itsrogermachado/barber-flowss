# Barber Flow

SaaS multi-inquilino de agendamento para barbearias, construído em **React + TypeScript**
sobre **Supabase**. Cada barbearia tem sua própria página pública de agendamento,
sua equipe, seus serviços e seu plano.

![React](https://img.shields.io/badge/-React-20232A?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

## O que tem dentro

**Para o cliente final**
- Página pública da barbearia (`/loja/:slug`), sem necessidade de cadastro
- Assistente de agendamento passo a passo: serviço → profissional → horário
- Confirmação de agendamento e envio de avaliação

**Para a barbearia**
- Agenda com visão dos atendimentos
- Cadastro de profissionais, serviços e horários de funcionamento
- Bloqueio de horários (folga, almoço, feriado)
- Convite de membros da equipe por link, com aceite
- Onboarding guiado na criação da barbearia

**Plataforma**
- Multi-inquilino: `shops`, `memberships` e papéis (`OWNER`, equipe)
- Planos com limites por assinatura — número de profissionais, agendamentos
  por mês e lembretes por WhatsApp
- Painel de super administrador
- Autenticação completa: cadastro, login, recuperação e redefinição de senha

## Segurança

Todas as tabelas usam **Row Level Security** do Postgres, com as políticas
declaradas em migrações versionadas em `supabase/migrations/`. O isolamento
entre barbearias é garantido no banco, não apenas na interface.

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React · TypeScript · Vite · Tailwind · shadcn/ui |
| Formulários | react-hook-form · Zod |
| Dados | Supabase (Auth, Postgres, RLS) |
| UI | Framer Motion · Recharts · date-fns · lucide-react |
| Testes | Vitest |

## Rodando localmente

```bash
git clone https://github.com/itsrogermachado/barber-flowss
cd barber-flowss
npm install
cp .env.example .env    # preencha com as chaves do seu projeto Supabase
npm run dev
```

As migrações em `supabase/migrations/` reconstroem o schema inteiro, incluindo
tabelas, políticas de RLS e funções.

```bash
npm run test        # testes unitários
npm run lint
```

## Observação

Projeto de estudo, não está em produção. As variáveis do `.env.example` são as
chaves públicas do cliente Supabase (prefixo `VITE_`), que por definição são
embarcadas no bundle do navegador — a proteção dos dados fica por conta do RLS.
