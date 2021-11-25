import { resolve, join } from 'path';
import { readFile } from '../../shared/io';
import getFilesListRecursive from '../../shared/commands/getFilesListRecursive';
import filterFilesByExtension from '../../shared/commands/filterFilesByExtension';

async function getDataContents(file) {
    return readFile(file);
}

async function mapFolderAssets(folder, files) {
    const filtered = files.filter((file) => file.includes(folder));
    const data = {};

    await Promise.all(filtered.map(async (file) => {
        const path = file.split(folder)[1].slice(1);
        const contents = await getDataContents(file);
        data[path] = contents;
    }));

    return data;
}

async function mapAssetsToPack(files, folders) {
    const mappedSymbols = {};

    await Promise.all(folders.map(async (folder) => {
        mappedSymbols[folder] = await mapFolderAssets(folder, files);
    }));

    return mappedSymbols;
}

async function getFileList(cfg) {
    const {
        folders,
        extensions,
        qualityFolders,
        sourceFolder,
    } = cfg;

    const folderList = qualityFolders.map((quality) => {
        const aPath = join(resolve('.'), sourceFolder, quality);
        return folders.map((folder) => join(aPath, folder));
    }).reduce((acc, cur) => [...acc, ...cur], []);

    const filesList = await getFilesListRecursive([...folderList]);
    const filtered = filterFilesByExtension(filesList, extensions);

    return filtered;
}

async function getFilesContents(cfg) {
    const { qualityFolders } = cfg;

    const filesList = await getFileList(cfg);
    const assetsToPack = await mapAssetsToPack(filesList, qualityFolders);
    return assetsToPack;
}

export default getFilesContents;
