import path from 'path';
import puppeteer from 'puppeteer';
import { exists, readFile } from '../../shared/io';
import getGameAssetsData from './getGameAssetsData';

async function makePage(content) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.addScriptTag({ content });

    return { browser, page };
}

async function getAssets(entry) {
    const fPath = path.resolve('.', entry);
    const fileExists = await exists(fPath);

    if (!fileExists) {
        throw new Error(`File ${fPath} was not found!`);
    }

    const content = await readFile(fPath, 'utf-8');
    const { page, browser } = await makePage(content);

    const data = await page.evaluate(getGameAssetsData);
    await browser.close();

    return data;
}

async function makeLazyLoadFileParams(entry) {
    return getAssets(entry);
}

export default makeLazyLoadFileParams;
