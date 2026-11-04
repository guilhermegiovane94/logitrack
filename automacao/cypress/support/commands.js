// ***********************************************
// Custom Commands - LogiTrack
// ***********************************************
// Comandos customizados encapsulando ações recorrentes (reset de massa, login API/UI, logout e requisições autenticadas).
// Reduz duplicação nos specs e centraliza a lógica de autenticação.

/**
 * Reseta o banco de dados para a massa inicial (independência de testes).
 * Garante que cada spec começa do mesmo estado, evitando interferência entre testes.
 */
Cypress.Commands.add('resetDb', () => {
  cy.request({
    method: 'POST',
    url: '/api/__reset',
    failOnStatusCode: false
  }).then((resp) => {
    expect(resp.status).to.eq(204, 'O reset do banco deve retornar 204 No Content');
  });
});

/**
 * Realiza login via API e armazena o token no localStorage e no ambiente do Cypress.
 * @param {string} profile - Perfil de usuário: 'analista' | 'admin' (padrão: 'analista').
 * O token é usado posteriormente pelo comando `api` para requisições autenticadas.
 */
Cypress.Commands.add('loginApi', (profile = 'analista') => {
  const user = Cypress.env(profile);
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: user.email,
      password: user.password
    }
  }).then((resp) => {
    expect(resp.status).to.eq(200, 'Login via API deve retornar 200 OK');
    expect(resp.body).to.have.property('token', 'O corpo da resposta deve conter o token JWT');
    window.localStorage.setItem('logitrack.token', resp.body.token);
    window.localStorage.setItem('logitrack.user', JSON.stringify(resp.body.user));
    Cypress.env('token', resp.body.token);
    Cypress.env('currentUser', resp.body.user);
  });
});

/**
 * Realiza login pela interface web (SPA).
 * @param {string} profile - Perfil de usuário: 'analista' | 'admin' (padrão: 'analista').
 * Navega para a tela de login, preenche credenciais, submete o formulário e aguarda a barra superior (topbar).
 */
Cypress.Commands.add('loginUi', (profile = 'analista') => {
  const user = Cypress.env(profile);
  cy.visit('/');
  cy.get('#email').clear().type(user.email);
  cy.get('#password').clear().type(user.password);
  cy.get('#login-form').submit();
  cy.get('#topbar', { timeout: 10000 }).should('be.visible', 'A barra superior deve aparecer após login bem-sucedido');
  cy.get('#whoami').should('contain', user.email.split('@')[0], 'O e-mail do usuário logado deve ser exibido');
});

/**
 * Realiza logout pela interface web (SPA).
 * Clica no botão de logout e valida o retorno à tela de login.
 */
Cypress.Commands.add('logoutUi', () => {
  cy.get('#logout').click();
  cy.get('#login-form').should('be.visible', 'O formulário de login deve estar visível após logout');
});

/**
 * Executa uma requisição HTTP autenticada (Bearer token).
 * @param {string} method - Método HTTP (GET, POST, PUT, PATCH, DELETE).
 * @param {string} path - Caminho da rota da API (ex: '/api/shipments').
 * @param {object|null} body - Corpo da requisição (padrão: null).
 * @param {string|null} token - Token opcional; se omitido, usa o token armazenado via `loginApi` ou localStorage.
 * @returns {Cypress.Chainable} A cadeia de resposta do `cy.request`.
 */
Cypress.Commands.add('api', (method, path, body = null, token = null) => {
  const authToken = token || Cypress.env('token') || window.localStorage.getItem('logitrack.token');
  return cy.request({
    method,
    url: path,
    body: body || undefined,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    failOnStatusCode: false
  });
});
