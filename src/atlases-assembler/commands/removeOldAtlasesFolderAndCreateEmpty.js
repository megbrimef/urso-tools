import { resolve, join } from 'path';
import { rm, mkdir } from '../../shared/io';

async function removeOldAtlasesFolderAndCreateEmpty(qualities, { output, sourceFolder }) {
    const aPath = qualities
        .map((quality) => join(resolve('.'), sourceFolder, quality, output));

    await Promise.all(aPath.map((path) => rm(path)));
    await Promise.all(aPath.map((path) => mkdir(path)));
}

export default removeOldAtlasesFolderAndCreateEmpty;
