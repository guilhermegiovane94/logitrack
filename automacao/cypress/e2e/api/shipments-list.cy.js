// =============================================================================
// API - Listagem de embarques
// Valida paginação (padrão e customizada), filtros por status e busca,
// além de tratamento de parâmetros inválidos.
// =============================================================================
describe('API - Listagem de embarques', () => {
  // Reseta a massa e autentica como analista antes de cada teste.
  beforeEach(() => {
    cy.resetDb();
    cy.loginApi('analista');
  });

  // CT-LIST-01: Listagem padrão — contrato com chaves data/meta, metadados consistentes e limite de 10 itens.
  it('Lista com paginação padrão e meta consistente', () => {
    cy.api('GET', '/api/shipments').then((resp) => {
      expect(resp.status).to.eq(200, 'Listagem deve retornar 200 OK');
      expect(resp.body).to.have.keys('data', 'meta', 'O corpo deve conter data e meta');
      expect(resp.body.meta).to.include.keys('page', 'pageSize', 'total', 'totalPages');
      expect(resp.body.meta.page).to.eq(1, 'Página padrão deve ser 1');
      expect(resp.body.meta.pageSize).to.eq(10, 'pageSize padrão deve ser 10');
      expect(resp.body.meta.totalPages).to.eq(
        Math.ceil(resp.body.meta.total / resp.body.meta.pageSize),
        'totalPages deve ser coerente com total e pageSize'
      );
      expect(resp.body.data).to.be.an('array').and.have.length.at.most(10, 'Não deve exceder pageSize itens');
    });
  });

  // CT-LIST-02: Paginação customizada (page=2, pageSize=5).
  it('Paginação - page e pageSize', () => {
    cy.api('GET', '/api/shipments?page=2&pageSize=5').then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.meta.page).to.eq(2, 'Página solicitada deve ser 2');
      expect(resp.body.meta.pageSize).to.eq(5, 'pageSize solicitado deve ser 5');
      expect(resp.body.data).to.have.length.at.most(5, 'Não deve exceder o pageSize solicitado');
    });
  });

  // CT-LIST-03: Filtro por status CREATED — todas as filas devem ter esse status.
  it('Filtro por status', () => {
    cy.api('GET', '/api/shipments?status=CREATED').then((resp) => {
      expect(resp.status).to.eq(200);
      resp.body.data.forEach((s) => {
        expect(s.status).to.eq('CREATED', 'Cada embarque filtrado deve ter status CREATED');
      });
    });
  });

  // CT-LIST-04: Busca por referência (case-insensitive).
  it('Busca por referência (case-insensitive)', () => {
    cy.api('GET', '/api/shipments?q=lt-2026-0001').then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.data.length).to.be.greaterThan(0, 'Deve retornar ao menos um resultado');
      expect(resp.body.data[0].reference.toLowerCase()).to.include('lt-2026-0001', 'Busca deve ignorar maiúsculas/minúsculas');
    });
  });

  // CT-LIST-05: Busca por nome do cliente — valida apenas o contrato da resposta.
  it('Busca por cliente', () => {
    cy.api('GET', '/api/shipments?q=cliente').then((resp) => {
      expect(resp.status).to.eq(200);
      // Pode ou não haver resultados dependendo da massa inicial; valida apenas o contrato
      expect(resp.body).to.have.keys('data', 'meta');
    });
  });

  // CT-LIST-06: Status inválido no filtro — deve retornar 400.
  it('Status inválido retorna 400', () => {
    cy.api('GET', '/api/shipments?status=INVALIDO').then((resp) => {
      expect(resp.status).to.eq(400, 'Status inválido deve retornar 400 Bad Request');
    });
  });
});
