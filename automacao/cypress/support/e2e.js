// Este arquivo é executado uma vez antes de todos os specs.
// Carrega comandos customizados e configura handlers globais.

// ***********************************************************
// Support file carregado automaticamente antes de cada spec
// ***********************************************************

import './commands';

// Evita falha em uncaught exceptions da aplicação sob teste (SPA).
// Retornar false impede que o Cypress marque o teste como falho
// por erros JavaScript não tratados originados da aplicação.
Cypress.on('uncaught:exception', (err) => {
  // Retorne false para impedir que o Cypress falhe o teste
  // por erros não tratados da SPA
  return false;
});
