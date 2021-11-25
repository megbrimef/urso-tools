export default function getGameAssetsData() {
    function recursiveGet(key, object, defaultResult) {
        if (object === undefined) { return defaultResult; }

        // eslint-disable-next-line no-param-reassign
        key = (typeof key === 'string') ? key.split('.') : key;

        // eslint-disable-next-line no-restricted-syntax
        for (const k of key) {
            if (typeof object[k] === 'undefined') { return defaultResult; }
            // eslint-disable-next-line no-param-reassign
            object = object[k];
        }

        return object;
    }

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
