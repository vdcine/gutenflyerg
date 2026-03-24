const INIT_FLAG = Symbol('isInitialized');

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
    version: '1',
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

const initialSearchData = fromStorage('SearchState') || {};
initialSearchData[INIT_FLAG] = false;

const SearchState = new Proxy(
    initialSearchData,
    {
        set(target, prop, value) {
            target[prop] = value;
            if (target[INIT_FLAG] && prop !== INIT_FLAG) {
                toStorage('SearchState', target);
            }
            return true;
        },
    }
);

const initialDesignData = { ...defaultDesignState, ...fromStorage('DesignState') };
initialDesignData[INIT_FLAG] = false;

const DesignState = new Proxy(
    initialDesignData,
    {
        set(target, prop, value) {
            target[prop] = value;
            if (target[INIT_FLAG] && prop !== INIT_FLAG) {
                toStorage('DesignState', target);
            }
            return true;
        },
    }
);

SearchState[INIT_FLAG] = true;
DesignState[INIT_FLAG] = true;
