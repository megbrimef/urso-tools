import { dirname, sep } from 'path';
import { getAbsolutePath } from '../../../shared/helper';
import { copyFile, exists, mkdir } from '../../../shared/io';

const AssetsEnum = {
    NONE: 0,
    ATLAS: 1,
    AUDIOSPRITE: 2,
    BITMAPFONT: 3,
    CONTAINER: 4,
    FONT: 5,
    IMAGE: 6,
    JSON: 7,
    SOUND: 8,
    SPINE: 9
};

function BaseAsset(asset, config) {
    const {
        path,
        loadingGroup,
        placeHolder,
        type,
    } = asset;

    this.config = config;
    this.type = type || AssetsEnum.NONE;
    this.path = path || '';
    this.loadingGroup = loadingGroup || 'initial';
    this.placeHolder = placeHolder || '';
    this.valid = false;
    this.cookedFiles = [];

    this.cook = async () => this;
    this.cookWebp = async () => this;

    this.copy = async ({ source, output }) => copyFile(source, output);

    this.makeSourcePath = async () => {
        const source = getAbsolutePath(this.config.sourceFolder, this.path);
        if (!(await exists(source))) {
            throw new Error(`File ${source} was not found!`);
        }

        return source;
    };

    this.makeOutputPath = async () => {
        const output = getAbsolutePath(this.config.outputFolder, this.path);
        await mkdir(dirname(output), { recursive: true });
        return output;
    };

    this.getWebpPath = async (aPath) => {
        const { outputFolder } = this.config;
        const dir = getAbsolutePath(outputFolder);
        const parts = aPath.replace(dir, '').split(sep).slice(2);
        const webpPath = getAbsolutePath(outputFolder, 'webp', ...parts);
        await mkdir(dirname(webpPath), { recursive: true });
        return webpPath;
    };
}

export {
    AssetsEnum,
    BaseAsset,
};
