// VARIABLES GLOBALES Y HELPERS
const API_KEY = 'c733c18f5b61209aa7ea217bd007b156';
const BASE_URL = 'https://api.themoviedb.org/3';

const bandavertical = document.getElementById('bandavertical');

function getSimpleCorsProxiedUrl(imageUrl) {
    if (!imageUrl) return "";
    return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&default=${encodeURIComponent(imageUrl)}`;
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
    'MA 15+': '+16',
    M: '+13',
    G: 'ATP',
    PG: '+13',
    'PG-13': '+13',
    R: '+16',
    'NC-17': '+18',
    NR: '',
};

const certificationStyles = {
    'ATP':     { display: 'inline-block', backgroundColor: '#4CAF50', color: 'white' },
    '+13':     { display: 'inline-block', backgroundColor: '#2196F3', color: 'white' },
    'SAM 13':  { display: 'inline-block', backgroundColor: '#2196F3', color: 'white' },
    '+16':     { display: 'inline-block', backgroundColor: '#FF9800', color: 'white' },
    'SAM 16':  { display: 'inline-block', backgroundColor: '#FF9800', color: 'white' },
    '+18':     { display: 'inline-block', backgroundColor: '#f44336', color: 'white' },
    'SAM 18':  { display: 'inline-block', backgroundColor: '#f44336', color: 'white' },
};

// BUSCADOR
async function searchMovies(e) {
  e.preventDefault();

  // SearchState.search_title = document.getElementById('movieSearch').value;
  SearchState.DOM.movieSearch = { value: document.getElementById('movieSearch').value };
  SearchState.DOM.movieLanguage = { value: document.getElementById('movieLanguage').value };

    const searchRes = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${SearchState.DOM.movieSearch?.value || ''}&language=${SearchState.DOM.movieLanguage?.value || 'es-AR'}`
    );

    const searchData = await searchRes.json();
    if (searchData.results.length === 0)
        return alert('No se encontró la película.');

    SearchState.orderedResults = (
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
            `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=${SearchState.search_language}`
        )
    ).json();
    // const movieDetailsSinopsis = await (await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=es-ES`)).json();
    return { director: director, details: details };
}

