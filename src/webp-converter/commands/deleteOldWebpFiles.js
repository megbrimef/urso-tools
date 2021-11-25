import { sep, resolve } from 'path';
import getDirTreeRecursive from '../../shared/commands/getDirTreeRecursive';
import getFilesListRecursive from '../../shared/commands/getFilesListRecursive';
import { rm } from '../../shared/io';
import filterFilesByExtension from '../../shared/commands/filterFilesByExtension';

async function removeFile(file) {
    await rm(file);
}

async function removeWebpTextures(files) {
    const allFiles = await getFilesListRecursive(files);
    const webpFiles = filterFilesByExtension(allFiles, ['webp']);
    await Promise.all(webpFiles.map(removeFile));
}

async function removeOldWebpDirs(files) {
    if (files.length > 0) {
        const folder = `${sep}webp`;
        const webpFolders = (await getDirTreeRecursive(files))
            .filter((file) => file.endsWith(folder));

        await Promise.all(webpFolders.map(async (file) => {
            const dir = resolve('.', file);
            return rm(dir);
        }));
    }
}

async function deleteOldWebpFiles(files) {
    await removeOldWebpDirs([...files]);
    await removeWebpTextures([...files]);
}

export default deleteOldWebpFiles;
