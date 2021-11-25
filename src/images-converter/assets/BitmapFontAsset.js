/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-rest-params */
import { join, dirname, resolve } from 'path';
import { parseStringPromise, Builder } from 'xml2js';
import ImageAsset from './ImageAsset';
import { exists, readFile } from '../../shared/io';

function BitmapFontAsset() {
    ImageAsset.call(this, ...arguments);
    this.baseProcessAsset = this.processAsset;

    this.getFntTexturePath = async (src) => {
        const regexp = new RegExp(/file="([a-zA-Z_.0-9]*)"/gi);
        const result = regexp.exec(this.fntContents);
        const fileName = result[1];
        const fntTexturePath = join(dirname(src), fileName);
        const fntTextureExists = await exists(fntTexturePath);

        if (!fntTextureExists) {
            return;
        }

        this.fntTexturePath = fntTexturePath.split(this.config.sourceFolder)[1];
    };

    this.getBaseAssetName = async () => 'config';

    this.customProcess = async () => {
        const { source } = this.assets[0];
        this.fntContents = await readFile(source, 'utf-8');
        await this.getFntTexturePath(source);
    };

    this.processFiles = () => {
        if (this.fntTexturePath) {
            const fPath = resolve('.', join(this.config.sourceFolder, this.fntTexturePath));
            this.removeFileFromFiles(fPath);
        }

        this.addAsset('texture', this.fntTexturePath);
    };

    this.processAsset = async (asset) => {
        if (asset.key === 'texture') {
            await this.baseProcessAsset(asset);
        } else {
            this.processFnt(asset);
        }
    };

    this.processFnt = async (asset) => {
        const result = await parseStringPromise(this.fntContents);
        const { scaleFactor, output } = asset;

        for (const char of result.font.chars[0].char) {
            const char$ = char.$;
            char$.x = (char$.x * scaleFactor).toString();
            char$.y = (char$.y * scaleFactor).toString();
            char$.width = (char$.width * scaleFactor).toString();
            char$.height = (char$.height * scaleFactor).toString();
            char$.xadvance = (char$.xadvance * scaleFactor).toString();
        }

        const builder = new Builder();
        const xml = builder.buildObject(result);
        await this.saveToFile(output, xml);
        await this.processNextAsset();
    };
}

module.exports = BitmapFontAsset;
