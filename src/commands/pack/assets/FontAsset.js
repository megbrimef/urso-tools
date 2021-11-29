import { dirname } from 'path';
import { getAbsolutePath } from '../../../shared/helper';
import { mkdir } from '../../../shared/io';
import { BaseAsset } from './BaseAsset';

function FontAsset(asset, config) {
    BaseAsset.call(this, asset, config);

    this.cook = async () => {
        const { sourceFolder, outputFolder } = this.config;
        const source = getAbsolutePath(sourceFolder, this.path);
        const output = getAbsolutePath(outputFolder, this.path);

        await mkdir(dirname(output), { recursive: true });

        await this.copy({ source, output });
        return this;
    };
}

export default FontAsset;
