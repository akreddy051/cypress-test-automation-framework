# Cypress E2E Testing Framework

This repository contains an end-to-end (E2E) testing framework using Cypress, enhanced with BDD implementation, parallel execution, and comprehensive reporting features.

## Features

1. **BDD Framework**: Implemented using [badeball/cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor).
2. **Parallel Execution**: Achieved using [npm-run-all](https://www.npmjs.com/package/npm-run-all).
3. **Allure Reporting**: Integrated for detailed test execution reports.
4. **HTML Reporting**: Utilizing [multiple-cucumber-html-reporter](https://www.npmjs.com/package/multiple-cucumber-html-reporter).
5. **Report Archiving**: Automatically archives the previous execution report before generating a new one.
6. **Customized Runner**: A `runner.js` file for streamlined command line execution.
