import { getFileExtension } from '../helper';

function filterFilesByExtension(files, extensions = []) {
    return files.filter((file) => {
        const extension = getFileExtension(file);
        return extensions.includes(extension);
    });
}

export default filterFilesByExtension;
