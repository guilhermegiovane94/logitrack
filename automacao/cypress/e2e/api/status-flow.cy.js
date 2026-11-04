// =============================================================================
// API - Fluxo de status e histórico
// Valida a máquina de estados de embarques: transições permitidas,
// transições inválidas, estados finais (CANCELLED/DELIVERED) e histórico de eventos.
// =============================================================================
describe('API - Fluxo de status e histórico', () => {
  // Reseta a massa e autentica como analista antes de cada teste.
  beforeEach(() => {
    cy.resetDb();
    cy.loginApi('analista');
  });

  // CT-STATUS-01: Fluxo completo CREATED → IN_TRANSIT → CUSTOMS → DELIVERED com validação de histórico.
  it('Transições válidas: CREATED → IN_TRANSIT → CUSTOMS → DELIVERED', () => {
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9400',
      customer: 'Fluxo Completo',
      origin: 'Santos',
      destination: 'Singapore',
      incoterm: 'DDP',
      weightKg: 500,
      valueUsd: 25000
    }).then((create) => {
      const id = create.body.id;
      expect(create.body.status).to.eq('CREATED', 'Status inicial deve ser CREATED');

      // Transição CREATED → IN_TRANSIT
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'IN_TRANSIT' }).then((r1) => {
        expect(r1.status).to.eq(200, 'CREATED → IN_TRANSIT deve retornar 200');
        expect(r1.body.status).to.eq('IN_TRANSIT');
      });

      // Transição IN_TRANSIT → CUSTOMS
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'CUSTOMS' }).then((r2) => {
        expect(r2.status).to.eq(200, 'IN_TRANSIT → CUSTOMS deve retornar 200');
        expect(r2.body.status).to.eq('CUSTOMS');
      });

      // Transição CUSTOMS → DELIVERED
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'DELIVERED' }).then((r3) => {
        expect(r3.status).to.eq(200, 'CUSTOMS → DELIVERED deve retornar 200');
        expect(r3.body.status).to.eq('DELIVERED');
      });

      // O histórico de eventos deve conter pelo menos a criação + 3 mudanças de status
      cy.api('GET', `/api/shipments/${id}/events`).then((events) => {
        expect(events.status).to.eq(200);
        expect(events.body).to.be.an('array').and.have.length.at.least(3, 'Histórico deve registrar as mudanças');
      });
    });
  });

  // CT-STATUS-02: Transição CREATED → CANCELLED é válida — espera 200 e status CANCELLED.
  it('CANCELLED a partir de CREATED', () => {
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9401',
      customer: 'Cancelar',
      origin: 'A',
      destination: 'B',
      incoterm: 'EXW',
      weightKg: 10,
      valueUsd: 100
    }).then((create) => {
      const id = create.body.id;
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'CANCELLED' }).then((resp) => {
        expect(resp.status).to.eq(200, 'CREATED → CANCELLED deve retornar 200');
        expect(resp.body.status).to.eq('CANCELLED');
      });
    });
  });

  // CT-STATUS-03: Transição inválida CREATED → DELIVERED (pula estados) — espera 422 INVALID_TRANSITION.
  it('Transição inválida: CREATED → DELIVERED retorna 422', () => {
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9402',
      customer: 'Invalido',
      origin: 'A',
      destination: 'B',
      incoterm: 'FOB',
      weightKg: 10,
      valueUsd: 100
    }).then((create) => {
      const id = create.body.id;
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'DELIVERED' }).then((resp) => {
        expect(resp.status).to.eq(422, 'Transição inválida deve retornar 422');
        expect(resp.body).to.have.property('code', 'INVALID_TRANSITION');
      });
    });
  });

  // CT-STATUS-04: Estado final CANCELLED não permite nova transição — espera 422.
  it('Estados finais não permitem novas transições', () => {
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9403',
      customer: 'Final',
      origin: 'A',
      destination: 'B',
      incoterm: 'FOB',
      weightKg: 10,
      valueUsd: 100
    }).then((create) => {
      const id = create.body.id;
      // Move para estado final CANCELLED
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'CANCELLED' });
      // Tentativa de transição a partir de estado final deve falhar
      cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'IN_TRANSIT' }).then((resp) => {
        expect(resp.status).to.eq(422, 'Estado final não deve permitir nova transição');
      });
    });
  });
});
