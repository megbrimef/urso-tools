/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import { lookup } from 'mime-types';
import { extname, dirname, basename } from 'path';
import { lstat } from './io';

function getDirPath(path) {
    return dirname(path);
}

function getFileName(path) {
    return basename(path);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getFileExtension(filePath) {
    return extname(filePath).slice(1);
}

async function isDir(fPath) {
    return (await lstat(fPath)).isDirectory();
}

function isHiddenDir(path) {
    return basename(path)[0] === '.';
}

function isImage(file) {
    const mime = lookup(file);

    if (!mime) {
        return mime;
    }

    return mime.trim().split('/')[0] === 'image';
}

function recursiveGet(key, object, defaultResult) {
    if (object === undefined) { return defaultResult; }

    key = (typeof key === 'string') ? key.split('.') : key;

    for (const k of key) {
        if (typeof object[k] === 'undefined') { return defaultResult; }
        object = object[k];
    }

    return object;
}

export {
    capitalizeFirstLetter,
    getFileExtension,
    recursiveGet,
    getDirPath,
    getFileName,
    isDir,
    isHiddenDir,
    isImage,
};
