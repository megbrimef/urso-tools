/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

import { join, resolve } from 'path';
import getFilesInDir from '../../shared/commands/getFilesInDir';

function makeConfig(cfg) {
    const {
        sourceFolder,
        silence,
        format,
        output,
    } = cfg;

    return async (key) => {
        const configs = [];
        const type = cfg.types[key];
        const soundsSourceFolder = resolve('.', sourceFolder);
        const files = await getFilesInDir(soundsSourceFolder);

        const outputPath = join(output, type.output);
        let opts = {
            silence,
            format,
            output: outputPath,
        };

        if (type.optimizations) {
            opts = { ...opts, ...type.optimizations };
        }

        configs.push({
            files,
            opts,
            outputPath,
            key,
        });

        return configs;
    };
}

async function parseCfg(cfg) {
    const typeKeys = Object.keys(cfg.types);
    const result = await Promise.all(typeKeys.map(makeConfig(cfg)));
    return result.reduce((acc, cur) => ([...acc, ...cur]), []);
}

export default parseCfg;
