import { join, resolve, dirname } from 'path';
import {
    exists,
    mkdir,
    copyFile,
    writeFile,
} from '../../shared/io';

function BaseAsset(file, files, config) {
    this.config = config;
    this.assets = [];
    this.files = [...files];

    this.getBaseAssetName = async () => 'base';

    this.customProcess = async () => {};

    this.processFiles = () => {};

    this.removeFileFromFiles = (fileToRm) => {
        this.files = this.files.filter((f) => f !== fileToRm);
    };

    this.getRelativePath = (aPath) => {
        const splitted = aPath.split(this.config.sourceFolder);
        return splitted[1] ? splitted[1] : aPath;
    };

    this.addAsset = (key, assetFile) => {
        Object.keys(this.config.types).forEach((type) => {
            const { scaleFactor, quality, speed } = this.config.types[type];
            const output = join(resolve('.'), this.config.output, type, assetFile);
            const source = join(resolve('.'), this.config.sourceFolder, assetFile);
            this.assets.push({
                key,
                type,
                scaleFactor,
                quality,
                speed,
                output,
                source,
            });
        });
    };

    this.createDir = async (to) => {
        const dir = dirname(to);
        const dirExists = await exists(dir);

        if (!dirExists) {
            await mkdir(dir, { recursive: true });
        }
    };

    this.copyAsset = async (asset) => {
        const { output, source } = asset;
        await this.createDir(output);
        await copyFile(source, output);
    };

    this.getNextAssetToProcess = () => this.assets.pop();

    this.processNextAsset = async () => {
        const asset = this.getNextAssetToProcess();

        if (asset) {
            return this.processAsset(asset);
        }

        return null;
    };

    this.processAsset = async (asset) => {
        await this.copyAsset(asset);
        await this.processNextAsset();
    };

    this.saveToFile = async (filePath, data) => writeFile(filePath, data);

    this.prepare = async () => {
        this.addAsset(await this.getBaseAssetName(file), file);
        await this.customProcess();
        await this.processFiles(this.files);
        return this.files;
    };

    this.process = async () => {
        await this.processNextAsset();
    };
}

module.exports = BaseAsset;
