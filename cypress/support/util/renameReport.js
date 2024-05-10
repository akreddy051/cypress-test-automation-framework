const fs = require('fs')

const oldName = 'Execution-Reports/reports'
let newName;

function generateNewName() {
    const now = Date.now();
    const localDateTime = new Date(now)
    newName = `Execution-Reports/reports - ${localDateTime}`
}

async function renameDirectory() {
    try {
        generateNewName();
        await fs.promises.rename(oldName, newName);
    } catch (error) {
        console.log(error)
    }
}

renameDirectory();