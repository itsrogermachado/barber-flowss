# Barber Flow — documentação para portfólio

**Status:** projeto de estudo; não está em produção.

## Visão
SaaS multi-tenant de agendamento para barbearias. Permite agendamento público, cadastro de serviços/profissionais, controle de horários e painel de administração. O isolamento entre barbearias usa estruturas de associação e Row Level Security no PostgreSQL (conforme README e migrations).

## Stack observável
React, TypeScript, Vite, Supabase (Auth/PostgreSQL/RLS), Tailwind, shadcn/ui, Vitest.

## Fluxos para demonstração
1. Criar barbearia e configurar equipe/serviços.
2. Reservar um horário em página pública de agendamento.
3. Conferir agenda e bloquear intervalos.
4. Tentar consultar dados de outro tenant em uma sessão não autorizada.
5. Executar `npm run test` e `npm run build` localmente.

## Evidências técnicas
- `.github/workflows/ci.yml`: instala dependências, executa testes e build em push/PR.
- `vitest.config.ts`: testes em jsdom para `src/**/*.test.ts(x)`.
- Migrações Supabase presentes em `supabase/migrations`.

A existência de pipeline **não significa** que todo teste já passou na revisão corrente.

## Limitações
Projeto de estudo; sem métricas reais de usuários, receita, disponibilidade ou transações. Evite atribuir resultados comerciais.

## Capturas de tela sugeridas
Gerar telas reais em ambiente de demonstração:
- `docs/assets/barber-agendamento.png` — seleção de serviço, profissional e horário.
- `docs/assets/barber-agenda.png` — agenda operacional com dados fictícios.
- `docs/assets/barber-admin.png` — configurações da barbearia.

Não criar imagens fictícias apresentadas como screenshots reais.
