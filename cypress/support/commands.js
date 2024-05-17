const {
    attach
} = require("@badeball/cypress-cucumber-preprocessor");

Cypress.Commands.add("softVerify", (expected, actual, assertionType, message) => {
    Cypress.log({
        name: "Soft Assertion"
    });
    try {
        switch (assertionType) {
            case "ONE_OF":
                expect(expected).to.be.oneOf(actual);
                break;
            case "NOT_EQUAL":
                expect(expected).to.not.equal(actual);
                break;
            case "INCLUDE":
                expect(expected).to.deep.include(actual);
                break;
            case "NOT_INCLUDE":
                expect(expected).to.not.include(actual);
                break;
            case "TO_EQUAL":
                expect(expected).to.deep.equal(actual);
                break;
            default:
                expect(expected).to.deep.equal(actual);
                break;
        }
    } catch (err) {
        const testState = window.testState;
        const imageName = message === undefined ? `${testState.pickleStep.text.replaceAll('"', "")}-${Cypress.env("softAssertionCounter")}` : `${message}-${Cypress.env("softAssertionCounter")}`;
        Cypress.env("softAssertionCounter", Cypress.env("softAssertionCounter") + 1);
        attach("Soft Assertion failure");
        attach(err.stack);
        attach(new TextEncoder().encode(cy.screenshot(imageName, {
            capture: "runner"
        })).buffer, "text/plain");
        Cypress.log({
            name: "Soft Assertion Failed",
            message: [message, err.message],
        });
    }
});

/* Use this method for normal assertion cases. This method will stop the test upon assertion failure. If the assertion is passed then it will take the screenshot and attach it in the current step in the html report */
Cypress.Commands.add("verify", (expected, actual, assertionType, takeScreenShot, screenShotName) => {
    Cypress.log({
        name: "verify"
    });
    switch (assertionType) {
        case "ONE_OF":
            expect(expected).to.be.oneOf(actual);
            break;
        case "NOT_EQUAL":
            expect(expected).to.not.equal(actual);
            break;
        case "INCLUDE":
            expect(expected).to.deep.include(actual);
            break;
        case "NOT_INCLUDE":
            expect(expected).to.not.include(actual);
            break;
        case "TO_EQUAL":
            expect(expected).to.deep.equal(actual);
            break;
        default:
            expect(expected).to.deep.equal(actual);
            break;
    }
    if (takeScreenShot) {
        const testState = window.testState;
        let imageName = screenShotName === undefined ? `${testState.pickleStep.text.replaceAll('"', "")}-${Cypress.env("softAssertionCounter")}` : `${screenShotName}-${Cypress.env("softAssertionCounter")}`;
        attach(new TextEncoder().encode(cy.screenshot(imageName, {
            capture: "runner"
        })).buffer, "text/plain");
        Cypress.env("softAssertionCounter", Cypress.env("softAssertionCounter") + 1);
    }
});
