import { getFileExtension } from '../../../shared/helper';
import BaseQualityAsset from './BaseQualityAsset';

function ImageAsset(asset, config) {
    BaseQualityAsset.call(this, asset, config);

    this.cookByQuality = async (qPath) => {
        const {
            scaleFactor,
            speed,
            quality,
            needOptimize,
        } = this.config.types[qPath];
        const source = await this.makeSourcePath();
        const output = await this.makeOutputPath(qPath);

        if (await this.canBeOptimized({ scaleFactor, source })) {
            await this.resize({ scaleFactor, output, source });

            const ext = getFileExtension(output);
            if (ext === 'png' && needOptimize) {
                await this.compress({ quality, speed, output });
            }
        } else {
            await this.copy({ output, source });
        }

        this.cookedFiles.push(output);
    };

    this.cookWebpByQuality = async (quality) => {
        this.processImagesToWebp(this.cookedFiles, quality);
    };
}

export default ImageAsset;
