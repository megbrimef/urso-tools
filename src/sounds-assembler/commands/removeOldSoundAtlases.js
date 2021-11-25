import { rm } from '../../shared/io';

async function removeOldSoundAtlases({ output }) {
    await rm(output);
}

export default removeOldSoundAtlases;
