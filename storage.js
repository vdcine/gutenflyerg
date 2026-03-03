
function toStorage(key, obj) {
    localStorage[key] = JSON.stringify(obj);
}

function fromStorage(key) {
    let x = localStorage.getItem(key);
    return JSON.parse(x);
}
