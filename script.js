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

document.getElementById("movieForm").addEventListener("submit", async (e) => {
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

      document.getElementById("titleInputReview").value = movie.title;

      if (mappedCertification) {
        document.getElementById("edadSugeridaInputReview").value = mappedCertification;

        const edadLabel = document.getElementById("edad-sugerida-review");

        if (edadLabel) {
          edadLabel.textContent = mappedCertification;
          edadLabel.style.display = "inline-block";

          if (mappedCertification === "ATP") {
            edadLabel.style.backgroundColor = "#4CAF50"; // Verde para ATP
            edadLabel.style.color = "white";
          } else if (
            mappedCertification === "+13" ||
            mappedCertification === "SAM 13"
          ) {
            edadLabel.style.backgroundColor = "#2196F3"; // Azul para +13
            edadLabel.style.color = "white";
          } else if (
            mappedCertification === "+16" ||
            mappedCertification === "SAM 16"
          ) {
            edadLabel.style.backgroundColor = "#FF9800"; // Naranja para +16
            edadLabel.style.color = "white";
          } else if (
            mappedCertification === "+18" ||
            mappedCertification === "SAM 18"
          ) {
            edadLabel.style.backgroundColor = "#f44336"; // Rojo para +18
            edadLabel.style.color = "white";
          } else {
            edadLabel.style.backgroundColor = "#777"; // Gris para otros
            edadLabel.style.color = "white";
          }
        }
      }

      const backdropUrl = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      );

      setBackdropAsBackgroundReview(backdropUrl);

      const posterUrlReview = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      );
      document.getElementById("poster-review").src = posterUrlReview;
      document.getElementById(
        "duracion-review"
      ).textContent = `${movieDetails.runtime} minutos`;
      document.getElementById("title-review").textContent = movie.title;
      document.getElementById("year-review").textContent = new Date(
        movie.release_date
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
      document.getElementById(
        "origen-review"
      ).textContent = `Origen: ${flag} ${countryName}`;

      const imagesRes = await fetch(
        `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}`
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
});

const linkBackdrops = document.getElementById("backdrops");
linkBackdrops.addEventListener("click", (e) => {
  e.preventDefault();
  if (!window.selectedMovieId) return;
  window.open(
    `https://www.themoviedb.org/movie/${window.selectedMovieId}/images/backdrops`,
    "_blank"
  );
});

const linkPosters = document.getElementById("posters");
linkPosters.addEventListener("click", (e) => {
  e.preventDefault();
  if (!window.selectedMovieId) return;
  window.open(
    `https://www.themoviedb.org/movie/${window.selectedMovieId}/images/posters`,
    "_blank"
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

function setPoster(url) {document.getElementById("poster-review").src = url}

document.getElementById("backdrop-prev").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop - 1 + backdrops.length) % backdrops.length;
  showBackdrop(currentBackdrop);
  if (!backdrops.length) return;
  const filePath = backdrops[currentBackdrop].file_path;
  const backdropUrlPrev = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/original${filePath}`
  );
  const rectReview = document.querySelector(".rect-review");
  rectReview.style.display = "none";
  setBackdropAsBackgroundReview(backdropUrlPrev);
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

  const rectReview = document.querySelector(".rect-review");
  rectReview.style.display = "none";
  setBackdropAsBackgroundReview(backdropUrlNext);
});

function setBackdropAsBackgroundReview(url) {
  const flyerReview = document.getElementById("flyer-story-review");
  let blurBg = document.getElementById("flyer-blur-bg-review");
  if (blurBg) blurBg.remove();

  blurBg = document.createElement("div");
  blurBg.id = "flyer-blur-bg-review";
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
  flyerReview.prepend(blurBg);

  flyerReview.style.backgroundImage = "";
}

function setBackdropAsBackgroundReviewFeed(url) {
  const flyerReview = document.getElementById("flyer-feed-review");
  let blurBg = document.getElementById("flyer-blur-bg-review-feed");
  if (blurBg) blurBg.remove();

  blurBg = document.createElement("div");
  blurBg.id = "flyer-blur-bg-review-feed";
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
  flyerReview.prepend(blurBg);

  flyerReview.style.backgroundImage = "";
}

document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  const flyerReview = document.getElementById("flyer-story-review");
  if (flyerReview) {
    flyerReview.style.backgroundImage = "";
  }

  const blurBgReview = document.getElementById("flyer-blur-bg-review");
  if (blurBgReview) {
    blurBgReview.remove();
  }
});

const flyerDate = document.getElementById("flyer-date");
const flyerHour = document.getElementById("flyer-hour");

const dateInput = document.getElementById("dateInput");
const hourInput = document.getElementById("hourInput");

async function applyBlurToImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = "blur(4px) brightness(0.9)";
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL());
    };
    img.src = imageUrl;
  });
}

document.getElementById("saveFlyerReview").addEventListener("click", async () => {
  const flyerElement = document.getElementById("flyer-story-review");
  const blurBg = document.getElementById("flyer-blur-bg-review");

  const downloadCanvas = async () => {
    const canvas = await html2canvas(flyerElement, {
      width: 1080,
      height: 1920,
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
    });

    const link = document.createElement("a");
    const titleElement = document.getElementById("title-review");
    const flyerTitle = titleElement 
        ? titleElement.textContent.trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "") 
        : "flyer";
    const date = new Date().toISOString().slice(0, 10);
    
    link.download = `${date}_${flyerTitle}_review.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (blurBg && blurBg.style.backgroundImage) {
    const bgImageMatch = blurBg.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);

    if (bgImageMatch) {
      const imageUrl = bgImageMatch[1];
      let originalFilter, originalBgImage;

      try {
        const blurredDataUrl = await applyBlurToImage(imageUrl);

        originalFilter = blurBg.style.filter;
        originalBgImage = blurBg.style.backgroundImage;

        blurBg.style.filter = "none";
        blurBg.style.backgroundImage = `url('${blurredDataUrl}')`;

        await new Promise((resolve) => setTimeout(resolve, 100));

        await downloadCanvas();

        blurBg.style.filter = originalFilter;
        blurBg.style.backgroundImage = originalBgImage;
        return;
        
      } catch (blurError) {
        console.warn("Error al aplicar blur, usando método alternativo:", blurError);
        if (originalFilter !== undefined) blurBg.style.filter = originalFilter;
        if (originalBgImage !== undefined) blurBg.style.backgroundImage = originalBgImage;
      }
    }
  }

  await downloadCanvas();
});

