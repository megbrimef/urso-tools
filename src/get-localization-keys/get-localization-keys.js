#!/usr/bin/env node

import getObjectsByType from '../shared/commands/getObjectsByType';
import { greet, logSuccess } from '../shared/logger';
import { writeFile, exists, mkdir } from '../shared/io';
import { getAbsolutePath } from '../shared/helper';
import startApp from '../shared/commands/startApp';
import getEngineData from '../shared/commands/getEngineData';

const TEXT_TYPE = 4;

async function run(getConfigParamClbk) {
    greet('Parsing localizations');
    const { filename, savePath } = getConfigParamClbk('localization');
    const pPath = getAbsolutePath(savePath);
    const fPath = getAbsolutePath(savePath, filename);
    const { entrypoint } = getConfigParamClbk('general');
    const { objects } = await getEngineData(entrypoint);
    const texts = getObjectsByType(objects, TEXT_TYPE);
    const localizedTexts = texts.filter(({ localeId }) => localeId);
    // eslint-disable-next-line max-len
    const localizeConfig = localizedTexts.reduce((acc, { localeId, text }) => ({ ...acc, [localeId]: text }), {});

    if (!await exists(pPath)) {
        await mkdir(pPath, { recursive: true });
    }

    await writeFile(fPath, JSON.stringify(localizeConfig, null, 2));

    logSuccess('Parsing localizations done');
}

startApp().then((runner) => runner(run));
