import { join } from 'path';
import { readDir } from '../io';
import { isDir, isHiddenDir } from '../helper';

async function getDirTreeRecursive(fList) {
    let list = [];
    const fPath = fList.pop();
    const pathIsDir = await isDir(fPath);

    if (pathIsDir && !isHiddenDir(fPath)) {
        list.push(fPath);
        const dirs = await readDir(fPath);

        if (dirs.length > 0) {
            const absoluteDirPaths = dirs.map((dir) => join(fPath, dir));
            const newDirs = await getDirTreeRecursive(absoluteDirPaths);
            list = [
                ...list,
                ...newDirs,
            ];
        }
    }

    if (fList.length > 0) {
        const newDirs = await getDirTreeRecursive(fList);
        list = [
            ...newDirs,
            ...list,
        ];
    }

    return list;
}

export default getDirTreeRecursive;
