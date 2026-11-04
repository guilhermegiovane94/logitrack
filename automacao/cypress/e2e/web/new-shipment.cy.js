import NewShipmentPage from '../../pages/NewShipmentPage';
import ShipmentsPage from '../../pages/ShipmentsPage';

// =============================================================================
// Web - Cadastro de embarque
// Valida o formulário de novo embarque: sucesso, referência inválida e
// origem igual a destino (regras de negócio na UI).
// =============================================================================
describe('Web - Cadastro de embarque', () => {
  // Reseta a massa e faz login como analista antes de cada teste.
  beforeEach(() => {
    cy.resetDb();
    cy.loginUi('analista');
  });

  // CT-WEB-NEW-01: Cadastro com dados válidos — deve exibir toast de sucesso, redirecionar e o embarque aparecer na listagem.
  it('Cadastra embarque com sucesso', () => {
    NewShipmentPage.visit(); // Abre a tela de cadastro
    NewShipmentPage.fillForm({
      reference: 'LT-2026-9500',
      customer: 'Cliente Web QA',
      origin: 'Santos - SP',
      destination: 'Rotterdam - NL',
      incoterm: 'FOB',
      weightKg: 850.25,
      valueUsd: 32000.50
    });
    NewShipmentPage.submit(); // Submete o formulário

    // Deve redirecionar para a lista e mostrar toast de sucesso
    cy.get('[data-testid="toast"]').should('be.visible', 'Toast de sucesso deve ser exibido');
    cy.hash().should('include', '/shipments', 'Deve redirecionar para a listagem');
    ShipmentsPage.search('LT-2026-9500'); // Busca o embarque recém-criado
    cy.get('#list-body').should('contain', 'LT-2026-9500', 'O embarque deve constar na listagem');
  });

  // CT-WEB-NEW-02: Referência fora do padrão — deve exibir erro de validação no campo.
  it('Exibe erros de validação (referência inválida)', () => {
    NewShipmentPage.visit();
    NewShipmentPage.fillForm({
      reference: 'REF-INVALIDA', // padrão inválido (não segue LT-AAAA-NNNN)
      customer: 'Teste',
      origin: 'A',
      destination: 'B',
      incoterm: 'CIF',
      weightKg: 10,
      valueUsd: 100
    });
    NewShipmentPage.submit();
    NewShipmentPage.getFieldError('reference').should('not.be.empty', 'Campo reference deve exibir erro de validação');
  });

  // CT-WEB-NEW-03: Origem igual a destino — deve exibir erro de validação (campo ou toast).
  it('Exibe erro quando origem = destino', () => {
    NewShipmentPage.visit();
    NewShipmentPage.fillForm({
      reference: 'LT-2026-9501',
      customer: 'Teste',
      origin: 'Santos',
      destination: 'Santos', // igual à origem
      incoterm: 'FOB',
      weightKg: 10,
      valueUsd: 100
    });
    NewShipmentPage.submit();
    // Esperamos erro de validação (campo ou toast)
    cy.get('[data-testid="toast"], .field-error').should('exist', 'Deve exibir erro quando origem igual a destino');
  });
});
