// --------------------------------------------------
// VARIABLES GLOBALES Y HELPERS
// --------------------------------------------------

const API_KEY = "c733c18f5b61209aa7ea217bd007b156";
const BASE_URL = "https://api.themoviedb.org/3";

function getSimpleCorsProxiedUrl(imageUrl) {
  return `https://corsproxy.io/?${imageUrl}`;
}

function getCountryFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";

  const code = countryCode.toUpperCase();

  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt()));
}

const countryNamesES = {
  AR: "Argentina",
  US: "Estados Unidos",
  FR: "Francia",
  IT: "Italia",
  ES: "España",
  GB: "Reino Unido",
  DE: "Alemania",
  JP: "Japón",
  CN: "China",
  BR: "Brasil",
  MX: "México",
  CA: "Canadá",
  RU: "Rusia",
  IN: "India",
  KR: "Corea del Sur",
};

// Mapeo de certificaciones para normalizar los valores de arg https://calificaciones.incaa.gob.ar/
const certificationMap = {
  AA: "ATP",
  A: "ATP",
  ATP: "ATP",
  Atp: "ATP",
  12: "+13",
  13: "+13",
  14: "+13",
  15: "+16",
  16: "+16",
  18: "+18",
  SAM13: "SAM 13",
  SAM16: "SAM 16",
  SAM18: "SAM 18",
  "MA15+": "+16",
  M: "+13",
  G: "ATP",
  PG: "+13",
  "PG-13": "+13",
  R: "+16",
  "NC-17": "+18",
  NR: "",
};


// --------------------------------------------------
// BUSCADOR
// --------------------------------------------------

async function searchMovies (e) {
  e.preventDefault();

  const query = document.getElementById("movieSearch").value;
  const language = document.getElementById("movieLanguage").value || "en";

  const searchRes = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${language}`
  );

  const searchData = await searchRes.json();
  if (searchData.results.length === 0)
    return alert("No se encontró la película.");

  const orderedResults = [...searchData.results].sort(
    (a, b) => b.popularity - a.popularity
  );

  const resultsDiv = document.getElementById("movie-results");
  resultsDiv.innerHTML = "";

  for (let idx = 0; idx < Math.min(10, orderedResults.length); idx++) {
    const movie = orderedResults[idx];
    const creditsRes = await fetch(
      `${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`
    );
    const creditsData = await creditsRes.json();
    const director = creditsData.crew.find((c) => c.job === "Director");

    const movieDetails = await (
      await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=${language}`
      )
    ).json();

    const movieDetailsSinapsis = await (
      await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=es-ES`
      )
    ).json();

    const result = document.createElement("div");
    result.style.cursor = "pointer";
    result.style.padding = "8px";
    result.style.borderBottom = "1px solid #ccc";
    result.style.display = "flex";
    result.style.alignItems = "center";
    result.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${
      movie.poster_path
    }" style="width:48px;height:auto;margin-right:12px;" />
    <span style="font-weight:bold;">${movie.title}</span>
    <span style="margin-left:12px;">(${new Date(
      movie.release_date
    ).getFullYear()})</span>
    <span style="margin-left:12px;">${
      director ? director.name : "Director no disponible"
    }</span>
  `;
    result.addEventListener("click", async () => {
      window.selectedMovieId = movie.id;

      const releaseDatesRes = await fetch(
        `${BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`
      );
      const releaseDatesData = await releaseDatesRes.json();
      console.log(releaseDatesData);

      let certification = "";
      const countriesOrder = ["AR"]; // Se pueden agregar otros codigos de paises

      for (const country of countriesOrder) {
        const countryData = releaseDatesData.results.find(
          (r) => r.iso_3166_1 === country
        );
        if (countryData && countryData.release_dates.length > 0) {
          const certData = countryData.release_dates.find(
            (rd) => rd.certification !== ""
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
            (rd) => rd.certification !== ""
          );
          if (certData && certData.certification) {
            certification = certData.certification;
            break;
          }
        }
      }

      const mappedCertification =
        certificationMap[certification] || certification;

      document.getElementById("title").textContent = movie.title;

      if (mappedCertification) {
        document.getElementById("edadSugeridaInput").value =
          mappedCertification;

        const edadElements = [document.getElementById("edad-sugerida")];

        edadElements.forEach((el) => {
          if (el) {
            el.textContent = mappedCertification;
            el.style.display = "inline-block";
            if (mappedCertification === "ATP") {
              el.style.backgroundColor = "#4CAF50"; // Verde para ATP
              el.style.color = "white";
            } else if (
              mappedCertification === "+13" ||
              mappedCertification === "SAM 13"
            ) {
              el.style.backgroundColor = "#2196F3"; // Azul para +13
              el.style.color = "white";
            } else if (
              mappedCertification === "+16" ||
              mappedCertification === "SAM 16"
            ) {
              el.style.backgroundColor = "#FF9800"; // Naranja para +16
              el.style.color = "white";
            } else if (
              mappedCertification === "+18" ||
              mappedCertification === "SAM 18"
            ) {
              el.style.backgroundColor = "#f44336"; // Rojo para +18
              el.style.color = "white";
            } else {
              el.style.backgroundColor = "#777"; // Gris para otros
              el.style.color = "white";
            }
          }
        });
      }
      document.getElementById("year").textContent = new Date(
        movie.release_date,
      ).getFullYear();
      const posterUrl = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      );
      document.getElementById("poster").src = posterUrl;
      document.getElementById("director").textContent = director
        ? director.name
        : "Director no disponible";

      console.log(movieDetails);
      document.getElementById("duracion").textContent =
        `${movieDetails.runtime} minutos`;

      const backdropUrl = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      );
      setBackdropAsBackground(backdropUrl);

      const countryCode = movieDetails.origin_country[0];
      const flag = getCountryFlagEmoji(countryCode);
      const countryName = countryNamesES[countryCode] || countryCode;

      const imagesRes = await fetch(
        `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}`,
      );
      const imagesData = await imagesRes.json();

      backdrops = imagesData.backdrops || [];
      currentBackdrop = 0;
      showBackdrop(currentBackdrop);

      posters = imagesData.posters || [];
      currentPoster = 0;
      showPoster(currentPoster);

      Array.from(resultsDiv.children).forEach(
        (child) => (child.style.background = "")
      );
      result.style.background = "#386119ff";

      resultsDiv.style.display = "none";
      showResultsBtn.style.display = "block";
    });

    resultsDiv.appendChild(result);

    const showResultsBtn = document.createElement("button");
    showResultsBtn.textContent = "Mostrar resultados de búsqueda";
    showResultsBtn.id = "show-results-btn";
    showResultsBtn.style.display = "none";
    showResultsBtn.style.margin = "16px auto";
    showResultsBtn.style.fontSize = "1rem";
    showResultsBtn.style.textAlign = "center";
    showResultsBtn.style.width = "fit-content";
    showResultsBtn.style.position = "relative";

    resultsDiv.parentNode.insertBefore(showResultsBtn, resultsDiv);

    showResultsBtn.addEventListener("click", () => {
      resultsDiv.style.display = "block";
      showResultsBtn.style.display = "none";
    });
  }
}

