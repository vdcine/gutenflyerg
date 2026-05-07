// const INIT_FLAG = Symbol('isInitialized');

function getNextWednesday() {
    const d = new Date();
    d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7));
    return d.toLocaleDateString('sv');
}

function toStorage(key, obj) {
    localStorage[key] = JSON.stringify(obj);
}

function fromStorage(key) {
    let x = localStorage.getItem(key);
    return x ? JSON.parse(x) : null;
}

function clearAllStorageAndReload() {
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
    currentPaintColor: '#00ff00',
    fontSizes: {
        flyerDate: '34',
        flyerHour: '40',
        flyerTitle: '42',
        rectWidth: '460',
    },
    backgroundImage: '',
    DOM: {
        // inputs del panel
        titleInput: { value: 'Titulo' },
        cicloInput: { value: 'Nombre del ciclo' },
        dateInput: { value: getNextWednesday() },
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
        rectWidthInput: { value: '460' },
        // figuras
        bandavertical: { style: { display: 'block', width: '460px' } },
        flyer: { style: { backgroundImage: '' } },
        poster: { src: '' },
        // edades
        edadSugerida: { textContent: '', style: { display: 'none' } },
        edadSugeridaSelect: { value: '' },
        // stroke
        strokeColorInput: { value: '#000000' },
    },
};

function updateDOMFromState() {
    //Object.entries(SearchState.DOM).forEach(([eid, props]) =>  Object.entries(props).forEach(([k, v]) => document.getElementById(eid)[k] = v));
    Object.entries(SearchState.DOM).forEach(([eid, props]) => {
        const el = document.getElementById(eid);
        if (!el) {
            console.error(`[storage.js] Error: No se encontró el elemento con ID "${eid}" en el DOM (SearchState).`);
            return;
        }
        Object.entries(props).forEach(([k, v]) => el[k] = v);
    });

    Object.entries(DesignState.DOM).forEach(([eid, props]) => {
      // document.getElementByID(eid)[k] = v // mal cuando el valor es un dict , porque pisa todo el previo y no lo actualiza
        const el = document.getElementById(eid);
        if (!el) {
            console.error(`[storage.js] Error: No se encontró el elemento con ID "${eid}" en el DOM (DesignState).`);
            return;
        }
        Object.entries(props).forEach(([prop, v]) => {
            if (typeof el[prop] === 'object') { // ¿testear el typo del valor actual o del valor que quiero aplicar?
            // if (typeof v === 'object') { // ¿testear el typo del valor actual o del valor que quiero aplicar?
                Object.assign(el[prop], v);
            } else {
                el[prop] = v;
            }
        });
        if (props.dataset && props.dataset.svgColor) {
            applySvgColor(eid, props.dataset.svgColor);
        }
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