// color picker flotante
const floatingColorPicker = document.getElementById("floatingColorPicker");
let colorTargets = [];
let lastUsedColor = "#ffffff";

const lastColorIndicators = [];

function updateGlobalLastColor(color) {
  lastUsedColor = color;
  if (lastColorSquare) lastColorSquare.style.backgroundColor = color;
  lastColorIndicators.forEach(ind => ind.style.backgroundColor = color);
}

const lastColorSquare = document.createElement("div");
lastColorSquare.id = "lastColorSquare";
lastColorSquare.style.position = "absolute";
lastColorSquare.style.width = "48px";
lastColorSquare.style.height = "48px";
lastColorSquare.style.border = "2px solid #333";
lastColorSquare.style.borderRadius = "8px";
lastColorSquare.style.backgroundColor = lastUsedColor;
lastColorSquare.style.cursor = "pointer";
lastColorSquare.style.display = "none";
lastColorSquare.style.zIndex = "10000";
lastColorSquare.title = "Usar último color seleccionado";
lastColorSquare.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
document.body.appendChild(lastColorSquare);

function isBackgroundElement(target) {
  return (
    target.classList.contains("rect") ||
    target.classList.contains("rect-feed") ||
    target.classList.contains("rect2") ||
    target.classList.contains("rect2-feed") ||
    target.classList.contains("rect2-review") ||
    target.classList.contains("rect2-review-feed") ||
    target.classList.contains("tape") ||
    target.id === "flyer-story" ||
    target.id === "flyer-feed" ||
    target.id === "flyer-story-review" ||
    target.id === "flyer-feed-review"
  );
}

floatingColorPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;

  updateGlobalLastColor(selectedColor);

  colorTargets.forEach((target) => {
    if (isBackgroundElement(target)) {
      target.style.backgroundColor = selectedColor;
    } else {
      target.style.color = selectedColor;
    }
  });
});

lastColorSquare.addEventListener("click", (e) => {
  e.stopPropagation();
  floatingColorPicker.value = lastUsedColor;

  colorTargets.forEach((target) => {
    if (isBackgroundElement(target)) {
      target.style.backgroundColor = lastUsedColor;
    } else {
      target.style.color = lastUsedColor;
    }
  });
});

