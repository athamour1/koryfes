// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your e2e test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';

// The Quasar AE helpers ship as ESM-only and can't be bundled by Cypress's
// e2e webpack preprocessor; e2e specs only need cy.dataCy()
Cypress.Commands.add('dataCy', (value, options) => cy.get(`[data-cy=${value}]`, options));
import '@cypress/code-coverage/support';
