// VARIABLES GLOBALES Y HELPERS
const API_KEY = 'c733c18f5b61209aa7ea217bd007b156';
const BASE_URL = 'https://api.themoviedb.org/3';

const bandavertical = document.getElementById('bandavertical');

function getSimpleCorsProxiedUrl(imageUrl) {
    return `https://corsproxy.io/?${imageUrl}`;
}

function getCountryFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';

    const code = countryCode.toUpperCase();

    return String.fromCodePoint(
        ...[...code].map((c) => 127397 + c.charCodeAt())
    );
}

const countryNamesES = {
    AR: 'Argentina',
    US: 'Estados Unidos',
    FR: 'Francia',
    IT: 'Italia',
    ES: 'España',
    GB: 'Reino Unido',
    DE: 'Alemania',
    JP: 'Japón',
    CN: 'China',
    BR: 'Brasil',
    MX: 'México',
    CA: 'Canadá',
    RU: 'Rusia',
    IN: 'India',
    KR: 'Corea del Sur',
};

// Mapeo de certificaciones para normalizar los valores de arg https://calificaciones.incaa.gob.ar/
const certificationMap = {
    AA: 'ATP',
    A: 'ATP',
    ATP: 'ATP',
    Atp: 'ATP',
    12: '+13',
    13: '+13',
    14: '+13',
    15: '+16',
    16: '+16',
    18: '+18',
    SAM13: 'SAM 13',
    SAM16: 'SAM 16',
    SAM18: 'SAM 18',
    'MA15+': '+16',
    M: '+13',
    G: 'ATP',
    PG: '+13',
    'PG-13': '+13',
    R: '+16',
    'NC-17': '+18',
    NR: '',
};

// BUSCADOR
async function searchMovies(e) {
    e.preventDefault();

    GlobalState.search_title = document.getElementById('movieSearch').value;
    GlobalState.search_language =
        document.getElementById('movieLanguage').value || 'en';
    const searchRes = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${GlobalState.search_title}&language=${GlobalState.search_language}`
    );

    const searchData = await searchRes.json();
    if (searchData.results.length === 0)
        return alert('No se encontró la película.');

    GlobalState.orderedResults = (
        await Promise.all(
            searchData.results.map( async (m) => ({...m, ...await fetchMovieDetails(m)}))
        )
    ).sort((a, b) => b.popularity - a.popularity);
    await populateSearchResults();
}

async function fetchMovieDetails(movie) {
    const credits = await (
        await fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`)
    ).json();
    const director = credits.crew.find((c) => c.job === 'Director');
    const details = await (
        await fetch(
            `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=${GlobalState.search_language}`
        )
    ).json();
    // const movieDetailsSinopsis = await (await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=es-ES`)).json();
    return { director: director, details: details };
}

