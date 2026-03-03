
function toStorage(key, obj) {
    localStorage[key] = JSON.stringify(obj);
}

function fromStorage(key) {
    let x = localStorage.getItem(key);
    return JSON.parse(x);
}

// En este objeto guardamos todas las propiedades
// para que se repliquen en el localStorage
const GlobalState = new Proxy(
    // Inicialiamos con lo que haya en el localStorage:
    fromStorage('GlobalState') || {},
    // Interceptamos actualizaciones:
    {
        set(target, prop, value) {
            // Primero hacemos lo esperado:
            target[prop] = value;
            // Luego actualizamos el objeto en el localStorage:
            toStorage('GlobalState', target);
            return true;
        }
    }
)
