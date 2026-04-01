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
DesignState.bandaHidden = DesignState.bandaHidden || false;

document.getElementById('toggle-banda').addEventListener('click', (e) => {
    DesignState.bandaHidden = !DesignState.bandaHidden;
    bandavertical.style.display = DesignState.bandaHidden ? 'none' : 'block';
    this.textContent = DesignState.bandaHidden
        ? 'Mostrar banda vertical'
        : 'Ocultar banda vertical';
});

document.getElementById('strokeColorInput').addEventListener('input', (e) => {
    DesignState.strokeColor = e.target.value;
});

document.getElementById('applyStrokeBtn').addEventListener('click', () => {
    DesignState.DOM.strokeColorInput = { value: document.getElementById('strokeColorInput').value }

    const select = document.getElementById('strokeTargetSelect');

    const currentTargets = new Set(DesignState.strokeTargets || []);

    Array.from(select.selectedOptions).forEach((option) => {
        const target = document.getElementById(option.value);
        if (target) {
            target.style.textShadow = `
                -1px -1px 0 ${color},
                1px -1px 0 ${color},
                -1px 1px 0 ${color},
                1px 1px 0 ${color}
            `;
            currentTargets.add(option.value);
        }
    });
    DesignState.strokeTargets = Array.from(currentTargets);
});

document.getElementById('removeStrokeBtn').addEventListener('click', () => {
    const select = document.getElementById('strokeTargetSelect');
    const currentTargets = new Set(DesignState.strokeTargets || []);

    Array.from(select.selectedOptions).forEach((option) => {
        const target = document.getElementById(option.value);
        if (target) {
            target.style.textShadow = '';
            currentTargets.delete(option.value);
        }
    });
    DesignState.strokeTargets = Array.from(currentTargets);
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

document.getElementById('applyTxtBtn').addEventListener('click', () => {
    // Elementos del flyer
    DesignState.DOM.flyerTitle = { textContent: document.getElementById('titleInput').value.replace(/\n/g, "<br />") };
    DesignState.DOM.flyerCiclo = { textContent: document.getElementById('cicloInput').value };
    DesignState.DOM.flyerDate = { textContent: formatDateToSpanish(document.getElementById('dateInput').value) };
    DesignState.DOM.flyerHour = { textContent: document.getElementById('hourInput').value };
    DesignState.DOM.flyerOrg = { textContent: document.getElementById('orgInput').value };

    // Elementos del panel
    DesignState.DOM.titleInput = { value: document.getElementById('titleInput').value };
    DesignState.DOM.cicloInput = { value: document.getElementById('cicloInput').value };
    DesignState.DOM.dateInput = { value: document.getElementById('dateInput').value };
    DesignState.DOM.hourInput = { value: document.getElementById('hourInput').value };
    DesignState.DOM.orgInput = { value: document.getElementById('orgInput').value };
});

document.getElementById("flyerDateFontSizeInput").addEventListener("input", (e) => {
    DesignState.DOM.flyerDateFontSizeInput = { value: e.target.value };
    DesignState.DOM.flyerDate.style = { fontSize: e.target.value + "px" };
});

document.getElementById('flyerHourFontSizeInput').addEventListener('input', (e) => {
    DesignState.DOM.flyerHourFontSizeInput = {value: e.target.value}
    DesignState.DOM.flyerHour.style = { fontSize: e.target.value + "px" }
});

document.getElementById('flyerTitleFontSizeInput').addEventListener('input', (e) => {
    DesignState.DOM.flyerTitleFontSizeInput = {value: e.target.value}
    DesignState.DOM.flyerTitle.style = { fontSize: e.target.value + "px" }
});

document.getElementById('flyerTitleMarginTopInput').addEventListener('input', (e) => {
    DesignState.DOM.flyerTitleMarginTopInput = {value: e.target.value}
    DesignState.DOM.flyerTitle.style = { marginTop: e.target.value + "px" }
});

document.getElementById('rectWidthInput').addEventListener('input', (e) => {
    DesignState.DOM.rectWidthInput = {value: e.target.value}
    DesignState.DOM.bandavertical.style = { width: e.target.value + "px" }
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
    const k = SearchState.backdrops.length;
    SearchState.currentBackdrop = (SearchState.currentBackdrop + 1) % k;
  }
);

document.getElementById('backdrop-prev').addEventListener('click',
    (e) => {
      const k = SearchState.backdrops.length;
      SearchState.currentBackdrop = (SearchState.currentBackdrop - 1) % k;
    }
);

document.getElementById('poster-prev').addEventListener('click', (e) => {
    shiftPoster(-1);
});

document.getElementById('poster-next').addEventListener('click', (e) => {
    shiftPoster(1);
});

document.getElementById('remove-backdrop-bg').addEventListener('click', () => {
    const flyerStory = document.getElementById('flyer');

    bandavertical.style.display = 'block';

    flyerStory.style.backgroundImage = '';
    DesignState.backgroundImage = '';

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
        document.getElementById('cicloInput').value = 'Nombre del ciclo';
        document.getElementById('dateInput').value = '2026-03-11';
        document.getElementById('hourInput').value = '19:00';
        document.getElementById('titleInput').value = 'Titulo de la Peli';
        document.getElementById('edadSugeridaInput').value = '';
        document.getElementById('orgInput').value = 'Organiza Matías Corona con apoyo de la Comisión Directiva de la Biblioteca Menéndez.';
        document.getElementById('ciclo').textContent = '';
        document.getElementById('flyer-date').textContent = '';
        document.getElementById('flyer-hour').textContent = '';
        document.getElementById('title').textContent = '';
        clearAllStorage();
    }
});
