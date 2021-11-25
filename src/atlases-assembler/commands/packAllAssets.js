import { packAsync } from 'free-tex-packer-core';
import { merge } from 'lodash';

function packByExtension(packData, quality, scaleParams, params) {
    return async (loadData, index) => {
        const extensionFiles = packData[loadData];
        const extensions = Object.keys(extensionFiles);
        const scale = scaleParams[quality];
        const result = { [quality]: {} };

        await Promise.all(extensions.map(async (textureFormat) => {
            const textureName = `${index}_${textureFormat}Atlas`;
            const files = extensionFiles[textureFormat];

            const options = {
                textureName,
                textureFormat,
                ...params,
                scale,
            };

            result[quality][textureFormat] = await packAsync(files, options);
        }));

        return result;
    };
}

function packAssetGroup(packData, { packerParams, scaleParams }) {
    const params = { ...packerParams };

    return async function pack(quality) {
        const loadinGroupData = packData[quality];
        const loadingGroups = Object.keys(loadinGroupData);
        return Promise.all(loadingGroups
            .map(packByExtension(loadinGroupData, quality, scaleParams, params)));
    };
}

function remapAtlasesData(atlases) {
    return atlases
        .reduce((cum, cur) => merge(cum, cur), []);
}

async function packAllAssets(packData, params) {
    const keys = Object.keys(packData);
    const atlases = await Promise.all(keys.map(packAssetGroup(packData, params)));
    return remapAtlasesData(atlases);
}

export default packAllAssets;
