/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */
import path from 'path';
import puppeteer from 'puppeteer';
import { runSafe } from './runSafe';
import { exists, readFile } from '../io';

function getGameAssetsData() {
    const errors = [];

    function getLazyLoadConfig(ctx) {
        const cfg = ctx.getInstance('Modules.Assets.Config');

        if (!cfg || !cfg.loadingGroups) {
            throw new Error('Loading groups config was not found');
        }

        return cfg.loadingGroups;
    }

    function getObjectsByKey(namespace, ctx, pKey) {
        let obj = null;

        try {
            obj = ctx.getInstance(namespace, {});
        } catch (e) {
            errors.push(e);
        }

        return (obj && obj[pKey] instanceof Array) ? obj[pKey] : [];
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

    function processNamespace(namespace, ctx, pKey) {
        const obj = recursiveGet(namespace, ctx.Game, '');
        const type = typeof obj;
        let objects = [];

        if (type === 'object') {
            const keys = Object.keys(obj);

            keys.forEach((key) => {
                objects = [
                    ...objects,
                    ...processNamespace(`${namespace}.${key}`, ctx, pKey),
                ];
            });
        } else if (type === 'function') {
            objects = [
                ...objects,
                ...getObjectsByKey(namespace, ctx, pKey),
            ];
        }

        return objects;
    }

    function getGameData(ctx) {
        const keys = ['Components', 'Templates'];
        let assets = [];
        let objects = [];

        keys.forEach((key) => {
            assets = [
                ...assets,
                ...processNamespace(key, ctx, 'assets'),
            ];

            objects = [
                ...objects,
                ...processNamespace(key, ctx, 'objects'),
            ];
        });

        return { assets, objects };
    }

    function makeEngineData() {
        // eslint-disable-next-line no-undef
        const { Urso } = window;

        Urso.runGame();

        const config = getLazyLoadConfig(Urso);
        const { assets, objects } = getGameData(Urso);

        return {
            objects,
            assets,
            config,
            errors,
        };
    }

    return makeEngineData();
}

async function makePage(content) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.evaluate(() => {
        window.automation = true;
    });
    

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
