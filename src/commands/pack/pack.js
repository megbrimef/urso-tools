#!/usr/bin/env node

import startApp from '../../shared/commands/startApp';
import getEngineData from '../../shared/commands/getEngineData';
import prepareAssets from './shorthands/prepareAssets';
import cookAssets from './shorthands/cookAssets';
import packAtlases from './shorthands/packAtlases';
import makeGroups from './shorthands/makeGroups';

import { rm, exists } from '../../shared/io';
import { resolve } from 'path';

import {
    greet,
    logInfo,
    logSuccess,
    logWarning,
} from '../../shared/logger';

async function run(getConfigParamClbk) {
    const {
        entrypoint,
        sourceFolder,
        types,
        outputFolder,
    } = getConfigParamClbk('general');

    const {
        atlasesOutputFolder,
        extensions,
        packerParams,
        removeSingleImages
    } = getConfigParamClbk('atlases');

    const {
        groupName,
        groupsPath,
    } = getConfigParamClbk('groups');

    greet('URSO PACKER TOOL');
    logInfo('Getting assets list');

    const { assets, config, errors } = await getEngineData(entrypoint);

    if (errors.length > 0) {
        logWarning(`Founded ${assets.length} assets with ${errors.length} errors`);
        logWarning(JSON.stringify(errors));
    } else {
        logSuccess(`Founded ${assets.length} assets`);
    }
    const preparedAssets = prepareAssets(assets, { sourceFolder, types, outputFolder });

    logInfo('Starting assets optimization');
    const cookedAssets = await cookAssets(preparedAssets);
    logSuccess('Assets optimization done');

    logInfo('Starting atlas packing');
    const atlases = await packAtlases(cookedAssets, {
        types,
        atlasesOutputFolder,
        extensions,
        packerParams,
        outputFolder,
    });

    logSuccess('Atlases packing done');

    if(removeSingleImages) {
        const qualies = Object.keys(types);
        Promise.all(
            cookedAssets
                .filter(asset => asset.type === 6)
                .reduce((acc, { path }) => {
                    const paths = qualies.map(qual => {
                        const parts = path.split('/');
                        parts.splice(1, 0, qual);
                        return resolve('.',outputFolder, parts.join('/'));
                    });
                    return [...acc, ...paths];
                }, [])
                .map(async (path) => {
                    if(await exists(path)){
                        await rm(path);
                    }
                })
            );
    }

    logInfo('Generating groups');
    await makeGroups(atlases, config, {
        groupName,
        groupsPath,
    });

    logSuccess('Groups was generated');
    logSuccess('Packer done!');
}

startApp().then((runner) => runner(run));
