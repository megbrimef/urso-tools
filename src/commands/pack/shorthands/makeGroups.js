import {
    basename,
    resolve,
    join,
    sep,
} from 'path';
import { capitalizeFirstLetter } from '../../../shared/helper';
import {
    mkdir,
    writeFile,
} from '../../../shared/io';
import { logWarning } from '../../../shared/logger';

function getLoadingGroup(path, loadingConfig) {
    const atlasLoadingGroup = basename(path).split('_').shift();

    if (typeof loadingConfig[atlasLoadingGroup] === 'undefined') {
        logWarning(`There no ${atlasLoadingGroup} loading group in the config for ${path} atlas!`);
    }

    return atlasLoadingGroup;
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
            + '\t\tobjects = [];\n'
            + `\t\tassets = [${atlasesText}\n\t\t];\n`
            + '}\n\n'
            + `module.exports = ${className};`;

    return { [quality]: js };
}

function createGroups(atlasesMap, loadingConfig) {
    return (quality) => createGroup(quality, atlasesMap, loadingConfig);
}

async function writeGroups(createdGroups, { groupsPath, groupName }) {
    const groupKeys = Object.keys(createdGroups);

    await Promise.all(groupKeys.map(async (groupKey) => {
        const partialPath = groupKey.toLowerCase().split('.');
        const aPath = resolve('.', groupsPath, 'modifications', ...partialPath);

        await mkdir(aPath, { recursive: true });
        await writeFile(join(aPath, groupName), createdGroups[groupKey]);
    }));
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
