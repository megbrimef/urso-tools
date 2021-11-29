import { runSafeAsync } from '../../../shared/commands/runSafe';

function cookAsset() {
    return async (preparedAsset) => runSafeAsync(preparedAsset.cook);
}

async function cookAssets(preparedAssets = []) {
    return Promise.all(preparedAssets.map(cookAsset()));
}

export default cookAssets;
