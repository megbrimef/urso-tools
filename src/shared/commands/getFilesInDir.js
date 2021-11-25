import { join } from 'path';
import { readDir } from '../io';
import { isDir } from '../helper';

async function notDir(file) {
    const isDirr = await isDir(file);
    return isDirr ? null : file;
}

async function getFilesInDir(dir) {
    const dirFiles = await readDir(dir);
    const absoluteDirFiles = dirFiles.map((file) => join(dir, file));
    const mapped = await Promise.all(absoluteDirFiles.map(notDir));
    return mapped.filter((file) => file);
}

export default getFilesInDir;
