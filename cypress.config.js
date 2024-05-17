const {
  defineConfig
} = require("cypress");
const {
  addCucumberPreprocessorPlugin,
  afterRunHandler,
} = require("@badeball/cypress-cucumber-preprocessor");
const {
  preprocessor,
} = require("@badeball/cypress-cucumber-preprocessor/browserify");
const {
  rmdir
} = require("fs");
const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");
const report = require("multiple-cucumber-html-reporter");
const base64 = require("js-base64");
let browserDetails;

async function setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config, {
    omitAfterRunHandler: true,
  });
  on("file:preprocessor", preprocessor(config));
  on("task", {
    deleteDownloads() {
      return new Promise((resolve) => {
        rmdir("cypress/downloads", {
          recursive: true
        }, () => {
          resolve(null);
        });
      });
    },
  });
  on("task", {
    queryDb: (query) => {
      const connection = mysql.createConnection(config.env.db);
      connection.connect();
      return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
          if (error) reject(error);
          else {
            connection.end();
            return resolve(results);
          }
        });
      });
    },
  });
  allureWriter(on, config);
  on("after:run", async (results) => {
    await afterRunHandler(config);
    browserDetails = results;
    renameCucumberJSONFile("cypress/test-output/json-reports", results.endedTestsAt);
    generateHTMLReport();
  });
  return config;
}

module.exports = defineConfig({
  pageLoadTimeout: 360000,
  defaultCommandTimeout: 8000,
  requestTimeout: 20000,
  responseTimeout: 60000,
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  videoCompression: 40,
  trashAssetsBeforeRuns: false,
  experimentalMemoryManagement: true,
  projectId: "cypress-test-automation",
  e2e: {
    baseUrl: "https://www.saucedemo.com",
    chromeWebSecurity: false,
    specPattern: "cypress/e2e/features/*.feature",
    testIsolation: false,
    inlineAssets: true,
    screenshotsFolder: "cypress/test-output/screenshots",
    screenshotOnRunFailure: true,
    env: {
      softAssertionCounter: 1,
      allureReuseAfterSpec: true,
      allureLogCypress: true,
      allureResultsPath: "cypress/test-output/allure-results",
      allureAttachRequests: true,
    },
    setupNodeEvents,
  },
});

//This method generates HTML Report after the Execution in "test-output/html-report" folder
function generateHTMLReport() {
  const cucumberJsonDir = "./cypress/test-output/json-reports";
  const htmlReportDir = "./cypress/test-output/html-report";
  const osName = browserDetails.osName == "darwin" ? "osx" : browserDetails.osName;
  processCucumberJsonFiles(cucumberJsonDir);
  report.generate({
    openReportInBrowser: true,
    jsonDir: cucumberJsonDir,
    reportPath: htmlReportDir,
    saveCollectedJSON: true,
    displayDuration: true,
    displayReportTime: true,
    removeFolders: true,
    pageTitle: "System-Test Report",
    reportName: `System - Test Report - ${new Date().toLocaleString()}`,
    metadata: {
      browser: {
        name: browserDetails.browserName,
        version: browserDetails.browserVersion,
      },
      device: "Local test machine",
      platform: {
        name: osName,
        version: browserDetails.osVersion,
      },
    },
  });
}

function sanitizeTimestamp(timestamp) {
  // Replace invalid characters for filenames
  return timestamp.replace(/[:]/g, "-");
}

function renameCucumberJSONFile(folderPath, timestamp) {
  const sanitizedTimestamp = sanitizeTimestamp(timestamp);
  const originalFilePath = path.join(folderPath, "cucumber.json");
  const newFileName = path.join(folderPath, `report-${sanitizedTimestamp}.json`);
  console.log(`Original File Path: ${originalFilePath}`);
  console.log(`New File Path: ${newFileName}`);
  try {
    if (!fs.existsSync(originalFilePath)) {
      console.error("Error: cucumber.json file does not exist");
      return;
    }
    const cucumberData = fs.readFileSync(originalFilePath, "utf-8");
    fs.writeFileSync(newFileName, cucumberData);
    console.log(`Created report: ${newFileName}`);
    try {
      fs.unlinkSync(originalFilePath);
      console.log("Deleted cucumber.json");
    } catch (error) {
      console.error("Error deleting cucumber.json:", error);
    }
  } catch (error) {
    console.error("Error during file operations:", error);
  }
}


function decodeBase64(data) {
  return base64.decode(data);
}

function processCucumberJsonFiles(folderPath) {
  const files = fs.readdirSync(folderPath);
  files.forEach((fileName) => {
    if (path.extname(fileName) === ".json") {
      const filePath = path.join(folderPath, fileName);
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const cucumberReport = JSON.parse(fileContents);
      cucumberReport.forEach((feature) => {
        feature.elements.forEach((scenario) => {
          scenario.steps.forEach((step) => {
            if (step.embeddings) {
              step.embeddings.forEach((embedding) => {
                const decodedData = decodeBase64(embedding.data);
                if (decodedData == "Soft Assertion failure") {
                  step.result.status = "failed";
                  step.result.error_message = "Soft assertion error";
                }
              });
            }
          });
        });
      });
      fs.writeFileSync(filePath, JSON.stringify(cucumberReport, null, 2));
    }
  });
}