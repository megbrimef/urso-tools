import runSafeAsync from '../../shared/commands/runSafeAsync';
import { isImage } from '../../shared/helper';
import makeAsset from './makeAsset';

function splitFiles(files = []) {
    const configFiles = files.filter((file) => !isImage(file));
    const imageFiles = files.filter((file) => isImage(file));
    return [...imageFiles, ...configFiles];
}

async function makeNextAsset([...list], config) {
    const file = list.pop();
    let assets = [];

    if (file) {
        const asset = await makeAsset(file, list, config);
        const newList = await runSafeAsync(asset.prepare);
        const newAssets = await makeNextAsset(newList, config);
        assets = [...assets, ...newAssets, asset];
    }

    return assets;
}

async function convertAssetsAsync(files, config) {
    const sorted = splitFiles(files);
    const assets = await makeNextAsset(sorted, config);
    await Promise.all(assets.map(async (asset) => asset.process()));
}

export default convertAssetsAsync;