// funcion aux para convertir rgb a hexa
// el navegador devuelve estilos en RGB, pero el input type="color" requiere Hex
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#ffffff";
  const r = parseInt(result[0]).toString(16).padStart(2, '0');
  const g = parseInt(result[1]).toString(16).padStart(2, '0');
  const b = parseInt(result[2]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

// sincroniza colores entre version story y feed(posiblemente se vaya)
function getColorTargets(el) {
  if (el.classList.contains("rect") || el.classList.contains("rect2") || el.classList.contains("rect-feed") || el.classList.contains("rect2-feed")) {
    return [".rect", ".rect2", ".rect-feed", ".rect2-feed"].map(s => document.querySelector(s)).filter(Boolean);
  }

  if (el.classList.contains("rect2-review") || el.classList.contains("rect2-review-feed")) {
    return [".rect2-review", ".rect2-review-feed"].map(s => document.querySelector(s)).filter(Boolean);
  }

  const idGroups = [
    ["flyer-hour", "flyer-biblioteca", "flyer-hour-feed", "flyer-biblioteca-feed"],
    ["ciclo", "ciclo-feed"],
    ["title", "title-feed"],
    ["title-review", "title-review-feed"],
    ["year", "year-feed"],
    ["year-review", "year-review-feed"],
    ["flyer-date", "flyer-date-feed"],
    ["director", "director-feed"],
    ["director-review", "director-review-feed"],
    ["duracion", "duracion-feed"],
    ["duracion-review", "duracion-review-feed"],
    ["header", "header-feed"],
    ["header-review", "header-review-feed"],
    ["org", "org-feed"],
    ["org-review", "org-review-feed"],
    ["origen-review", "origen-review-feed"],
    ["sinapsis-review", "sinapsis-review-feed"],
    ["flyer-story", "flyer-feed"],
    ["flyer-story-review", "flyer-feed-review"],
    ["edad-sugerida", "edad-sugerida-feed"],
    ["edad-sugerida-review", "edad-sugerida-review-feed"]
  ];

  for (const group of idGroups) {
    if (group.includes(el.id)) {
      return group.map(id => document.getElementById(id)).filter(Boolean);
    }
  }

  return [el];
}

function getCurrentColorForTargets(targets) {
  for (const target of targets) {
    const inlineColor = target.style.backgroundColor || target.style.color;
    if (inlineColor && inlineColor !== "") {
      return rgbToHex(inlineColor);
    }
  }

  const style = window.getComputedStyle(targets[0]);
  return rgbToHex(isBackgroundElement(targets[0]) ? style.backgroundColor : style.color);
}

// muestra el color picker flotante cuando clickeas en el flyer
function showColorPickerForElement(element, event) {
  colorTargets = getColorTargets(element);

  const colorValue = getCurrentColorForTargets(colorTargets);

  floatingColorPicker.value = colorValue;
  floatingColorPicker.style.left = event.pageX + "px";
  floatingColorPicker.style.top = event.pageY + "px";
  floatingColorPicker.style.display = "block";
  floatingColorPicker.style.width = "48px";
  floatingColorPicker.style.height = "48px";
  floatingColorPicker.style.border = "2px solid #333";
  floatingColorPicker.style.borderRadius = "8px";
  floatingColorPicker.focus();

  lastColorSquare.style.left = (event.pageX + 55) + "px";
  lastColorSquare.style.top = event.pageY + "px";
  lastColorSquare.style.display = "block";
}

floatingColorPicker.addEventListener("blur", () => {
  setTimeout(() => {
    floatingColorPicker.style.display = "none";
    lastColorSquare.style.display = "none";
  }, 200);
});

[
  document.querySelector(".header"),
  document.querySelector(".header-feed"),
  document.querySelector(".header-review"),
  document.querySelector(".header-feed-review"),
  document.getElementById("title"),
  document.getElementById("year"),
  document.getElementById("director"),
  document.getElementById("duracion"),
  document.getElementById("edad-sugerida"),
  document.getElementById("title-review"),
  document.getElementById("origen-review"),
  document.getElementById("year-review"),
  document.getElementById("director-review"),
  document.getElementById("duracion-review"),
  document.getElementById("edad-sugerida-review"),
  document.getElementById("sinapsis-review"),
  document.getElementById("title-review-feed"),
  document.getElementById("origen-review-feed"),
  document.getElementById("year-review-feed"),
  document.getElementById("director-review-feed"),
  document.getElementById("duracion-review-feed"),
  document.getElementById("edad-sugerida-review-feed"),
  document.getElementById("sinapsis-review-feed"),
  document.getElementById("title-feed"),
  document.getElementById("year-feed"),
  document.getElementById("director-feed"),
  document.getElementById("duracion-feed"),
  document.getElementById("edad-sugerida-feed"),
  document.getElementById("flyer-date"),
  document.getElementById("flyer-date-feed"),
  document.getElementById("flyer-hour"),
  document.getElementById("flyer-hour-feed"),
  document.getElementById("flyer-biblioteca"),
  document.getElementById("flyer-biblioteca-feed"),
  document.getElementById("org"),
  document.getElementById("org-feed"),
  document.getElementById("org-review"),
  document.getElementById("org-review-feed"),
  document.querySelector(".rect"),
  document.querySelector(".rect2"),
  document.querySelector(".rect-feed"),
  document.querySelector(".rect2-feed"),
  document.querySelector(".rect2-review"),
  document.querySelector(".rect2-review-feed"),
  document.getElementById("ciclo"),
  document.getElementById("ciclo-feed"),
  document.getElementById("flyer-feed"),
  document.getElementById("flyer-story"),
  document.getElementById("flyer-story-review"),
  document.getElementById("flyer-feed-review"),
  document.querySelector(".tape"),
].forEach((el) => {
  if (el) {
    el.addEventListener("click", (event) => {
      showColorPickerForElement(el, event);
      event.stopPropagation();
    });
  }
});

// cierra el picker flotante
document.addEventListener("click", (e) => {
  if (e.target !== floatingColorPicker && e.target !== lastColorSquare) {
    floatingColorPicker.style.display = "none";
    lastColorSquare.style.display = "none";
    colorTargets = [];
  }
});

const comicBalloon = document.querySelector(".dialogo-comic");
const comicColorPanel = document.getElementById("comicColorPickerPanel");
const comicBgPicker = document.getElementById("comicBgColorPicker");
const comicBorderPicker = document.getElementById("comicBorderColorPicker");
const comicTextPicker = document.getElementById("comicTextColorPicker");
const posterImg = document.getElementById("poster");

// agrega el lastUsedColor en el panel del globo
function addInlineLastColorBtn(pickerInput, applyCallback) {
  const btn = document.createElement("div");
  btn.style.width = "24px";
  btn.style.height = "24px";
  btn.style.marginLeft = "10px";
  btn.style.display = "inline-block";
  btn.style.border = "1px solid #999";
  btn.style.borderRadius = "4px";
  btn.style.cursor = "pointer";
  btn.style.backgroundColor = lastUsedColor;
  btn.title = "Aplicar último color usado";

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    applyCallback(lastUsedColor);
    pickerInput.value = lastUsedColor;
  });

  pickerInput.parentNode.appendChild(btn);
  
  lastColorIndicators.push(btn);
}

