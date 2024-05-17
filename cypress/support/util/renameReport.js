const fs = require("fs");
const path = require("path");
const oldName = "Execution-Reports/reports";
let newName;

function generateNewName() {
    const now = Date.now();
    const localDateTime = new Date(now); // Format the localDateTime to a string without invalid characters for a directory name 
    const formattedDateTime = localDateTime.toISOString().replace(/[:]/g, "-");
    newName = `Execution-Reports/Reports-${formattedDateTime}`;
}
async function copyDirectory(source, destination) {
    try {
        await fs.promises.mkdir(destination, {
            recursive: true
        });
        const entries = await fs.promises.readdir(source, {
            withFileTypes: true
        });
        for (let entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const destinationPath = path.join(destination, entry.name);
            if (entry.isDirectory()) {
                await copyDirectory(sourcePath, destinationPath);
            } else {
                await fs.promises.copyFile(sourcePath, destinationPath);
            }
        }
    } catch (error) {
        console.error("Error copying directory:", error);
        throw error;
    }
}
async function deleteDirectory(directory) {
    try {
        const entries = await fs.promises.readdir(directory, {
            withFileTypes: true,
        });
        for (let entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                await deleteDirectory(fullPath);
            } else {
                await fs.promises.unlink(fullPath);
            }
        }
        await fs.promises.rmdir(directory);
    } catch (error) {
        console.error("Error deleting directory:", error);
        throw error;
    }
}
async function renameDirectory() {
    try {
        generateNewName();
        await copyDirectory(oldName, newName);
        console.log("Directory copied successfully.");
        await deleteDirectory(oldName);
        console.log("Old directory deleted successfully.");
    } catch (err) {
        console.error(err);
    }
}
renameDirectory();