async function populateSearchResults() {
    if (!GlobalState.orderedResults) return;

    const resultsDiv = document.getElementById('movie-results');
    resultsDiv.innerHTML = '';

    // FIXME: no usar idx : iterar directo
    for (let idx = 0; idx < Math.min(10, GlobalState.orderedResults.length); idx++) {
        const movie = GlobalState.orderedResults[idx];

        const result = document.createElement('div');
        result.style.cursor = 'pointer';
        result.style.padding = '8px';
        result.style.borderBottom = '1px solid #ccc';
        result.style.display = 'flex';
        result.style.alignItems = 'center';
        result.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${
        movie.poster_path
    }" style="width:48px;height:auto;margin-right:12px;" />
    <span style="font-weight:bold;">${movie.title}</span>
    <span style="margin-left:12px;">(${new Date(
        movie.release_date
    ).getFullYear()})</span>
    <span style="margin-left:12px;">${
        movie.director ? movie.director.name : 'Director no disponible'
    }</span>`;
        result.addEventListener('click', async () => {
            console.log(movie.title);
            GlobalState.selectedMovie = movie;

            const releaseDatesRes = await fetch(
                `${BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`
            );
            const releaseDatesData = await releaseDatesRes.json();
            // console.log(releaseDatesData);

            let certification = '';
            const countriesOrder = ['AR']; // Se pueden agregar otros codigos de paises

            for (const country of countriesOrder) {
                const countryData = releaseDatesData.results.find(
                    (r) => r.iso_3166_1 === country
                );
                if (countryData && countryData.release_dates.length > 0) {
                    const certData = countryData.release_dates.find(
                        (rd) => rd.certification !== ''
                    );
                    if (certData && certData.certification) {
                        certification = certData.certification;
                        break;
                    }
                }
            }

            if (!certification) {
                for (const result of releaseDatesData.results) {
                    const certData = result.release_dates.find(
                        (rd) => rd.certification !== ''
                    );
                    if (certData && certData.certification) {
                        certification = certData.certification;
                        break;
                    }
                }
            }

            const mappedCertification =
                certificationMap[certification] || certification;

            document.getElementById('title').textContent = movie.title;
            document.getElementById('titleInput').value = movie.title;
            GlobalState.titulo = movie.title;
            GlobalState.edadSugerida = mappedCertification || '';

            if (mappedCertification) {
                document.getElementById('edadSugeridaInput').value =
                    mappedCertification;

                const edadElements = [document.getElementById('edad-sugerida')];

                edadElements.forEach((el) => {
                    if (el) {
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
                    }
                });
            }
            document.getElementById('year').textContent = new Date(
                movie.release_date
            ).getFullYear();
            const posterUrl = getSimpleCorsProxiedUrl(
                `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            );
            document.getElementById('poster').src = posterUrl;
            document.getElementById('director').textContent = movie.director
                ? movie.director.name
                : 'Director no disponible';

            console.log(movie.details);
            document.getElementById('duracion').textContent =
                `${movie.details.runtime} minutos`;

            const backdropUrl = getSimpleCorsProxiedUrl(
                `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            );
            updateBackdrop(backdropUrl);

            const countryCode = movie.details.origin_country[0];
            const flag = getCountryFlagEmoji(countryCode);
            const countryName = countryNamesES[countryCode] || countryCode;

            const imagesRes = await fetch(
                `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}`
            );
            const imagesData = await imagesRes.json();

            GlobalState.backdrops = imagesData.backdrops || [];
            GlobalState.currentBackdrop = 0;
            shiftBackdrop(0);

            GlobalState.posters = imagesData.posters || [];
            GlobalState.currentPoster = 0;
            shiftPoster(0);

            Array.from(resultsDiv.children).forEach(
                (child) => (child.style.background = '')
            );
            result.style.background = '#386119ff';
        });

        resultsDiv.appendChild(result);
    }
}

// CARROUSEL
GlobalState.backdrops = GlobalState.backdrops || [];
GlobalState.posters = GlobalState.posters || [];
GlobalState.currentBackdrop = GlobalState.currentBackdrop || 0;
GlobalState.currentPoster = GlobalState.currentPoster || 0;

//TODO: quedan getelementbyid que ensucian la logica, hay que ver como sacarlos a entrypoints.js.

function shiftBackdrop(delta) {
    let backdrops_len = GlobalState.backdrops.length;
    if (!backdrops_len) return;

    GlobalState.currentBackdrop = (GlobalState.currentBackdrop + delta + backdrops_len) % backdrops_len;
    let index = GlobalState.currentBackdrop;

    const filePath = GlobalState.backdrops[index].file_path;

    const url = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/w1280${filePath}`;

    document.getElementById('backdrop-carousel-img').src = url;
    document.getElementById('backdrop-counter').textContent =
        `Backdrop ${index + 1} de ${backdrops_len}`;

    const proxiedUrl = getSimpleCorsProxiedUrl(url);
    updateBackdrop(proxiedUrl);
}

function shiftPoster(delta) {
    let posters_len = GlobalState.posters.length;
    if (!posters_len) return;

    GlobalState.currentPoster = (GlobalState.currentPoster + delta + posters_len) % posters_len;
    let index = GlobalState.currentPoster;

    const filePath = GlobalState.posters[index].file_path;

    const url = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/w780${filePath}`;

    document.getElementById('poster-carousel-img').src = url;
    document.getElementById('poster-counter').textContent =
        `Poster ${index + 1} de ${posters_len}`;

    const proxiedUrl = getSimpleCorsProxiedUrl(url);
    updatePoster(proxiedUrl);
}

function updateBackdrop(url) {
    const flyer = document.getElementById('flyer');
    let blurBg = document.getElementById('flyer-blur-bg-story');

    if (!blurBg) {
        blurBg = document.createElement('div');
        blurBg.id = 'flyer-blur-bg-story';
        blurBg.classList.add('flyer-blur-bg');
        flyer.prepend(blurBg);
    }

    blurBg.style.backgroundImage = `url('${url}')`;
    flyer.style.backgroundImage = '';
}

function updatePoster(url) {
    const poster = document.getElementById('poster');
    if (poster) poster.src = url;
}

// CARGA DIRECTA POR URL
function applyBackdropDirect(url) {
    if (!url || !url.startsWith('http')) return;

    let filePath = url;
    const tmdbMatch = url.match(
        /https:\/\/image\.tmdb\.org\/t\/p\/[^/]+(\/.*)/
    );
    if (tmdbMatch) {
        filePath = tmdbMatch[1];
    }

    const newBackdrop = {
        file_path: filePath,
        aspect_ratio: 1.778,
    };

    GlobalState.backdrops.unshift(newBackdrop);
    GlobalState.currentBackdrop = 0;

    shiftBackdrop(0);
}

function applyPosterDirect(url) {
    if (!url || !url.startsWith('http')) return;

    let filePath = url;
    const tmdbMatch = url.match(
        /https:\/\/image\.tmdb\.org\/t\/p\/[^/]+(\/.*)/
    );
    if (tmdbMatch) {
        filePath = tmdbMatch[1];
    }

    const newPoster = {
        file_path: filePath,
        aspect_ratio: 0.667,
    };

    GlobalState.posters.unshift(newPoster);
    GlobalState.currentPoster = 0;

    shiftPoster(0);
}
