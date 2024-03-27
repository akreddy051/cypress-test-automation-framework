const report = require("multiple-cucumber-html-reporter");
const fs = require('fs')

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
        name: "Windows",
        version: "10"
      },
    },
  })
}

generateHTMLReport()

