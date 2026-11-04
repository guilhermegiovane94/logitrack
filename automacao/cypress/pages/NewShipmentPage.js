class NewShipmentPage {
  /** Navega para a tela de cadastro de novo embarque. */
  visit() {
    cy.visit('/#/shipments/new');
  }

  /**
   * Preenche o formulário de cadastro de embarque com os dados informados.
   * @param {object} data - Objeto com os campos do embarque.
   * @param {string} [data.reference] - Referência do embarque.
   * @param {string} [data.customer] - Nome do cliente.
   * @param {string} [data.origin] - Cidade/país de origem.
   * @param {string} [data.destination] - Cidade/país de destino.
   * @param {string} [data.incoterm] - Incoterm (FOB, CIF, EXW, DAP, DDP).
   * @param {number} [data.weightKg] - Peso em kg.
   * @param {number} [data.valueUsd] - Valor em USD.
   */
  fillForm(data) {
    if (data.reference) cy.get('#reference').clear().type(data.reference);
    if (data.customer) cy.get('#customer').clear().type(data.customer);
    if (data.origin) cy.get('#origin').clear().type(data.origin);
    if (data.destination) cy.get('#destination').clear().type(data.destination);
    if (data.incoterm) cy.get('#incoterm').select(data.incoterm);
    if (data.weightKg !== undefined) cy.get('#weightKg').clear().type(String(data.weightKg));
    if (data.valueUsd !== undefined) cy.get('#valueUsd').clear().type(String(data.valueUsd));
  }

  /** Submete o formulário de cadastro de embarque. */
  submit() {
    cy.get('#new-form').submit();
  }

  /**
   * Retorna o elemento de mensagem de erro de um campo específico.
   * @param {string} field - Nome do campo (ex: 'reference', 'customer').
   */
  getFieldError(field) {
    return cy.get(`.field-error[data-for="${field}"]`);
  }

  /** Clica no botão Cancelar para voltar à listagem sem salvar. */
  cancel() {
    cy.get('#cancel-new').click();
  }
}

export default new NewShipmentPage();
