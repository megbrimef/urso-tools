import { dirname, sep } from 'path';
import { getAbsolutePath } from '../../../shared/helper';
import {
    exec,
    exists,
    getImageSize,
    mkdir,
} from '../../../shared/io';
import { BaseAsset } from './BaseAsset';

function BaseQualityAsset(asset, config) {
    BaseAsset.call(this, asset, config);

    this.canBeOptimized = async (params) => {
        const { source, scaleFactor } = params;
        const { width, height } = await getImageSize(source);
        return (width * scaleFactor) > 1 && (height * scaleFactor) > 1;
    };

    this.cookByQuality = async () => {};
    this.cook = async () => {
        const qualities = Object.keys(this.config.types);
        await Promise.all(qualities.map(this.cookByQuality));
        this.valid = true;
        return this;
    };

    this.cookWebpByQuality = async () => {};
    this.cookWebp = async () => {
        await Promise.all(Object.keys(this.config.types).map(this.cookWebpByQuality));
        return this;
    };

    this.makeSourcePath = async (customPath = '') => {
        const source = getAbsolutePath(this.config.sourceFolder, customPath || this.path);
        if (!(await exists(source))) {
            throw new Error(`File ${source} was not found!`);
        }

        return source;
    };

    this.makeOutputPath = async (qPath = '', customPath = '') => {
        const currentPath = customPath || this.path;
        const splitted = currentPath.split('/');
        splitted.splice(1, 0, qPath);
        const output = getAbsolutePath(this.config.outputFolder, ...splitted);
        await mkdir(dirname(output), { recursive: true });
        return output;
    };

    this.resize = async (params) => {
        const { scaleFactor, output, source } = params;
        const command = `magick convert ${source} -resize ${scaleFactor * 100}% ${output}`;
        await exec(command);
    };

    this.compress = async (params) => {
        const { quality, speed, output } = params;
        const command = `pngquant --ext .png --force --strip --quality 0-${quality} --speed ${speed} "${output}"`;
        await exec(command);
    };

    this.processImagesToWebp = async (allFiles, quality) => {
        const files = allFiles
            .filter((file) => file.includes(`${sep}${quality}${sep}`));

        await Promise.all(files.map(async (source) => {
            const output = (await this.getWebpPath(source));
            await this.convertToWebp(source, output);
            this.cookedFiles.push(output);
        }));
    };

    this.convertToWebp = async (from, to) => {
        const cmd = `cwebp -q 100 ${from} -o ${to}`;
        await exec(cmd);
    };
}

export default BaseQualityAsset;
