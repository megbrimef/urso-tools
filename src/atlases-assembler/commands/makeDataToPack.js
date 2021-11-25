import { getFileExtension } from '../../shared/helper';

function makeDataToPack(filesData, assetsData) {
    const packData = {};
    const qualities = Object.keys(filesData);
    const loadingGroups = Object.keys(assetsData);

    qualities.forEach((quality) => {
        packData[quality] = {};
        loadingGroups.forEach((loadingGroup) => {
            packData[quality][loadingGroup] = {};
            const qualityFiles = filesData[quality];

            const fileKeys = Object.keys(filesData[quality]);

            fileKeys.forEach((fileKey) => {
                if (assetsData[loadingGroup][fileKey]) {
                    const path = fileKey;
                    const contents = qualityFiles[fileKey];

                    const extension = getFileExtension(fileKey);

                    if (!packData[quality][loadingGroup][extension]) {
                        packData[quality][loadingGroup][extension] = [];
                    }

                    packData[quality][loadingGroup][extension].push({ path, contents });
                }
            });
        });
    });

    return packData;
}

export default makeDataToPack;
