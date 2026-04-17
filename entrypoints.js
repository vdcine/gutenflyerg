document.getElementById('movieForm').addEventListener('submit', searchMovies);

const flyer = document.getElementById('flyer');

// PAINT PALETTE
// referencias a los elementos del modo edicion en el html
const paintPalette = document.getElementById('paintPaletteContainer');
const paintColorInput = document.getElementById('paintColorInput');

paintColorInput.addEventListener('input', (e) => {
    DesignState.currentPaintColor = e.target.value;
});

// Efecto hover (highlighter)
flyer.addEventListener('mouseover', (e) => {
    // if (isEditableElement(e.target)) {
    e.target.classList.add('paint-mode-highlight');
    // }
});

flyer.addEventListener('mouseout', (e) => {
    e.target.classList.remove('paint-mode-highlight');
});

flyer.addEventListener('click', paintEventHandler);

// MAIN
document.addEventListener('DOMContentLoaded', initializeControlValues);

// JSON EXPORT & IMPORT
document.getElementById("exportDataBtn").addEventListener("click",
    function (e) {
        try {
            exportUserData();
        } catch (error) {
            console.error("Error al exportar datos:", error);
            alert("Error al exportar los datos. Por favor intenta de nuevo.");
        }
    }
);

const fileInput = document.getElementById("importFileInput");
fileInput.addEventListener("change", handleFileImport);
document.getElementById("importDataBtn").addEventListener("click", () => fileInput.click());

// PANEL
document.getElementById('toggle-banda').addEventListener('click', (e) => {
    const banda_display = DesignState.DOM.bandavertical.style.display;
    if (banda_display == 'block') {
        // Si es block, está visible y la vamos a ocultar.
        this.textContent = 'Mostrar banda vertical';
        DesignState.DOM.bandavertical.style.display = 'none';
    } else {
        this.textContent = 'Ocultar banda vertical';
        DesignState.DOM.bandavertical.style.display = 'block';
    }
});

document.getElementById('strokeColorInput').addEventListener('input', (e) => {
    DesignState.DOM.strokeColorInput = { value: e.target.value };
});

document.getElementById('applyStrokeBtn').addEventListener('click', () => {
    const color = document.getElementById('strokeColorInput').value;
    const shadow = `-1px -1px 0 ${color}, 1px -1px 0 ${color}, -1px 1px 0 ${color}, 1px 1px 0 ${color}`;

    Array.from(document.getElementById('strokeTargetSelect').selectedOptions).forEach((option) => {
        const id = option.value;
        const existing = DesignState.DOM[id] || {};
        const existingStyle = existing.style || {};
        DesignState.DOM[id] = { ...existing, style: { ...existingStyle, textShadow: shadow } };
    });
});

document.getElementById('removeStrokeBtn').addEventListener('click', () => {
    Array.from(document.getElementById('strokeTargetSelect').selectedOptions).forEach((option) => {
        const id = option.value;
        const existing = DesignState.DOM[id] || {};
        const existingStyle = existing.style || {};
        DesignState.DOM[id] = { ...existing, style: { ...existingStyle, textShadow: '' } };
    });
});

// function updateEdadSugeridaDisplay() {
//     const mappedCertification = certificationMap[edadSugerida] || edadSugerida;
//     const el = document.getElementById('edadSugerida');

//     if (mappedCertification) {
//         document.getElementById('edadSugeridaInput').value = mappedCertification;
//         el.textContent = mappedCertification;
//         el.style.display = 'inline-block';
//         if (mappedCertification === 'ATP') {
//             el.style.backgroundColor = '#4CAF50';
//             el.style.color = 'white';
//         } else if (
//             mappedCertification === '+13' ||
//             mappedCertification === 'SAM 13'
//         ) {
//             el.style.backgroundColor = '#2196F3';
//             el.style.color = 'white';
//         } else if (
//             mappedCertification === '+16' ||
//             mappedCertification === 'SAM 16'
//         ) {
//             el.style.backgroundColor = '#FF9800';
//             el.style.color = 'white';
//         } else if (
//             mappedCertification === '+18' ||
//             mappedCertification === 'SAM 18'
//         ) {
//             el.style.backgroundColor = '#f44336';
//             el.style.color = 'white';
//         } else {
//             el.style.backgroundColor = '#777';
//             el.style.color = 'white';
//         }
//     } else {
//         el.style.display = 'none';
//     }
// }

