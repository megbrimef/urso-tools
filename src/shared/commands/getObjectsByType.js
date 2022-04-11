/* eslint-disable max-len */
/* eslint-disable no-param-reassign */

function flatten(arr) {
    let result = [];

    const obj = arr.pop();

    if (obj.contents && obj.contents.length > 0) {
        result = [...result, ...flatten(obj.contents.splice(0, obj.contents.length))];
    }

    if (arr.length > 0) {
        result = [...result, ...flatten(arr)];
    }

    return [...result, obj];
}

function getObjectsByType(objects, type) {
    return flatten(objects).filter(({ type: objType }) => type === objType);
}

export default getObjectsByType;
