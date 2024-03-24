const { defineConfig } = require("cypress");
const {
  addCucumberPreprocessorPlugin,
} = require("@badeball/cypress-cucumber-preprocessor");
const {
  preprocessor,
} = require("@badeball/cypress-cucumber-preprocessor/browserify");


async function setupNodeEvents(on, config) {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config);

  on("file:preprocessor", preprocessor(config));

  return config;
}

module.exports = defineConfig({
  defaultCommandTimeout:8000,
  requestTimeout:20000,
  responseTimeout:60000,
  viewportHeight:1080,
  viewportWidth:1080,
  video:false,
  videoCompression:40,
  trashAssetsBeforeRuns:false,
  e2e: {
    testIsolation:false,
    inlineAssets:true,
    screenshotsFolder:'cypress/test-outputs/screenshots',
    screenshotOnRunFailure:true,
    setupNodeEvents,
    specPattern: "cypress/integration/features/*.feature",
    baseUrl: "https://www.saucedemo.com",
    chromeWebSecurity: false,
  },
});
