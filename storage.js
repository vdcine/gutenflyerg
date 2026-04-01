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
    bandaHidden: false,
    elementColors: {},
    strokeTargets: [],
    fontSizes: {
        flyerDate: '34',
        flyerHour: '40',
        flyerTitle: '42',
        flyerTitleMarginTop: '24',
        rectWidth: '460',
    },
    backgroundImage: '',
};

function updateDOMFromState() {
    console.log('[State] Actualizando DOM desde state...');
    if (!document.getElementById("flyer")) {
        console.warn("DOM no listo para actualizar");
        return;
    }

    Object.entries(SearchState.DOM).forEach(([eid, props]) =>  Object.entries(props).forEach(([k, v]) => document.getElementById(eid)[k] = v));
    Object.entries(DesignState.DOM).forEach(([eid, props]) =>  Object.entries(props).forEach(([k, v]) => document.getElementById(eid)[k] = v));
    // idealmente la función debería terminar acá

    if (DesignState.strokeColor) {
        setInputValue("strokeColorInput", DesignState.strokeColor);
    }

    if (DesignState.strokeTargets && DesignState.strokeTargets.length > 0) {
        const color = DesignState.strokeColor || '#000000';
        DesignState.strokeTargets.forEach(targetId => {
            const target = document.getElementById(targetId);
            if (target) {
                target.style.textShadow = `
                    -1px -1px 0 ${color},
                    1px -1px 0 ${color},
                    -1px 1px 0 ${color},
                    1px 1px 0 ${color}
                    `;
            }
        });
    }

    if (DesignState.backgroundImage) {
        const flyerEl = document.getElementById("flyer");
        if (flyerEl)
            flyerEl.style.backgroundImage = `url('${DesignState.backgroundImage}')`;
    }

    restoreElementColors();
    restoreBackdropDisplay();
    restorePosterDisplay();

    console.log("DOM actualizado desde state");
}


  // CARROUSEL
  SearchState.backdrops = SearchState.backdrops || [];
  SearchState.posters = SearchState.posters || [];
  SearchState.currentBackdrop = SearchState.currentBackdrop || 0;
  SearchState.currentPoster = SearchState.currentPoster || 0;

//const initialSearchData = fromStorage('SearchState') || {};
//initialSearchData[INIT_FLAG] = false;

const SearchState = new Proxy(
    fromStorage('SearchState') || {},
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
