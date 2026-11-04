// =============================================================================
// E2E Combinado - API + Web
// Fluxo ponta a ponta: cria embarque via API, valida na interface,
// muda status via UI e confirma a atualização via API.
// =============================================================================
describe('E2E Combinado - API + Web', () => {
  // Reseta a massa antes do teste para garantir isolamento.
  beforeEach(() => {
    cy.resetDb();
  });

  // CT-E2E-01: Cria embarque via API, valida na UI, muda status via UI e confirma via API.
  it('Cria embarque via API e valida na interface', () => {
    // 1. Cria o embarque via API (autenticado como analista)
    cy.loginApi('analista');
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9600',
      customer: 'Cliente E2E Combinado',
      origin: 'Santos',
      destination: 'Busan',
      incoterm: 'DAP',
      weightKg: 1200,
      valueUsd: 78000.99
    }).then((resp) => {
      expect(resp.status).to.eq(201, 'Criação via API deve retornar 201 Created');
      const id = resp.body.id;

      // 2. Abre a interface e busca o embarque criado
      cy.loginUi('analista');
      cy.visit('/#/shipments');
      cy.get('#q').clear().type('LT-2026-9600');
      cy.get('#apply').click();
      cy.get('#list-body').should('contain', 'LT-2026-9600', 'A listagem deve exibir o embarque criado via API');
      cy.get('#list-body').should('contain', 'Cliente E2E Combinado');

      // 3. Abre a tela de detalhe do embarque
      cy.contains('LT-2026-9600').click();
      cy.get('#detail-ref').should('contain', 'LT-2026-9600', 'A referência no detalhe deve coincidir');
      cy.get('#d-status').should('contain', 'Criado', 'O status inicial deve ser Criado (CREATED)');

      // 4. Muda o status via UI para "Iniciar trânsito" (IN_TRANSIT)
      cy.get('button[data-to="IN_TRANSIT"]').click();
      cy.get('[data-testid="toast"]').should('be.visible', 'Toast de confirmação deve aparecer');
      cy.get('#d-status').should('contain', 'Em trânsito', 'O status no detalhe deve ser atualizado');

      // 5. Valida via API que o status foi persistido no banco
      cy.api('GET', `/api/shipments/${id}`).then((getResp) => {
        expect(getResp.body.status).to.eq('IN_TRANSIT', 'A API deve confirmar o status IN_TRANSIT');
      });
    });
  });
});
