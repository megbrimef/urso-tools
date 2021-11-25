import audiosprite from 'audiosprite';
import { promisify } from 'util';
import { writeFile } from '../../shared/io';

const audiospriteAsync = promisify(audiosprite);

async function assembleAudioSprite(cfg) {
    const { files, opts } = cfg;
    const data = await audiospriteAsync(files, opts);
    const json = JSON.stringify(data, null, 2);
    await writeFile(`${opts.output}.json`, json);
}

async function assembleAudioSprites(cfgs = []) {
    await Promise.all(cfgs.map(assembleAudioSprite));
}

export default assembleAudioSprites;
