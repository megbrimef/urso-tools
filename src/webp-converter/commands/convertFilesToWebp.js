import { join, resolve } from 'path';
import filterFilesByExtension from '../../shared/commands/filterFilesByExtension';
import { getDirPath, getFileName } from '../../shared/helper';
import {
    exec,
    exists,
    readFile,
    rm,
    writeFile,
    mkdir,
} from '../../shared/io';

function isJsonAtlas(obj) {
    return obj.meta && obj.meta.app && obj.meta.version && obj.meta.image;
}

async function getTextureFileName(filePath) {
    const fileContents = await readFile(filePath, 'utf-8');
    const jsonFileContents = JSON.parse(fileContents);

    if (isJsonAtlas(jsonFileContents)) {
        return jsonFileContents;
    }

    return false;
}

async function prepareWebpDir(filePath) {
    const aPath = resolve('.', filePath);
    const fromPath = getDirPath(aPath);
    const toPath = join(fromPath, 'webp');
    const webpDirExists = await exists(toPath);

    if (webpDirExists) {
        await rm(toPath);
    }

    await mkdir(toPath, { recursive: true });

    return { fromPath, toPath };
}

async function convertTexture(from, to) {
    const cmd = `cwebp -q 100 ${from} -o ${to}`;
    await exec(cmd);
}

async function convertAtlas(filePath) {
    const json = await getTextureFileName(filePath);

    if (!json) {
        return null;
    }

    const { toPath, fromPath } = await prepareWebpDir(filePath);

    const textureName = json.meta.image;
    const newTextureName = textureName.replace(/png/g, 'webp');
    json.meta.image = newTextureName;
    const jsonPath = join(toPath, getFileName(filePath))
        .replace(/png/g, 'webp');

    const atlasFromPath = join(fromPath, textureName);
    const atlasToPath = join(toPath, newTextureName);

    await writeFile(jsonPath, JSON.stringify(json));
    await convertTexture(atlasFromPath, atlasToPath);

    return atlasFromPath;
}

async function convertAtlases(files) {
    const filteredJson = filterFilesByExtension(files, ['json']);
    const atlasTextures = [];

    await Promise.all(filteredJson.map(async (filePath) => {
        const atlasPath = await convertAtlas(filePath);
        if (atlasPath) {
            atlasTextures.push(atlasPath);
        }
    }));

    return atlasTextures;
}

function getTextureFiles(files, convertedAtlasTextures) {
    const pngFiles = filterFilesByExtension(files, ['png']);
    return pngFiles
        .map((file) => resolve('.', file))
        .filter((file) => !convertedAtlasTextures.includes(file));
}

async function convertTextures(files) {
    await Promise.all(files.map((from) => {
        const to = from.replace('.png', '.webp');
        return convertTexture(from, to);
    }));
}

async function convertAssetsToWebp(files) {
    const convertedAtlasTextures = await convertAtlases(files);
    const textureFiles = getTextureFiles(files, convertedAtlasTextures);
    await convertTextures(textureFiles);
}

export default convertAssetsToWebp;
