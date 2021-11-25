#!/usr/bin/env node

import { join } from 'path';
import { logInfo, logSuccess } from '../shared/logger';
import startApp from '../shared/commands/startApp';
import getFileListAsync from './commands/getFileListAsync';
import convertAssetsAsync from './commands/convertAssetsAsync';
import { getFileExtension } from '../shared/helper';

async function run(config) {
    const { types, sourceFolder, folders } = config;
    logInfo(`Starting images converter with [${Object.keys(types).map((type) => type.toUpperCase())}] quality settings`);
    const folderPath = folders.map((folder) => join(sourceFolder, folder));
    const files = await getFileListAsync(folderPath);
    const filtered = files.filter((file) => getFileExtension(file) !== 'webp');
    logInfo(`${filtered.length} asset file(s) was found in '${sourceFolder}'`);
    await convertAssetsAsync(filtered, config);
    logSuccess('Assets convert DONE!');
}

startApp('images').then((runner) => runner(run));