async function populateSearchResults() {
    if (!SearchState.orderedResults) return;

    const resultsDiv = document.getElementById('movie-results');
    resultsDiv.innerHTML = '';

    // FIXME: no usar idx : iterar directo
    for (let idx = 0; idx < Math.min(10, SearchState.orderedResults.length); idx++) {
        const movie = SearchState.orderedResults[idx];

        const result = document.createElement('div');
        result.style.cursor = 'pointer';
        result.style.padding = '10px 12px';
        result.style.border = '1px solid #d1d9e2';
        result.style.borderRadius = '10px';
        result.style.backgroundColor = '#ffffff';
        result.style.display = 'flex';
        result.style.alignItems = 'center';
        result.style.gap = '15px'; // Espaciado automático entre la imagen, el título y la info
        result.style.fontFamily = '"Gilroy", sans-serif';

        result.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${
        movie.poster_path
    }" style="width:48px; height:auto; border-radius: 4px; flex-shrink: 0;" />

    <div style="flex-grow: 1; text-align: left;">
        <span style="font-weight: 700; font-size: 16px; color: #0f172a;">${movie.title}</span>
    </div>

    <div style="display: flex; gap: 8px; align-items: center; text-align: right; flex-shrink: 0;">
        <span style="font-weight: 500; color: #334155;">(${new Date(
            movie.release_date
        ).getFullYear()})</span>

        <span style="font-weight: 500; color: #334155;">${
            movie.director ? movie.director.name : 'Director no disponible'
        }</span>
    </div>`;
        result.addEventListener('click', async () => {
            console.log(movie.title);
            SearchState.selectedMovie = movie;
            SearchState.DOM.year = { textContent: new Date(movie.release_date).getFullYear() };
            SearchState.DOM.director = { textContent: movie.director ? movie.director.name : "" };
            SearchState.DOM.duracion = { textContent: `${movie.details.runtime} minutos` };
            DesignState.DOM.title = { ...(DesignState.DOM.title || {}), textContent: movie.title };
            DesignState.DOM.titleInput = { value: movie.title };

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

            DesignState.DOM.edadSugerida = mappedCertification
                ? { textContent: mappedCertification, style: getEdadStyles(mappedCertification) }
                : { textContent: '', style: { display: 'none' } };
            DesignState.DOM.edadSugeridaInput = { value: mappedCertification || '' };// TODO: ver si esto funciona con el dropdown

            actualizarEdadSugerida(mappedCertification || '');// TODO: ver si esta bien aca

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

            SearchState.backdrops = imagesData.backdrops || [];
            SearchState.currentBackdrop = 0;
            shiftBackdrop(0);

            SearchState.posters = imagesData.posters || [];
            SearchState.currentPoster = 0;
            shiftPoster(0);

            Array.from(resultsDiv.children).forEach(
                (child) => (child.style.background = '')
            );
            result.style.background = '#4a90e2';
        });

        resultsDiv.appendChild(result);
    }
}

//TODO: quedan getelementbyid que ensucian la logica, hay que ver como sacarlos a entrypoints.js.

function restoreBackdropDisplay() {
    if (!SearchState.backdrops?.length) return;
    const index = SearchState.currentBackdrop || 0;
    const filePath = SearchState.backdrops[index].file_path;
    const url = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/w1280${filePath}`;

    SearchState.DOM['backdrop-carousel-img'] = { src: url };
    SearchState.DOM['backdrop-counter'] = {
        textContent: `Backdrop ${index + 1} de ${SearchState.backdrops.length}`
    };

    const proxiedUrl = getSimpleCorsProxiedUrl(url);
    restoreBackdropImage(proxiedUrl);
}

function restorePosterDisplay() {
    if (!SearchState.posters?.length) return;
    const index = SearchState.currentPoster || 0;
    const filePath = SearchState.posters[index].file_path;
    const url = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/w780${filePath}`;

    SearchState.DOM['poster-carousel-img'] = { src: url };
    SearchState.DOM['poster-counter'] = {
        textContent: `Poster ${index + 1} de ${SearchState.posters.length}`
    };

    const proxiedUrl = getSimpleCorsProxiedUrl(url);
    restorePosterImage(proxiedUrl);
}

function restoreBackdropImage(url) {
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

function restorePosterImage(url) {
    const poster = document.getElementById('poster');
    if (poster) poster.src = url;
}

function shiftBackdrop(delta) {
    let backdrops_len = SearchState.backdrops.length;
    if (!backdrops_len) return;

    SearchState.currentBackdrop = (SearchState.currentBackdrop + delta + backdrops_len) % backdrops_len;
    let index = SearchState.currentBackdrop;

    const filePath = SearchState.backdrops[index].file_path;

    const url = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/w1280${filePath}`;

    document.getElementById('backdrop-counter').textContent =
        `${index + 1} de ${backdrops_len}`;

    const proxiedUrl = getSimpleCorsProxiedUrl(url);
    updateBackdrop(proxiedUrl);
}

function shiftPoster(delta) {
    let posters_len = SearchState.posters.length;
    if (!posters_len) return;

    SearchState.currentPoster = (SearchState.currentPoster + delta + posters_len) % posters_len;
    let index = SearchState.currentPoster;

    const filePath = SearchState.posters[index].file_path;

    const url = filePath.startsWith('http')
        ? filePath
        : `https://image.tmdb.org/t/p/w780${filePath}`;

    document.getElementById('poster-counter').textContent =
        `${index + 1} de ${posters_len}`;

    const proxiedUrl = getSimpleCorsProxiedUrl(url);
    updatePoster(proxiedUrl);
}

function updateBackdrop(url) {
    const flyer = document.getElementById('flyer');
    let blurBg = document.getElementById('flyer-blur-bg-story');

    DesignState.backgroundImage = url;

    if (!blurBg) {
        blurBg = document.createElement('div');
        blurBg.id = 'flyer-blur-bg-story';
        blurBg.classList.add('flyer-blur-bg');
        flyer.prepend(blurBg);
    }

    DesignState.DOM['flyer-blur-bg-story'] = {
        style: { backgroundImage: `url('${url}')` }
    };
    DesignState.DOM['flyer'] = {
        style: { backgroundImage: '' }
    };
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

    SearchState.backdrops.unshift(newBackdrop);
    SearchState.currentBackdrop = 0;

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

    SearchState.posters.unshift(newPoster);
    SearchState.currentPoster = 0;

    shiftPoster(0);
}
