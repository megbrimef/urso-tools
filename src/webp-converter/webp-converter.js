#!/usr/bin/env node

import { logInfo, logSuccess } from '../shared/logger';
import getFilesListRecursive from '../shared/commands/getFilesListRecursive';
import startApp from '../shared/commands/startApp';
import deleteOldWebpFiles from './commands/deleteOldWebpFiles';
import convertFilesToWebp from './commands/convertFilesToWebp';

async function run(config) {
    const { sourceFolder } = config;
    logInfo('Webp converter starting');
    await deleteOldWebpFiles([sourceFolder]);
    logInfo('Old webp removed');
    const files = await getFilesListRecursive([sourceFolder]);
    logInfo('Start webp converting');
    await convertFilesToWebp(files);
    logSuccess('Webp converting done.');
}

startApp('webpConverter').then((runner) => runner(run));
