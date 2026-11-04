# LogiTrack — aplicação sob teste

Sistema de gestão de embarques (logística / comércio exterior) com API REST e interface web.
Esta é a aplicação que você vai testar no desafio técnico. Leia o enunciado para as instruções.

## Como executar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm start
```

A aplicação sobe em **http://localhost:3000** (interface web e API no mesmo endereço).
Para usar outra porta: `PORT=3100 npm start` (Windows PowerShell: `$env:PORT=3100; npm start`).

## Usuários de teste

A aplicação possui perfis pré-cadastrados (ex.: `analista` e `admin`). As credenciais exatas **não estão versionadas** por motivos de segurança.

Consulte o enunciado do desafio ou a massa de seed inicial para obter o e-mail e a senha de cada perfil. Em ambiente local, as credenciais podem ser injetadas via variáveis de ambiente ou arquivo `.env` (não versionado).

## Banco de dados

SQLite, criado automaticamente em `./data/logitrack.db` com embarques de exemplo e usuários.

- Restaurar a massa inicial **sem reiniciar**: `POST /api/__reset` (útil para isolar testes).
- Restaurar parando a aplicação: `npm run reset-db` e `npm start` novamente.
- Você pode abrir o arquivo `data/logitrack.db` com qualquer cliente SQLite (DB Browser, DBeaver, `sqlite3`) para consultas e validações. Tabelas: `users`, `shipments`, `shipment_events`.

## Documentação

- `openapi.yaml`: contrato esperado da API (abra no Swagger Editor ou em qualquer visualizador OpenAPI).

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor em `dist/server.js` |
| `npm run start:safe` | Inicia com verificação detalhada de dependências |
| `npm run reset-db` | Remove o banco de dados local (recria na próxima inicialização) |

## Segurança

Não commite credenciais, tokens, chaves de API ou arquivos de ambiente contendo dados sensíveis. O arquivo `.env` (se usado) deve ser mantido fora do controle de versão.