addInlineLastColorBtn(comicBgPicker, (color) => {
  comicBalloon.style.backgroundColor = color;
  comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${color} !important; }`;
});

addInlineLastColorBtn(comicBorderPicker, (color) => {
  comicBalloon.style.borderColor = color;
  comicTailBorderStyle.textContent = `.comic-tail-border { border-top-color: ${color} !important; }`;
});

addInlineLastColorBtn(comicTextPicker, (color) => {
  comicBalloon.style.color = color;
});

// TODO: Se agregaron "?." (Optional Chaining) a los eventos de esta sección
// para evitar que el script se rompa al no encontrar elementos HTML eliminados.
// Se optó por esto en lugar de encerrar codigo en if's para facilitar posterior merge con otra branch.

// Codigo modificado desde aca: --------------------------------------------------------------------
comicBalloon?.addEventListener("click", (event) => {
  const style = window.getComputedStyle(comicBalloon);
  comicBgPicker.value = rgbToHex(style.backgroundColor);
  comicBorderPicker.value = rgbToHex(style.borderColor);
  comicTextPicker.value = rgbToHex(style.color);

  comicColorPanel.style.left = event.pageX + "px";
  comicColorPanel.style.top = event.pageY + "px";
  comicColorPanel.style.display = "block";
  event.stopPropagation();
});

let comicTailBgStyle = document.getElementById("comic-tail-bg-style");
if (!comicTailBgStyle) {
  comicTailBgStyle = document.createElement("style");
  comicTailBgStyle.id = "comic-tail-bg-style";
  document.head.appendChild(comicTailBgStyle);
}

let comicTailBorderStyle = document.getElementById("comic-tail-border-style");
if (!comicTailBorderStyle) {
  comicTailBorderStyle = document.createElement("style");
  comicTailBorderStyle.id = "comic-tail-border-style";
  document.head.appendChild(comicTailBorderStyle);
}

comicBgPicker?.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  updateGlobalLastColor(selectedColor);
  comicBalloon.style.backgroundColor = selectedColor;
  comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${selectedColor} !important; }`;
});


