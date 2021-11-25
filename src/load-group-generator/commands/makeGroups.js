/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

import {
    basename,
    resolve,
    join,
} from 'path';
import {
    exists,
    mkdir,
    writeFile,
    readFile,
} from '../../shared/io';

function getLoadGroup(path) {
    return basename(path).split('_').shift();
}

function createGroups(assetsData) {
    const groups = {};

    for (const assetDataKey in assetsData) {
        const atlases = assetsData[assetDataKey]
            .map((path) => `\n\t\t\t{ type: Urso.types.assets.ATLAS, key: '${basename(path)}', path: '${path}', loadingGroup: '${getLoadGroup(path)}' }`)
            .join(',');

        const className = `AppTemplatesGroups${assetDataKey.split('.').join('')}AtlasLoaderGroup`;

        groups[assetDataKey] = `/*GENERATED FILE*/\n\nclass ${className} {\n`
                + '\tconstructor() {\n'
                + '\t\tthis.objects = [];\n'
                + `\t\tthis.assets = [${atlases}\n\t\t];\n`
                + '\t}\n'
                + '}\n\n'
                + `module.exports = ${className};`;
    }
    return groups;
}

async function createInfo(modes, partialPath) {
    const indexFilePath = join(partialPath, '_info.js');
    const js = `/*GENERATED FILE*/\n\nUrso.App.Templates.Groups.${modes} = {`
        + '\n\tAtlasLoaderGroup: require(\'./atlasLoadGroup.js\')\n};';

    await writeFile(indexFilePath, js);
}

async function setGroupRequire(groupKey, gPath) {
    const partialPath = groupKey.toLowerCase().split('.');
    const aPath = resolve('.', gPath, ...partialPath);
    const parentFolder = join(aPath, '..');
    const parentInfo = join(parentFolder, '_info.js');
    const parentInfoExists = await exists(parentInfo);

    if (!parentInfoExists) {
        return;
    }

    const groupPath = groupKey.toLowerCase().split('.').pop();
    const requirePath = join(groupPath, '_info.js');
    const requireString = `/*GENERATED CODE*/require('./${requirePath}');/*GENERATED CODE END*/`;

    const js = await readFile(parentInfo, 'utf-8');

    if (js.includes(requireString)) {
        return;
    }

    const jsWithRequire = `${js}\n${requireString}`;
    await writeFile(parentInfo, jsWithRequire);
}

async function requireIt(groups, groupPath) {
    const groupKeys = Object.keys(groups)
        .sort((a, b) => b.split('.').length - a.split('.').length);

    const groupKey = groupKeys.pop();

    if (!groupKey) {
        return;
    }

    const newGroups = { ...groups };
    delete newGroups[groupKey];

    await setGroupRequire(groupKey, groupPath);
    await requireIt(newGroups, groupPath);
}

async function writeGroups(createdGroups, { groupPath, groupName }) {
    const groupKeys = Object.keys(createdGroups, groupPath);

    await Promise.all(groupKeys.map(async (groupKey) => {
        const partialPath = groupKey.toLowerCase().split('.');
        const aPath = resolve('.', groupPath, ...partialPath);
        const pathExists = await exists(aPath);

        if (!pathExists) {
            await mkdir(aPath, { recursive: true });
        }

        await createInfo(groupKey, aPath);
        await writeFile(join(aPath, groupName), createdGroups[groupKey]);
    }));

    await requireIt(createdGroups, groupPath);
}

async function makeGroups(templateData, { groupPath, groupName }) {
    const createdGroups = createGroups(templateData);
    await writeGroups(createdGroups, { groupPath, groupName });
}

export default makeGroups;
