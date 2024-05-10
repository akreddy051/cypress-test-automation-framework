const { defineConfig } = require("cypress");
const {
  addCucumberPreprocessorPlugin, afterRunHandler
} = require("@badeball/cypress-cucumber-preprocessor");
const {
  preprocessor,
} = require("@badeball/cypress-cucumber-preprocessor/browserify");
const report = require("multiple-cucumber-html-reporter");
let browserDetails;


async function setupNodeEvents(on, config) {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config,{
    omitAfterRunHandler: true
  });

  on("file:preprocessor", preprocessor(config));

  on("after:run", async (results) => {
    await afterRunHandler(config);
    browserDetails = results
    generateHTMLReport()
  })

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

function generateHTMLReport() {
  const cucumberJsonDir = './cypress/test-outputs/json-reports'
  const htmlReportDir = './cypress/test-outputs/html-report'
  const osName = browserDetails.osName=="darwin"?"osx":browserDetails.osName
  report.generate({
    openReportInBrowser: true,
    jsonDir: cucumberJsonDir,
    reportPath: htmlReportDir,
    saveCollectedJSON: true,
    displayDuration: true,
    displayReportTime: true,
    removeFolders: true,
    pageTitle: 'Execution Report',
    reportName: `Execution Report - ${new Date().toLocaleString()}`,
    metadata: {
      browser: {
        name: browserDetails.browserName,
        version: browserDetails.browserVersion,
      },
      device: "Local test machine",
      platform: {
        name: osName,
        version: browserDetails.osVersion
      },
    },
  })
}