comicBorderPicker?.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  updateGlobalLastColor(selectedColor);
  comicBalloon.style.borderColor = selectedColor;
  comicTailBorderStyle.textContent = `.comic-tail-border { border-top-color: ${selectedColor} !important; }`;
});

// Event listeners cuando se cambia el color del texto del globo
comicTextPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  updateGlobalLastColor(selectedColor);
  comicBalloon.style.color = selectedColor;
});

// cierra el panel del color picker del globo
document.addEventListener("mousedown", (e) => {
  if (
    comicColorPanel?.style.display === "block" &&
    !comicColorPanel?.contains(e.target) &&
    !e.target.classList.contains("dialogo-comic")
  ) {
    comicColorPanel.style.display = "none";
  }

  const contextMenu = document.getElementById("comicColorContextMenu");
  if (
    contextMenu &&
    contextMenu.style.display === "block" &&
    !contextMenu.contains(e.target)
  ) {
    contextMenu.style.display = "none";
  }
});

// Hasta aca: --------------------------------------------------------------------------------------

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
        "Por favor, ingresa una URL completa que comience con http:// o htt://"
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
      "Por favor, ingresa una URL completa que comience con http:// o https://"
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

document
  .getElementById("flyerTitleFontSizeInputReview")
  .addEventListener("input", (e) => {
    document.getElementById("title-review").style.fontSize =
      e.target.value + "px";
  });

document
  .getElementById("flyerSynopsisFontSizeInputStory")
  .addEventListener("input", (e) => {
    document.getElementById("sinapsis-review").style.fontSize =
      e.target.value + "px";
  });

document.getElementById("applyTxtBtnReview").addEventListener("click", () => {
  const titulo = document.getElementById("titleInputReview").value.trim();
  const sinapsis = document.getElementById("sinapsisInputReview").value.trim();
  const edadSugerida = document
    .getElementById("edadSugeridaInputReview")
    .value.trim();

  document.getElementById("title-review").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("titleInputReview").value = titulo;

  const flyerReview = document.getElementById("flyer-story-review");
  if (flyerReview) {
    flyerReview.querySelector("#sinapsis-review").innerHTML = (
      sinapsis || "Sinopsis de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("sinapsisInputReview").value = sinapsis;

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

    const mappedCertification = certificationMap[edadSugerida] || edadSugerida;

    if (mappedCertification) {
      if (edadSugerida) {
        document.getElementById("edadSugeridaInputReview").value = mappedCertification;
      } else {
        const edadSugeridaElement = document.getElementById("edad-sugerida-review");
        if (edadSugeridaElement) {
          edadSugeridaElement.style.display = "none";
        }
      }

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
  }
});

document
  .getElementById("applyStrokeBtnReview")
  .addEventListener("click", () => {
    const strokeIdMapReview = {
      "origen-review": ["origen-review", "origen-review-feed"],
      "sinapsis-review": ["sinapsis-review", "sinapsis-review-feed"],
    };

    const select = document.getElementById("strokeTargetSelectReview");
    const color = document.getElementById("strokeColorInputReview").value;
    Array.from(select.selectedOptions).forEach((option) => {
      const ids = strokeIdMapReview[option.value] || [option.value];
      ids.forEach((id) => {
        const target = document.getElementById(id);
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
  });

document
  .getElementById("removeStrokeBtnReview")
  .addEventListener("click", () => {
    const select = document.getElementById("strokeTargetSelectReview");
    Array.from(select.selectedOptions).forEach((option) => {
      const target = document.getElementById(option.value);
      if (target) {
        target.style.textShadow = "";
      }
    });
  });

function exportUserData() {
  const { colors, strokes } = extractElementColors();
  const userData = {
    selectedMovie: {
      id: window.selectedMovieId || null,
      title: document.getElementById("title-review").textContent,
      year: document.getElementById("year-review").textContent,
      director: document.getElementById("director-review").textContent,
      duration: document.getElementById("duracion-review").textContent,
      synopsis: {
        story: document.getElementById("sinapsis-review").textContent,
      },
      origin: {
        story: document.getElementById("origen-review").textContent,
      },
      posterUrl: document.getElementById("poster-review").src,
      ageRating: document.getElementById("edad-sugerida-review").textContent,
    },

    formData: {
      titleReview: document.getElementById("titleInputReview").value,
      synopsisReview: document.getElementById("sinapsisInputReview").value,
      ageRatingReview: document.getElementById("edadSugeridaInputReview").value,
    },

    designSettings: {
      fontSizes: {
        flyerTitleReview: document.getElementById("flyerTitleFontSizeInputReview").value,
        flyerSynopsisStory: document.getElementById("flyerSynopsisFontSizeInputStory").value,
      },
      colors: colors,
      textStrokes: strokes,
    },

    images: {
      currentBackdrop: currentBackdrop,
      currentPoster: currentPoster,
      backdrops: backdrops.slice(0, 10),
      posters: posters.slice(0, 10),
      backgroundImages: {
        review: extractBackgroundImage("flyer-blur-bg-review"),
      },
    },

    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  const movieTitle =
    userData.selectedMovie.title
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_") || "flyer";
  const filename = `${movieTitle}_datos_${new Date().toISOString().slice(0, 10)}.json`;

  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("Datos exportados exitosamente:", filename);
}

function extractElementColors() {
  const elements = [
    "header-review",
    "title-review",
    "year-review",
    "director-review",
    "duracion-review",
    "org-review",
    "sinapsis-review",
    "origen-review",
    "edad-sugerida-review"
  ];

  const colors = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    colors[id] = {
      color: element.style.color || "",
      backgroundColor: element.style.backgroundColor || "",
    };
  });

  const strokes = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element.style.textShadow) {
      strokes[id] = element.style.textShadow;
    }
  });

  const classElements = [
    { selector: ".rect2-review", name: "rect2-review" },
    { selector: ".tape", name: "tape" },
  ];

  classElements.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (element) {
      colors[name] = {
        color: element.style.color || "",
        backgroundColor: element.style.backgroundColor || "",
      };
    }
  });

  return { colors, strokes };
}