document.getElementById('applyTxtBtn').addEventListener('click', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('titleInput');
    const cicloInput = document.getElementById('cicloInput');
    const dateInput = document.getElementById('dateInput');
    const hourInput = document.getElementById('hourInput');
    const orgInput = document.getElementById('orgInput');

    DesignState.DOM = {
        ...DesignState.DOM,
        title: { ...(DesignState.DOM.title || {}), textContent: titleInput.value.replace(/\n/g, "<br />") },
        flyerCiclo: { ...(DesignState.DOM.flyerCiclo || {}), textContent: cicloInput.value },
        flyerDate: { ...(DesignState.DOM.flyerDate || {}), textContent: formatDateToSpanish(dateInput.value) },
        flyerHour: { ...(DesignState.DOM.flyerHour || {}), textContent: hourInput.value },
        flyerOrg: { ...(DesignState.DOM.flyerOrg || {}), textContent: orgInput.value },
        titleInput: { value: titleInput.value },
        cicloInput: { value: cicloInput.value },
        dateInput: { value: dateInput.value },
        hourInput: { value: hourInput.value },
        orgInput: { value: orgInput.value }
    };
});

document.getElementById("flyerDateFontSizeInput").addEventListener("input", (e) => {
    DesignState.DOM.flyerDateFontSizeInput = { value: e.target.value };
    DesignState.fontSizes.flyerDate = e.target.value;
    DesignState.DOM.flyerDate = { ...(DesignState.DOM.flyerDate || {}), style: { ...(DesignState.DOM.flyerDate?.style || {}), fontSize: e.target.value + "px" } };
});

document.getElementById('flyerHourFontSizeInput').addEventListener('input', (e) => {
    DesignState.DOM.flyerHourFontSizeInput = {value: e.target.value}
    DesignState.fontSizes.flyerHour = e.target.value;
    DesignState.DOM.flyerHour = { ...(DesignState.DOM.flyerHour || {}), style: { ...(DesignState.DOM.flyerHour?.style || {}), fontSize: e.target.value + "px" } }
});

document.getElementById('flyerTitleFontSizeInput').addEventListener('input', (e) => {
    DesignState.DOM.flyerTitleFontSizeInput = {value: e.target.value}
    DesignState.fontSizes.flyerTitle = e.target.value;
    DesignState.DOM.title = {
        textContent: DesignState.DOM.title?.textContent || '',
        style: { ...(DesignState.DOM.title?.style || {}), fontSize: e.target.value + "px" }
    }
});

document.getElementById('flyerTitleMarginTopInput').addEventListener('input', (e) => {
    DesignState.DOM.flyerTitleMarginTopInput = {value: e.target.value}
    DesignState.fontSizes.flyerTitleMarginTop = e.target.value;
    DesignState.DOM.title = {
        textContent: DesignState.DOM.title?.textContent || '',
        style: { ...(DesignState.DOM.title?.style || {}), marginTop: e.target.value + "px" }
    }
});

document.getElementById('rectWidthInput').addEventListener('input', (e) => {
    DesignState.DOM.rectWidthInput = {value: e.target.value}
    DesignState.fontSizes.rectWidth = e.target.value;
    DesignState.DOM.bandavertical = { ...(DesignState.DOM.bandavertical || {}), style: { ...(DesignState.DOM.bandavertical?.style || {}), width: e.target.value + "px" } }
});

document.getElementById('saveFlyer').addEventListener('click', () => {
    const flyerElement = document.getElementById('flyer');
    const blurBgElement = document.getElementById('flyer-blur-bg-story');
    const titleText = document.getElementById('title').textContent;
    handleFlyerDownload(flyerElement, blurBgElement, titleText);
});

