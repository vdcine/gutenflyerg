// DESCARGA DE IMAGEN
const flyerDate = document.getElementById('flyer-date');
const flyerHour = document.getElementById('flyer-hour');

const dateInput = document.getElementById('dateInput');
const hourInput = document.getElementById('hourInput');

async function applyBlurToImage(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.filter = 'blur(4px) brightness(0.9)';
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL());
        };
        img.src = imageUrl;
    });
}

async function captureAndDownloadFlyer(flyerElement, titleText) {
    const canvas = await html2canvas(flyerElement, {
        width: 1080,
        height: 1440,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
            const clonedFlyer = clonedDoc.getElementById('flyer');
            const mainGroup = clonedFlyer?.querySelector('.flyer-main-group');
            if (mainGroup) {
                mainGroup.style.transform = 'translateZ(0)';
            }
        },
    });

    const link = document.createElement('a');

    const cleanTitle = titleText
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w\-]/g, '');
    const date = new Date().toISOString().slice(0, 10);

    link.download = `${date}_${cleanTitle}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function handleFlyerDownload(flyerElement, blurBgElement, titleText) {
    if (blurBgElement && blurBgElement.style.backgroundImage) {
        const bgImageMatch = blurBgElement.style.backgroundImage.match(
            /url\(['"]?([^'"]+)['"]?\)/
        );

        if (bgImageMatch) {
            const imageUrl = bgImageMatch[1];
            try {
                const blurredDataUrl = await applyBlurToImage(imageUrl);
                const originalFilter = blurBgElement.style.filter;
                const originalBgImage = blurBgElement.style.backgroundImage;

                blurBgElement.style.filter = 'none';
                blurBgElement.style.backgroundImage = `url('${blurredDataUrl}')`;

                await new Promise((resolve) => setTimeout(resolve, 100));

                await captureAndDownloadFlyer(flyerElement, titleText);

                blurBgElement.style.filter = originalFilter;
                blurBgElement.style.backgroundImage = originalBgImage;
                return;
            } catch (blurError) {
                console.warn(
                    'Error al aplicar blur, ignorando efecto:',
                    blurError
                );
            }
        }
    }
    await captureAndDownloadFlyer(flyerElement, titleText);
}

function applyBackdropDirect(url) {
    if (!url || !url.startsWith('http')) return;

    let filePath = '';
    if (url.includes('image.tmdb.org/t/p/original')) {
        filePath = url.replace('https://image.tmdb.org/t/p/original', '');
    } else {
        filePath = url;
    }

    const newBackdrop = {
        file_path: filePath,
        aspect_ratio: 1.778,
    };

    backdrops.unshift(newBackdrop);
    currentBackdrop = 0;
    shiftBackdrop(currentBackdrop);

    const fullUrl = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/original${filePath}`;
    bandavertical.style.display = 'none';
    setBackdropAsBackground(fullUrl);
}

function applyPosterDirect(url) {
    if (!url || !url.startsWith('http')) return;

    let filePath = '';
    if (url.includes('image.tmdb.org/t/p/original')) {
        filePath = url.replace('https://image.tmdb.org/t/p/original', '');
    } else {
        filePath = url;
    }

    const newPoster = {
        file_path: filePath,
        aspect_ratio: 0.667,
    };

    posters.unshift(newPoster);
    currentPoster = 0;
    shiftPoster(currentPoster);

    const fullUrl = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/original${filePath}`;
    setPoster(fullUrl);
}

function formatDateToSpanish(dateStr) {
    if (!dateStr) return '';
    const dias = [
        'DOMINGO',
        'LUNES',
        'MARTES',
        'MIÉRCOLES',
        'JUEVES',
        'VIERNES',
        'SÁBADO',
    ];
    const meses = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE',
    ];

    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    if (isNaN(d)) return dateStr;
    return `${dias[d.getDay()]} ${d.getDate()} DE ${meses[d.getMonth()]}`;
}

// BOOTSTRAPPER
// Función auxiliar para obtener el fontsize
async function initializeControlValues() {
    restoreElementColors();
    await populateSearchResults();
    shiftPoster(0);
    shiftBackdrop(0);

    document.getElementById('movieSearch').value = SearchState.search_title || '';

    // carga los valores del state en los inputs
    document.getElementById('titleInput').value = DesignState.titulo;
    document.getElementById('cicloInput').value = DesignState.ciclo;
    document.getElementById('dateInput').value = DesignState.date;
    document.getElementById('hourInput').value = DesignState.hour;
    document.getElementById('orgInput').value = DesignState.orgText;
    document.getElementById('edadSugeridaInput').value = DesignState.edadSugerida;

    if (SearchState.selectedMovie) {
        const movie = SearchState.selectedMovie;
        if (movie.release_date) {
            document.getElementById('year').textContent = new Date(
                movie.release_date
            ).getFullYear();
        }
        const director = movie.director;
        document.getElementById('director').textContent = director
            ? director.name
            : '';
        if (movie.details && movie.details.runtime) {
            document.getElementById('duracion').textContent =
                `${movie.details.runtime} minutos`;
        }
    }

    if (DesignState.fontSizes) {
        const { flyerDate, flyerHour, flyerTitle, flyerTitleMarginTop, rectWidth } = DesignState.fontSizes;
        if (flyerDate) {
            const el = document.getElementById('flyerDateFontSizeInput');
            if (el) { el.value = flyerDate; el.dispatchEvent(new Event('input')); }
        }
        if (flyerHour) {
            const el = document.getElementById('flyerHourFontSizeInput');
            if (el) { el.value = flyerHour; el.dispatchEvent(new Event('input')); }
        }
        if (flyerTitle) {
            const el = document.getElementById('flyerTitleFontSizeInput');
            if (el) { el.value = flyerTitle; el.dispatchEvent(new Event('input')); }
        }
        if (flyerTitleMarginTop) {
            const el = document.getElementById('flyerTitleMarginTopInput');
            if (el) { el.value = flyerTitleMarginTop; el.dispatchEvent(new Event('input')); }
        }
        if (rectWidth) {
            const el = document.getElementById('rectWidthInput');
            if (el) { el.value = rectWidth; el.dispatchEvent(new Event('input')); }
        }
    }

    if (DesignState.strokeColor) {
        const el = document.getElementById('strokeColorInput');
        if (el) el.value = DesignState.strokeColor;
    }

    if (DesignState.backgroundImage) {
        const flyerEl = document.getElementById('flyer');
        if (flyerEl) flyerEl.style.backgroundImage = `url('${DesignState.backgroundImage}')`;
    }

    if (typeof updateEdadSugeridaDisplay === 'function') {
        updateEdadSugeridaDisplay(DesignState.edadSugerida);
    }

    console.log('Valores de controles inicializados desde estados');
}
