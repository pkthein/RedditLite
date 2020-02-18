
/**
 * inserts an element to an array while maintaining its sorted order.
 * @param greater is a function to compare items. returns true if left param is greater than the left
 *  */ 
module.exports.insertionSortInsert = (array, item, greater) => {
    if (!array) return [item];

    for(let i = 0; i < array.length; i++) {
        if (greater(item, array[i])) {
            array.splice(i, 0, item)
            return array
        }
    }
    array.push(item);
    return array;
}