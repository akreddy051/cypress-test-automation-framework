const fs = require("fs");
generateArchiveFolder();

function generateArchiveFolder() {
    try {
        if (!fs.existsSync("Execution-Reports")) {
            fs.mkdirSync("Execution-Reports");
        }
    } catch (err) {
        console.error(err);
    }
}