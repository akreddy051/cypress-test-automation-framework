const { defineConfig } = require("cypress");
const {
  addCucumberPreprocessorPlugin,
} = require("@badeball/cypress-cucumber-preprocessor");
const {
  preprocessor,
} = require("@badeball/cypress-cucumber-preprocessor/browserify");
const fs = require('fs')
const report = require('multiple-cucumber-html-reporter')


async function setupNodeEvents(on, config) {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config);

  on("file:preprocessor", preprocessor(config));
  on('after:run',()=>{
    // generateHTMLReport()
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

//This method generates HTML Report after the execution in "test-outputs/html-report" folder
function generateHTMLReport() {
  const cucumberJsonDir = './cypress/test-outputs/json-reports'
  const htmlReportDir = './cypress/test-outputs/html-report'
  // fetching browser and OS details
  const readBrowserInfoFileContents = fs.readFileSync('cypress/fixtures/browserInfo.json','utf-8');
  const parsedBrowserInfo = JSON.parse(readBrowserInfoFileContents)
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
        name: parsedBrowserInfo.browserInfo.name,
        version: parsedBrowserInfo.browserInfo.version,
      },
      device: "Local test machine",
      platform: {
        name: parsedBrowserInfo.osInfo.name=='darwin'?"osx":parsedBrowserInfo.osInfo.name,
        version: "Debian GNU/Linux 11 (bullseye)"
      },
    },
  })
}