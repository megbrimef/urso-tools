/* eslint-disable no-param-reassign */
/* eslint-disable prefer-rest-params */

import { resolve, join } from 'path';
import { getFileExtension } from '../../shared/helper';
import { readFile } from '../../shared/io';
import ImageAsset from './ImageAsset';

function DragonbonesAsset() {
    ImageAsset.call(this, ...arguments);

    this.getAsset = async (file) => JSON.parse(await readFile(file));

    this.getBaseAssetName = async (file) => {
        const fPath = join(resolve('.'), this.config.sourceFolder, file);
        const json = JSON.parse(await readFile(fPath));
        const isAnimationJson = json.compatibleVersion && json.armature;
        return isAnimationJson ? 'animation' : 'atlas';
    };

    this.processAsset = async (asset) => {
        asset.scaleFactor = 1;
        await this.copyAsset(asset);

        if (asset.key === 'texture') {
            await this.compress(asset);
        }

        await this.processNextAsset();
    };

    this.getSecondConfigFile = async () => {
        const { key, source } = this.assets[0];
        const isAnimation = key === 'animation';

        if (isAnimation) {
            await this.getAtlasConfig(source);
        } else {
            await this.getAnimationConfig(source);
        }
    };

    this.getDependedAsset = async (file) => {
        const isJson = getFileExtension(file) === 'json';

        if (!isJson) {
            return {};
        }

        return this.getAsset(file);
    };

    this.getAtlasConfig = async (source) => {
        const json = JSON.parse(await readFile(source));
        const { name } = json;
        let configFile = null;

        await Promise.all(this.files.map(async (file) => {
            const asset = await this.getDependedAsset(file);

            if (asset.width && asset.height && asset.SubTexture && asset.name === name) {
                configFile = file;
            }
        }));

        this.addAsset('atlas', this.getRelativePath(configFile));
        this.removeFileFromFiles(configFile);
    };

    this.getAnimationConfig = async (source) => {
        const json = JSON.parse(await readFile(source));
        const { name } = json;
        let animFile = null;

        await Promise.all(this.files.map(async (file) => {
            const asset = await this.getDependedAsset(file);

            if (asset.compatibleVersion && asset.armature && asset.name === name) {
                animFile = file;
            }
        }));

        this.addAsset('animation', this.getRelativePath(animFile));
        this.removeFileFromFiles(animFile);
    };

    this.getTexture = async () => {
        const { sourceFolder } = this.config;
        const { source } = this.assets.filter((asset) => asset.key === 'atlas')[0];
        const [, dirFile] = source.split(sourceFolder);
        const fPath = dirFile.replace('.json', '.png');
        const aPath = join(resolve('.'), sourceFolder, fPath);
        this.addAsset('texture', fPath);
        this.removeFileFromFiles(aPath);
    };

    this.processFiles = async () => {
        await this.getSecondConfigFile();
        await this.getTexture();
    };
}

module.exports = DragonbonesAsset;
