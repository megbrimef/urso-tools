#!/usr/bin/env node

import { logInfo } from '../shared/logger';
import startApp from '../shared/commands/startApp';
import getTemplateData from './commands/getTemplateData';
import makeGroups from './commands/makeGroups';

async function run(config) {
    logInfo('Generating template groups');
    const templateData = await getTemplateData(config);
    await makeGroups(templateData, config);
    logInfo('Generating template groups done');
}

startApp('loadGroupsGenerator').then((runner) => runner(run));