function extractBackgroundImage(elementId) {
  const element = document.getElementById(elementId);
  if (element && element.style.backgroundImage) {
    const match = element.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    return match ? match[1] : "";
  }
  return "";
}

function restoreMovieData(movieData) {
  if (!movieData) return;

  if (movieData.id) window.selectedMovieId = movieData.id;

  if (movieData.title) {
    document.getElementById("title-review").innerHTML = movieData.title.replace(/\n/g, "<br>");
  }
  if (movieData.year) {
    document.getElementById("year-review").textContent = movieData.year;
  }
  if (movieData.director) {
    document.getElementById("director-review").textContent = movieData.director;
  }
  if (movieData.duration) {
    document.getElementById("duracion-review").textContent = movieData.duration;
  }
  if (movieData.synopsis && movieData.synopsis.story) {
    document.getElementById("sinapsis-review").innerHTML = movieData.synopsis.story.replace(/\n/g, "<br>");
  }
  if (movieData.origin && movieData.origin.story) {
    document.getElementById("origen-review").textContent = movieData.origin.story;
  }
  if (movieData.posterUrl && movieData.posterUrl !== "") {
    document.getElementById("poster-review").src = movieData.posterUrl;
  }
  if (movieData.ageRating) {
    const el = document.getElementById("edad-sugerida-review");
    el.textContent = movieData.ageRating;
    el.style.display = "inline-block";

    if (movieData.ageRating === "ATP") {
      el.style.backgroundColor = "#4CAF50"; el.style.color = "white";
    } else if (movieData.ageRating === "+13" || movieData.ageRating === "SAM 13") {
      el.style.backgroundColor = "#2196F3"; el.style.color = "white";
    } else if (movieData.ageRating === "+16" || movieData.ageRating === "SAM 16") {
      el.style.backgroundColor = "#FF9800"; el.style.color = "white";
    } else if (movieData.ageRating === "+18" || movieData.ageRating === "SAM 18") {
      el.style.backgroundColor = "#f44336"; el.style.color = "white";
    } else {
      el.style.backgroundColor = "#777"; el.style.color = "white";
    }
  }
}

function restoreFormData(formData) {
  if (!formData) return;
  document.getElementById("titleInputReview").value = formData.titleReview || "";
  document.getElementById("sinapsisInputReview").value = formData.synopsisReview || "";
  document.getElementById("edadSugeridaInputReview").value = formData.ageRatingReview || "";
}

