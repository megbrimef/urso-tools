import { logWarning } from '../../../shared/logger';
import { BaseAsset, AssetsEnum } from '../assets/BaseAsset';
import AtlasAsset from '../assets/AtlasAsset';
import ImageAsset from '../assets/ImageAsset';
import JsonAsset from '../assets/JsonAsset';
import SpineAsset from '../assets/SpineAsset';
import BitmapFontAsset from '../assets/BitmapFontAsset';
import SoundAsset from '../assets/SoundAsset';
import DragonBonesAsset from '../assets/DragonBonesAsset';
import FontAsset from '../assets/FontAsset';
import AudioSpriteAsset from '../assets/AudioSpriteAsset';

function prepareAsset(config) {
    return (asset) => {
        switch (asset.type) {
        case AssetsEnum.IMAGE:
            return new ImageAsset(asset, config);
        case AssetsEnum.ATLAS:
            return new AtlasAsset(asset, config);
        case AssetsEnum.JSON:
            return new JsonAsset(asset, config);
        case AssetsEnum.SPINE:
            return new SpineAsset(asset, config);
        case AssetsEnum.BITMAPFONT:
            return new BitmapFontAsset(asset, config);
        case AssetsEnum.SOUND:
            return new SoundAsset(asset, config);
        case AssetsEnum.DRAGONBONES:
            return new DragonBonesAsset(asset, config);
        case AssetsEnum.FONT:
            return new FontAsset(asset, config);
        case AssetsEnum.AUDIOSPRITE:
            return new AudioSpriteAsset(asset, config);
        default:
            logWarning(`Asset with key '${asset.key}' with key type ${asset.type} will be ignored!`);
            return new BaseAsset(asset, config);
        }
    };
}

function prepareAssets(assets = [], config) {
    return assets
        .map(prepareAsset(config))
        .filter((asset) => asset.type !== AssetsEnum.NONE);
}

export default prepareAssets;
