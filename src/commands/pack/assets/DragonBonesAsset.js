import { getFileExtension } from '../../../shared/helper';
import BaseQualityAsset from './BaseQualityAsset';

function DragonBonesAsset(asset, config) {
    BaseQualityAsset.call(this, asset, config);

    const { skeletonJson, textureJson, textureImage } = asset;

    this.skeletonJson = skeletonJson;
    this.textureJson = textureJson;
    this.textureImage = textureImage;

    this.cookTextureByQuality = async (qPath) => {
        const {
            speed,
            quality,
            needOptimize,
        } = this.config.types[qPath];
        const source = await this.makeSourcePath(this.textureImage);
        const output = await this.makeOutputPath(qPath, this.textureImage);

        await this.copy({ source, output });

        const ext = getFileExtension(output);
        if (ext === 'png' && needOptimize) {
            await this.compress({ quality, speed, output });
        }

        this.cookedFiles.push(output);
    };

    this.cookTextureJsonByQulaity = async (qPath) => {
        const source = await this.makeSourcePath(this.textureJson);
        const output = await this.makeOutputPath(qPath, this.textureJson);
        await this.copy({ source, output });
        this.cookedFiles.push(output);
    };

    this.cookSkeletonByQulaity = async (qPath) => {
        const source = await this.makeSourcePath(this.skeletonJson);
        const output = await this.makeOutputPath(qPath, this.skeletonJson);
        await this.copy({ source, output });
        this.cookedFiles.push(output);
    };

    this.cookByQuality = async (qPath) => {
        await this.cookTextureByQuality(qPath);
        await this.cookSkeletonByQulaity(qPath);
        await this.cookTextureJsonByQulaity(qPath);
    };
}

export default DragonBonesAsset;
