import { logError } from '../logger';

async function runSafeAsync(clbk) {
    try {
        return await clbk();
    } catch (e) {
        logError(e.message);
    }

    return null;
}

export default runSafeAsync;
