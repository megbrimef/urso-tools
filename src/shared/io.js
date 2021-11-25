import fs from 'fs';
import childProcess from 'child_process';
import { promisify } from 'util';
import sizeOf from 'image-size';

const exec = promisify(childProcess.exec);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const lstat = promisify(fs.lstat);
const rmdir = promisify(fs.rmdir);
const access = promisify(fs.access);

const rm = async (path) => {
    await rmdir(path, { recursive: true });
};

const getImageSize = promisify(sizeOf);

const exists = async (path) => {
    try {
        await access(path, fs.constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
};

export {
    exists,
    readFile,
    readDir,
    rm,
    mkdir,
    exec,
    writeFile,
    copyFile,
    lstat,
    getImageSize,
};
