import { logError } from '../logger';

async function runSafeAsync(clbk, message) {
    try {
        return await clbk();
    } catch (e) {
        logError(message || e.message);
    }

    return null;
}

async function runSafe(clbk, message) {
    try {
        return clbk();
    } catch (e) {
        logError(message || e.message);
    }

    return null;
}

export {
    runSafeAsync,
    runSafe,
};
