import { argv } from 'process';
import makeParamsAsync from './makeParamsAsync';
import { getConfig, getConfigParam } from '../config';
import { runSafeAsync } from './runSafe';

async function startApp() {
    const { configPath } = await makeParamsAsync(argv);
    await runSafeAsync(() => getConfig(configPath));
    return async (cblk) => runSafeAsync(cblk.bind(this, getConfigParam));
}

export default startApp;
