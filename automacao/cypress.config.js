const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    viewportWidth: 1280,
    viewportHeight: 720,
    env: {
      apiUrl: 'http://localhost:3000',
      analista: {
        email: 'analista@logitrack.test',
        password: 'Senha@123',
        role: 'analista'
      },
      admin: {
        email: 'admin@logitrack.test',
        password: 'Admin@123',
        role: 'admin'
      }
    },
    setupNodeEvents(on, config) {
      // Plugin opcional para SQL validation via Node (sqlite3)
      // on('task', { ... })
      return config;
    }
  }
});
