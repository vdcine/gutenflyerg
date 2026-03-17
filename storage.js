const _initialized = { search: false, design: false }; // para que no guarde nada en localStorage hasta que haga la carga inicial.

function toStorage(key, obj) {
    localStorage[key] = JSON.stringify(obj);
}

function fromStorage(key) {
    let x = localStorage.getItem(key);
    return x ? JSON.parse(x) : null;
}

function clearAllStorage() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
}

const defaultDesignState = {
    titulo: '',
    edadSugerida: '',
    orgText: '',
    ciclo: '',
    date: '',
    hour: '',
    currentPaintColor: '#00ff00',
    strokeColor: '#000000',
    bandaHidden: false,
    elementColors: {},
    fontSizes: {
        flyerDate: '34',
        flyerHour: '40',
        flyerTitle: '42',
        flyerTitleMarginTop: '24',
        rectWidth: '460',
    },
    backgroundImage: '',
};

const SearchState = new Proxy(
    fromStorage('SearchState') || {},
    {
        set(target, prop, value) {
            target[prop] = value;
            if (_initialized.search) {
                toStorage('SearchState', target);
            }
            return true;
        },
    }
);

const DesignState = new Proxy(
    { ...defaultDesignState, ...fromStorage('DesignState') },
    {
        set(target, prop, value) {
            target[prop] = value;
            if (_initialized.design) {
                toStorage('DesignState', target);
            }
            return true;
        },
    }
);

_initialized.search = true;
_initialized.design = true;