// --------------------------------------------------
// CARROUSEL
// --------------------------------------------------

const linkBackdrops = document.getElementById("backdrops");
linkBackdrops.addEventListener("click", (e) => {
  e.preventDefault();
  if (!window.selectedMovieId) return;
  window.open(
    `https://www.themoviedb.org/movie/${window.selectedMovieId}/images/backdrops`,
    "_blank",
  );
});

const linkPosters = document.getElementById("posters");
linkPosters.addEventListener("click", (e) => {
  e.preventDefault();
  if (!window.selectedMovieId) return;
  window.open(
    `https://www.themoviedb.org/movie/${window.selectedMovieId}/images/posters`,
    "_blank",
  );
});

let backdrops = [];
let currentBackdrop = 0;
let posters = [];
let currentPoster = 0;

function showBackdrop(index) {
  if (!backdrops.length) return;
  const img = document.getElementById("backdrop-carousel-img");
  const filePath = backdrops[index].file_path;

  if (filePath.startsWith("http")) {
    img.src = filePath;
  } else {
    img.src = `https://image.tmdb.org/t/p/original${filePath}`;
  }

  document.getElementById("backdrop-counter").textContent = `Backdrop ${
    index + 1
  } de ${backdrops.length}`;
}

function showPoster(index) {
  if (!posters.length) return;
  const img = document.getElementById("poster-carousel-img");
  const filePath = posters[index].file_path;

  if (filePath.startsWith("http")) {
    img.src = filePath;
  } else {
    img.src = `https://image.tmdb.org/t/p/original${filePath}`;
  }

  document.getElementById("poster-counter").textContent = `Poster ${
    index + 1
  } de ${posters.length}`;
}

