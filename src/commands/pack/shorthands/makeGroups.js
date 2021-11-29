import {
    basename,
    resolve,
    join,
    sep,
} from 'path';
import { capitalizeFirstLetter } from '../../../shared/helper';
import {
    exists,
    mkdir,
    writeFile,
    readFile,
} from '../../../shared/io';
import { logWarning } from '../../../shared/logger';

function getLoadingGroup(path, loadingConfig) {
    const atlasLoadingGroup = basename(path).split('_').shift();

    if (typeof loadingConfig[atlasLoadingGroup] === 'undefined') {
        logWarning(`There no ${atlasLoadingGroup} loading group in the config for ${path} atlas! Initial was set`);
        return 0;
    }

    return loadingConfig[atlasLoadingGroup];
}

function getPath(path, folder, quality) {
    const [, relative] = path.split(`${sep}${quality}${sep}`);
    return [folder, ...relative.split(sep)].join('/');
}

function createGroup(quality, atlasesMap, loadingConfig) {
    const atlases = atlasesMap[quality];

    const atlasesText = atlases
        .map((atlas) => atlas.jsons
            .map((json) => `\n\t\t\t{ type: Urso.types.assets.ATLAS, key: '${basename(json)}', path: '${getPath(json, atlas.folder, quality)}', loadingGroup: '${getLoadingGroup(json, loadingConfig)}' }`))
        .reduce((acc, cur) => [...acc, ...cur], [])
        .join(',');

    const className = `AppTemplatesGroups${capitalizeFirstLetter(quality)}AtlasLoaderGroup`;

    const js = `/*GENERATED FILE*/\n\nclass ${className} {\n`
            + '\tconstructor() {\n'
            + '\t\tthis.objects = [];\n'
            + `\t\tthis.assets = [${atlasesText}\n\t\t];\n`
            + '\t}\n'
            + '}\n\n'
            + `module.exports = ${className};`;

    return { [quality]: js };
}

function createGroups(atlasesMap, loadingConfig) {
    return (quality) => createGroup(quality, atlasesMap, loadingConfig);
}

async function createInfo(modes, partialPath) {
    const indexFilePath = join(partialPath, '_info.js');
    const js = `/*GENERATED FILE*/\n\nUrso.App.Templates.Groups.${capitalizeFirstLetter(modes)} = {`
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

async function writeGroups(createdGroups, { groupsPath, groupName }) {
    const groupKeys = Object.keys(createdGroups);

    await Promise.all(groupKeys.map(async (groupKey) => {
        const partialPath = groupKey.toLowerCase().split('.');
        const aPath = resolve('.', groupsPath, ...partialPath);

        await mkdir(aPath, { recursive: true });
        await createInfo(groupKey, aPath);
        await writeFile(join(aPath, groupName), createdGroups[groupKey]);
    }));

    await requireIt(createdGroups, groupsPath);
}

function atlasesReducer() {
    return [(acc, cur) => {
        const newObj = { ...acc };
        const {
            quality,
            loaderGroup,
            folder,
            jsons,
        } = cur;

        if (!newObj[quality]) {
            newObj[quality] = [];
        }

        newObj[quality].push({ loaderGroup, folder, jsons });
        return newObj;
    }, {}];
}

async function makeGroups(atlases, loadingConfig, cfg) {
    const allAtlases = atlases
        .reduce((acc, cur) => [...acc, ...cur], [])
        .reduce(...atlasesReducer());
    const groups = Object.keys(allAtlases)
        .map(createGroups(allAtlases, loadingConfig))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {});
    await writeGroups(groups, cfg);
}

export default makeGroups;