// BACKDROP CAROUSEL
document.getElementById('backdrop-next').addEventListener('click',
  (e) => {
    shiftBackdrop(1);
  }
);

document.getElementById('backdrop-prev').addEventListener('click',
    (e) => {
      shiftBackdrop(-1);
    }
);

document.getElementById('poster-prev').addEventListener('click', (e) => {
    shiftPoster(-1);
});

document.getElementById('poster-next').addEventListener('click', (e) => {
    shiftPoster(1);
});

document.getElementById('remove-backdrop-bg').addEventListener('click', () => {
    DesignState.DOM.bandavertical = {
        ...(DesignState.DOM.bandavertical || {}),
        style: { ...(DesignState.DOM.bandavertical?.style || {}), display: 'block' }
    };

    DesignState.backgroundImage = '';
    DesignState.DOM['flyer'] = {
        style: { backgroundImage: '' }
    };
    delete DesignState.DOM['flyer-blur-bg-story'];

    const blurBgStory = document.getElementById('flyer-blur-bg-story');

    if (blurBgStory) {
        blurBgStory.remove();
    }
});

document
    .getElementById('load-backdrop-direct')
    .addEventListener('click', () => {
        const input = document
            .getElementById('backdrop-direct-input')
            .value.trim();

        if (!input) return alert('Por favor, ingresa una URL del backdrop');
        if (!input.startsWith('http'))
            return alert('Por favor, ingresa una URL completa.');

        applyBackdropDirect(input);

        document.getElementById('backdrop-direct-input').value = '';
    });

document.getElementById('backdrops').addEventListener('click', (e) => {
    e.preventDefault();
    if (!SearchState.selectedMovie.id) return;
    window.open(
        `https://www.themoviedb.org/movie/${SearchState.selectedMovie.id}/images/backdrops`,
        '_blank'
    );
});

// POSTERS
document.getElementById('load-poster-direct').addEventListener('click', () => {
    const input = document.getElementById('poster-direct-input').value.trim();

    if (!input) return alert('Por favor, ingresa una URL del poster');
    if (!input.startsWith('http'))
        return alert('Por favor, ingresa una URL completa.');

    applyPosterDirect(input);

    document.getElementById('poster-direct-input').value = '';
});

document.getElementById('poster-carousel-img').addEventListener('click', () => {
    let posters = SearchState.posters;
    let currentPoster = SearchState.currentPoster;
    if (posters.length > 0) {
        const currentPosterData = posters[currentPoster];
        const filePath = currentPosterData.file_path;
        const fullUrl = filePath.startsWith('http')
            ? filePath
            : `https://image.tmdb.org/t/p/original${filePath}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            alert('URL copiada al portapapeles');
        });
    }
});

document
    .getElementById('backdrop-carousel-img')
    .addEventListener('click', () => {
        if (SearchState.backdrops.length > 0) {
            const currentBackdropData =
                SearchState.backdrops[SearchState.currentBackdrop];
            const filePath = currentBackdropData.file_path;
            const fullUrl = filePath.startsWith('http')
                ? filePath
                : `https://image.tmdb.org/t/p/original${filePath}`;
            navigator.clipboard.writeText(fullUrl).then(() => {
                alert('URL copiada al portapapeles');
            });
        }
    });

document.getElementById('posters').addEventListener('click', (e) => {
    e.preventDefault();
    if (!SearchState.selectedMovie.id) return;
    window.open(
        `https://www.themoviedb.org/movie/${SearchState.selectedMovie.id}/images/posters`,
        '_blank'
    );
});

document.getElementById('deleteLocalS').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas borrar todos los datos guardados y cargados del Flyer?')) {
        Object.keys(defaultDesignState).forEach(key => {
            DesignState[key] = defaultDesignState[key];
        });
        Object.keys(defaultSearchState).forEach(key => {
            SearchState[key] = defaultSearchState[key];
        });
        clearAllStorage();
    }
});
