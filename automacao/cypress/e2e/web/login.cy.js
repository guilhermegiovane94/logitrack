import LoginPage from '../../pages/LoginPage';

// =============================================================================
// Web - Login e Logout
// Valida o fluxo de autenticação na interface: sucesso, falha de credenciais
// e limpeza de token ao fazer logout.
// =============================================================================
describe('Web - Login e Logout', () => {
  // Reseta a massa antes de cada teste para garantir isolamento.
  beforeEach(() => {
    cy.resetDb();
  });

  // CT-WEB-LOGIN-01: Login com sucesso (analista) — deve exibir topbar, whoami e redirecionar para /shipments.
  it('Login com sucesso (analista)', () => {
    LoginPage.visit(); // Abre a tela de login
    LoginPage.login(
      Cypress.env('analista').email,
      Cypress.env('analista').password
    );
    cy.get('#topbar').should('be.visible', 'A barra superior deve aparecer após login');
    cy.get('#whoami').should('be.visible', 'O identificador do usuário deve ser exibido');
    cy.hash().should('include', '/shipments', 'Deve redirecionar para a listagem de embarques');
  });

  // CT-WEB-LOGIN-02: Login com falha — credenciais inválidas devem exibir mensagem de erro e não mostrar topbar.
  it('Login com falha - credenciais inválidas', () => {
    LoginPage.visit();
    LoginPage.login('errado@logitrack.test', 'senhaerrada');
    LoginPage.getError().should('be.visible').and('not.be.empty', 'Mensagem de erro deve ser exibida');
    cy.get('#topbar').should('not.be.visible', 'A barra superior não deve aparecer em caso de falha');
  });

  // CT-WEB-LOGOUT-01: Logout — deve voltar ao formulário de login e limpar o token do localStorage.
  it('Logout', () => {
    cy.loginUi('analista'); // Faz login pela UI
    cy.logoutUi(); // Clica no logout
    cy.get('#login-form').should('be.visible', 'Deve retornar à tela de login após logout');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('logitrack.token')).to.be.null, 'O token deve ser removido do localStorage';
    });
  });
});
