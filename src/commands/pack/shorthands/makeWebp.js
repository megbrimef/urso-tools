import { getFileExtension } from '../../../shared/helper';
import { AssetsEnum } from '../assets/BaseAsset';

// const makeArrayReducer = (reducer) => [reducer, []];
// const assetsReducer = () => makeArrayReducer((acc, cur) => [...acc, ...cur.cookedFiles]);
// const atlasesReducer = () => makeArrayReducer((acc, cur) => [...acc, ...cur.textures]);
// const mergeArraysReducer = () => makeArrayReducer((acc, cur) => [...acc, ...cur]);
// const pngFilterer = (file) => getFileExtension(file) === 'png';

async function makeWebpForAssets(assets, removeSingleImages) {
    const assetsForWebp = removeSingleImages
        ? assets.filter((asset) => asset.type !== AssetsEnum.IMAGE)
        : assets;

    await Promise.all(assetsForWebp.map(async (asset) => asset.cookWebp()));
}

async function makeWebp(assets, atlases, { removeSingleImages }) {
    await makeWebpForAssets(assets, removeSingleImages);
    // const allPngFiles = [
    //     ...assets
    //         .reduce(...assetsReducer()),
    //     ...atlases
    //         .reduce(...mergeArraysReducer())
    //         .reduce(...atlasesReducer()),
    // ].filter(pngFilterer);

    console.log(1);
}

export default makeWebp;