document.getElementById("poster-prev").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster - 1 + posters.length) % posters.length;
  showPoster(currentPoster);
  if (!posters.length) return;
  const filePath = posters[currentPoster].file_path;
  const posterUrlPrev = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/original${filePath}`
  );

  setPoster(posterUrlPrev);
});
document.getElementById("poster-next").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster + 1) % posters.length;
  showPoster(currentPoster);
  if (!posters.length) return;
  const filePath = posters[currentPoster].file_path;
  const posterUrlNext = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/original${filePath}`
  );

  setPoster(posterUrlNext);
});

function setPoster(url) {
  document.getElementById("poster").src = url;
}

document.getElementById("backdrop-prev").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop - 1 + backdrops.length) % backdrops.length;
  showBackdrop(currentBackdrop);
  if (!backdrops.length) return;
  const filePath = backdrops[currentBackdrop].file_path;
  const backdropUrlPrev = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/original${filePath}`
  );
  const rect = document.querySelector(".rect");
  rect.style.display = "none";
  setBackdropAsBackground(backdropUrlPrev);
});

document.getElementById("backdrop-next").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop + 1) % backdrops.length;
  showBackdrop(currentBackdrop);
  if (!backdrops.length) return;
  const filePath = backdrops[currentBackdrop].file_path;
  const backdropUrlNext = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/original${filePath}`
  );

  const rect = document.querySelector(".rect");
  rect.style.display = "none";
  setBackdropAsBackground(backdropUrlNext);
});

function setBackdropAsBackground(url) {
  const flyerStory = document.getElementById("flyer-story");
  let blurBg = document.getElementById("flyer-blur-bg-story");
  if (blurBg) blurBg.remove();

  blurBg = document.createElement("div");
  blurBg.id = "flyer-blur-bg-story";
  blurBg.style.position = "absolute";
  blurBg.style.top = "0";
  blurBg.style.left = "0";
  blurBg.style.width = "100%";
  blurBg.style.height = "100%";
  blurBg.style.zIndex = "0";
  blurBg.style.pointerEvents = "none";
  blurBg.style.backgroundPosition = "center";
  blurBg.style.backgroundSize = "cover";
  blurBg.style.backgroundRepeat = "no-repeat";
  blurBg.style.filter = "blur(4px) brightness(0.9)";
  blurBg.style.backgroundImage = `url('${url}')`;
  flyerStory.prepend(blurBg);

  flyerStory.style.backgroundImage = "";
}

document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  const flyerStory = document.getElementById("flyer-story");
  const rect = document.querySelector(".rect");

  rect.style.display = "block";

  flyerStory.style.backgroundImage = "";

  const blurBgStory = document.getElementById("flyer-blur-bg-story");

  if (blurBgStory) {
    blurBgStory.remove();
  }
});

const rect = document.querySelector(".rect");

const rectToggle = document.getElementById("toggle-rect");

let rectHidden = false;

rectToggle.addEventListener("click", () => {
  rectHidden = !rectHidden;
  rect.style.display = rectHidden ? "none" : "block";
  rectToggle.textContent = rectHidden
    ? "Mostrar rectángulo vertical"
    : "Ocultar rectángulo vertical";
});

// --------------------------------------------------
// CARGA DIRECTA POR URL
// --------------------------------------------------

document
  .getElementById("load-backdrop-direct")
  .addEventListener("click", () => {
    const input = document.getElementById("backdrop-direct-input").value.trim();

    if (!input) {
      alert("Por favor, ingresa una URL del backdrop");
      return;
    }

    if (!input.startsWith("http")) {
      alert(
        "Por favor, ingresa una URL completa que comience con http:// o htt://",
      );
      return;
    }

    let filePath = "";
    if (input.includes("image.tmdb.org/t/p/original")) {
      filePath = input.replace("https://image.tmdb.org/t/p/original", "");
    } else {
      filePath = input;
    }

    const newBackdrop = {
      file_path: filePath,
      aspect_ratio: 1.778,
    };

    backdrops.unshift(newBackdrop);
    currentBackdrop = 0;

    showBackdrop(currentBackdrop);

    // Aplicar automáticamente como fondo del flyer
    const fullUrl = filePath.startsWith("http")
      ? filePath
      : `https://image.tmdb.org/t/p/original${filePath}`;
    const rect = document.querySelector(".rect");
    const rectFeed = document.querySelector(".rect-feed");
    const rectReview = document.querySelector(".rect-review");
    rect.style.display = "none";
    rectFeed.style.display = "none";
    rectReview.style.display = "none";
    setBackdropAsBackground(fullUrl);
    setBackdropAsBackgroundFeed(fullUrl);
    setBackdropAsBackgroundReview(fullUrl);
    setBackdropAsBackgroundReviewFeed(fullUrl);

    document.getElementById("backdrop-direct-input").value = "";
  });

