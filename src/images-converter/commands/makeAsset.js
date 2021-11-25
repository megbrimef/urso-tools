import { getFileExtension, isImage } from '../../shared/helper';
import { readFile } from '../../shared/io';
import BaseAsset from '../assets/BaseAsset';
import DragonbonesAsset from '../assets/DragonbonesAsset';
import BitmapFontAsset from '../assets/BitmapFontAsset';
import ImageAsset from '../assets/ImageAsset';

function isAnimationJson(json) {
    return json.compatibleVersion && json.armature;
}

function isAtlasJson(json) {
    return json.width && json.height && json.SubTexture;
}

function isImageAsset(source) {
    return isImage(source);
}

function isSvgAsset(source) {
    return getFileExtension(source) === 'svg';
}

function isBitmapFontAsset(source) {
    return getFileExtension(source) === 'fnt';
}

async function isDragonbonesAsset(source) {
    const isJson = getFileExtension(source) === 'json';

    if (!isJson) {
        return false;
    }

    const json = JSON.parse(await readFile(source));
    return isAnimationJson(json) || isAtlasJson(json);
}

async function makeAsset(file, fileList, params) {
    let constructor = null;

    if (await isDragonbonesAsset(file)) {
        constructor = DragonbonesAsset;
    } else if (isBitmapFontAsset(file)) {
        constructor = BitmapFontAsset;
    } else if (isImageAsset(file) && !isSvgAsset(file)) {
        constructor = ImageAsset;
    } else {
        constructor = BaseAsset;
    }

    const relativePath = file.split(params.sourceFolder)[1];

    return new constructor(relativePath, fileList, params);
}

export default makeAsset;
