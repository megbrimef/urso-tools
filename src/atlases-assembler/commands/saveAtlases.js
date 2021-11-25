import { resolve } from 'path';
import { writeFile } from '../../shared/io';

function saveAtlasByQuality(params, atlasesData) {
    const { output, sourceFolder } = params;
    return async (quality) => {
        const atlasesByQuality = atlasesData[quality];
        const dataToSave = Object.values(atlasesByQuality);
        const saveDir = resolve('.', sourceFolder, quality, output);

        await Promise.all(dataToSave.map(async (dataList) => {
            await Promise.all(dataList.map(async (fileData) => {
                const { name, buffer } = fileData;
                const aPath = resolve(saveDir, name);
                await writeFile(aPath, buffer);
            }));
        }));
    };
}

function saveAtlasesByLoadGroup(params) {
    return async (atlasesData) => {
        const qualities = Object.keys(atlasesData);
        return Promise.all(qualities.map(saveAtlasByQuality(params, { ...atlasesData })));
    };
}

async function saveAtlases(atlases, params) {
    await Promise.all(atlases.map(saveAtlasesByLoadGroup(params)));
}

export default saveAtlases;
