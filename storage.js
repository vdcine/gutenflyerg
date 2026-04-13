// const INIT_FLAG = Symbol('isInitialized');

function toStorage(key, obj) {
    localStorage[key] = JSON.stringify(obj);
    console.log(`[Storage] Guardado ${key}:`, JSON.parse(JSON.stringify(obj)));
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

const defaultSearchState = {
    DOM: {},
    backdrops: [],
    posters: [],
    currentBackdrop: 0,
    currentPoster: 0,
};

// TODO: ver redundancias
const defaultDesignState = {
    version: '1',
    titulo: 'Título de la Peli',
    edadSugerida: '',
    orgText: 'Organiza Matías Corona con apoyo de la Comisión Directiva de la Biblioteca Menéndez.',
    ciclo: 'Nombre del ciclo',
    date: '2026-03-11',
    hour: '19:00',
    currentPaintColor: '#00ff00',
    strokeColor: '#000000',
    strokeTargets: [],
    fontSizes: {
        flyerDate: '34',
        flyerHour: '40',
        flyerTitle: '42',
        flyerTitleMarginTop: '24',
        rectWidth: '460',
    },
    backgroundImage: '',
    DOM: {
        // inputs del panel
        titleInput: { value: '' },
        cicloInput: { value: 'Nombre del ciclo' },
        dateInput: { value: '2026-03-11' },
        hourInput: { value: '19:00' },
        orgInput: { value: 'Organiza Matías Corona con apoyo de la Comisión Directiva de la Biblioteca Menéndez.' },
        // elementos del flyer
        title: { textContent: 'Título' },
        flyerCiclo: { textContent: 'Ciclo' },
        flyerDate: { textContent: '' },
        flyerHour: { textContent: '19:00 HS' },
        flyerOrg: { textContent: 'Organiza Matías Corona con apoyo de la Comisión Directiva de la Biblioteca Menéndez.' },
        // tamaños del panel
        flyerDateFontSizeInput: { value: '34' },
        flyerHourFontSizeInput: { value: '40' },
        flyerTitleFontSizeInput: { value: '42' },
        flyerTitleMarginTopInput: { value: '24' },
        rectWidthInput: { value: '460' },
        // figuras
        bandavertical: { style: { display: 'block', width: '460px' } },
        flyer: { style: { backgroundImage: '' } },
        // edades
        edadSugerida: { textContent: '' },
        edadSugeridaInput: { value: '' },
    },
};

function updateDOMFromState() {
    if (!document.getElementById("flyer")) return;

    //Object.entries(SearchState.DOM).forEach(([eid, props]) =>  Object.entries(props).forEach(([k, v]) => document.getElementById(eid)[k] = v));
    Object.entries(SearchState.DOM).forEach(([eid, props]) => {
        const el = document.getElementById(eid);
        if (!el) return;
        Object.entries(props).forEach(([k, v]) => el[k] = v);
    });

    Object.entries(DesignState.DOM).forEach(([eid, props]) => {
      // document.getElementByID(eid)[k] = v // mal cuando el valor es un dict , porque pisa todo el previo y no lo actualiza
        const el = document.getElementById(eid);
        if (!el) return;// TODO: agregarle el else para que tire el error en caso de que haya
        Object.entries(props).forEach(([prop, v]) => {
            if (typeof el[prop] === 'object') { // ¿testear el typo del valor actual o del valor que quiero aplicar?
            // if (typeof v === 'object') { // ¿testear el typo del valor actual o del valor que quiero aplicar?
                Object.assign(el[prop], v);
            } else {
                el[prop] = v;
            }
        });
    });
}

//const initialSearchData = fromStorage('SearchState') || {};
//initialSearchData[INIT_FLAG] = false;

const SearchState = new Proxy(
    { ...defaultSearchState, ...fromStorage('SearchState') },
    {
        set(target, prop, value) {
            target[prop] = value;
            //if (target[INIT_FLAG] && prop !== INIT_FLAG) {
            toStorage('SearchState', target);
            updateDOMFromState();
            return true;
        },
    }
);

//const initialDesignData = { ...defaultDesignState, ...fromStorage('DesignState') };
//initialDesignData[INIT_FLAG] = false;

// posible proxy recursivo que detecta cambios en objetos anidados
function createDeepProxy(obj, onChange) {
    const handler = {
        get(target, prop) {
            const value = target[prop];
            if (value && typeof value === 'object') {
                return createDeepProxy(value, onChange);
            }
            return value;
        },
        set(target, prop, value) {
            console.log(`[State] Cambiando DesignState.${prop}:`, value);
            target[prop] = value;
            onChange();
            return true;
        }
    };
    return new Proxy(obj, handler);
}

const DesignState = createDeepProxy(
    { ...defaultDesignState, ...fromStorage('DesignState') },
    () => {
        toStorage('DesignState', DesignState);
        updateDOMFromState();
    }
);

//SearchState[INIT_FLAG] = true;
//DesignState[INIT_FLAG] = true;
