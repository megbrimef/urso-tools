/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import { packAsync } from 'free-tex-packer-core';
import { sep, dirname } from 'path';
import { getAbsolutePath, getFileExtension } from '../../../shared/helper';
import { mkdir, readFile, writeFile } from '../../../shared/io';
import { AssetsEnum } from '../assets/BaseAsset';

function mapAssetsByLoadingGroups(imageAssets) {
    return imageAssets.reduce((cum, cur) => {
        const obj = { ...cum };
        const { loadingGroup, cookedFiles } = cur;

        if (!obj[loadingGroup]) {
            obj[loadingGroup] = [];
        }

        obj[loadingGroup] = [
            ...obj[loadingGroup],
            ...cookedFiles,
        ];

        return obj;
    }, {});
}

async function getFileContents(files = [], { outputFolder, quality }) {
    return Promise.all(files.map(async (aPath) => {
        const relativePath = aPath.split(outputFolder).pop();
        const pathParts = relativePath.split('/').filter((part) => part && part !== quality);
        const path = pathParts.join('/');
        const contents = await readFile(aPath);
        return { path, contents };
    }));
}

function applyScale(packedData, scale) {
    const jsons = packedData.filter((pData) => getFileExtension(pData.name) === 'json');
    jsons.forEach((json) => {
        const obj = JSON.parse(json.buffer.toString());
        obj.meta.scale = scale;
        json.buffer = Buffer.from(JSON.stringify(obj), 'utf8');
    });
}

async function packAtlas(files, cfg) {
    const {
        outputFolder,
        textureFormat,
        packerParams,
        loaderGroup,
        quality,
        scale,
    } = cfg;
    const data = await getFileContents(files, { outputFolder, quality });
    const textureName = `${loaderGroup}_${textureFormat}Atlas`;
    const options = {
        textureName,
        textureFormat,
        ...packerParams,
    };
    const packedData = await packAsync(data, options);
    applyScale(packedData, scale);
    return packedData;
}

function packByExtension(files, cfg) {
    const {
        packerParams,
        scale,
        quality,
        outputFolder,
        loaderGroup,
    } = cfg;
    return async (textureFormat) => {
        const filteredByExtension = files
            .filter((file) => getFileExtension(file) === textureFormat);

        if (filteredByExtension.length === 0) {
            return;
        }

        return packAtlas(filteredByExtension, {
            packerParams,
            scale,
            quality,
            textureFormat,
            outputFolder,
            loaderGroup,
        });
    };
}

function packByQuality(files, cfg) {
    const {
        extensions,
        outputFolder,
        packerParams,
        types,
        loaderGroup,
    } = cfg;

    return async (quality) => {
        const scale = types[quality].scaleFactor;
        const filteredByQuality = files
            .filter((file) => file.includes(`${sep}${quality}${sep}`));

        const folder = filteredByQuality.reduce((cum, cur) => {
            const regex = new RegExp('/bin/([^/]*)');
            const [, finded] = regex.exec(cur);
            return finded || '';
        }, '');

        const atlasData = (await Promise.all(extensions
            .map(packByExtension([...filteredByQuality], {
                outputFolder,
                quality,
                packerParams,
                scale,
                loaderGroup,
            }))))
            .filter((data) => data)
            .reduce((cum, cur) => [...cum, ...cur], []);

        return {
            loaderGroup,
            atlasData,
            quality,
            folder,
        };
    };
}

function packLoadingGroupToAltases(imageAssets, cfg) {
    const {
        types,
        extensions,
        packerParams,
        outputFolder,
    } = cfg;
    return async (loaderGroup) => {
        const qualies = Object.keys(types);
        const files = imageAssets[loaderGroup];
        return Promise.all(qualies.map(packByQuality([...files], {
            extensions,
            outputFolder,
            packerParams,
            types,
            loaderGroup,
        })));
    };
}

async function saveAtlasData(mappedAtlases, cfg) {
    const {
        atlasesOutputFolder,
        outputFolder,
    } = cfg;
    return Promise.all(mappedAtlases
        .map(async (mAtlas) => Promise.all(mAtlas.map(async (data) => {
            const {
                loaderGroup,
                atlasData,
                quality,
                folder,
            } = data;
            const atlases = {
                loaderGroup,
                quality,
                folder,
                textures: [],
                jsons: [],
            };
            await Promise.all(atlasData.map(async ({ name, buffer }) => {
                const pathParts = [
                    outputFolder,
                    folder,
                    quality,
                    atlasesOutputFolder,
                    name,
                ];
                const absolutePath = getAbsolutePath(pathParts.join('/'));

                await mkdir(dirname(absolutePath), { recursive: true });

                await writeFile(absolutePath, buffer);
                if (getFileExtension(absolutePath) === 'json') {
                    atlases.jsons.push(absolutePath);
                } else {
                    atlases.textures.push(absolutePath);
                }
            }));

            return atlases;
        }))));
}

async function packAtlases(cookedAssets = [], cfg) {
    const { atlasesOutputFolder, outputFolder } = cfg;
    const imageAssets = cookedAssets.filter((asset) => asset.type === AssetsEnum.IMAGE);
    const mappedLoadingGroups = mapAssetsByLoadingGroups(imageAssets);
    const mappedAtlases = await Promise.all(Object.keys(mappedLoadingGroups)
        .map(packLoadingGroupToAltases(mappedLoadingGroups, cfg)));

    return saveAtlasData(mappedAtlases, { atlasesOutputFolder, outputFolder });
}

export default packAtlases;
