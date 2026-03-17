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
document.getElementById("exportDataBtn").addEventListener("click", exportUserData);

const fileInput = document.getElementById("importFileInput");
fileInput.addEventListener("change", handleFileImport);
document.getElementById("importDataBtn").addEventListener("click", fileInput.click);

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
    const select = document.getElementById('strokeTargetSelect');
    const color = document.getElementById('strokeColorInput').value;
    DesignState.strokeColor = color;
    Array.from(select.selectedOptions).forEach((option) => {
        const target = document.getElementById(option.value);
        if (target) {
            target.style.textShadow = `
                -1px -1px 0 ${color},
                1px -1px 0 ${color},
                -1px 1px 0 ${color},
                1px 1px 0 ${color}
            `;
        }
    });
});

document.getElementById('removeStrokeBtn').addEventListener('click', () => {
    const select = document.getElementById('strokeTargetSelect');
    Array.from(select.selectedOptions).forEach((option) => {
        const target = document.getElementById(option.value);
        if (target) {
            target.style.textShadow = '';
        }
    });
});

document.getElementById('applyTxtBtn').addEventListener('click', () => {
    const ciclo = document.getElementById('cicloInput').value.trim();
    const dateRaw = document.getElementById('dateInput').value.trim();
    const hourRaw = document.getElementById('hourInput').value.trim();
    DesignState.ciclo = ciclo;
    DesignState.date = dateRaw;
    DesignState.hour = hourRaw;
    DesignState.titulo = document.getElementById('titleInput').value.trim();

    document.getElementById('dateInput').value = dateRaw;
    document.getElementById('hourInput').value = hourRaw;

    const edadSugerida = document
        .getElementById('edadSugeridaInput')
        .value.trim();
    DesignState.edadSugerida = edadSugerida;

    document.getElementById('title').innerHTML = (
        DesignState.titulo || 'Título de la película'
    ).replace(/\n/g, '<br />');
    document.getElementById('titleInput').value = DesignState.titulo;
    document.getElementById('ciclo').textContent = ciclo || 'Nombre del ciclo';

    const mappedCertification = certificationMap[edadSugerida] || edadSugerida;
    const el = document.getElementById('edad-sugerida');

    if (mappedCertification) {
        document.getElementById('edadSugeridaInput').value =
            mappedCertification;
        el.textContent = mappedCertification;
        el.style.display = 'inline-block';
        if (mappedCertification === 'ATP') {
            el.style.backgroundColor = '#4CAF50'; // Verde para ATP
            el.style.color = 'white';
        } else if (
            mappedCertification === '+13' ||
            mappedCertification === 'SAM 13'
        ) {
            el.style.backgroundColor = '#2196F3'; // Azul para +13
            el.style.color = 'white';
        } else if (
            mappedCertification === '+16' ||
            mappedCertification === 'SAM 16'
        ) {
            el.style.backgroundColor = '#FF9800'; // Naranja para +16
            el.style.color = 'white';
        } else if (
            mappedCertification === '+18' ||
            mappedCertification === 'SAM 18'
        ) {
            el.style.backgroundColor = '#f44336'; // Rojo para +18
            el.style.color = 'white';
        } else {
            el.style.backgroundColor = '#777'; // Gris para otros
            el.style.color = 'white';
        }
    } else {
        el.style.display = 'none';
    }

    const formattedDate = dateRaw ? formatDateToSpanish(dateRaw) : '';
    document.getElementById('flyer-date').innerHTML = formattedDate;
    document.getElementById('flyer-date').textContent = formattedDate || '';

    document.getElementById('flyer-hour').textContent = hourRaw
        ? `${hourRaw} HS`
        : '';

    const orgInput = document.getElementById('orgInput');
    const orgValue = orgInput?.value.trim() || '';
    DesignState.orgText = orgValue;
    const orgEl = document.getElementById('org');
    const defaultOrg = 'Organiza Matías Corona con apoyo de la Comisión Directiva de la Biblioteca Menéndez.';
    if (orgEl) orgEl.textContent = orgValue || defaultOrg;
});

document
    .getElementById('flyerDateFontSizeInput')
    .addEventListener('input', (e) => {
        document.getElementById('flyer-date').style.fontSize =
            e.target.value + 'px';
        DesignState.fontSizes.flyerDate = e.target.value;
    });

document
    .getElementById('flyerHourFontSizeInput')
    .addEventListener('input', (e) => {
        document.getElementById('flyer-hour').style.fontSize =
            e.target.value + 'px';
        DesignState.fontSizes.flyerHour = e.target.value;
    });

document
    .getElementById('flyerTitleFontSizeInput')
    .addEventListener('input', (e) => {
        document.getElementById('title').style.fontSize = e.target.value + 'px';
        DesignState.fontSizes.flyerTitle = e.target.value;
    });

document
    .getElementById('flyerTitleMarginTopInput')
    .addEventListener('input', (e) => {
        document.getElementById('title').style.marginTop = e.target.value + 'px';
        DesignState.fontSizes.flyerTitleMarginTop = e.target.value;
    });

document.getElementById('rectWidthInput').addEventListener('input', (e) => {
    document.getElementById('bandavertical').style.width =
        e.target.value + 'px';
    DesignState.fontSizes.rectWidth = e.target.value;
});

document.getElementById('saveFlyer').addEventListener('click', () => {
    const flyerElement = document.getElementById('flyer');
    const blurBgElement = document.getElementById('flyer-blur-bg-story');
    const titleText = document.getElementById('title').textContent;
    handleFlyerDownload(flyerElement, blurBgElement, titleText);
});

// BACKDROP CAROUSEL
document.getElementById('backdrop-next').addEventListener('click', (e) => {
    shiftBackdrop(1);
});

document.getElementById('backdrop-prev').addEventListener('click', (e) => {
    shiftBackdrop(-1);
});

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
