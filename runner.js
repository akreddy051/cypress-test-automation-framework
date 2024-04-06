#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const envParameters = ['tags','allure'];
const configProperties = ['video'];

function parseArgs(args) {
    const options = {};

    for (const arg of args) {
        if (arg.startsWith('feature=')) {
            options.featurePath = arg.replace('feature=', '');
        } else if (arg.startsWith('tags=')) {
            options.tags = arg.replace('tags=', '');
        } else if (arg.startsWith('browser=')) {
            options.browser = arg.replace('browser=', '');
        } else if (arg === '--headed') {
            options.headed = true;
        } else if (arg.startsWith('globPath=')) {
            options.globPath = arg.replace('globPath=', '');
        } else if (arg === '--parallel') {
            options.parallel = true;
        } else if (arg.startsWith('features=')) {
            options.features = arg.replace('features=', '').split(',');
        } else if (arg.startsWith('configFile=')) {
            options.configFile = arg.replace('configFile=', '');
        } else if (arg.startsWith('video=')) {
            options.video = arg.replace('video=', '');
        } else if (arg.startsWith('xvfb=')) {
            // Note: This parameter should only be used in case of Jenkins execution
            options.xvfb = arg.replace('xvfb=', '');
        }
    }
    return options;
}

function findFeatureFileRecursively(directory, targetFeatureFileName) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            const result = findFeatureFileRecursively(filePath, targetFeatureFileName);
            if (result) {
                return result;
            }
        } else if (file === targetFeatureFileName && path.extname(file) === '.feature') {
            return filePath;
        }
    }
    return null;
}

async function main() {
    // Parsing the arguments
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (options.parallel) {
        if (!options.features) {
            console.error("When using 'parallel', you must provide features.");
            process.exit(1);
        }
        const scripts = [];
        let npmRunAllScript = "run-p -c --max-parallel 5";
        for (const feature of options.features) {
            const scriptName = feature.split('.')[0];
            const featurePath = findFeatureFileRecursively('cypress/integration/features', feature);
            const scriptCommand = `npx cypress run --spec ${featurePath}`;
            addScriptToPackageJson(scriptName, resolveArguments(scriptCommand, options));
            scripts.push(scriptName);
        }
        npmRunAllScript += ' ' + scripts.join(' ');
        addScriptToPackageJson("runAll", npmRunAllScript);
        let command = "npm run runAll";
        await executeCommand(command);
        for (const script of scripts) {
            removeScriptFromPackageJson(script);
        }
        removeScriptFromPackageJson('runAll');
    } else {
        if (options.tagName) {
            if (!options.featurePath && !options.globPath) {
                console.error('When using a tag name, you must provide either a feature path or a glob path.');
                process.exit(1);
            }
            // If a feature path is provided, use it; otherwise, use the glob path.
            options.globPath = findFeatureFileRecursively('cypress/integration/features', options.featurePath) || '';
        } else if (options.featurePath) {
            // If a feature path is provided without a tag name, find the corresponding glob path.
            const featureFilePath = findFeatureFileRecursively('cypress/integration/features', options.featurePath);
            if (!featureFilePath) {
                console.error(`Feature file not found: ${options.featurePath}`);
                process.exit(1);
            }
            options.globPath = featureFilePath;
        } else {
            console.error('Please provide either a feature path or a tag name as an argument.');
            process.exit(1);
        }
        console.log(`Running Cypress for feature: ${options.featurePath}`);
        console.log(`Running with tag: ${options.tagName}`);
        console.log(`Glob path: ${options.globPath}`);

        let command = options.tagName ?
            `npx cypress-tags run -e TAGS='${options.tagName}' --glob '${options.globPath}'` :
            `npx cypress run --spec '${options.globPath}'`;
        if (options.xvfb) {
            command = command.replace(/^/, 'xvfb-run -a ');
        }
        await executeCommand(resolveArguments(command, options));
    }
}

function parseArgs(args) {
    const options = {};
    for (const arg of args) {
        if (arg.startsWith('feature=')) {
            options.featurePath = arg.replace('feature=', '');
        } else if (arg.startsWith('tag=')) {
            options.tagName = arg.replace('tag=', '');
        } else if (arg.startsWith('browser=')) {
            options.browser = arg.replace('browser=', '');
        } else if (arg === '--headed') {
            options.headed = true;
        } else if (arg.startsWith("namespace='")) {
            options.namespace = arg.replace("namespace='", '').replace("'", '');
        } else if (arg.startsWith('globPath=')) {
            options.globPath = arg.replace('globPath=', '');
        } else if (arg === '--parallel') {
            options.parallel = true;
        } else if (arg.startsWith('features=')) {
            options.features = arg.replace('features=', '').split(',');
        } else if (arg.startsWith('clientID=')) {
            options.clientID = arg.replace('clientID=', '');
        } else if (arg.startsWith('product=')) {
            options.product = arg.replace('product=', '');
        } else if (arg.startsWith('configFile=')) {
            options.configFile = arg.replace('configFile=', '');
        } else if (arg.startsWith('video=')) {
            options.video = arg.replace('video=', '');
        } else if (arg.startsWith('xvfb=')) {
            options.xvfb = arg.replace('xvfb=', '');
        }
    }
    return options;
}

function findFeatureFileRecursively(directory, targetFeatureFileName) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = `${directory}/${file}`;
        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            const result = findFeatureFileRecursively(filePath, targetFeatureFileName);
            if (result) {
                return result;
            }
        } else if (file === targetFeatureFileName && file.endsWith('.feature')) {
            return filePath;
        }
    }
    return null;
}

function resolveArguments(command, options) {
    if (options.browser) {
        command += ` --browser ${options.browser}`;
    }
    if (options.headed) {
        command += ' --headed';
    }
    if (options.configFile) {
        command += ` --config-file ${options.configFile}`;
    }
    const envParameters = ['namespace', 'clientID', 'product'];
    for (const param of envParameters) {
        if (options[param]) {
            if (param === 'clientID') {
                const idMapping = {
                    'NACH': '2220',
                    'NACC': '2332',
                    'INTCH': '5701',
                    'INTCC': '4261'
                };
                options[param] = idMapping[options[param]] || options[param];
            }
            if (command.includes('-e')) {
                command = command.replace('-e ', `-e ${param}='${options[param]}',`);
            } else {
                command += ` -e ${param}='${options[param]}'`;
            }
        }
    }
    const configProperties = ['video'];
    for (const param of configProperties) {
        if (options[param]) {
            if (command.includes('--config')) {
                command = command.replace('--config', `--config ${param}=${options[param]},`);
            } else {
                command += ` --config ${param}=${options[param]}`;
            }
        }
    }
    return command;
}

async function executeCommand(command) {
    console.log(`Executing command: ${command}`);
    const child = child_process.spawn('bash', ['-c', command], {
        env: process.env,
        stdio: 'inherit'
    });
    return new Promise((resolve) => {
        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`Error running Cypress: ${code}`);
            }
            resolve();
        });
    });
}

function addScriptToPackageJson(scriptName, scriptCommand) {
    try {
        const packageJsonPath = 'package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.scripts[scriptName] = scriptCommand;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    } catch (error) {
        console.error('Error adding script to package.json:', error);
    }
}

function removeScriptFromPackageJson(scriptName) {
    try {
        const packageJsonPath = 'package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        delete packageJson.scripts[scriptName];
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    } catch (error) {
        console.error('Error removing script from package.json:', error);
    }
}

main();



