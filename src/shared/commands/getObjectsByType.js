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

function getObjectsByTypes(objects, types = []) {
    return flatten([...objects]).filter(({ type: objType }) => types.includes(objType));
}

export default getObjectsByTypes;