function restoreDesignSettings(designSettings) {
  if (!designSettings) return;

  if (designSettings.colors) {
    Object.keys(designSettings.colors).forEach((elementKey) => {
      const colorData = designSettings.colors[elementKey];
      let element;

      if (elementKey.startsWith(".") || ["rect2-review", "tape"].includes(elementKey)) {
        const selector = elementKey.startsWith(".") ? elementKey : `.${elementKey}`;
        element = document.querySelector(selector);
      } else {
        element = document.getElementById(elementKey);
      }

      if (element && colorData) {
        if (colorData.color) element.style.color = colorData.color;
        if (colorData.backgroundColor) element.style.backgroundColor = colorData.backgroundColor;
      }
    });
  }

  if (designSettings.fontSizes) {
    const fontSizeFields = [
      { id: "flyerTitleFontSizeInputReview", value: designSettings.fontSizes.flyerTitleReview },
      { id: "flyerSynopsisFontSizeInputStory", value: designSettings.fontSizes.flyerSynopsisStory },
    ];

    fontSizeFields.forEach((field) => {
      if (field.value !== undefined && field.value !== null && field.value !== "") {
        const element = document.getElementById(field.id);
        if (element) {
          element.value = field.value;
          element.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (designSettings.textStrokes) {
    Object.keys(designSettings.textStrokes).forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.textShadow = designSettings.textStrokes[elementId];
      }
    });
  }
}

function restoreImages(imagesData) {
  if (!imagesData) return;

  if (imagesData.backdrops && Array.isArray(imagesData.backdrops)) {
    backdrops = [...imagesData.backdrops];
    if (typeof imagesData.currentBackdrop === "number") {
      currentBackdrop = Math.min(imagesData.currentBackdrop, backdrops.length - 1);
    }
    if (backdrops.length > 0) showBackdrop(currentBackdrop);
  }

  if (imagesData.posters && Array.isArray(imagesData.posters)) {
    posters = [...imagesData.posters];
    if (typeof imagesData.currentPoster === "number") {
      currentPoster = Math.min(imagesData.currentPoster, posters.length - 1);
    }
    if (posters.length > 0) showPoster(currentPoster);
  }

  if (imagesData.backgroundImages && imagesData.backgroundImages.review) {
    setBackdropAsBackgroundReview(imagesData.backgroundImages.review);
  }
}

function validateUserData(data) {
  const defaultData = {
    selectedMovie: {},
    formData: {},
    designSettings: {},
    images: {},
  };
  return { ...defaultData, ...data };
}

function importUserData(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const userData = JSON.parse(e.target.result);
      const validatedData = validateUserData(userData);

      console.log("Importando datos de usuario:", validatedData);

      try {
        restoreMovieData(validatedData.selectedMovie);
        restoreFormData(validatedData.formData);
        restoreDesignSettings(validatedData.designSettings);
        restoreImages(validatedData.images);
      } catch (restoreError) {
        console.error("Error durante la restauración:", restoreError);
      }
    } catch (error) {
      console.error("Error al parsear el JSON:", error);
      alert("Error al leer el archivo. Verifica que sea un JSON válido.");
    }
  };

  reader.onerror = function () {
    console.error("Error de lectura del archivo");
    alert("Hubo un problema al leer el archivo.");
  };

  reader.readAsText(file);
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    alert(
      "El archivo no es un JSON válido. Por favor selecciona un archivo con extensión .json"
    );
    event.target.value = "";
    return;
  }

  const fileInfo = `Datos del archivo cargado:
• Nombre: ${file.name}
• Tamaño: ${(file.size / 1024).toFixed(2)} KB
• Última modificación: ${new Date(file.lastModified).toLocaleString()}`;

  if (confirm(fileInfo)) {
    const loadingIndicator = showLoadingIndicator("Importando datos...");

    setTimeout(() => {
      importUserData(file);
      hideLoadingIndicator(loadingIndicator);
    }, 100);
  }

  event.target.value = "";
}

