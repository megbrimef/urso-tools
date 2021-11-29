import { readFile } from './io';

let config = null;

async function getConfig(configPath) {
    const file = await readFile(configPath, { encoding: 'utf-8' });
    config = JSON.parse(file);
}

function getConfigParam(key) {
    return (config && config[key]) ? config[key] : null;
}

export {
    getConfigParam,
    getConfig,
};
