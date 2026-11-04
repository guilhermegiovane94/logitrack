class ShipmentsPage {
  /** Navega para a tela de listagem de embarques. */
  visit() {
    cy.visit('/#/shipments');
  }

  /**
   * Realiza busca textual na listagem de embarques.
   * @param {string} term - Termo de busca (ex: referência ou nome do cliente).
   */
  search(term) {
    cy.get('#q').clear().type(term);
    cy.get('#apply').click();
  }

  /**
   * Aplica filtro por status na listagem.
   * @param {string} status - Status a ser filtrado (ex: CREATED, IN_TRANSIT, DELIVERED).
   */
  filterByStatus(status) {
    cy.get('#status').select(status);
    cy.get('#apply').click();
  }

  /** Retorna o corpo da tabela/lista de embarques. */
  getListBody() {
    return cy.get('#list-body');
  }

  /** Retorna todas as linhas de embarque da listagem. */
  getRows() {
    return cy.get('[data-testid="shipment-row"]');
  }

  /** Navega para a próxima página da paginação. */
  goToNextPage() {
    cy.get('#next').click();
  }

  /** Navega para a página anterior da paginação. */
  goToPrevPage() {
    cy.get('#prev').click();
  }

  /** Retorna o elemento que exibe a paginação (página atual/total). */
  getPageInfo() {
    return cy.get('#page-info');
  }

  /** Retorna o elemento que exibe o total de registros. */
  getTotal() {
    return cy.get('#total');
  }

  /** Clica no link/botão para abrir o cadastro de novo embarque. */
  openNewShipment() {
    cy.contains('a', 'Novo embarque').click();
  }
}

export default new ShipmentsPage();