document.getElementById("load-poster-direct").addEventListener("click", () => {
  const input = document.getElementById("poster-direct-input").value.trim();

  if (!input) {
    alert("Por favor, ingresa una URL del poster");
    return;
  }

  if (!input.startsWith("http")) {
    alert(
      "Por favor, ingresa una URL completa que comience con http:// o https://",
    );
    return;
  }

  let filePath = "";
  if (input.includes("image.tmdb.org/t/p/original")) {
    filePath = input.replace("https://image.tmdb.org/t/p/original", "");
  } else {
    filePath = input;
  }

  const newPoster = {
    file_path: filePath,
    aspect_ratio: 0.667,
  };

  posters.unshift(newPoster);
  currentPoster = 0;

  showPoster(currentPoster);
  const fullUrl = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;
  setPoster(fullUrl);

  document.getElementById("poster-direct-input").value = "";
});

function applyBackdropDirect(url) {
  if (!url || !url.startsWith("http")) return;

  let filePath = "";
  if (url.includes("image.tmdb.org/t/p/original")) {
    filePath = url.replace("https://image.tmdb.org/t/p/original", "");
  } else {
    filePath = url;
  }

  const newBackdrop = {
    file_path: filePath,
    aspect_ratio: 1.778,
  };

  backdrops.unshift(newBackdrop);
  currentBackdrop = 0;
  showBackdrop(currentBackdrop);

  const fullUrl = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;
  const rect = document.querySelector(".rect");
  const rectFeed = document.querySelector(".rect-feed");
  const rectReview = document.querySelector(".rect-review");
  rect.style.display = "none";
  rectFeed.style.display = "none";
  rectReview.style.display = "none";
  setBackdropAsBackground(fullUrl);
  setBackdropAsBackgroundFeed(fullUrl);
  setBackdropAsBackgroundReview(fullUrl);
  setBackdropAsBackgroundReviewFeed(fullUrl);
}

function applyPosterDirect(url) {
  if (!url || !url.startsWith("http")) return;

  let filePath = "";
  if (url.includes("image.tmdb.org/t/p/original")) {
    filePath = url.replace("https://image.tmdb.org/t/p/original", "");
  } else {
    filePath = url;
  }

  const newPoster = {
    file_path: filePath,
    aspect_ratio: 0.667,
  };

  posters.unshift(newPoster);
  currentPoster = 0;
  showPoster(currentPoster);

  const fullUrl = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;
  setPoster(fullUrl);
}

document
  .getElementById("backdrop-carousel-img")
  .addEventListener("click", () => {
    if (backdrops.length > 0) {
      const currentBackdropData = backdrops[currentBackdrop];
      const filePath = currentBackdropData.file_path;

      const fullUrl = filePath.startsWith("http")
        ? filePath
        : `https://image.tmdb.org/t/p/original${filePath}`;

      showImageInfo("Backdrop", filePath, fullUrl);
    }
  });

document.getElementById("poster-carousel-img").addEventListener("click", () => {
  if (posters.length > 0) {
    const currentPosterData = posters[currentPoster];
    const filePath = currentPosterData.file_path;

    const fullUrl = filePath.startsWith("http")
      ? filePath
      : `https://image.tmdb.org/t/p/original${filePath}`;

    showImageInfo("Poster", filePath, fullUrl);
  }
});

