# LogiTrack – Automação de Testes (Cypress)

Projeto de automação **API + Web E2E** desenvolvido para o **Desafio Técnico QA Automation – LogiTrack**.

O objetivo é validar a qualidade do sistema de gestão de embarques (API REST + interface web), priorizando cenários de alto valor, independência de testes e evidências claras.

> **Intuito:** este projeto foi desenvolvido com propósito de **ensino e entrevista técnica**, demonstrando boas práticas de automação de testes E2E (API + Web) com Cypress, Page Object Model, fixtures, comandos customizados e validações SQL.



---

## 1. Pré-requisitos (Windows)

| Item              | Versão mínima      | Observação                          |
|-------------------|--------------------|-------------------------------------|
| Node.js           | 18.x ou superior   | [nodejs.org](https://nodejs.org)    |
| npm               | 9.x+               | Vem com o Node                      |
| Google Chrome     | Última estável     | Recomendado para `cy:run:headed`    |
| Git               | Qualquer           | Opcional                            |
| Aplicação LogiTrack | Rodando em `http://localhost:3000` | Ver seção 2 abaixo |

> **PowerShell** ou **CMD** podem ser usados. Os comandos abaixo funcionam em ambos.

---

## 2. Subir a aplicação sob teste

1. Extraia o pacote da aplicação (`logitrack`).
2. Abra um terminal na pasta da aplicação:

```powershell
cd caminho\para\logitrack
npm install
npm start
```

A aplicação sobe em **http://localhost:3000** (interface + API no mesmo host).

Para restaurar a massa inicial sem reiniciar:

```http
POST http://localhost:3000/api/__reset
```

Ou, pela linha de comando (na pasta da aplicação):

```powershell
npm run reset-db
npm start
```

**Usuários de teste**

A aplicação possui perfis pré-cadastrados (ex.: `analista` e `admin`). As credenciais exatas **não estão versionadas** por motivos de segurança. Consulte o enunciado do desafio ou a massa de seed inicial para obter o e-mail e a senha de cada perfil.

---

## 3. Instalação do projeto de automação (Windows)

```powershell
# 1. Clone ou descompacte este repositório
cd caminho\para\logitrack-cypress

# 2. Instale as dependências
npm install

# 3. (Opcional) Verifique se o Cypress foi instalado
npx cypress verify
```

---

## 4. Como executar os testes

### Modo interativo (Cypress Test Runner)

```powershell
npm run cy:open
```

### Headless (todos os testes)

```powershell
npm run cy:run
```

### Apenas API

```powershell
npm run cy:run:api
```

### Apenas Web

```powershell
npm run cy:run:web
```

### Headed (Chrome)

```powershell
npm run cy:run:headed
```

### Com relatório Mochawesome

```powershell
npm run report
```

Os relatórios HTML ficam em `cypress/reports/`.

---

## 5. Estrutura do projeto

```
logitrack-cypress/
├── cypress/
│   ├── e2e/
│   │   ├── api/                    # Testes de API (cy.request)
│   │   │   ├── auth.cy.js
│   │   │   ├── authorization.cy.js
│   │   │   ├── shipments-list.cy.js
│   │   │   ├── shipments-crud.cy.js
│   │   │   └── status-flow.cy.js
│   │   └── web/                    # Testes E2E de interface
│   │       ├── login.cy.js
│   │       ├── shipments-list.cy.js
│   │       ├── new-shipment.cy.js
│   │       └── e2e-combined.cy.js  # Fluxo API + UI
│   ├── fixtures/
│   │   ├── users.json
│   │   └── shipments.json
│   ├── pages/                      # Page Object Model
│   │   ├── LoginPage.js
│   │   ├── ShipmentsPage.js
│   │   └── NewShipmentPage.js
│   ├── support/
│   │   ├── commands.js             # Custom commands
│   │   └── e2e.js
│   └── reports/                    # Gerado em runtime
├── sql/
│   └── queries.sql                 # Consultas da Parte C
├── cypress.config.js
├── package.json
└── README.md
```

---

## 6. Design Patterns utilizados

| Pattern              | Onde / Por quê                                                                 |
|----------------------|--------------------------------------------------------------------------------|
| **Page Object Model**| `cypress/pages/*` – isola seletores e ações de UI, facilita manutenção.        |
| **Custom Commands**  | `cy.loginApi`, `cy.resetDb`, `cy.api` – reuso e legibilidade.                  |
| **Fixtures**         | Dados de teste versionados e reutilizáveis.                                    |
| **Indepêndência**    | Todo teste chama `cy.resetDb()` no `beforeEach` (POST `/api/__reset`).         |
| **API-first + E2E**  | API cobre regras de negócio; Web cobre jornada e UX.                           |
| **Combined flow**    | Um cenário cria via API, valida na tela e altera status via UI.                |

Não utilizamos esperas fixas (`cy.wait(ms)`). Preferimos asserções com timeout configurável.

---

## 7. Cobertura de casos de teste

### Parte A – API

| Área              | Cenários cobertos                                                                 | Arquivo                  |
|-------------------|-----------------------------------------------------------------------------------|--------------------------|
| Autenticação      | Login válido (analista/admin), inválido, campos ausentes, sem token, token inválido | `auth.cy.js`            |
| Autorização       | Admin pode deletar / Analista recebe 403                                          | `authorization.cy.js`   |
| Listagem          | Paginação, meta, filtro status, busca q (case-insensitive), status inválido       | `shipments-list.cy.js`  |
| CRUD              | Create sucesso, duplicata 409, validações (ref, origem=destino, peso), edit CREATED, edit não-editável 422 | `shipments-crud.cy.js` |
| Fluxo de status   | Transições válidas completas, CANCELLED, transição inválida 422, estado final     | `status-flow.cy.js`     |

### Parte B – Web (E2E)

| Área              | Cenários cobertos                                      | Arquivo               |
|-------------------|--------------------------------------------------------|-----------------------|
| Login / Logout    | Sucesso, falha, logout                                 | `login.cy.js`         |
| Listagem          | Exibição, busca, filtro status, paginação              | `shipments-list.cy.js`|
| Cadastro          | Sucesso, erros de validação (referência, origem=destino)| `new-shipment.cy.js` |
| Combinado         | Cria API → valida UI → muda status UI → valida API     | `e2e-combined.cy.js`  |

### Parte C – SQL

Arquivo: `sql/queries.sql`

1. Quantidade de embarques por status  
2. Total de embarques e valor USD por cliente (ordenado)  
3. Histórico inconsistente com status atual  
4. Violações de regras de negócio (origem=destino, peso/valor inválidos, referência fora do padrão, incoterm inválido)  
5. Contagem de CREATED (para validação cruzada com API)

> Para executar as queries use qualquer cliente SQLite (DB Browser, DBeaver, `sqlite3 data/logitrack.db`).

---

## 8. Configurações principais (`cypress.config.js`)

```js
baseUrl: 'http://localhost:3000'
env: {
  analista: { email, password, role },
  admin:    { email, password, role }
}
```

Timeouts generosos (10–15 s) para ambiente local.  
Screenshots em falha ativados. Vídeo desativado por padrão (pode habilitar).

---

## 9. Variáveis de ambiente / parametrização

Credenciais e `baseUrl` **não devem ser versionadas**. Configure-as via:

### Opção A – arquivo `cypress.env.json` (não versionado, já está no `.gitignore`)

Crie o arquivo `cypress.env.json` na raiz do projeto de automação com o seguinte modelo (substitua os valores conforme o enunciado do desafio):

```json
{
  "baseUrl": "http://localhost:3000",
  "analista": {
    "email": "<SEU_EMAIL_ANALISTA>",
    "password": "<SUA_SENHA_ANALISTA>"
  },
  "admin": {
    "email": "<SEU_EMAIL_ADMIN>",
    "password": "<SUA_SENHA_ADMIN>"
  }
}
```

### Opção B – variáveis de ambiente (PowerShell)

```powershell
$env:CYPRESS_baseUrl = "http://localhost:3000"
$env:CYPRESS_analista__email = "<SEU_EMAIL_ANALISTA>"
$env:CYPRESS_analista__password = "<SUA_SENHA_ANALISTA>"
npx cypress run
```

---
## 10. O que foi priorizado / o que ficou de fora

**Priorizado (alto valor):**
- Autenticação e autorização
- Regras de negócio de status e validação de payload
- Independência total via `/api/__reset`
- Fluxo combinado API + UI
- SQL de inconsistências e violações

**Deixado de fora (por tempo / valor marginal):**
- Cobertura exaustiva de todos os campos de erro de UI
- Testes de performance / carga
- Acessibilidade
- Visual regression
- CI/CD pipeline completo (pode ser adicionado facilmente com GitHub Actions)

---

## 11. Como reportar defeitos encontrados

Caso algum teste falhe por defeito real da aplicação:

1. Marque o teste com `.skip` ou tag `// @bug` e referencie o ID do defeito no relatório.
2. Registre no relatório de bugs:
   - Título
   - Passos
   - Resultado esperado (OpenAPI + regras de negócio)
   - Resultado obtido
   - Evidência (screenshot / response body)
   - Severidade

Testes que falham de propósito por defeito conhecido são bem-vindos e devem ser documentados.

---

## 12. Comandos úteis (resumo Windows)

```powershell
# Instalar
npm install

# Abrir Cypress
npm run cy:open

# Rodar tudo headless
npm run cy:run

# Só API
npm run cy:run:api

# Só Web
npm run cy:run:web

# Com relatório
npm run report
```

---

**Boa sorte na apresentação!**  
Qualquer dúvida sobre o enunciado ou sobre a execução, pergunte.

