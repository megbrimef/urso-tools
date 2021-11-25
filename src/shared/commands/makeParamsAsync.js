import args from 'args';
import path from 'path';
import { exists } from '../io';

function getArgsParams() {
    return [
        { name: 'config', description: 'path to config', defaultValue: 'assets.config.json' },
    ];
}

function setupArgs() {
    const argsParams = getArgsParams();
    args.options(argsParams);
}

async function makeParamsAsync(argv) {
    setupArgs();

    const flags = args.parse(argv);
    const configPath = path.resolve('.', flags.config);
    const fileExists = await exists(configPath);

    if (!fileExists) {
        throw new Error(`Config file was not found ${configPath}`);
    }

    return { configPath };
}

export default makeParamsAsync;
