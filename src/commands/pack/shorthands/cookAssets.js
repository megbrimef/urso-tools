import { runSafeAsync } from '../../../shared/commands/runSafe';

function cookAsset() {
    return async (preparedAsset) => runSafeAsync(preparedAsset.cook);
}

async function cookAssets(preparedAssets = []) {
    const assets = await Promise.all(preparedAssets.map(cookAsset()));
    return assets.filter((asset) => asset);
}

export default cookAssets;
