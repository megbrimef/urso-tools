/* eslint-disable prefer-rest-params */
import BaseAsset from './BaseAsset';
import { exec, getImageSize } from '../../shared/io';
import { getFileExtension } from '../../shared/helper';

function ImageAsset() {
    BaseAsset.call(this, ...arguments);

    this.canBeOptimized = async (asset) => {
        const { source, scaleFactor } = asset;
        const { width, height } = await getImageSize(source);
        return (width * scaleFactor) > 1 && (height * scaleFactor) > 1;
    };

    this.processAsset = async (asset) => {
        await this.createDir(asset.output);

        if (await this.canBeOptimized(asset)) {
            await this.resize(asset);

            const ext = getFileExtension(asset.output);
            if (ext === 'png') {
                await this.compress(asset);
            }
        } else {
            await this.copyAsset(asset);
        }

        await this.processNextAsset();
    };

    this.resize = async (asset) => {
        const { scaleFactor, output, source } = asset;
        const command = `magick convert ${source} -resize ${scaleFactor * 100}% ${output}`;
        await exec(command);
    };

    this.compress = async (asset) => {
        const { quality, speed, output } = asset;
        const command = `pngquant --ext .png --force --strip --quality 0-${quality} --speed ${speed} "${output}"`;
        await exec(command);
    };
}

module.exports = ImageAsset;
