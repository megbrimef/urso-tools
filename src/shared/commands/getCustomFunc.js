/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { resolve } from 'path';
import { exists } from '../io';

async function getCustomFunc(path, objects) {
    const resolvedPath = resolve('.', path);
    if (await exists(resolvedPath)) {
        const func = require(resolvedPath);
        return func(objects);
    }
    return [];
}

export default getCustomFunc;
