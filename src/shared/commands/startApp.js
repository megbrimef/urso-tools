import { argv } from 'process';
import makeParamsAsync from './makeParamsAsync';
import makeConfigByKeyAsync from './makeConfigByKeyAsync';
import runSafeAsync from './runSafeAsync';

async function getConfig(key) {
    const { configPath } = await makeParamsAsync(argv);
    return makeConfigByKeyAsync(key, configPath);
}

async function startApp(key) {
    const config = await runSafeAsync(getConfig.bind(this, key));
    return async (cblk) => runSafeAsync(cblk.bind(this, config));
}

export default startApp;
