/* eslint-disable arrow-body-style */
import { sep, resolve, join } from 'path';
import getDirTreeRecursive from '../../shared/commands/getDirTreeRecursive';
import getFilesInDir from '../../shared/commands/getFilesInDir';
import { capitalizeFirstLetter } from '../../shared/helper';
import { exists } from '../../shared/io';
import filterFilesByExtension from '../../shared/commands/filterFilesByExtension';

async function getDirJsons(dir, sourceFolder) {
    const files = await getFilesInDir(dir);
    return filterFilesByExtension(files, ['json'])
        .map((file) => file.split(sourceFolder)[1].slice(1));
}

async function makeNamespaceData(dirs, quality, sourceFolder) {
    const pathPart = join(sourceFolder, quality);
    let namespace = null;
    let curDir = null;
    const namespaceData = {};
    await Promise.all(dirs.map(async (dir, index) => {
        if (!namespace) {
            namespace = capitalizeFirstLetter(quality);
        }

        if (!curDir) {
            curDir = dir;
        }

        namespaceData[namespace] = await getDirJsons(curDir, pathPart);

        if (index === 0) {
            return;
        }

        const nameSpacePart = dir
            .replace(`${curDir}`, '')
            .replace(`${sep}`, '');
        curDir = dir;
        namespace = `${namespace}.${capitalizeFirstLetter(nameSpacePart)}`;
        namespaceData[namespace] = await getDirJsons(curDir, pathPart);
    }));

    return namespaceData;
}

function getQuality(data) {
    const {
        sourceFolder,
        groupsFolders,
    } = data;

    return async (quality) => Promise.all(groupsFolders.map(async (folder) => {
        const qFolder = folder.replace('[quality]', quality);
        const aPath = resolve('.', sourceFolder, qFolder);
        const pathExists = await exists(aPath);

        if (!pathExists) {
            return null;
        }

        const dirs = await getDirTreeRecursive([aPath]);
        return makeNamespaceData(dirs, quality, sourceFolder);
    }));
}

async function getTemplateData(data) {
    const { qualities } = data;
    const templateData = (await Promise.all(qualities.map(getQuality(data))))
        .reduce((cum, [val]) => ({ ...cum, ...val }), {});

    return templateData;
}

export default getTemplateData;
