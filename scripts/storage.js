import {getNextWednesday} from "./calendar.js";

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

// Esta funcion es una solucion provisoria no tan eficiente, requiere mejora a futuro
function updateDOMFromState() {
    //Object.entries(SearchState.DOM).forEach(([eid, props]) =>  Object.entries(props).forEach(([k, v]) => document.getElementById(eid)[k] = v));
    Object.entries(SearchState.DOM).forEach(([eid, props]) => {
        const el = document.getElementById(eid);
        if (!el) {
            throw new Error(`[storage.js] No se encontró el elemento con ID "${eid}" en el DOM (SearchState).`);
        }
        Object.entries(props).forEach(([k, v]) => el[k] = v);
    });

    Object.entries(DesignState.DOM).forEach(([eid, props]) => {
      // document.getElementByID(eid)[k] = v // mal cuando el valor es un dict , porque pisa todo el previo y no lo actualiza
        const el = document.getElementById(eid);
        if (!el) {
            throw new Error(`[storage.js] No se encontró el elemento con ID "${eid}" en el DOM (DesignState).`);
        }
        Object.entries(props).forEach(([prop, v]) => {
            if (typeof el[prop] === 'object') {
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

const _searchStateTarget = { ...defaultSearchState, ...fromStorage('SearchState') };

const SearchState = new Proxy(_searchStateTarget, {
    set(target, prop, value) {
        target[prop] = value;
        toStorage('SearchState', target);
        updateDOMFromState();
        return true;
    },
});

function setSearchState(data) {
    for (const key in _searchStateTarget) {
        delete _searchStateTarget[key];
    }
    Object.assign(_searchStateTarget, data);
    toStorage('SearchState', _searchStateTarget);
    updateDOMFromState();
}

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

const _designStateTarget = { ...defaultDesignState, ...fromStorage('DesignState') };

const DesignState = createDeepProxy(_designStateTarget, () => {
    toStorage('DesignState', _designStateTarget);
    updateDOMFromState();
});

function setDesignState(data) {
    for (const key in _designStateTarget) {
        delete _designStateTarget[key];
    }
    Object.assign(_designStateTarget, data);
    toStorage('DesignState', _designStateTarget);
    updateDOMFromState();
}
