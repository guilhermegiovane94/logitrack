// =============================================================================
// API - CRUD de embarques
// Valida criação (POST), leitura implícita, atualização (PUT) e regras de negócio
// (referência duplicada, campos inválidos, edição apenas em status CREATED).
// =============================================================================
describe('API - CRUD de embarques', () => {
  // Reseta a massa e autentica como analista antes de cada teste.
  beforeEach(() => {
    cy.resetDb();
    cy.loginApi('analista');
  });

  // CT-CRUD-01: Cria embarque válido — status inicial deve ser CREATED, retorna 201.
  it('Cria embarque com sucesso (status inicial CREATED)', () => {
    cy.fixture('shipments').then((data) => {
      const payload = { ...data.valid, reference: 'LT-2026-9100' };
      cy.api('POST', '/api/shipments', payload).then((resp) => {
        expect(resp.status).to.eq(201, 'Criação bem-sucedida deve retornar 201 Created');
        expect(resp.body).to.include({
          reference: payload.reference,
          customer: payload.customer,
          status: 'CREATED'
        });
        expect(resp.body).to.have.property('id', 'O embarque criado deve gerar um ID');
        expect(resp.body.weightKg).to.eq(payload.weightKg);
        expect(resp.body.valueUsd).to.eq(payload.valueUsd);
      });
    });
  });

  // CT-CRUD-02: Referência duplicada — deve retornar 409 e código DUPLICATE_REFERENCE.
  it('Referência duplicada retorna 409', () => {
    cy.fixture('shipments').then((data) => {
      // LT-2026-0001 já existe na massa inicial
      const payload = { ...data.valid, reference: 'LT-2026-0001' };
      cy.api('POST', '/api/shipments', payload).then((resp) => {
        expect(resp.status).to.eq(409, 'Referência duplicada deve retornar 409 Conflict');
        expect(resp.body).to.have.property('code', 'DUPLICATE_REFERENCE');
      });
    });
  });

  // CT-CRUD-03: Referência fora do padrão — deve retornar 400 VALIDATION_ERROR.
  it('Validação: referência inválida', () => {
    cy.fixture('shipments').then((data) => {
      cy.api('POST', '/api/shipments', data.invalidReference).then((resp) => {
        expect(resp.status).to.eq(400, 'Referência inválida deve retornar 400 Bad Request');
        expect(resp.body).to.have.property('code', 'VALIDATION_ERROR');
      });
    });
  });

  // CT-CRUD-04: Origem igual a destino — deve retornar 400 (regra de negócio).
  it('Validação: origem igual a destino', () => {
    cy.fixture('shipments').then((data) => {
      cy.api('POST', '/api/shipments', data.sameOriginDestination).then((resp) => {
        expect(resp.status).to.eq(400, 'Origem igual a destino deve retornar 400 Bad Request');
      });
    });
  });

  // CT-CRUD-05: Peso igual a zero — deve retornar 400 (regra de negócio).
  it('Validação: peso <= 0', () => {
    cy.fixture('shipments').then((data) => {
      cy.api('POST', '/api/shipments', data.weightZero).then((resp) => {
        expect(resp.status).to.eq(400, 'Peso <= 0 deve retornar 400 Bad Request');
      });
    });
  });

  // CT-CRUD-06: Edição de embarque em status CREATED — deve retornar 200 com campos atualizados.
  it('Edita embarque CREATED com sucesso', () => {
    cy.api('POST', '/api/shipments', {
      reference: 'LT-2026-9200',
      customer: 'Original',
      origin: 'Santos',
      destination: 'Hamburg',
      incoterm: 'FOB',
      weightKg: 100,
      valueUsd: 1000
    }).then((create) => {
      const id = create.body.id;
      cy.api('PUT', `/api/shipments/${id}`, {
        reference: 'LT-2026-9200',
        customer: 'Atualizado',
        origin: 'Santos',
        destination: 'Hamburg',
        incoterm: 'CIF',
        weightKg: 150,
        valueUsd: 1500
      }).then((resp) => {
        expect(resp.status).to.eq(200, 'Edição de embarque CREATED deve retornar 200 OK');
        expect(resp.body.customer).to.eq('Atualizado');
        expect(resp.body.incoterm).to.eq('CIF');
      });
    });
  });

  // CT-CRUD-07: Edição de embarque NÃO em CREATED — deve retornar 422 NOT_EDITABLE.
  it('Não permite editar embarque que não está CREATED (422)', () => {
    // Busca um embarque já em status diferente de CREATED (ou cria e move para IN_TRANSIT)
    cy.api('GET', '/api/shipments?status=IN_TRANSIT&pageSize=1').then((list) => {
      if (list.body.data.length === 0) {
        // Não há embarque IN_TRANSIT: cria um e altera seu status
        cy.api('POST', '/api/shipments', {
          reference: 'LT-2026-9300',
          customer: 'Transito',
          origin: 'A',
          destination: 'B',
          incoterm: 'FOB',
          weightKg: 10,
          valueUsd: 100
        }).then((c) => {
          const id = c.body.id;
          cy.api('PATCH', `/api/shipments/${id}/status`, { status: 'IN_TRANSIT' });
          cy.api('PUT', `/api/shipments/${id}`, {
            reference: 'LT-2026-9300',
            customer: 'X',
            origin: 'A',
            destination: 'B',
            incoterm: 'FOB',
            weightKg: 10,
            valueUsd: 100
          }).then((resp) => {
            expect(resp.status).to.eq(422, 'Edição de embarque não-CREATED deve retornar 422');
            expect(resp.body).to.have.property('code', 'NOT_EDITABLE');
          });
        });
      } else {
        // Já existe um embarque IN_TRANSIT: tenta editá-lo diretamente
        const id = list.body.data[0].id;
        cy.api('PUT', `/api/shipments/${id}`, {
          reference: list.body.data[0].reference,
          customer: 'X',
          origin: 'A',
          destination: 'B',
          incoterm: 'FOB',
          weightKg: 10,
          valueUsd: 100
        }).then((resp) => {
          expect(resp.status).to.eq(422, 'Edição de embarque não-CREATED deve retornar 422');
        });
      }
    });
  });
});
