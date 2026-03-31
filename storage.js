// const INIT_FLAG = Symbol('isInitialized');

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
      if (!document.getElementById("flyer")) {
        console.warn("DOM no listo para actualizar");
        return;
      }

      if (SearchState.search_title) {
        document.getElementById("movieSearch").value = SearchState.search_title;
      }

      if (SearchState.selectedMovie) {
        const movie = SearchState.selectedMovie;
        if (movie.release_date) {
          document.getElementById("year").textContent = new Date(
            movie.release_date,
          ).getFullYear();
        }
        const director = movie.director;
        document.getElementById("director").textContent = director
          ? director.name
          : "";
        if (movie.details?.runtime) {
          document.getElementById("duracion").textContent =
            `${movie.details.runtime} minutos`;
        }
      }

      const titleEl = document.getElementById("title");
      if (titleEl) {
        const titleValue = DesignState.titulo || defaultDesignState.titulo;
        titleEl.innerHTML = titleValue.replace(/\n/g, "<br />");
      }

      const orgEl = document.getElementById("org");
      if (orgEl) {
        orgEl.textContent = DesignState.orgText || defaultDesignState.orgText;
      }

      const cicloEl = document.getElementById("ciclo");
      if (cicloEl) {
        cicloEl.textContent = DesignState.ciclo || defaultDesignState.ciclo;
      }

      const flyerDateEl = document.getElementById("flyer-date");
      if (flyerDateEl) {
        const dateValue = DesignState.date || defaultDesignState.date;
        flyerDateEl.textContent = dateValue ? formatDateToSpanish(dateValue) : "";
      }

      const flyerHourEl = document.getElementById("flyer-hour");
      if (flyerHourEl) {
        const hourValue = DesignState.hour || defaultDesignState.hour;
        flyerHourEl.textContent = hourValue ? `${hourValue} HS` : "";
      }



      if (DesignState.fontSizes) {
        const { flyerDate, flyerHour, flyerTitle, flyerTitleMarginTop, rectWidth } =
          DesignState.fontSizes;
        if (flyerDate) {
          setInputValue("flyerDateFontSizeInput", flyerDate);
          const flyerDateDisplay = document.getElementById("flyer-date");
          if (flyerDateDisplay) flyerDateDisplay.style.fontSize = flyerDate + "px";
        }
        if (flyerHour) {
          setInputValue("flyerHourFontSizeInput", flyerHour);
          const flyerHourDisplay = document.getElementById("flyer-hour");
          if (flyerHourDisplay) flyerHourDisplay.style.fontSize = flyerHour + "px";
        }
        if (flyerTitle) {
          setInputValue("flyerTitleFontSizeInput", flyerTitle);
          if (titleEl) titleEl.style.fontSize = flyerTitle + "px";
        }
        if (flyerTitleMarginTop) {
          setInputValue("flyerTitleMarginTopInput", flyerTitleMarginTop);
          if (titleEl) titleEl.style.marginTop = flyerTitleMarginTop + "px";
        }
        if (rectWidth) {
          setInputValue("rectWidthInput", rectWidth);
          const bandaEl = document.getElementById("bandavertical");
          if (bandaEl) bandaEl.style.width = rectWidth + "px";
        }
      }

      if (DesignState.strokeColor) {
        setInputValue("strokeColorInput", DesignState.strokeColor);
      }

      if (DesignState.backgroundImage) {
        const flyerEl = document.getElementById("flyer");
        if (flyerEl)
          flyerEl.style.backgroundImage = `url('${DesignState.backgroundImage}')`;
      }

      if (typeof restoreElementColors === "function") {
        restoreElementColors();
      }
      if (typeof restoreBackdropDisplay === "function") {
        restoreBackdropDisplay();
      }
      if (typeof restorePosterDisplay === "function") {
        restorePosterDisplay();
      }

      console.log("DOM actualizado desde state");
    }

function setInputValue(id, value) {
    document.getElementById(id).value = value;
  }



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
