import BaseQualityAsset from './BaseQualityAsset';

function JsonAsset(asset, config) {
    BaseQualityAsset.call(this, asset, config);

    this.cookByQuality = async (qPath) => {
        const source = await this.makeSourcePath();
        const output = await this.makeOutputPath(qPath);
        this.copy({ source, output });
        this.valid = true;
    };
}

export default JsonAsset;