function showLoadingIndicator(message) {
  const indicator = document.createElement("div");
  indicator.id = "loading-indicator";
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px 40px;
    border-radius: 10px;
    z-index: 10001;
    text-align: center;
    font-size: 16px;
  `;
  indicator.innerHTML = `
    <div style="margin-bottom: 10px;">Cargando</div>
    <div>${message}</div>
  `;
  document.body.appendChild(indicator);
  return indicator;
}

function hideLoadingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

// Función auxiliar para obtener el fontsize
function initializeControlValues() {
  function getFontSizeInPx(element) {
    if (!element) return null;
    const computedStyle = window.getComputedStyle(element);
    const fontSize = computedStyle.fontSize;
    return parseInt(fontSize.replace("px", ""));
  }

  const flyerDate = document.getElementById("flyer-date");
  const flyerHour = document.getElementById("flyer-hour");

  if (flyerDate) {
    const currentSize = getFontSizeInPx(flyerDate);
    if (currentSize) {
      const control = document.getElementById("flyerDateFontSizeInput");
      if (control && control.value == "40") {
        control.value = currentSize;
      }
    }
  }

  if (flyerHour) {
    const currentSize = getFontSizeInPx(flyerHour);
    if (currentSize) {
      const control = document.getElementById("flyerHourFontSizeInput");
      if (control && control.value == "45") {
        control.value = currentSize;
      }
    }
  }

  const flyerDateFeed = document.getElementById("flyer-date-feed");
  const flyerHourFeed = document.getElementById("flyer-hour-feed");

  if (flyerDateFeed) {
    const currentSize = getFontSizeInPx(flyerDateFeed);
    if (currentSize) {
      const control = document.getElementById("flyerDateFontSizeInputFeed");
      if (control && control.value == "50") {
        control.value = currentSize;
      }
    }
  }

  if (flyerHourFeed) {
    const currentSize = getFontSizeInPx(flyerHourFeed);
    if (currentSize) {
      const control = document.getElementById("flyerHourFontSizeInputFeed");
      if (control && control.value == "50") {
        control.value = currentSize;
      }
    }
  }

  console.log("Valores de controles inicializados con CSS por defecto");
}

async function fetchMovieByIdAndCompleteFlyer(movieId, language, fecha) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES`
  );
  const movie = await res.json();
  const releaseDatesRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`
  );
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

  const mappedCertification = certificationMap[certification] || certification;

  document.getElementById("titleInputReview").value = movie.title;

  if (mappedCertification) {
    document.getElementById("edadSugeridaInputReview").value = mappedCertification;

    const el = document.getElementById("edad-sugerida-review");
    if (el) {
      el.textContent = mappedCertification;
      el.style.display = "inline-block";
      if (mappedCertification === "ATP") {
        el.style.backgroundColor = "#4CAF50"; el.style.color = "white";
      } else if (mappedCertification === "+13" || mappedCertification === "SAM 13") {
        el.style.backgroundColor = "#2196F3"; el.style.color = "white";
      } else if (mappedCertification === "+16" || mappedCertification === "SAM 16") {
        el.style.backgroundColor = "#FF9800"; el.style.color = "white";
      } else if (mappedCertification === "+18" || mappedCertification === "SAM 18") {
        el.style.backgroundColor = "#f44336"; el.style.color = "white";
      } else {
        el.style.backgroundColor = "#777"; el.style.color = "white";
      }
    }
  }

  console.log(movieDetails);

  const posterUrlReview = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  );
  const posterReviewImg = document.getElementById("poster-review");
  if (posterReviewImg) {
    posterReviewImg.setAttribute("crossOrigin", "anonymous");
    posterReviewImg.src = posterUrlReview;
  }

  document.getElementById("duracion-review").textContent = `${movieDetails.runtime} minutos`;
  document.getElementById("title-review").textContent = movie.title;
  document.getElementById("year-review").textContent = new Date(movie.release_date).getFullYear();
  document.getElementById("sinapsis-review").textContent = movieDetailsSinapsis.overview;
  document.getElementById("sinapsisInputReview").value = movieDetailsSinapsis.overview;
  document.getElementById("director-review").textContent = director ? director.name : "Director no disponible";

  const countryCode = movieDetails.origin_country[0];
  const flag = getCountryFlagEmoji(countryCode);
  const countryName = countryNamesES[countryCode] || countryCode;
  document.getElementById("origen-review").textContent = `Origen: ${flag} ${countryName}`;

  if (movie.backdrop_path) {
    const backdropUrl = getSimpleCorsProxiedUrl(
      `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    );
    setBackdropAsBackgroundReview(backdropUrl);
  }

  const imagesRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}`
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

document.addEventListener("DOMContentLoaded", async function () {
  initializeControlValues();

  const exportBtn = document.getElementById("exportDataBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      try {
        exportUserData();
      } catch (error) {
        console.error("Error al exportar datos:", error);
        alert("Error al exportar los datos. Por favor intenta de nuevo.");
      }
    });
  }

  const importBtn = document.getElementById("importDataBtn");
  const fileInput = document.getElementById("importFileInput");

  if (importBtn && fileInput) {
    importBtn.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", handleFileImport);
  }

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("movieId");
  const language = params.get("lang") || params.get("language") || "es-ES";
  const fecha = params.get("date");
  if (movieId) {
    fetchMovieByIdAndCompleteFlyer(movieId, language, fecha);
  }
});
