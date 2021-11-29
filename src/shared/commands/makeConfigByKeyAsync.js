import { readFile } from '../io';

async function makeConfigByKeyAsync(configPath) {
    const file = await readFile(configPath, { encoding: 'utf-8' });
    const config = JSON.parse(file);

    if (!config[key]) {
        throw new Error(`There is no '${key}' in settings file!`);
    }

    return config[key];
}

export default makeConfigByKeyAsync;
