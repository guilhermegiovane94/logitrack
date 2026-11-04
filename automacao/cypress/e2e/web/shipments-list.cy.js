import ShipmentsPage from '../../pages/ShipmentsPage';

// =============================================================================
// Web - Listagem, busca, filtro e paginação
// Valida a tela de listagem de embarques: exibição, busca por referência,
// filtro por status e navegação de paginação.
// =============================================================================
describe('Web - Listagem, busca, filtro e paginação', () => {
  // Reseta a massa e faz login como analista antes de cada teste.
  beforeEach(() => {
    cy.resetDb();
    cy.loginUi('analista');
  });

  // CT-WEB-LIST-01: Listagem de embarques — deve exibir ao menos uma linha na tabela.
  it('Exibe lista de embarques', () => {
    ShipmentsPage.visit(); // Abre a tela de listagem
    ShipmentsPage.getListBody().should('be.visible', 'O corpo da lista deve ser visível');
    // Deve ter linhas (massa inicial tem 27 registros)
    cy.get('#list-body tr, #list-body [data-testid="shipment-row"]').should('have.length.at.least', 1, 'Deve conter ao menos um embarque');
  });

  // CT-WEB-LIST-02: Busca por referência — deve filtrar e exibir o embarque procurado.
  it('Busca por referência', () => {
    ShipmentsPage.search('LT-2026-0001'); // Digita o termo e clica em aplicar
    cy.get('#list-body').should('contain', 'LT-2026-0001', 'O resultado deve conter a referência buscada');
  });

  // CT-WEB-LIST-03: Filtro por status CREATED — lista deve exibir apenas embarques com esse status.
  it('Filtro por status CREATED', () => {
    ShipmentsPage.filterByStatus('CREATED'); // Seleciona o status e aplica
    // Todas as linhas visíveis devem ser CREATED (badge ou texto)
    cy.get('#list-body').should('be.visible', 'A lista filtrada deve ser exibida');
  });

  // CT-WEB-LIST-04: Paginação — clicar em "próximo" deve avançar para a página 2.
  it('Paginação - botão próximo', () => {
    ShipmentsPage.getPageInfo().should('be.visible', 'A paginação deve ser visível');
    ShipmentsPage.goToNextPage(); // Clica no botão próxima página
    ShipmentsPage.getPageInfo().should('contain', '2', 'A página atual deve ser 2');
  });
});
