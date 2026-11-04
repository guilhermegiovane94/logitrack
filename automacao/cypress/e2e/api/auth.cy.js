// =============================================================================
// API - Autenticação
// Valida o endpoint POST /api/auth/login (sucesso, falha, campos ausentes)
// e o acesso a rotas protegidas sem token ou com token inválido.
// =============================================================================
describe('API - Autenticação', () => {
  // Antes de cada teste, reseta a massa inicial para garantir independência.
  beforeEach(() => {
    cy.resetDb();
  });

  // CT-AUTH-01: Login válido com perfil analista — deve retornar 200, token e dados do usuário sem senha.
  it('Login válido com perfil analista', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: Cypress.env('analista').email,
        password: Cypress.env('analista').password
      }
    }).then((resp) => {
      expect(resp.status).to.eq(200, 'Login analista deve retornar 200 OK');
      // O token deve ser uma string não vazia
      expect(resp.body).to.have.property('token').and.be.a('string').and.not.be.empty;
      // O usuário retornado deve conter o e-mail e role correto
      expect(resp.body.user).to.include({
        email: Cypress.env('analista').email,
        role: 'analista'
      });
      // Não deve expor a senha ou outros dados sensíveis no corpo da resposta
      expect(resp.body.user).to.not.have.property('password');
    });
  });

  // CT-AUTH-02: Login válido com perfil admin — deve retornar 200 e role 'admin'.
  it('Login válido com perfil admin', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: Cypress.env('admin').email,
        password: Cypress.env('admin').password
      }
    }).then((resp) => {
      expect(resp.status).to.eq(200, 'Login admin deve retornar 200 OK');
      expect(resp.body.user.role).to.eq('admin', 'O papel do usuário deve ser admin');
    });
  });

  // CT-AUTH-03: Login com credenciais inválidas — deve retornar 401 e código INVALID_CREDENTIALS.
  it('Login inválido - credenciais erradas', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'naoexiste@logitrack.test',
        password: 'errada'
      },
      // Não falhar automaticamente em status 4xx/5xx para podermos validar o corpo
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(401, 'Credenciais inválidas devem retornar 401 Unauthorized');
      expect(resp.body).to.have.property('code', 'INVALID_CREDENTIALS');
    });
  });

  // CT-AUTH-04: Login com campo obrigatório ausente (senha) — deve retornar 400 e VALIDATION_ERROR.
  it('Login com campos ausentes retorna 400', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'analista@logitrack.test' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400, 'Campos ausentes devem retornar 400 Bad Request');
      expect(resp.body).to.have.property('code', 'VALIDATION_ERROR');
    });
  });

  // CT-AUTH-05: Acesso a rota protegida sem token — deve retornar 401.
  it('Acesso sem token retorna 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/shipments',
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(401, 'Requisição sem token deve retornar 401 Unauthorized');
    });
  });

  // CT-AUTH-06: Acesso a rota protegida com token inválido — deve retornar 401.
  it('Acesso com token inválido retorna 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/shipments',
      headers: { Authorization: 'Bearer token-invalido' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(401, 'Token inválido deve retornar 401 Unauthorized');
    });
  });
});
