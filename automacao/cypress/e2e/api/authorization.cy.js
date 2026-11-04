// =============================================================================
// API - Autorização por perfil
// Valida regras de controle de acesso (RBAC): admin pode excluir, analista não.
// =============================================================================
describe('API - Autorização por perfil', () => {
  // Reseta a massa antes de cada teste para garantir isolamento.
  beforeEach(() => {
    cy.resetDb();
  });

  // CT-AUTHZ-01: Usuário com perfil admin pode remover (DELETE) um embarque — espera 204 No Content.
  it('Admin pode remover embarque', () => {
    // Autentica como admin para obter o token
    cy.loginApi('admin');

    // Cria um embarque que será removido em seguida
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9001',
      customer: 'Cliente Remover',
      origin: 'Santos',
      destination: 'Rotterdam',
      incoterm: 'FOB',
      weightKg: 100,
      valueUsd: 5000
    }).then((createResp) => {
      expect(createResp.status).to.eq(201, 'Criação de embarque deve retornar 201 Created');
      const id = createResp.body.id;

      // Admin tem permissão para excluir
      cy.api('DELETE', `/api/shipments/${id}`).then((delResp) => {
        expect(delResp.status).to.eq(204, 'Exclusão por admin deve retornar 204 No Content');
      });
    });
  });

  // CT-AUTHZ-02: Usuário com perfil analista NÃO pode remover embarque — espera 403 Forbidden.
  it('Analista NÃO pode remover embarque (403)', () => {
    // Autentica como analista (perfil sem permissão de exclusão)
    cy.loginApi('analista');

    // Cria um embarque para tentar removê-lo
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9002',
      customer: 'Cliente Protegido',
      origin: 'Santos',
      destination: 'Rotterdam',
      incoterm: 'CIF',
      weightKg: 200,
      valueUsd: 8000
    }).then((createResp) => {
      expect(createResp.status).to.eq(201, 'Criação de embarque deve retornar 201 Created');
      const id = createResp.body.id;

      // Analista deve receber 403 ao tentar excluir
      cy.api('DELETE', `/api/shipments/${id}`).then((delResp) => {
        expect(delResp.status).to.eq(403, 'Exclusão por analista deve retornar 403 Forbidden');
        expect(delResp.body).to.have.property('code', 'FORBIDDEN');
      });
    });
  });
});
