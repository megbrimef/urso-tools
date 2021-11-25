import getDirTreeRecursive from './getDirTreeRecursive';
import getFilesInDir from './getFilesInDir';

async function getFilesListRecursive(fList) {
    const dirs = await getDirTreeRecursive(fList);
    const list = await Promise.all(dirs.map(async (dir) => getFilesInDir(dir)));
    return list.reduce((cum, cur) => [...cum, ...cur], []);
}

export default getFilesListRecursive;
