#!/usr/bin/env node

import { logInfo, logSuccess } from '../shared/logger';
import startApp from '../shared/commands/startApp';
import makeLazyLoadFileParams from './commands/makeLazyLoadFileParams';
import processAssetsByGroups from './commands/processAssetsByGroups';
import getFilesContents from './commands/getFilesContents';
import makeDataToPack from './commands/makeDataToPack';
import packAllAssets from './commands/packAllAssets';
import saveAtlases from './commands/saveAtlases';
import removeOldAtlasesFolderAndCreateEmpty from './commands/removeOldAtlasesFolderAndCreateEmpty';

async function run(cfg) {
    const {
        entry,
        sourceFolder,
        output,
        extensions,
        packerParams,
        scaleParams,
        folders,
    } = cfg;

    logInfo('Starting atlases convertor');

    const { config, assets } = await makeLazyLoadFileParams(entry);
    const qualityFolders = Object.keys(scaleParams);

    await removeOldAtlasesFolderAndCreateEmpty(qualityFolders, { output, sourceFolder });

    logInfo('Starting assets processing');
    const processedAssets = processAssetsByGroups({ config, assets });
    const fileContentsCfg = {
        sourceFolder,
        qualityFolders,
        extensions,
        folders,
    };
    const filesData = await getFilesContents(fileContentsCfg);
    const dataToPack = makeDataToPack(filesData, processedAssets, qualityFolders);

    logInfo('Assets processing done. Start packing atlases');
    const atlases = await packAllAssets(dataToPack, { packerParams, scaleParams });
    await saveAtlases(atlases, { sourceFolder, output });
    logSuccess('Atlases packing done.');
}

startApp('images_atlas').then((runner) => runner(run));
