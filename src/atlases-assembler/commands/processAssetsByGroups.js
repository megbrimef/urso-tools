/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import { logWarning } from '../../shared/logger';

function makeAssetsMap(assets, defaultLoadingGroup) {
    const map = {};

    for (let i = 0; i < assets.length; i++) {
        const {
            type,
            key,
            path,
            loadingGroup,
            placeHolder = null,
        } = assets[i];

        const lGroup = loadingGroup || defaultLoadingGroup;

        const asset = {
            type,
            path,
            placeHolder,
            lGroup,
        };

        if (map[key]) {
            logWarning(`${key} has duplicate! Asset ${JSON.stringify(asset)}`);
        }

        map[key] = asset;
    }

    return map;
}

function processLoadingGroups(assets, defaultLoadingGroup, lazyLoadingGroups) {
    const assetsObj = {};
    const mappedAssets = makeAssetsMap(assets, defaultLoadingGroup);
    let keys = Object.keys(mappedAssets);

    assetsObj[defaultLoadingGroup] = {};

    // move all placeholder and initial assets;
    for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        const obj = mappedAssets[key];

        if (obj.lGroup === defaultLoadingGroup) {
            const path = obj.path || obj.textureImage;
            assetsObj[defaultLoadingGroup][path] = obj;
            delete mappedAssets[key];
            continue;
        }

        const placeHolderObj = mappedAssets[obj.placeHolder];

        if (obj.placeHolder && !placeHolderObj) {
            logWarning(`There was no placeHolder: ${obj.placeHolder} texture found!`);
        }

        if (placeHolderObj) {
            assetsObj[defaultLoadingGroup] = placeHolderObj;
            delete mappedAssets[obj.placeHolder];
        }
    }

    keys = Object.keys(mappedAssets);

    // move other assets to lazyload groups;
    for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        const obj = mappedAssets[key];

        if (!lazyLoadingGroups.includes(obj.lGroup)) {
            logWarning(`LoadingGroup: ${obj.lGroup} wasn't found! Moving it to initial.`);
            obj.lGroup = defaultLoadingGroup;
        }

        if (!assetsObj[obj.lGroup]) {
            assetsObj[obj.lGroup] = {};
        }

        const path = obj.path || obj.textureImage;
        assetsObj[obj.lGroup][path] = obj;
        delete mappedAssets[key];
    }

    return assetsObj;
}

function swapConfig(config) {
    const swapped = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(config)) {
        swapped[value] = key;
    }

    return swapped;
}

function getInitialConfig(config) {
    const minValue = Object.keys(config).sort()[0];
    return config[minValue];
}

function processAssetsByGroups({ config, assets }) {
    const swappedConfig = swapConfig(config);
    const swappedConfigKeys = Object.values(swappedConfig);
    const initialConfig = getInitialConfig(swappedConfig);
    const lazyLoadingGroups = swappedConfigKeys.filter((group) => group !== initialConfig);
    const processedAssets = processLoadingGroups(assets, initialConfig, lazyLoadingGroups);

    return processedAssets;
}

export default processAssetsByGroups;
