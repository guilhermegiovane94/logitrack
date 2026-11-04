class LoginPage {
  /** Navega para a tela de login (raiz da aplicação). */
  visit() {
    cy.visit('/');
  }

  /** Preenche o campo de e-mail no formulário de login. */
  fillEmail(email) {
    cy.get('#email').clear().type(email);
  }

  /** Preenche o campo de senha no formulário de login. */
  fillPassword(password) {
    cy.get('#password').clear().type(password);
  }

  /** Submete o formulário de login. */
  submit() {
    cy.get('#login-form').submit();
  }

  /** Retorna o elemento de mensagem de erro de login. */
  getError() {
    return cy.get('#login-error');
  }

  /** Executa o fluxo completo de login: preenche e-mail, senha e submete. */
  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
  }
}

export default new LoginPage();
