#!/usr/bin/env node

import { greet, logInfo, logSuccess } from '../shared/logger';
import startApp from '../shared/commands/startApp';
import parseCfg from './commands/parseCfg';
import assembleAudioSprites from './commands/assembleAudioSprites';
import removeOldSoundAtlases from './commands/removeOldSoundAtlases';

async function run(config) {
    config = config('audio');
    greet('URSO SOUNDS TO ATLAS TOOL');
    logInfo('Starting sound atlas assembling');
    await removeOldSoundAtlases(config);
    const parsedCfg = await parseCfg(config);
    await assembleAudioSprites(parsedCfg);
    logSuccess('Sound atlas assembling done');
}

startApp().then((runner) => runner(run));