function showImageInfo(type, filePath, fullUrl) {
  const existingModal = document.getElementById("image-info-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "image-info-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 600px;
    width: 90%;
    text-align: center;
  `;

  modalContent.innerHTML = `
    <h3>Información del ${type}</h3>
    <p><strong>URL de la imagen:</strong></p>
    <input type="text" readonly value="${fullUrl}" style="width: 100%; padding: 5px; margin-bottom: 20px; font-family: monospace;">
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="copy-url" style="padding: 8px 16px;">Copiar URL</button>
      <button id="close-modal" style="padding: 8px 16px; background: #ccc;">Cerrar</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  document.getElementById("copy-url").addEventListener("click", () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert("URL copiada al portapapeles");
    });
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// --------------------------------------------------
// CARGA POR ID
// --------------------------------------------------

async function fetchMovieByIdAndCompleteFlyer(movieId, language, fecha) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES`,
  );
  const movie = await res.json();
  const releaseDatesRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`,
  );
  const creditsRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`,
  );
  const creditsData = await creditsRes.json();
  const director = creditsData.crew.find((c) => c.job === "Director");

  const movieDetails = await (
    await fetch(
      `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=${language}`,
    )
  ).json();

  const movieDetailsSinapsis = await (
    await fetch(
      `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=es-ES`,
    )
  ).json();
  const releaseDatesData = await releaseDatesRes.json();
  console.log(releaseDatesData);

  // Mapeo de certificaciones para normalizar los valores de arg https://calificaciones.incaa.gob.ar/
  const certificationMap = {
    AA: "ATP",
    A: "ATP",
    ATP: "ATP",
    Atp: "ATP",
    12: "+13",
    13: "+13",
    14: "+13",
    15: "+16",
    16: "+16",
    18: "+18",
    SAM13: "SAM 13",
    SAM16: "SAM 16",
    SAM18: "SAM 18",
    "MA15+": "+16",
    M: "+13",
    G: "ATP",
    PG: "+13",
    "PG-13": "+13",
    R: "+16",
    "NC-17": "+18",
    NR: "",
  };

  let certification = "";
  const countriesOrder = ["AR"]; // Se pueden agregar otros codigos de paises

  for (const country of countriesOrder) {
    const countryData = releaseDatesData.results.find(
      (r) => r.iso_3166_1 === country,
    );
    if (countryData && countryData.release_dates.length > 0) {
      const certData = countryData.release_dates.find(
        (rd) => rd.certification !== "",
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
        (rd) => rd.certification !== "",
      );
      if (certData && certData.certification) {
        certification = certData.certification;
        break;
      }
    }
  }

  const mappedCertification = certificationMap[certification] || certification;

  document.getElementById("titleInputReview").value = movie.title;

  if (mappedCertification) {
    document.getElementById("edadSugeridaInputReview").value =
      mappedCertification;

    const el = document.getElementById("edad-sugerida-review");
    if (el) {
      el.textContent = mappedCertification;
      el.style.display = "inline-block";
      if (mappedCertification === "ATP") {
        el.style.backgroundColor = "#4CAF50";
        el.style.color = "white";
      } else if (
        mappedCertification === "+13" ||
        mappedCertification === "SAM 13"
      ) {
        el.style.backgroundColor = "#2196F3";
        el.style.color = "white";
      } else if (
        mappedCertification === "+16" ||
        mappedCertification === "SAM 16"
      ) {
        el.style.backgroundColor = "#FF9800";
        el.style.color = "white";
      } else if (
        mappedCertification === "+18" ||
        mappedCertification === "SAM 18"
      ) {
        el.style.backgroundColor = "#f44336";
        el.style.color = "white";
      } else {
        el.style.backgroundColor = "#777";
        el.style.color = "white";
      }
    }
  }

  console.log(movieDetails);

  const posterUrlReview = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
  );
  const posterReviewImg = document.getElementById("poster-review");
  if (posterReviewImg) {
    posterReviewImg.setAttribute("crossOrigin", "anonymous");
    posterReviewImg.src = posterUrlReview;
  }

  document.getElementById("duracion-review").textContent =
    `${movieDetails.runtime} minutos`;
  document.getElementById("title-review").textContent = movie.title;
  document.getElementById("year-review").textContent = new Date(
    movie.release_date,
  ).getFullYear();
  document.getElementById("sinapsis-review").textContent =
    movieDetailsSinapsis.overview;
  document.getElementById("sinapsisInputReview").value =
    movieDetailsSinapsis.overview;
  document.getElementById("director-review").textContent = director
    ? director.name
    : "Director no disponible";

  const countryCode = movieDetails.origin_country[0];
  const flag = getCountryFlagEmoji(countryCode);
  const countryName = countryNamesES[countryCode] || countryCode;
  document.getElementById("origen-review").textContent =
    `Origen: ${flag} ${countryName}`;

  if (movie.backdrop_path) {
    const backdropUrl = getSimpleCorsProxiedUrl(
      `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
    );
    setBackdropAsBackgroundReview(backdropUrl);
  }

  const imagesRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}`,
  );
  const imagesData = await imagesRes.json();

  backdrops = imagesData.backdrops || [];
  currentBackdrop = 0;
  showBackdrop(currentBackdrop);

  posters = imagesData.posters || [];
  currentPoster = 0;
  showPoster(currentPoster);

  /* TODO: Lógica de Fecha (Pendiente de implementar en flyer)
  if (fecha) {
    document.getElementById("dateInputReview").value = fecha;
    document.getElementById("flyer-date-review").innerHTML = formatDateToSpanish(fecha);
  }
  */
}
