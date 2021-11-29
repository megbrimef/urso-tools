/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */
import path from 'path';
import puppeteer from 'puppeteer';
import { runSafe } from '../../../shared/commands/runSafe';
import { exists, readFile } from '../../../shared/io';

function getGameAssetsData() {
    function getLazyLoadConfig(ctx) {
        const cfg = ctx.getInstance('Modules.Assets.Config');

        if (!cfg || !cfg.loadingGroups) {
            throw new Error('Loading groups config was not found');
        }

        return cfg.loadingGroups;
    }

    function getAssets(namespace, ctx) {
        let obj = null;

        try {
            obj = ctx.getInstance(namespace, {});
        // eslint-disable-next-line no-empty
        } catch (e) {}

        return (obj
            && obj.assets instanceof Array
            && obj.objects instanceof Array) ? obj.assets : [];
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

    function processNamespace(namespace, ctx) {
        const obj = recursiveGet(namespace, ctx.Game, '');
        const type = typeof obj;
        let assets = [];

        if (type === 'object') {
            const keys = Object.keys(obj);

            keys.forEach((key) => {
                assets = [
                    ...assets,
                    ...processNamespace(`${namespace}.${key}`, ctx),
                ];
            });
        } else if (type === 'function') {
            assets = [
                ...assets,
                ...getAssets(namespace, ctx),
            ];
        }

        return assets;
    }

    function getGameAssets(ctx) {
        const keys = ['Components', 'Templates'];
        let assets = [];

        keys.forEach((key) => {
            assets = [
                ...assets,
                ...processNamespace(key, ctx),
            ];
        });

        return assets;
    }

    function makeEngineData() {
        // eslint-disable-next-line no-undef
        const { Urso } = window;

        Urso.runGame();

        const config = getLazyLoadConfig(Urso);
        const assets = getGameAssets(Urso);

        return { assets, config };
    }

    return makeEngineData();
}

async function makePage(content) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.addScriptTag({ content });

    return { browser, page };
}

function checkContent(content) {
    eval(content);
}

async function getEngineData(entry) {
    const fPath = path.resolve('.', entry);
    const fileExists = await exists(fPath);

    if (!fileExists) {
        throw new Error(`File ${fPath} was not found!`);
    }

    const content = await readFile(fPath, 'utf-8');

    runSafe(checkContent, 'Can not run builded game. Please check build!');

    const { page, browser } = await makePage(content);

    const data = await page.evaluate(getGameAssetsData);
    await browser.close();

    return data;
}

export default getEngineData;
