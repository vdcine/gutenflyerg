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

      document.getElementById("title").innerHTML = (
        DesignState.titulo || "Título de la Peli"
      ).replace(/\n/g, "<br />");
      setInputValue("titleInput", DesignState.titulo || "");
      setInputValue("edadSugeridaInput", DesignState.edadSugerida || "");
      setInputValue("orgInput", DesignState.orgText || "");
      setInputValue("cicloInput", DesignState.ciclo || "");
      setInputValue("dateInput", DesignState.date || "");
      setInputValue("hourInput", DesignState.hour || "");

      const orgEl = document.getElementById("org");
      if (orgEl) orgEl.textContent = DesignState.orgText || "";

      const cicloEl = document.getElementById("ciclo");
      if (cicloEl) cicloEl.textContent = DesignState.ciclo || "";

      const flyerDateEl = document.getElementById("flyer-date");
      if (flyerDateEl)
        flyerDateEl.textContent = DesignState.date
          ? formatDateToSpanish(DesignState.date)
          : "";

      const flyerHourEl = document.getElementById("flyer-hour");
      if (flyerHourEl)
        //fix: si esto falla quiero saber
        flyerHourEl.textContent = DesignState.hour ? `${DesignState.hour} HS` : "";

      if (DesignState.fontSizes) {
        const { flyerDate, flyerHour, flyerTitle, flyerTitleMarginTop, rectWidth } =
          DesignState.fontSizes;
        if (flyerDate) {
          setInputValue("flyerDateFontSizeInput", flyerDate);
          const flyerDateEl = document.getElementById("flyer-date");
          if (flyerDateEl) flyerDateEl.style.fontSize = flyerDate + "px";
        }
        if (flyerHour) {
          setInputValue("flyerHourFontSizeInput", flyerHour);
          const flyerHourEl = document.getElementById("flyer-hour");
          if (flyerHourEl) flyerHourEl.style.fontSize = flyerHour + "px";
        }
        if (flyerTitle) {
          setInputValue("flyerTitleFontSizeInput", flyerTitle);
          const titleEl = document.getElementById("title");
          if (titleEl) titleEl.style.fontSize = flyerTitle + "px";
        }
        if (flyerTitleMarginTop) {
          setInputValue("flyerTitleMarginTopInput", flyerTitleMarginTop);
          const titleEl = document.getElementById("title");
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

      if (typeof restoreElementColors === 'function') {
        restoreElementColors();
      }
      if (typeof restoreBackdropDisplay === 'function') {
        restoreBackdropDisplay();
      }
      if (typeof restorePosterDisplay === 'function') {
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
