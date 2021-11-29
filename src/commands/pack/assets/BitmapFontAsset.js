/* eslint-disable no-restricted-syntax */
import { join, dirname, sep } from 'path';
import { parseStringPromise, Builder } from 'xml2js';
import { getFileExtension } from '../../../shared/helper';
import { readFile, writeFile } from '../../../shared/io';
import BaseQualityAsset from './BaseQualityAsset';

function BitmapFontAsset(asset, config) {
    BaseQualityAsset.call(this, asset, config);

    this.cookTextureByQuality = async (texturePath, qPath) => {
        const { scaleFactor, speed, quality } = this.config.types[qPath];
        const source = await this.makeSourcePath(texturePath);
        const output = await this.makeOutputPath(qPath, texturePath);

        await this.resize({ scaleFactor, output, source });

        const ext = getFileExtension(output);
        if (ext === 'png') {
            await this.compress({ quality, speed, output });
        }

        this.cookedFiles.push(output);
    };

    this.cookFontConfigByQuality = async (qPath) => {
        const { scaleFactor } = this.config.types[qPath];
        const source = await this.makeSourcePath();
        const output = await this.makeOutputPath(qPath);
        const contents = await readFile(source, 'utf-8');
        const result = await parseStringPromise(contents);

        for (const char of result.font.chars[0].char) {
            const char$ = char.$;
            char$.x = (char$.x * scaleFactor).toString();
            char$.y = (char$.y * scaleFactor).toString();
            char$.width = (char$.width * scaleFactor).toString();
            char$.height = (char$.height * scaleFactor).toString();
            char$.xadvance = (char$.xadvance * scaleFactor).toString();
        }

        const fontTextureName = result.font.pages[0].page[0].$.file;

        const builder = new Builder();
        const xml = builder.buildObject(result);
        await writeFile(output, xml);

        this.cookedFiles.push(output);

        return fontTextureName;
    };

    this.cookByQuality = async (qPath) => {
        const textureName = await this.cookFontConfigByQuality(qPath);
        const texturePath = join(dirname(this.path), textureName);
        await this.cookTextureByQuality(texturePath, qPath);
    };

    this.mapFiles = () => this.cookedFiles.reduce((acc, cur) => {
        const isFnts = getFileExtension(cur) === 'fnt';
        const data = { ...acc };

        if (isFnts) {
            data.fnts.push(cur);
        } else {
            data.textures.push(cur);
        }

        return data;
    }, { fnts: [], textures: [] });

    this.processFntToWebp = async (fnts, quality) => {
        const files = fnts
            .filter((file) => file.includes(`${sep}${quality}${sep}`));

        await Promise.all(files.map(async (source) => {
            const output = await this.getWebpPath(source);
            await this.copy(source, output);
            this.cookedFiles.push(output);
        }));
    };

    this.cookWebpByQuality = async (quality) => {
        const { fnts, textures } = this.mapFiles();
        this.processImagesToWebp(textures, quality);
        this.processFntToWebp(fnts, quality);
    };
}

export default BitmapFontAsset;
