# Sistema de Reserva de Salas

API REST para reserva de salas com detecção de conflitos de horário.

> 📦 **Template de trabalho em grupo da WebForge.** Clique em **Use this template** (botão verde acima) para criar o repositório do seu grupo.

## 🚀 Como rodar

```bash
npm install
npm start        # inicia em http://localhost:3000
```

O projeto já sobe com uma rota raiz `GET /`. Todo o resto é com o grupo.

## 📋 Requisitos

- **Salas** — CRUD (`/salas`) com nome, capacidade e recursos; filtro por capacidade mínima.
- **Reservas** — `POST /reservas` (salaId, responsável, início, fim) **rejeitando conflitos de horário**; `GET /reservas` com filtros; `DELETE /reservas/:id`.
- `GET /salas/:id/disponibilidade?data=YYYY-MM-DD` — horários livres da sala no dia.
- **Usuários** — cadastro e `GET /usuarios/:id/reservas`.
- **Relatórios** — taxa de ocupação por sala e horários de pico.

> Persistam os dados (arquivo JSON ou SQLite) — os testes podem reiniciar o servidor entre etapas.

## ✅ O que os testes de correção validam

Os testes automáticos sobem o **seu** servidor e fazem requisições HTTP reais contra a API. Eles verificam **comportamento** (status HTTP e corpo das respostas), não a estrutura interna do código — organizem os arquivos como preferirem. Para ser aprovado, a API precisa:

- [ ] `GET /` responde **200**.
- [ ] `POST /salas` cria (**201**) e `GET /salas` lista.
- [ ] `POST /reservas` cria uma reserva válida (**201**).
- [ ] Reservar a **mesma sala** em horário que **sobrepõe** uma reserva existente responde **409**.
- [ ] Reservas **adjacentes** (uma termina quando a outra começa) são **permitidas**.
- [ ] Reserva com `início >= fim` responde **400**.
- [ ] `DELETE /reservas/:id` cancela e libera o horário.
- [ ] `GET /salas/:id/disponibilidade` reflete as reservas existentes.

## 👥 Trabalho em equipe (obrigatório)

Este é um ambiente o mais próximo possível do mercado:

- O repositório deve pertencer a **um** dos membros do grupo. Os **demais membros entram como colaboradores** em `Settings → Collaborators → Add people`.
- Cada membro trabalha em sua **própria branch** e abre **Pull Request** para a `main`, pedindo revisão de outro colega.
- A WebForge mede as **contribuições individuais** de cada membro (commits, linhas adicionadas e removidas) direto do histórico do GitHub. Distribuam bem o trabalho.

## 🧱 Stack

- Node.js + Express (CommonJS)
