import { resolve } from 'path';
import getFilesListRecursive from '../../shared/commands/getFilesListRecursive';

async function getFileListAsync(folderPaths) {
    const absoluteFolderPaths = folderPaths.map((fPath) => resolve('.', fPath));
    return getFilesListRecursive(absoluteFolderPaths);
}

export default getFileListAsync;
