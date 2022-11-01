import { basename, dirname, join } from 'path';
import { getFileExtension } from '../../../shared/helper';
import BaseQualityAsset from './BaseQualityAsset';

function SpineAsset(asset, config) {
    BaseQualityAsset.call(this, asset, config);
    this.noAtlas = asset.noAtlas;

    this.cookTextureByQuality = async (name, path, qPath) => {
        if(this.noAtlas) {
            return;
        }
        const {
            speed,
            quality,
            needOptimize,
        } = this.config.types[qPath];

        const fName = join(path, `${name}.png`);
        const source = await this.makeSourcePath(fName);
        const output = await this.makeOutputPath(qPath, fName);

        await this.copy({ source, output });

        const ext = getFileExtension(output);
        if (ext === 'png' && needOptimize) {
            await this.compress({ quality, speed, output });
        }

        this.cookedFiles.push(output);
    };

    this.cookJsonByQuality = async (qPath) => {
        const source = await this.makeSourcePath();
        const output = await this.makeOutputPath(qPath, this.textureJson);

        await this.copy({ source, output });
        this.cookedFiles.push(output);
    };

    this.cookAtlasByQuality = async (name, path, qPath) => {
        if(this.noAtlas) {
            return;
        }

        const fName = join(path, `${name}.atlas`);
        const source = await this.makeSourcePath(fName);
        const output = await this.makeOutputPath(qPath, fName);

        await this.copy({ source, output });
        this.cookedFiles.push(output);
    };

    this.cookByQuality = async (qPath) => {
        const name = basename(this.path).split('.').shift();
        const path = dirname(this.path);
        await this.cookJsonByQuality(qPath);
        await this.cookTextureByQuality(name, path, qPath);
        await this.cookAtlasByQuality(name, path, qPath);
    };
}

export default SpineAsset;
