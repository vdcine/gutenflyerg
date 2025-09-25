function getSimpleCorsProxiedUrl(imageUrl) {
  return `https://corsproxy.io/?${imageUrl}`;
}

document.getElementById("movieForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const API_KEY = "c733c18f5b61209aa7ea217bd007b156";
  const BASE_URL = "https://api.themoviedb.org/3";

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

      document.getElementById("title").textContent = movie.title;
      document.getElementById("titleInput").value = movie.title;
      document.getElementById("titleInputFeed").value = movie.title;
      document.getElementById("titleInputReview").value = movie.title;
      document.getElementById("titleInputReviewFeed").value = movie.title;

      if (mappedCertification) {
        document.getElementById("edadSugeridaInput").value =
          mappedCertification;
        document.getElementById("edadSugeridaInputFeed").value =
          mappedCertification;
        document.getElementById("edadSugeridaInputReview").value =
          mappedCertification;
        document.getElementById("edadSugeridaInputReviewFeed").value =
          mappedCertification;

        const edadElements = [
          document.getElementById("edad-sugerida"),
          document.getElementById("edad-sugerida-feed"),
          document.getElementById("edad-sugerida-review"),
          document.getElementById("edad-sugerida-review-feed"),
        ];

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
        movie.release_date
      ).getFullYear();
      const posterUrl = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      );
      document.getElementById("poster").src = posterUrl;
      document.getElementById("director").textContent = director
        ? director.name
        : "Director no disponible";

      console.log(movieDetails);
      document.getElementById(
        "duracion"
      ).textContent = `${movieDetails.runtime} minutos`;

      const backdropUrl = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      );
      setBackdropAsBackground(backdropUrl);
      setBackdropAsBackgroundFeed(backdropUrl);
      setBackdropAsBackgroundReview(backdropUrl);
      setBackdropAsBackgroundReviewFeed(backdropUrl);

      const flyerFeed = document.getElementById("flyer-feed");
      flyerFeed.querySelector("#title-feed").textContent = movie.title;
      flyerFeed.querySelector("#year-feed").textContent = new Date(
        movie.release_date
      ).getFullYear();
      const posterUrlFeed = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      );
      flyerFeed.querySelector("#poster-feed").src = posterUrlFeed;
      flyerFeed.querySelector("#director-feed").textContent = director
        ? director.name
        : "Director no disponible";
      flyerFeed.querySelector(
        "#duracion-feed"
      ).textContent = `${movieDetails.runtime} minutos`;

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

      const posterUrlReviewFeed = getSimpleCorsProxiedUrl(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      );
      document.getElementById("poster-review-feed").src = posterUrlReviewFeed;
      document.getElementById(
        "duracion-review-feed"
      ).textContent = `${movieDetails.runtime} minutos`;
      document.getElementById("title-review-feed").textContent = movie.title;
      document.getElementById("year-review-feed").textContent = new Date(
        movie.release_date
      ).getFullYear();
      document.getElementById("sinapsis-review-feed").textContent =
        movieDetailsSinapsis.overview;
      document.getElementById("sinapsisInputReviewFeed").value =
        movieDetailsSinapsis.overview;
      document.getElementById("director-review-feed").textContent = director
        ? director.name
        : "Director no disponible";

      document.getElementById(
        "origen-review-feed"
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

    function getCountryFlagEmoji(countryCode) {
      if (!countryCode || countryCode.length !== 2) return "";

      const code = countryCode.toUpperCase();

      return String.fromCodePoint(
        ...[...code].map((c) => 127397 + c.charCodeAt())
      );
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

function setPoster(url) {
  document.getElementById("poster").src = url;
  document.getElementById("poster-feed").src = url;
  document.getElementById("poster-review").src = url;
  document.getElementById("poster-review-feed").src = url;
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
  const rectFeed = document.querySelector(".rect-feed");
  const rectReview = document.querySelector(".rect-review");
  rect.style.display = "none";
  rectFeed.style.display = "none";
  rectReview.style.display = "none";
  setBackdropAsBackground(backdropUrlPrev);
  setBackdropAsBackgroundFeed(backdropUrlPrev);
  setBackdropAsBackgroundReview(backdropUrlPrev);
  setBackdropAsBackgroundReviewFeed(backdropUrlPrev);
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
  const rectFeed = document.querySelector(".rect-feed");
  const rectReview = document.querySelector(".rect-review");
  rect.style.display = "none";
  rectFeed.style.display = "none";
  rectReview.style.display = "none";
  setBackdropAsBackground(backdropUrlNext);
  setBackdropAsBackgroundFeed(backdropUrlNext);
  setBackdropAsBackgroundReview(backdropUrlNext);
  setBackdropAsBackgroundReviewFeed(backdropUrlNext);
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

function setBackdropAsBackgroundFeed(url) {
  const flyerFeed = document.getElementById("flyer-feed");
  let blurBg = document.getElementById("flyer-blur-bg-feed");
  if (blurBg) blurBg.remove();

  blurBg = document.createElement("div");
  blurBg.id = "flyer-blur-bg-feed";
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
  flyerFeed.prepend(blurBg);

  flyerFeed.style.backgroundImage = "";
}

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
  const flyerStory = document.getElementById("flyer-story");
  const flyerFeed = document.getElementById("flyer-feed");
  const flyerReview = document.getElementById("flyer-story-review");
  const flyerReviewFeed = document.getElementById("flyer-feed-review");
  const rect = document.querySelector(".rect");
  const rectFeed = document.querySelector(".rect-feed");

  rect.style.display = "block";
  rectFeed.style.display = "block";

  flyerStory.style.backgroundImage = "";
  flyerFeed.style.backgroundImage = "";
  flyerReview.style.backgroundImage = "";
  flyerReviewFeed.style.backgroundImage = "";

  const blurBgStory = document.getElementById("flyer-blur-bg-story");
  const blurBgFeed = document.getElementById("flyer-blur-bg-feed");
  const blurBgReview = document.getElementById("flyer-blur-bg-review");
  const blurBgReviewFeed = document.getElementById("flyer-blur-bg-review-feed");

  if (blurBgStory) {
    blurBgStory.remove();
  }
  if (blurBgFeed) {
    blurBgFeed.remove();
  }
  if (blurBgReview) {
    blurBgReview.remove();
  }
  if (blurBgReviewFeed) {
    blurBgReviewFeed.remove();
  }
});

const flyerDate = document.getElementById("flyer-date");
const flyerHour = document.getElementById("flyer-hour");

const dateInput = document.getElementById("dateInput");
const hourInput = document.getElementById("hourInput");
const rect = document.querySelector(".rect");
const rectFeed = document.querySelector(".rect-feed");

const rectToggle = document.getElementById("toggle-rect");

let rectHidden = false;

rectToggle.addEventListener("click", () => {
  rectHidden = !rectHidden;
  rect.style.display = rectHidden ? "none" : "block";
  rectFeed.style.display = rectHidden ? "none" : "block";
  rectToggle.textContent = rectHidden
    ? "Mostrar rectángulo vertical"
    : "Ocultar rectángulo vertical";
});

const cicloH2 = document.getElementById("ciclo");

const cicloInput = document.createElement("input");
cicloInput.type = "text";
cicloInput.style.display = "none";
cicloInput.style.fontSize = "60px";
cicloInput.style.fontFamily = "Gilroy, sans-serif";
cicloInput.style.textAlign = "center";
cicloInput.style.width = "100%";
cicloInput.style.background = "rgba(255,255,255,0.4)";
cicloInput.style.border = "none";
cicloInput.style.outline = "none";
cicloInput.style.fontWeight = "700";

cicloH2.parentNode.insertBefore(cicloInput, cicloH2.nextSibling);

const titleH3 = document.getElementById("title");

const titleInput = document.createElement("input");
titleInput.style.display = "none";
titleInput.style.fontSize = "50px";
titleInput.style.fontFamily = "Gilroy, sans-serif";
titleInput.style.textAlign = "center";
titleInput.style.width = "100%";
titleInput.style.background = "rgba(255,255,255,0.85)";
titleInput.style.color = "#222";
titleInput.style.border = "2px solid #386119";
titleInput.style.outline = "none";
titleInput.style.fontWeight = "700";
titleInput.style.borderRadius = "8px";
titleInput.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
titleInput.style.position = "relative";
titleInput.style.zIndex = "10";

titleH3.parentNode.insertBefore(titleInput, titleH3.nextSibling);

/* document.getElementById("saveFlyer").addEventListener("click", () => {
  const flyer = document.getElementById("flyer");

  html2canvas(flyer, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: "white",
    scale: 2,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "flyer.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}); */

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

document.getElementById("saveFlyer").addEventListener("click", async () => {
  const flyerElement = document.getElementById("flyer-story");
  const blurBg = document.getElementById("flyer-blur-bg-story");

  if (blurBg && blurBg.style.backgroundImage) {
    const bgImageMatch = blurBg.style.backgroundImage.match(
      /url\(['"]?([^'"]+)['"]?\)/
    );

    if (bgImageMatch) {
      const imageUrl = bgImageMatch[1];

      try {
        const blurredDataUrl = await applyBlurToImage(imageUrl);

        const originalFilter = blurBg.style.filter;
        const originalBgImage = blurBg.style.backgroundImage;

        blurBg.style.filter = "none";
        blurBg.style.backgroundImage = `url('${blurredDataUrl}')`;

        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(flyerElement, {
          width: 1080,
          height: 1920,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
        });

        blurBg.style.filter = originalFilter;
        blurBg.style.backgroundImage = originalBgImage;

        // Descargar
        const link = document.createElement("a");
        const flyerTitle = document
          .getElementById("title")
          .textContent.trim()
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");
        const date = new Date().toISOString().slice(0, 10);
        link.download = `${date}_${flyerTitle}_story.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (blurError) {
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError
        );

        await generateWithoutBlur(flyerElement, true);
      }
    } else {
      await generateWithoutBlur(flyerElement, true);
    }
  } else {
    await generateWithoutBlur(flyerElement, true);
  }
});

document.getElementById("saveFlyerFeed").addEventListener("click", async () => {
  const flyerElement = document.getElementById("flyer-feed");
  const blurBg = document.getElementById("flyer-blur-bg-feed");

  if (blurBg && blurBg.style.backgroundImage) {
    const bgImageMatch = blurBg.style.backgroundImage.match(
      /url\(['"]?([^'"]+)['"]?\)/
    );

    if (bgImageMatch) {
      const imageUrl = bgImageMatch[1];

      try {
        const blurredDataUrl = await applyBlurToImage(imageUrl);

        const originalFilter = blurBg.style.filter;
        const originalBgImage = blurBg.style.backgroundImage;

        blurBg.style.filter = "none";
        blurBg.style.backgroundImage = `url('${blurredDataUrl}')`;

        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(flyerElement, {
          width: 1080,
          height: 1080,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
        });

        blurBg.style.filter = originalFilter;
        blurBg.style.backgroundImage = originalBgImage;

        // Descargar
        const link = document.createElement("a");
        const flyerTitle = document
          .getElementById("title")
          .textContent.trim()
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");
        const date = new Date().toISOString().slice(0, 10);
        link.download = `${date}_${flyerTitle}_feed.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (blurError) {
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError
        );

        await generateWithoutBlur(flyerElement, false);
      }
    } else {
      await generateWithoutBlur(flyerElement, false);
    }
  } else {
    await generateWithoutBlur(flyerElement, false);
  }
});

document
  .getElementById("saveFlyerReview")
  .addEventListener("click", async () => {
    const flyerElement = document.getElementById("flyer-story-review");
    const blurBg = document.getElementById("flyer-blur-bg-review");

    if (blurBg && blurBg.style.backgroundImage) {
      const bgImageMatch = blurBg.style.backgroundImage.match(
        /url\(['"]?([^'"]+)['"]?\)/
      );

      if (bgImageMatch) {
        const imageUrl = bgImageMatch[1];

        try {
          const blurredDataUrl = await applyBlurToImage(imageUrl);

          const originalFilter = blurBg.style.filter;
          const originalBgImage = blurBg.style.backgroundImage;

          blurBg.style.filter = "none";
          blurBg.style.backgroundImage = `url('${blurredDataUrl}')`;

          await new Promise((resolve) => setTimeout(resolve, 100));

          const canvas = await html2canvas(flyerElement, {
            width: 1080,
            height: 1920,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
          });

          blurBg.style.filter = originalFilter;
          blurBg.style.backgroundImage = originalBgImage;

          // Descargar
          const link = document.createElement("a");
          const flyerTitle = document
            .getElementById("title")
            .textContent.trim()
            .replace(/\s+/g, "_")
            .replace(/[^\w\-]/g, "");
          const date = new Date().toISOString().slice(0, 10);
          link.download = `${date}_${flyerTitle}_review.png`;
          link.href = canvas.toDataURL("image/png");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (blurError) {
          console.warn(
            "Error al aplicar blur, usando método alternativo:",
            blurError
          );

          await generateWithoutBlur(flyerElement, true);
        }
      } else {
        await generateWithoutBlur(flyerElement, true);
      }
    } else {
      await generateWithoutBlur(flyerElement, true);
    }
  });

document
  .getElementById("saveFlyerReviewFeed")
  .addEventListener("click", async () => {
    const flyerElement = document.getElementById("flyer-feed-review");
    const blurBg = document.getElementById("flyer-blur-bg-review-feed");

    if (blurBg && blurBg.style.backgroundImage) {
      const bgImageMatch = blurBg.style.backgroundImage.match(
        /url\(['"]?([^'"]+)['"]?\)/
      );

      if (bgImageMatch) {
        const imageUrl = bgImageMatch[1];

        try {
          const blurredDataUrl = await applyBlurToImage(imageUrl);

          const originalFilter = blurBg.style.filter;
          const originalBgImage = blurBg.style.backgroundImage;

          blurBg.style.filter = "none";
          blurBg.style.backgroundImage = `url('${blurredDataUrl}')`;

          await new Promise((resolve) => setTimeout(resolve, 100));

          const canvas = await html2canvas(flyerElement, {
            width: 1080,
            height: 1080,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
          });

          blurBg.style.filter = originalFilter;
          blurBg.style.backgroundImage = originalBgImage;

          // Descargar
          const link = document.createElement("a");
          const flyerTitle = document
            .getElementById("title-review-feed")
            .textContent.trim()
            .replace(/\s+/g, "_")
            .replace(/[^\w\-]/g, "");
          const date = new Date().toISOString().slice(0, 10);
          link.download = `${date}_${flyerTitle}_review-feed.png`;
          link.href = canvas.toDataURL("image/png");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (blurError) {
          console.warn(
            "Error al aplicar blur, usando método alternativo:",
            blurError
          );

          await generateWithoutBlur(flyerElement, true);
        }
      } else {
        await generateWithoutBlur(flyerElement, true);
      }
    } else {
      await generateWithoutBlur(flyerElement, true);
    }
  });

async function generateWithoutBlur(flyerElement, isStoryFormat = false) {
  const dimensions = isStoryFormat
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1080 };

  const canvas = await html2canvas(flyerElement, {
    width: dimensions.width,
    height: dimensions.height,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
  });

  const link = document.createElement("a");
  const flyerTitle = document
    .getElementById("title")
    .textContent.trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w\-]/g, "");
  const date = new Date().toISOString().slice(0, 10);
  const formatType = isStoryFormat ? "story" : "feed";
  link.download = `${date}_${flyerTitle}_${formatType}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const floatingColorPicker = document.getElementById("floatingColorPicker");
let colorTargets = [];

floatingColorPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;

  colorTargets.forEach((target) => {
    const isBackground =
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
      target.id === "flyer-feed-review";

    if (isBackground) {
      target.style.backgroundColor = selectedColor;
    } else {
      target.style.color = selectedColor;
    }
  });

  const colorPreview = document.getElementById("floating-color-preview");
  if (colorPreview) colorPreview.style.display = "none";
});

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#ffffff";
  return (
    "#" +
    (
      (1 << 24) +
      (parseInt(result[0]) << 16) +
      (parseInt(result[1]) << 8) +
      parseInt(result[2])
    )
      .toString(16)
      .slice(1)
  );
}

function getColorTargets(el) {
  if (el.classList.contains("rect") || el.classList.contains("rect2")) {
    return [
      document.querySelector(".rect"),
      document.querySelector(".rect2"),
      document.querySelector(".rect-feed"),
      document.querySelector(".rect2-feed"),
      document.querySelector(".rect2-review"),
      document.querySelector(".rect2-review-feed"),
    ];
  }

  if (el.id === "flyer-hour" || el.id === "flyer-biblioteca") {
    return [
      document.getElementById("flyer-hour"),
      document.getElementById("flyer-biblioteca"),
      document.getElementById("flyer-hour-feed"),
      document.getElementById("flyer-biblioteca-feed"),
    ];
  }

  if (el.id === "ciclo") {
    return [
      document.getElementById("ciclo"),
      document.getElementById("ciclo-feed"),
    ];
  }

  if (el.id === "title") {
    return [
      document.getElementById("title"),
      document.getElementById("title-feed"),
      document.getElementById("title-review-feed"),
      document.getElementById("title-review"),
    ];
  }

  if (el.id === "year") {
    return [
      document.getElementById("year"),
      document.getElementById("year-feed"),
      document.getElementById("year-review"),
      document.getElementById("year-review-feed"),
    ];
  }

  if (el.id === "flyer-date") {
    return [
      document.getElementById("flyer-date"),
      document.getElementById("flyer-date-feed"),
    ];
  }

  if (el.id === "director") {
    return [
      document.getElementById("director"),
      document.getElementById("director-feed"),
      document.getElementById("director-review"),
      document.getElementById("director-review-feed"),
    ];
  }

  if (el.id === "duracion") {
    return [
      document.getElementById("duracion"),
      document.getElementById("duracion-feed"),
      document.getElementById("duracion-review"),
      document.getElementById("duracion-review-feed"),
    ];
  }

  if (el.id === "header") {
    return [
      document.getElementById("header"),
      document.getElementById("header-feed"),
      document.getElementById("header-review"),
      document.getElementById("header-review-feed"),
    ];
  }

  if (el.id === "org") {
    return [
      document.getElementById("org"),
      document.getElementById("org-feed"),
      document.getElementById("org-review"),
      document.getElementById("org-review-feed"),
    ];
  }

  if (el.id === "origen-review") {
    return [
      document.getElementById("origen-review"),
      document.getElementById("origen-review-feed"),
    ];
  }

  if (el.id === "sinapsis-review") {
    return [
      document.getElementById("sinapsis-review"),
      document.getElementById("sinapsis-review-feed"),
    ];
  }

  if (el.id === "flyer-story" || el.id === "flyer-feed") {
    return [el];
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

  const isBackground =
    targets[0].classList.contains("rect") ||
    targets[0].classList.contains("rect-feed") ||
    targets[0].classList.contains("rect2") ||
    targets[0].classList.contains("rect2-feed") ||
    targets[0].classList.contains("rect2-review") ||
    targets[0].classList.contains("rect2-review-feed") ||
    targets[0].id === "flyer-story" ||
    targets[0].id === "flyer-feed" ||
    targets[0].id === "flyer-story-review" ||
    targets[0].id === "flyer-feed-review";
  const style = window.getComputedStyle(targets[0]);
  return rgbToHex(isBackground ? style.backgroundColor : style.color);
}

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

  let eyedropperBtn = document.getElementById("floating-eyedropper-btn");
  if (!eyedropperBtn) {
    eyedropperBtn = document.createElement("button");
    eyedropperBtn.id = "floating-eyedropper-btn";
    eyedropperBtn.textContent = "CuentaGotas";
    eyedropperBtn.title = "Seleccionar color del poster";
    eyedropperBtn.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 52px;
      top: 0px;
      width: 150px;
      height: 70px;
      border: 2px solid #333;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 20px;
      display: none;
    `;
    document.body.appendChild(eyedropperBtn);

    eyedropperBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      activateEyedropper((selectedColor) => {
        floatingColorPicker.value = selectedColor;
        floatingColorPicker.dispatchEvent(new Event("input"));
      });
    });
  }

  eyedropperBtn.style.left = event.pageX + 52 + "px";
  eyedropperBtn.style.top = event.pageY + "px";
  eyedropperBtn.style.display = "block";

  let applyLastColorBtn = document.getElementById(
    "apply-last-eyedropper-color-btn"
  );
  if (!applyLastColorBtn) {
    applyLastColorBtn = document.createElement("button");
    applyLastColorBtn.id = "apply-last-eyedropper-color-btn";
    applyLastColorBtn.textContent = "Último color";
    applyLastColorBtn.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 52px;
      top: 80px;
      width: 140px;
      height: 40px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-size: 16px;
      display: none;
    `;
    document.body.appendChild(applyLastColorBtn);
    applyLastColorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.lastEyedropperColor) {
        floatingColorPicker.value = window.lastEyedropperColor;
        floatingColorPicker.dispatchEvent(new Event("input"));
      }
    });
  }

  if (window.lastEyedropperColor) {
    applyLastColorBtn.style.left = event.pageX + 52 + "px";
    applyLastColorBtn.style.top = event.pageY + 80 + "px";
    applyLastColorBtn.style.display = "block";
    applyLastColorBtn.style.background = window.lastEyedropperColor;
    applyLastColorBtn.style.color = "#222";
    applyLastColorBtn.title = window.lastEyedropperColor;
  } else {
    applyLastColorBtn.style.display = "none";
  }

  floatingColorPicker.focus();
}

floatingColorPicker.addEventListener("blur", () => {
  setTimeout(() => {
    floatingColorPicker.style.display = "none";
    const eyedropperBtn = document.getElementById("floating-eyedropper-btn");
    if (eyedropperBtn) eyedropperBtn.style.display = "none";
    const applyLastColorBtn = document.getElementById(
      "apply-last-eyedropper-color-btn"
    );
    if (applyLastColorBtn) applyLastColorBtn.style.display = "none";
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

document.addEventListener("click", (e) => {
  if (
    e.target !== floatingColorPicker &&
    e.target.id !== "floating-eyedropper-btn"
  ) {
    floatingColorPicker.style.display = "none";
    const eyedropperBtn = document.getElementById("floating-eyedropper-btn");
    if (eyedropperBtn) eyedropperBtn.style.display = "none";
    colorTargets = [];

    if (eyedropperActive) {
      eyedropperActive = false;
      eyedropperCallback = null;
      posterImg.style.cursor = "";
      document.body.style.cursor = "";
      const message = document.getElementById("eyedropper-message");
      if (message) message.remove();
    }
  }
});

document.addEventListener("click", (e) => {
  if (
    e.target !== floatingColorPicker &&
    e.target.id !== "floating-eyedropper-btn"
  ) {
    floatingColorPicker.style.display = "none";
    const eyedropperBtn = document.getElementById("floating-eyedropper-btn");
    if (eyedropperBtn) eyedropperBtn.style.display = "none";
    colorTargets = [];

    if (eyedropperActive) {
      eyedropperActive = false;
      eyedropperCallback = null;
      posterFeed.style.cursor = "";
      document.body.style.cursor = "";
      const message = document.getElementById("eyedropper-message");
      if (message) message.remove();
    }
  }
});

const comicBalloon = document.querySelector(".dialogo-comic");
const comicColorPanel = document.getElementById("comicColorPickerPanel");
const comicBgPicker = document.getElementById("comicBgColorPicker");
const comicBorderPicker = document.getElementById("comicBorderColorPicker");
const comicTextPicker = document.getElementById("comicTextColorPicker");
const posterImg = document.getElementById("poster");
const posterFeed = document.getElementById("poster-feed");

let comicEyedropperActive = false;
let comicEyedropperTarget = null;
let lastComicEyedropperColor = null;

function cleanupComicEyedropperEvents() {
  posterImg.removeEventListener("mousemove", comicEyedropperMoveHandler);
  posterFeed.removeEventListener("mousemove", comicEyedropperMoveHandler);
  posterImg.style.cursor = "";
  posterFeed.style.cursor = "";
  document.body.style.cursor = "";

  const comicColorPreview = document.getElementById("comic-color-preview");
  if (comicColorPreview) {
    comicColorPreview.style.display = "none";
  }

  comicEyedropperActive = false;
  comicEyedropperTarget = null;
}

function updateComicLastColorSquare() {
  const lastColorSquare = document.getElementById("comicLastColorSquare");
  if (lastComicEyedropperColor) {
    lastColorSquare.style.background = lastComicEyedropperColor;
    lastColorSquare.style.display = "block";
    lastColorSquare.title = `Último color: ${lastComicEyedropperColor}`;
  } else {
    lastColorSquare.style.display = "none";
  }
}

function comicEyedropperMoveHandler(e) {
  if (!comicEyedropperActive) return;

  let comicColorPreview = document.getElementById("comic-color-preview");
  if (!comicColorPreview) {
    comicColorPreview = document.createElement("div");
    comicColorPreview.id = "comic-color-preview";
    comicColorPreview.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 0px;
      top: 0px;
      width: 48px;
      height: 48px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #fff;
      display: block;
      pointer-events: none;
    `;
    document.body.appendChild(comicColorPreview);
  }

  comicColorPreview.style.display = "block";
  comicColorPreview.style.left = e.pageX + 20 + "px";
  comicColorPreview.style.top = e.pageY - 24 + "px";

  let targetImg = null;
  if (e.target === posterImg || e.currentTarget === posterImg) {
    targetImg = posterImg;
  } else if (e.target === posterFeed || e.currentTarget === posterFeed) {
    targetImg = posterFeed;
  }

  if (!targetImg) {
    const posterImgRect = posterImg.getBoundingClientRect();
    const posterFeedRect = posterFeed.getBoundingClientRect();

    if (
      e.clientX >= posterImgRect.left &&
      e.clientX <= posterImgRect.right &&
      e.clientY >= posterImgRect.top &&
      e.clientY <= posterImgRect.bottom
    ) {
      targetImg = posterImg;
    } else if (
      e.clientX >= posterFeedRect.left &&
      e.clientX <= posterFeedRect.right &&
      e.clientY >= posterFeedRect.top &&
      e.clientY <= posterFeedRect.bottom
    ) {
      targetImg = posterFeed;
    }
  }

  if (
    targetImg &&
    targetImg.naturalWidth &&
    targetImg.naturalHeight &&
    targetImg.src
  ) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = targetImg.naturalWidth;
      canvas.height = targetImg.naturalHeight;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        targetImg,
        0,
        0,
        targetImg.naturalWidth,
        targetImg.naturalHeight
      );

      const rect = targetImg.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(
          Math.round(
            (e.clientX - rect.left) * (targetImg.naturalWidth / rect.width)
          ),
          targetImg.naturalWidth - 1
        )
      );
      const y = Math.max(
        0,
        Math.min(
          Math.round(
            (e.clientY - rect.top) * (targetImg.naturalHeight / rect.height)
          ),
          targetImg.naturalHeight - 1
        )
      );

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
      comicColorPreview.style.background = hex;
    } catch (error) {
      console.warn("Error al obtener color del pixel:", error);
      comicColorPreview.style.background = "#ffffff";
    }
  } else {
    comicColorPreview.style.background = "#ffffff";
  }
}

comicBalloon.addEventListener("click", (event) => {
  const style = window.getComputedStyle(comicBalloon);
  comicBgPicker.value = rgbToHex(style.backgroundColor);
  comicBorderPicker.value = rgbToHex(style.borderColor);
  comicTextPicker.value = rgbToHex(style.color);

  updateComicLastColorSquare();

  comicColorPanel.style.left = event.pageX + "px";
  comicColorPanel.style.top = event.pageY + "px";
  comicColorPanel.style.display = "block";
  event.stopPropagation();
});

document
  .getElementById("comicLastColorSquare")
  .addEventListener("click", (e) => {
    e.stopPropagation();
    if (lastComicEyedropperColor) {
      let contextMenu = document.getElementById("comicColorContextMenu");
      if (!contextMenu) {
        contextMenu = document.createElement("div");
        contextMenu.id = "comicColorContextMenu";
        contextMenu.style.cssText = `
        position: absolute;
        z-index: 10000;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 8px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: none;
      `;

        const options = [
          { text: "Aplicar al fondo", target: comicBgPicker },
          { text: "Aplicar al borde", target: comicBorderPicker },
          { text: "Aplicar al texto", target: comicTextPicker },
        ];

        options.forEach((option) => {
          const menuItem = document.createElement("div");
          menuItem.textContent = option.text;
          menuItem.style.cssText = `
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
        `;
          menuItem.addEventListener("mouseover", () => {
            menuItem.style.background = "#f0f0f0";
          });
          menuItem.addEventListener("mouseout", () => {
            menuItem.style.background = "";
          });
          menuItem.addEventListener("click", (e) => {
            e.stopPropagation();
            option.target.value = lastComicEyedropperColor;
            option.target.dispatchEvent(new Event("input"));
            contextMenu.style.display = "none";
          });
          contextMenu.appendChild(menuItem);
        });

        document.body.appendChild(contextMenu);
      }

      contextMenu.style.left = e.pageX + 5 + "px";
      contextMenu.style.top = e.pageY + 5 + "px";
      contextMenu.style.display = "block";

      setTimeout(() => {
        const closeContextMenu = (e) => {
          if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = "none";
            document.removeEventListener("click", closeContextMenu);
          }
        };
        document.addEventListener("click", closeContextMenu);
      }, 10);
    }
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

comicBgPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  comicBalloon.style.backgroundColor = selectedColor;
  comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${selectedColor} !important; }`;
});

comicBorderPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  comicBalloon.style.borderColor = selectedColor;
  comicTailBorderStyle.textContent = `.comic-tail-border { border-top-color: ${selectedColor} !important; }`;
});

comicTextPicker.addEventListener("input", (e) => {
  comicBalloon.style.color = e.target.value;
});

document
  .getElementById("activateEyedropperBg")
  .addEventListener("click", (e) => {
    cleanupComicEyedropperEvents();

    comicEyedropperActive = true;
    comicEyedropperTarget = comicBgPicker;

    posterImg.style.cursor = "crosshair";
    posterFeed.style.cursor = "crosshair";

    posterImg.addEventListener("mousemove", comicEyedropperMoveHandler);
    posterFeed.addEventListener("mousemove", comicEyedropperMoveHandler);

    e.stopPropagation();
  });
document
  .getElementById("activateEyedropperBorder")
  .addEventListener("click", (e) => {
    cleanupComicEyedropperEvents();

    comicEyedropperActive = true;
    comicEyedropperTarget = comicBorderPicker;
    posterImg.style.cursor = "crosshair";
    posterFeed.style.cursor = "crosshair";

    posterImg.addEventListener("mousemove", comicEyedropperMoveHandler);
    posterFeed.addEventListener("mousemove", comicEyedropperMoveHandler);

    e.stopPropagation();
  });
document
  .getElementById("activateEyedropperText")
  .addEventListener("click", (e) => {
    cleanupComicEyedropperEvents();

    comicEyedropperActive = true;
    comicEyedropperTarget = comicTextPicker;
    posterImg.style.cursor = "crosshair";
    posterFeed.style.cursor = "crosshair";

    posterImg.addEventListener("mousemove", comicEyedropperMoveHandler);
    posterFeed.addEventListener("mousemove", comicEyedropperMoveHandler);

    e.stopPropagation();
  });

posterImg.addEventListener("click", (e) => {
  if (comicEyedropperActive && comicEyedropperTarget && posterImg.src) {
    e.stopPropagation();

    try {
      const canvas = document.createElement("canvas");
      canvas.width = posterImg.naturalWidth;
      canvas.height = posterImg.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        posterImg,
        0,
        0,
        posterImg.naturalWidth,
        posterImg.naturalHeight
      );

      const rect = posterImg.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(
          Math.round(
            (e.clientX - rect.left) * (posterImg.naturalWidth / rect.width)
          ),
          posterImg.naturalWidth - 1
        )
      );
      const y = Math.max(
        0,
        Math.min(
          Math.round(
            (e.clientY - rect.top) * (posterImg.naturalHeight / rect.height)
          ),
          posterImg.naturalHeight - 1
        )
      );
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);

      lastComicEyedropperColor = hex;
      updateComicLastColorSquare();

      comicEyedropperTarget.value = hex;
      comicEyedropperTarget.dispatchEvent(new Event("input"));
    } catch (error) {
      console.warn("Error al obtener color del pixel:", error);
    }

    cleanupComicEyedropperEvents();
    return;
  }
});

posterFeed.addEventListener("click", (e) => {
  if (comicEyedropperActive && comicEyedropperTarget && posterFeed.src) {
    e.stopPropagation();

    try {
      const canvas = document.createElement("canvas");
      canvas.width = posterFeed.naturalWidth;
      canvas.height = posterFeed.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        posterFeed,
        0,
        0,
        posterFeed.naturalWidth,
        posterFeed.naturalHeight
      );

      const rect = posterFeed.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(
          Math.round(
            (e.clientX - rect.left) * (posterFeed.naturalWidth / rect.width)
          ),
          posterFeed.naturalWidth - 1
        )
      );
      const y = Math.max(
        0,
        Math.min(
          Math.round(
            (e.clientY - rect.top) * (posterFeed.naturalHeight / rect.height)
          ),
          posterFeed.naturalHeight - 1
        )
      );
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);

      lastComicEyedropperColor = hex;
      updateComicLastColorSquare();

      comicEyedropperTarget.value = hex;
      comicEyedropperTarget.dispatchEvent(new Event("input"));
    } catch (error) {
      console.warn("Error al obtener color del pixel:", error);
    }

    cleanupComicEyedropperEvents();
    return;
  }
});

document.addEventListener("mousedown", (e) => {
  if (
    comicColorPanel.style.display === "block" &&
    !comicColorPanel.contains(e.target) &&
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

  if (
    comicEyedropperActive &&
    e.target !== posterImg &&
    e.target !== posterFeed &&
    !posterImg.contains(e.target) &&
    !posterFeed.contains(e.target) &&
    !e.target.closest("#comicColorPickerPanel")
  ) {
    cleanupComicEyedropperEvents();
  }
});

let eyedropperActive = false;
let eyedropperColor = null;
let eyedropperCallback = null;

function eyedropperMoveHandler(e) {
  if (!eyedropperActive) return;
  const colorPreview = document.getElementById("floating-color-preview");
  if (!colorPreview) return;
  colorPreview.style.left = e.pageX + 20 + "px";
  colorPreview.style.top = e.pageY - 24 + "px";

  if (posterImg.naturalWidth && posterImg.naturalHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = posterImg.naturalWidth;
    canvas.height = posterImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      posterImg,
      0,
      0,
      posterImg.naturalWidth,
      posterImg.naturalHeight
    );
    const rect = posterImg.getBoundingClientRect();
    const x = Math.round(
      (e.clientX - rect.left) * (posterImg.naturalWidth / rect.width)
    );
    const y = Math.round(
      (e.clientY - rect.top) * (posterImg.naturalHeight / rect.height)
    );
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
    colorPreview.style.background = hex;
  }
}

function eyedropperMoveHandlerFeed(e) {
  if (!eyedropperActive) return;
  const colorPreview = document.getElementById("floating-color-preview");
  if (!colorPreview) return;
  colorPreview.style.left = e.pageX + 20 + "px";
  colorPreview.style.top = e.pageY - 24 + "px";

  if (posterFeed.naturalWidth && posterFeed.naturalHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = posterFeed.naturalWidth;
    canvas.height = posterFeed.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      posterFeed,
      0,
      0,
      posterFeed.naturalWidth,
      posterFeed.naturalHeight
    );
    const rect = posterFeed.getBoundingClientRect();
    const x = Math.round(
      (e.clientX - rect.left) * (posterFeed.naturalWidth / rect.width)
    );
    const y = Math.round(
      (e.clientY - rect.top) * (posterFeed.naturalHeight / rect.height)
    );
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
    colorPreview.style.background = hex;
  }
}

const activateEyedropperBtn = document.getElementById("activateEyedropper");

function activateEyedropper(callback = null) {
  eyedropperActive = true;
  eyedropperCallback = callback;
  posterImg.style.cursor = "crosshair";
  posterFeed.style.cursor = "crosshair";

  let colorPreview = document.getElementById("floating-color-preview");
  if (!colorPreview) {
    colorPreview = document.createElement("div");
    colorPreview.id = "floating-color-preview";
    colorPreview.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 0px;
      top: 0px;
      width: 48px;
      height: 48px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #fff;
      display: block;
      pointer-events: none;
    `;
    document.body.appendChild(colorPreview);
  }
  colorPreview.style.display = "block";
  colorPreview.style.background = "#fff";

  posterImg.addEventListener("mousemove", eyedropperMoveHandler);
  posterFeed.addEventListener("mousemove", eyedropperMoveHandlerFeed);
}

activateEyedropperBtn.addEventListener("click", () => {
  activateEyedropper();
});

posterImg.addEventListener("click", (e) => {
  if (!eyedropperActive || !posterImg.src) return;

  e.stopPropagation();
  e.preventDefault();

  const canvas = document.createElement("canvas");
  canvas.width = posterImg.naturalWidth;
  canvas.height = posterImg.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    posterImg,
    0,
    0,
    posterImg.naturalWidth,
    posterImg.naturalHeight
  );

  const rect = posterImg.getBoundingClientRect();
  const x = Math.round(
    (e.clientX - rect.left) * (posterImg.naturalWidth / rect.width)
  );
  const y = Math.round(
    (e.clientY - rect.top) * (posterImg.naturalHeight / rect.height)
  );
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
  eyedropperColor = hex;

  window.lastEyedropperColor = hex;

  let colorPreview = document.getElementById("floating-color-preview");
  if (colorPreview) {
    colorPreview.style.background = hex;
    colorPreview.style.display = "block";
    colorPreview.style.left = e.pageX + 20 + "px";
    colorPreview.style.top = e.pageY - 24 + "px";
  }

  if (eyedropperCallback) {
    eyedropperCallback(hex);
  } else {
    floatingColorPicker.value = hex;
    floatingColorPicker.dispatchEvent(new Event("input"));
  }

  posterImg.removeEventListener("mousemove", eyedropperMoveHandler);
  setTimeout(() => {
    if (colorPreview) colorPreview.style.display = "none";
  }, 400);

  posterImg.style.cursor = "";
  document.body.style.cursor = "";
  eyedropperActive = false;
  eyedropperCallback = null;
});

posterFeed.addEventListener("click", (e) => {
  if (!eyedropperActive || !posterFeed.src) return;

  e.stopPropagation();
  e.preventDefault();

  const canvas = document.createElement("canvas");
  canvas.width = posterFeed.naturalWidth;
  canvas.height = posterFeed.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    posterFeed,
    0,
    0,
    posterFeed.naturalWidth,
    posterFeed.naturalHeight
  );

  const rect = posterFeed.getBoundingClientRect();
  const x = Math.round(
    (e.clientX - rect.left) * (posterFeed.naturalWidth / rect.width)
  );
  const y = Math.round(
    (e.clientY - rect.top) * (posterFeed.naturalHeight / rect.height)
  );
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
  eyedropperColor = hex;

  window.lastEyedropperColor = hex;

  let colorPreview = document.getElementById("floating-color-preview");
  if (colorPreview) {
    colorPreview.style.background = hex;
    colorPreview.style.display = "block";
    colorPreview.style.left = e.pageX + 20 + "px";
    colorPreview.style.top = e.pageY - 24 + "px";
  }

  if (eyedropperCallback) {
    eyedropperCallback(hex);
  } else {
    floatingColorPicker.value = hex;
    floatingColorPicker.dispatchEvent(new Event("input"));
  }

  posterFeed.removeEventListener("mousemove", eyedropperMoveHandler);
  setTimeout(() => {
    if (colorPreview) colorPreview.style.display = "none";
  }, 400);

  posterFeed.style.cursor = "";
  document.body.style.cursor = "";
  eyedropperActive = false;
  eyedropperCallback = null;
});

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
  .getElementById("flyerDateFontSizeInput")
  .addEventListener("input", (e) => {
    document.getElementById("flyer-date").style.fontSize =
      e.target.value + "px";
    console.log("Aplicado tamaño fecha Story:", e.target.value + "px");
  });

document
  .getElementById("flyerHourFontSizeInput")
  .addEventListener("input", (e) => {
    document.getElementById("flyer-hour").style.fontSize =
      e.target.value + "px";
    console.log("Aplicado tamaño hora Story:", e.target.value + "px");
  });

document
  .getElementById("flyerTitleFontSizeInput")
  .addEventListener("input", (e) => {
    document.getElementById("title").style.fontSize = e.target.value + "px";
  });

document
  .getElementById("flyerTitleMarginTopInput")
  .addEventListener("input", (e) => {
    document.querySelector(".flyer-main-group").style.marginTop =
      e.target.value + "px";
  });

document
  .getElementById("flyerTitleFontSizeInputReview")
  .addEventListener("input", (e) => {
    document.getElementById("title-review").style.fontSize =
      e.target.value + "px";
  });

document
  .getElementById("flyerDateFontSizeInputFeed")
  .addEventListener("input", (e) => {
    document.getElementById("flyer-date-feed").style.fontSize =
      e.target.value + "px";
    console.log("Aplicado tamaño fecha Feed:", e.target.value + "px");
  });

document
  .getElementById("flyerTitleFontSizeInputFeed")
  .addEventListener("input", (e) => {
    document.getElementById("title-feed").style.fontSize =
      e.target.value + "px";
  });

document
  .getElementById("flyerYearFontSizeInputFeed")
  .addEventListener("input", (e) => {
    document.getElementById("year-feed").style.fontSize = e.target.value + "px";
  });

document
  .getElementById("flyerSynopsisFontSizeInput")
  .addEventListener("input", (e) => {
    document.getElementById("sinapsis-review-feed").style.fontSize =
      e.target.value + "px";
  });

document
  .getElementById("flyerSynopsisFontSizeInputStory")
  .addEventListener("input", (e) => {
    document.getElementById("sinapsis-review").style.fontSize =
      e.target.value + "px";
  });

document
  .getElementById("flyerHourFontSizeInputFeed")
  .addEventListener("input", (e) => {
    document.getElementById("flyer-hour-feed").style.fontSize =
      e.target.value + "px";
    console.log("Aplicado tamaño hora Feed:", e.target.value + "px");
  });

document.getElementById("rectWidthInputFeed").addEventListener("input", (e) => {
  document.querySelector(".rect-feed").style.width = e.target.value + "px";
});

document.getElementById("rectWidthInput").addEventListener("input", (e) => {
  document.querySelector(".rect").style.width = e.target.value + "px";
});

document.getElementById("applyTxtBtn").addEventListener("click", () => {
  const ciclo = document.getElementById("cicloInput").value.trim();
  const dateRaw = document.getElementById("dateInput").value.trim();
  const hourRaw = document.getElementById("hourInput").value.trim();
  const titulo = document.getElementById("titleInput").value.trim();

  document.getElementById("dateInputFeed").value = dateRaw;
  document.getElementById("dateInput").value = dateRaw;

  document.getElementById("hourInputFeed").value = hourRaw;
  document.getElementById("hourInput").value = hourRaw;

  const edadSugerida = document
    .getElementById("edadSugeridaInput")
    .value.trim();

  document.getElementById("title").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("title-feed").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("title-review").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("title-review-feed").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("titleInputReview").value = titulo;
  document.getElementById("titleInput").value = titulo;
  document.getElementById("titleInputFeed").value = titulo;
  document.getElementById("titleInputReviewFeed").value = titulo;

  document.getElementById("ciclo").textContent = ciclo || "Ciclo";
  document.getElementById("ciclo-feed").textContent = ciclo || "Ciclo";

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
      document.getElementById("edadSugeridaInput").value = mappedCertification;
      document.getElementById("edad-sugerida").textContent =
        mappedCertification;
      document.getElementById("edad-sugerida-feed").textContent =
        mappedCertification;
      document.getElementById("edad-sugerida-review").textContent =
        mappedCertification;
      document.getElementById("edad-sugerida-review-feed").textContent =
        mappedCertification;
      document.getElementById("edadSugeridaInputFeed").value =
        mappedCertification;
      document.getElementById("edadSugeridaInputReview").value =
        mappedCertification;
      document.getElementById("edadSugeridaInputReviewFeed").value =
        mappedCertification;
    } else {
      edadSugeridaElement.style.display = "none";
    }

    const edadElements = [
      document.getElementById("edad-sugerida"),
      document.getElementById("edad-sugerida-feed"),
      document.getElementById("edad-sugerida-review"),
      document.getElementById("edad-sugerida-review-feed"),
    ];

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

  const formattedDate = formatDateToSpanish(dateRaw);
  document.getElementById("flyer-date").innerHTML = formattedDate;
  document.getElementById("flyer-date-feed").innerHTML = formattedDate;

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";
  document.getElementById("flyer-hour").textContent = formattedHour;
  document.getElementById("flyer-hour-feed").textContent = formattedHour;
});

document.getElementById("applyTxtBtnFeed").addEventListener("click", () => {
  const ciclo = document.getElementById("cicloInputFeed").value.trim();
  const dateRaw = document.getElementById("dateInputFeed").value.trim();
  const hourRaw = document.getElementById("hourInputFeed").value.trim();
  const titulo = document.getElementById("titleInputFeed").value.trim();
  const edadSugerida = document
    .getElementById("edadSugeridaInputFeed")
    .value.trim();

  document.getElementById("dateInputFeed").value = dateRaw;
  document.getElementById("dateInput").value = dateRaw;

  document.getElementById("hourInputFeed").value = hourRaw;
  document.getElementById("hourInput").value = hourRaw;

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
      document.getElementById("edadSugeridaInput").value = mappedCertification;
      document.getElementById("edad-sugerida").textContent =
        mappedCertification;
      document.getElementById("edad-sugerida-feed").textContent =
        mappedCertification;
      document.getElementById("edad-sugerida-review").textContent =
        mappedCertification;
      document.getElementById("edad-sugerida-review-feed").textContent =
        mappedCertification;
      document.getElementById("edadSugeridaInputFeed").value =
        mappedCertification;
      document.getElementById("edadSugeridaInputReview").value =
        mappedCertification;
      document.getElementById("edadSugeridaInputReviewFeed").value =
        mappedCertification;
    } else {
      edadSugeridaElement.style.display = "none";
    }

    const edadElements = [
      document.getElementById("edad-sugerida"),
      document.getElementById("edad-sugerida-feed"),
      document.getElementById("edad-sugerida-review"),
      document.getElementById("edad-sugerida-review-feed"),
    ];

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

  const formattedDate = formatDateToSpanish(dateRaw);

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";

  const flyerFeed = document.getElementById("flyer-feed");
  if (flyerFeed) {
    flyerFeed.querySelector("#title-feed").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("title").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    flyerFeed.querySelector("#ciclo-feed").textContent = ciclo || "Ciclo";
    document.getElementById("ciclo").textContent = ciclo || "Ciclo";
    flyerFeed.querySelector("#flyer-date-feed").innerHTML = formattedDate;
    document.getElementById("flyer-date").innerHTML = formattedDate;
    flyerFeed.querySelector("#flyer-hour-feed").textContent = formattedHour;
    document.getElementById("flyer-hour").textContent = formattedHour;
  }
});

document.getElementById("applyTxtBtnReview").addEventListener("click", () => {
  const titulo = document.getElementById("titleInputReview").value.trim();
  const sinapsis = document.getElementById("sinapsisInputReview").value.trim();
  const edadSugerida = document
    .getElementById("edadSugeridaInputReview")
    .value.trim();

  document.getElementById("title").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("title-feed").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("title-review").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("title-review-feed").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("titleInputReview").value = titulo;
  document.getElementById("titleInput").value = titulo;
  document.getElementById("titleInputFeed").value = titulo;
  document.getElementById("titleInputReviewFeed").value = titulo;

  const flyerReview = document.getElementById("flyer-story-review");
  if (flyerReview) {
    flyerReview.querySelector("#sinapsis-review").innerHTML = (
      sinapsis || "Sinopsis de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("sinapsisInputReview").value = sinapsis;

    document.getElementById("sinapsis-review-feed").innerHTML = (
      sinapsis || "Sinopsis de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("sinapsisInputReviewFeed").value = sinapsis;

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
        document.getElementById("edadSugeridaInput").value =
          mappedCertification;
        document.getElementById("edad-sugerida").textContent =
          mappedCertification;
        document.getElementById("edad-sugerida-feed").textContent =
          mappedCertification;
        document.getElementById("edad-sugerida-review").textContent =
          mappedCertification;
        document.getElementById("edad-sugerida-review-feed").textContent =
          mappedCertification;
        document.getElementById("edadSugeridaInputFeed").value =
          mappedCertification;
        document.getElementById("edadSugeridaInputReview").value =
          mappedCertification;
        document.getElementById("edadSugeridaInputReviewFeed").value =
          mappedCertification;
      } else {
        edadSugeridaElement.style.display = "none";
      }

      const edadElements = [
        document.getElementById("edad-sugerida"),
        document.getElementById("edad-sugerida-feed"),
        document.getElementById("edad-sugerida-review"),
        document.getElementById("edad-sugerida-review-feed"),
      ];

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
  }
});

document
  .getElementById("applyTxtBtnReviewFeed")
  .addEventListener("click", () => {
    const titulo = document.getElementById("titleInputReviewFeed").value.trim();
    const sinapsis = document
      .getElementById("sinapsisInputReviewFeed")
      .value.trim();
    const edadSugerida = document
      .getElementById("edadSugeridaInputReviewFeed")
      .value.trim();

    document.getElementById("title").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("title-feed").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("title-review").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("title-review-feed").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    document.getElementById("titleInputReview").value = titulo;
    document.getElementById("titleInput").value = titulo;
    document.getElementById("titleInputFeed").value = titulo;
    document.getElementById("titleInputReviewFeed").value = titulo;

    const flyerReview = document.getElementById("flyer-feed-review");
    if (flyerReview) {
      flyerReview.querySelector("#sinapsis-review-feed").innerHTML = (
        sinapsis || "Sinopsis de la película"
      ).replace(/\n/g, "<br>");

      document.getElementById("sinapsisInputReview").value = sinapsis;

      document.getElementById("sinapsis-review").innerHTML = (
        sinapsis || "Sinopsis de la película"
      ).replace(/\n/g, "<br>");
      document.getElementById("sinapsisInputReviewFeed").value = sinapsis;

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

      const mappedCertification =
        certificationMap[edadSugerida] || edadSugerida;

      if (mappedCertification) {
        if (edadSugerida) {
          document.getElementById("edadSugeridaInput").value =
            mappedCertification;
          document.getElementById("edad-sugerida").textContent =
            mappedCertification;
          document.getElementById("edad-sugerida-feed").textContent =
            mappedCertification;
          document.getElementById("edad-sugerida-review").textContent =
            mappedCertification;
          document.getElementById("edad-sugerida-review-feed").textContent =
            mappedCertification;
          document.getElementById("edadSugeridaInputFeed").value =
            mappedCertification;
          document.getElementById("edadSugeridaInputReview").value =
            mappedCertification;
          document.getElementById("edadSugeridaInputReviewFeed").value =
            mappedCertification;
        } else {
          edadSugeridaElement.style.display = "none";
        }

        const edadElements = [
          document.getElementById("edad-sugerida"),
          document.getElementById("edad-sugerida-feed"),
          document.getElementById("edad-sugerida-review"),
          document.getElementById("edad-sugerida-review-feed"),
        ];

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
    }
  });

// TABS

document.getElementById("tab-story").addEventListener("click", () => {
  document.getElementById("flyer-story").style.display = "block";
  document.getElementById("flyer-story-review").style.display = "flex";
  document.getElementById("flyer-feed").style.display = "none";
  document.getElementById("flyer-feed-review").style.display = "none";
  document.getElementById("tab-story").classList.add("active");
  document.getElementById("tab-feed").classList.remove("active");
  document.getElementById("saveFlyer").style.display = "block";
  document.getElementById("saveFlyerFeed").style.display = "none";
  document.getElementById("saveFlyerReview").style.display = "block";
  document.getElementById("saveFlyerReviewFeed").style.display = "none";
  document.querySelector(".panel-feed").style.display = "none";
  document.querySelector(".panel-review").style.display = "flex";
  document.querySelector(".panel-review-feed").style.display = "none";
  document.querySelector(".panel").style.display = "flex";
});

document.getElementById("tab-feed").addEventListener("click", () => {
  document.getElementById("flyer-story").style.display = "none";
  document.getElementById("flyer-feed").style.display = "block";
  document.getElementById("flyer-story-review").style.display = "none";
  document.getElementById("flyer-feed-review").style.display = "flex";
  document.getElementById("tab-feed").classList.add("active");
  document.getElementById("tab-story").classList.remove("active");
  document.getElementById("saveFlyerFeed").style.display = "block";
  document.getElementById("saveFlyer").style.display = "none";
  document.getElementById("saveFlyerReview").style.display = "none";
  document.getElementById("saveFlyerReviewFeed").style.display = "block";
  document.querySelector(".panel-feed").style.display = "flex";
  document.querySelector(".panel-review").style.display = "none";
  document.querySelector(".panel-review-feed").style.display = "flex";
  document.querySelector(".panel").style.display = "none";
});

document.getElementById("applyStrokeBtn").addEventListener("click", () => {
  const strokeIdMap = {
    header: ["header", "header-feed", "header-review", "header-review-feed"],
    title: ["title", "title-feed", "title-review", "title-review-feed"],
    year: ["year", "year-feed", "year-review", "year-review-feed"],
    director: [
      "director",
      "director-feed",
      "director-review",
      "director-review-feed",
    ],
    duracion: [
      "duracion",
      "duracion-feed",
      "duracion-review",
      "duracion-review-feed",
    ],
    "flyer-date": ["flyer-date", "flyer-date-feed"],
    "flyer-hour": ["flyer-hour", "flyer-hour-feed"],
    "flyer-biblioteca": ["flyer-biblioteca", "flyer-biblioteca-feed"],
  };
  const select = document.getElementById("strokeTargetSelect");
  const color = document.getElementById("strokeColorInput").value;
  Array.from(select.selectedOptions).forEach((option) => {
    const ids = strokeIdMap[option.value] || [option.value];
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

document.getElementById("removeStrokeBtn").addEventListener("click", () => {
  const select = document.getElementById("strokeTargetSelect");
  Array.from(select.selectedOptions).forEach((option) => {
    const target = document.getElementById(option.value);
    if (target) {
      target.style.textShadow = "";
    }
  });
});

document.getElementById("applyStrokeBtnFeed").addEventListener("click", () => {
  const select = document.getElementById("strokeTargetSelectFeed");
  const color = document.getElementById("strokeColorInputFeed").value;
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

document.getElementById("removeStrokeBtnFeed").addEventListener("click", () => {
  const select = document.getElementById("strokeTargetSelectFeed");
  Array.from(select.selectedOptions).forEach((option) => {
    const target = document.getElementById(option.value);
    if (target) {
      target.style.textShadow = "";
    }
  });
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

document
  .getElementById("applyStrokeBtnReviewFeed")
  .addEventListener("click", () => {
    const select = document.getElementById("strokeTargetSelectReviewFeed");
    const color = document.getElementById("strokeColorInputReviewFeed").value;
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

document
  .getElementById("removeStrokeBtnReviewFeed")
  .addEventListener("click", () => {
    const select = document.getElementById("strokeTargetSelectReviewFeed");
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
      title: document.getElementById("title").textContent,
      year: document.getElementById("year").textContent,
      director: document.getElementById("director").textContent,
      duration: document.getElementById("duracion").textContent,
      synopsis: {
        story: document.getElementById("sinapsis-review").textContent,
        feed: document.getElementById("sinapsis-review-feed").textContent,
      },
      origin: {
        story: document.getElementById("origen-review").textContent,
        feed: document.getElementById("origen-review-feed").textContent,
      },
      posterUrl: document.getElementById("poster").src,
      ageRating: document.getElementById("edad-sugerida").textContent,
    },

    formData: {
      ciclo: document.getElementById("cicloInput").value,
      date: document.getElementById("dateInput").value,
      hour: document.getElementById("hourInput").value,
      title: document.getElementById("titleInput").value,
      ageRating: document.getElementById("edadSugeridaInput").value,

      cicloFeed: document.getElementById("cicloInputFeed").value,
      dateFeed: document.getElementById("dateInputFeed").value,
      hourFeed: document.getElementById("hourInputFeed").value,
      titleFeed: document.getElementById("titleInputFeed").value,
      ageRatingFeed: document.getElementById("edadSugeridaInputFeed").value,
      titleReview: document.getElementById("titleInputReview").value,
      synopsisReview: document.getElementById("sinapsisInputReview").value,
      ageRatingReview: document.getElementById("edadSugeridaInputReview").value,
      titleReviewFeed: document.getElementById("titleInputReviewFeed").value,
      synopsisReviewFeed: document.getElementById("sinapsisInputReviewFeed")
        .value,
      ageRatingReviewFeed: document.getElementById(
        "edadSugeridaInputReviewFeed"
      ).value,
    },

    designSettings: {
      fontSizes: {
        flyerDate: document.getElementById("flyerDateFontSizeInput").value,
        flyerHour: document.getElementById("flyerHourFontSizeInput").value,
        flyerTitle: document.getElementById("flyerTitleFontSizeInput").value,
        flyerTitleMarginTop: document.getElementById("flyerTitleMarginTopInput")
          .value,
        flyerTitleFeed: document.getElementById("flyerTitleFontSizeInputFeed")
          .value,
        flyerYearFeed: document.getElementById("flyerYearFontSizeInputFeed")
          .value,
        flyerDateFeed: document.getElementById("flyerDateFontSizeInputFeed")
          .value,
        flyerHourFeed: document.getElementById("flyerHourFontSizeInputFeed")
          .value,
        flyerTitleReview: document.getElementById(
          "flyerTitleFontSizeInputReview"
        ).value,
        flyerSynopsisStory: document.getElementById(
          "flyerSynopsisFontSizeInputStory"
        ).value,
        flyerSynopsisFeed: document.getElementById("flyerSynopsisFontSizeInput")
          .value,
      },

      dimensions: {
        rectWidth: document.getElementById("rectWidthInput").value,
        rectWidthFeed: document.getElementById("rectWidthInputFeed").value,
      },

      rectHidden: rectHidden,
      colors: colors,
      textStrokes: strokes,
    },

    images: {
      currentBackdrop: currentBackdrop,
      currentPoster: currentPoster,
      backdrops: backdrops.slice(0, 10),
      posters: posters.slice(0, 10),

      backgroundImages: {
        story: extractBackgroundImage("flyer-blur-bg-story"),
        feed: extractBackgroundImage("flyer-blur-bg-feed"),
        review: extractBackgroundImage("flyer-blur-bg-review"),
        reviewFeed: extractBackgroundImage("flyer-blur-bg-review-feed"),
      },
    },

    comicBalloon: {
      backgroundColor:
        document.querySelector(".dialogo-comic").style.backgroundColor || "",
      borderColor:
        document.querySelector(".dialogo-comic").style.borderColor || "",
      color: document.querySelector(".dialogo-comic").style.color || "",
      tailBackgroundColor: extractComicTailColor("comic-tail-bg-style"),
      tailBorderColor: extractComicTailColor("comic-tail-border-style"),
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
  const filename = `${movieTitle}_datos_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("Datos exportados exitosamente:", filename);
}

function extractElementColors() {
  const elements = [
    "header",
    "header-feed",
    "header-review",
    "header-review-feed",
    "title",
    "title-feed",
    "title-review",
    "title-review-feed",
    "year",
    "year-feed",
    "year-review",
    "year-review-feed",
    "director",
    "director-feed",
    "director-review",
    "director-review-feed",
    "duracion",
    "duracion-feed",
    "duracion-review",
    "duracion-review-feed",
    "flyer-date",
    "flyer-date-feed",
    "flyer-hour",
    "flyer-hour-feed",
    "flyer-biblioteca",
    "flyer-biblioteca-feed",
    "org",
    "org-feed",
    "org-review",
    "org-review-feed",
    "ciclo",
    "ciclo-feed",
    "sinapsis-review",
    "sinapsis-review-feed",
    "origen-review",
    "origen-review-feed",
  ];

  const colors = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      colors[id] = {
        color: element.style.color || "",
        backgroundColor: element.style.backgroundColor || "",
      };
    }
  });

  const strokes = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element && element.style.textShadow) {
      strokes[id] = element.style.textShadow;
    }
  });

  const classElements = [
    { selector: ".rect", name: "rect" },
    { selector: ".rect-feed", name: "rect-feed" },
    { selector: ".rect2", name: "rect2" },
    { selector: ".rect2-feed", name: "rect2-feed" },
    { selector: ".rect2-review", name: "rect2-review" },
    { selector: ".rect2-review-feed", name: "rect2-review-feed" },
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
    const bgImage = element.style.backgroundImage;
    const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    return match ? match[1] : "";
  }
  return "";
}

function extractComicTailColor(styleElementId) {
  const styleElement = document.getElementById(styleElementId);
  if (styleElement && styleElement.textContent) {
    const colorMatch = styleElement.textContent.match(
      /border-top-color:\s*([^;\s]+)/
    );
    return colorMatch ? colorMatch[1].trim() : "";
  }
  return "";
}

function importUserData(file) {
  if (file.size > 10 * 1024 * 1024) {
    alert("El archivo es demasiado grande. El tamaño max: 10MB");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      let userData;

      try {
        userData = JSON.parse(e.target.result);
      } catch (parseError) {
        throw new Error("El archivo no contiene JSON válido.");
      }
      const validatedData = validateUserData(userData);

      console.log("Importando datos de usuario:", validatedData);

      try {
        restoreMovieData(validatedData.selectedMovie);
        restoreFormData(validatedData.formData);
        restoreDesignSettings(validatedData.designSettings);
        restoreImages(validatedData.images);
        restoreComicBalloon(validatedData.comicBalloon);
      } catch (restoreError) {
        console.error("Error durante la restauración:", restoreError);
      }
    } catch (error) {
      console.error("Error al importar datos:", error);
    }
  };

  reader.onerror = function () {
    alert("Error al leer el archivo. Por favor intenta de nuevo.");
  };

  reader.readAsText(file);
}

function validateUserData(userData) {
  try {
    if (!userData || typeof userData !== "object") {
      throw new Error("El archivo no contiene un objeto JSON válido");
    }

    if (!userData.version) {
      throw new Error(
        "El archivo no tiene información de versión. Puede ser un archivo incompatible"
      );
    }

    if (!userData.selectedMovie || typeof userData.selectedMovie !== "object") {
      throw new Error("Faltan datos de la película seleccionada");
    }

    if (!userData.formData || typeof userData.formData !== "object") {
      throw new Error("Faltan datos de formularios");
    }

    if (
      userData.selectedMovie.posterUrl &&
      userData.selectedMovie.posterUrl !== ""
    ) {
      if (!isValidUrl(userData.selectedMovie.posterUrl)) {
        console.warn("URL de poster no válida, se omitirá");
        userData.selectedMovie.posterUrl = "";
      }
    }

    if (userData.images.backgroundImages) {
      Object.keys(userData.images.backgroundImages).forEach((key) => {
        const url = userData.images.backgroundImages[key];
        if (url && !isValidUrl(url)) {
          console.warn(
            `URL de imagen de fondo no válida para ${key}, se omitirá`
          );
          userData.images.backgroundImages[key] = "";
        }
      });
    }

    if (
      userData.images.backdrops &&
      !Array.isArray(userData.images.backdrops)
    ) {
      console.warn("Array de backdrops no válido, se inicializará vacío");
      userData.images.backdrops = [];
    }

    if (userData.images.posters && !Array.isArray(userData.images.posters)) {
      console.warn("Array de posters no válido, se inicializará vacío");
      userData.images.posters = [];
    }

    userData = sanitizeUserData(userData);

    return userData;
  } catch (error) {
    throw new Error("Validación falló: " + error.message);
  }
}

function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeUserData(userData) {
  function sanitizeString(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }

  if (userData.selectedMovie) {
    ["title", "director", "duration"].forEach((field) => {
      if (userData.selectedMovie[field]) {
        userData.selectedMovie[field] = sanitizeString(
          userData.selectedMovie[field]
        );
      }
    });

    if (userData.selectedMovie.synopsis) {
      ["story", "feed"].forEach((field) => {
        if (userData.selectedMovie.synopsis[field]) {
          userData.selectedMovie.synopsis[field] = sanitizeString(
            userData.selectedMovie.synopsis[field]
          );
        }
      });
    }

    if (userData.selectedMovie.origin) {
      ["story", "feed"].forEach((field) => {
        if (userData.selectedMovie.origin[field]) {
          userData.selectedMovie.origin[field] = sanitizeString(
            userData.selectedMovie.origin[field]
          );
        }
      });
    }
  }

  if (userData.formData) {
    Object.keys(userData.formData).forEach((key) => {
      if (typeof userData.formData[key] === "string") {
        userData.formData[key] = sanitizeString(userData.formData[key]);
      }
    });
  }

  return userData;
}

function restoreMovieData(movieData) {
  if (!movieData) return;

  if (movieData.id) {
    window.selectedMovieId = movieData.id;
  }

  if (movieData.title) {
    document.getElementById("title").innerHTML = movieData.title.replace(
      /\n/g,
      "<br>"
    );
    document.getElementById("title-feed").innerHTML = movieData.title.replace(
      /\n/g,
      "<br>"
    );
    document.getElementById("title-review").innerHTML = movieData.title.replace(
      /\n/g,
      "<br>"
    );
    document.getElementById("title-review-feed").innerHTML =
      movieData.title.replace(/\n/g, "<br>");
  }

  if (movieData.year) {
    document.getElementById("year").textContent = movieData.year;
    document.getElementById("year-feed").textContent = movieData.year;
    document.getElementById("year-review").textContent = movieData.year;
    document.getElementById("year-review-feed").textContent = movieData.year;
  }

  if (movieData.director) {
    document.getElementById("director").textContent = movieData.director;
    document.getElementById("director-feed").textContent = movieData.director;
    document.getElementById("director-review").textContent = movieData.director;
    document.getElementById("director-review-feed").textContent =
      movieData.director;
  }

  if (movieData.duration) {
    document.getElementById("duracion").textContent = movieData.duration;
    document.getElementById("duracion-feed").textContent = movieData.duration;
    document.getElementById("duracion-review").textContent = movieData.duration;
    document.getElementById("duracion-review-feed").textContent =
      movieData.duration;
  }

  if (movieData.synopsis) {
    if (movieData.synopsis.story) {
      document.getElementById("sinapsis-review").innerHTML =
        movieData.synopsis.story.replace(/\n/g, "<br>");
    }
    if (movieData.synopsis.feed) {
      document.getElementById("sinapsis-review-feed").innerHTML =
        movieData.synopsis.feed.replace(/\n/g, "<br>");
    }
  }

  if (movieData.origin) {
    if (movieData.origin.story) {
      document.getElementById("origen-review").textContent =
        movieData.origin.story;
    }
    if (movieData.origin.feed) {
      document.getElementById("origen-review-feed").textContent =
        movieData.origin.feed;
    }
  }

  if (movieData.posterUrl && movieData.posterUrl !== "") {
    setPoster(movieData.posterUrl);
  }

  if (movieData.ageRating) {
    const edadElements = [
      document.getElementById("edad-sugerida"),
      document.getElementById("edad-sugerida-feed"),
      document.getElementById("edad-sugerida-review"),
      document.getElementById("edad-sugerida-review-feed"),
    ];

    edadElements.forEach((el) => {
      if (el) {
        el.textContent = movieData.ageRating;
        el.style.display = "inline-block";

        if (movieData.ageRating === "ATP") {
          el.style.backgroundColor = "#4CAF50";
          el.style.color = "white";
        } else if (
          movieData.ageRating === "+13" ||
          movieData.ageRating === "SAM 13"
        ) {
          el.style.backgroundColor = "#2196F3";
          el.style.color = "white";
        } else if (
          movieData.ageRating === "+16" ||
          movieData.ageRating === "SAM 16"
        ) {
          el.style.backgroundColor = "#FF9800";
          el.style.color = "white";
        } else if (
          movieData.ageRating === "+18" ||
          movieData.ageRating === "SAM 18"
        ) {
          el.style.backgroundColor = "#f44336";
          el.style.color = "white";
        } else {
          el.style.backgroundColor = "#777";
          el.style.color = "white";
        }
      }
    });
  }
}

function restoreFormData(formData) {
  if (!formData) return;

  const formFields = [
    { id: "cicloInput", value: formData.ciclo },
    { id: "dateInput", value: formData.date },
    { id: "hourInput", value: formData.hour },
    { id: "titleInput", value: formData.title },
    { id: "edadSugeridaInput", value: formData.ageRating },
    { id: "cicloInputFeed", value: formData.cicloFeed },
    { id: "dateInputFeed", value: formData.dateFeed },
    { id: "hourInputFeed", value: formData.hourFeed },
    { id: "titleInputFeed", value: formData.titleFeed },
    { id: "edadSugeridaInputFeed", value: formData.ageRatingFeed },
    { id: "titleInputReview", value: formData.titleReview },
    { id: "sinapsisInputReview", value: formData.synopsisReview },
    { id: "edadSugeridaInputReview", value: formData.ageRatingReview },
    { id: "titleInputReviewFeed", value: formData.titleReviewFeed },
    { id: "sinapsisInputReviewFeed", value: formData.synopsisReviewFeed },
    { id: "edadSugeridaInputReviewFeed", value: formData.ageRatingReviewFeed },
  ];

  formFields.forEach((field) => {
    if (field.value !== undefined && field.value !== null) {
      const element = document.getElementById(field.id);
      if (element) {
        element.value = field.value;
      }
    }
  });

  if (formData.ciclo) {
    document.getElementById("ciclo").textContent = formData.ciclo;
    document.getElementById("ciclo-feed").textContent = formData.ciclo;
  }

  if (formData.date) {
    const formattedDate = formatDateToSpanish(formData.date);
    document.getElementById("flyer-date").innerHTML = formattedDate;
    document.getElementById("flyer-date-feed").innerHTML = formattedDate;
  }

  if (formData.hour) {
    const formattedHour = `${formData.hour} HS`;
    document.getElementById("flyer-hour").textContent = formattedHour;
    document.getElementById("flyer-hour-feed").textContent = formattedHour;
  }
}

function formatDateToSpanish(dateStr) {
  if (!dateStr) return "";
  const dias = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
  ];
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const [year, month, day] = dateStr.split("-");
  const d = new Date(year, month - 1, day);
  if (isNaN(d)) return dateStr;
  return `${dias[d.getDay()]} ${d.getDate()} DE ${meses[d.getMonth()]}`;
}

function restoreDesignSettings(designSettings) {
  if (!designSettings) return;

  if (designSettings.colors) {
    Object.keys(designSettings.colors).forEach((elementKey) => {
      const colorData = designSettings.colors[elementKey];
      let element;

      if (
        elementKey.startsWith(".") ||
        [
          "rect",
          "rect-feed",
          "rect2",
          "rect2-feed",
          "rect2-review",
          "rect2-review-feed",
          "tape",
        ].includes(elementKey)
      ) {
        const selector = elementKey.startsWith(".")
          ? elementKey
          : `.${elementKey}`;
        element = document.querySelector(selector);
      } else {
        element = document.getElementById(elementKey);
      }

      if (element && colorData) {
        if (colorData.color) element.style.color = colorData.color;
        if (colorData.backgroundColor)
          element.style.backgroundColor = colorData.backgroundColor;
      }
    });
  }

  if (designSettings.fontSizes) {
    const fontSizeFields = [
      {
        id: "flyerDateFontSizeInput",
        value: designSettings.fontSizes.flyerDate,
      },
      {
        id: "flyerHourFontSizeInput",
        value: designSettings.fontSizes.flyerHour,
      },
      {
        id: "flyerTitleFontSizeInput",
        value: designSettings.fontSizes.flyerTitle,
      },
      {
        id: "flyerTitleMarginTopInput",
        value: designSettings.fontSizes.flyerTitleMarginTop,
      },
      {
        id: "flyerTitleFontSizeInputFeed",
        value: designSettings.fontSizes.flyerTitleFeed,
      },
      {
        id: "flyerYearFontSizeInputFeed",
        value: designSettings.fontSizes.flyerYearFeed,
      },
      {
        id: "flyerDateFontSizeInputFeed",
        value: designSettings.fontSizes.flyerDateFeed,
      },
      {
        id: "flyerHourFontSizeInputFeed",
        value: designSettings.fontSizes.flyerHourFeed,
      },
      {
        id: "flyerTitleFontSizeInputReview",
        value: designSettings.fontSizes.flyerTitleReview,
      },
      {
        id: "flyerSynopsisFontSizeInputStory",
        value: designSettings.fontSizes.flyerSynopsisStory,
      },
      {
        id: "flyerSynopsisFontSizeInput",
        value: designSettings.fontSizes.flyerSynopsisFeed,
      },
    ];

    fontSizeFields.forEach((field) => {
      if (
        field.value !== undefined &&
        field.value !== null &&
        field.value !== ""
      ) {
        const element = document.getElementById(field.id);
        if (element) {
          console.log(`Restaurando ${field.id}: ${field.value}px`);
          element.value = field.value;
          element.dispatchEvent(new Event("input"));

          setTimeout(() => {
            console.log(
              `Verificación ${field.id}: valor=${element.value}, aplicado=${element.value}px`
            );
          }, 50);
        } else {
          console.warn(`No se encontró el elemento: ${field.id}`);
        }
      }
    });
  }

  if (designSettings.dimensions) {
    if (designSettings.dimensions.rectWidth) {
      const rectWidthInput = document.getElementById("rectWidthInput");
      if (rectWidthInput) {
        rectWidthInput.value = designSettings.dimensions.rectWidth;
        rectWidthInput.dispatchEvent(new Event("input"));
      }
    }
    if (designSettings.dimensions.rectWidthFeed) {
      const rectWidthFeedInput = document.getElementById("rectWidthInputFeed");
      if (rectWidthFeedInput) {
        rectWidthFeedInput.value = designSettings.dimensions.rectWidthFeed;
        rectWidthFeedInput.dispatchEvent(new Event("input"));
      }
    }
  }

  if (designSettings.rectHidden !== undefined) {
    rectHidden = designSettings.rectHidden;
    const rect = document.querySelector(".rect");
    const rectFeed = document.querySelector(".rect-feed");
    const toggleBtn = document.getElementById("toggle-rect");

    if (rect && rectFeed && toggleBtn) {
      rect.style.display = rectHidden ? "none" : "block";
      rectFeed.style.display = rectHidden ? "none" : "block";
      toggleBtn.textContent = rectHidden
        ? "Mostrar rectángulo vertical"
        : "Ocultar rectángulo vertical";
    }
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
      currentBackdrop = Math.min(
        imagesData.currentBackdrop,
        backdrops.length - 1
      );
    }
    if (backdrops.length > 0) {
      showBackdrop(currentBackdrop);
    }
  }

  if (imagesData.posters && Array.isArray(imagesData.posters)) {
    posters = [...imagesData.posters];
    if (typeof imagesData.currentPoster === "number") {
      currentPoster = Math.min(imagesData.currentPoster, posters.length - 1);
    }
    if (posters.length > 0) {
      showPoster(currentPoster);
    }
  }

  if (imagesData.backgroundImages) {
    Object.keys(imagesData.backgroundImages).forEach((key) => {
      const imageUrl = imagesData.backgroundImages[key];
      if (imageUrl) {
        switch (key) {
          case "story":
            if (imageUrl) setBackdropAsBackground(imageUrl);
            break;
          case "feed":
            if (imageUrl) setBackdropAsBackgroundFeed(imageUrl);
            break;
          case "review":
            if (imageUrl) setBackdropAsBackgroundReview(imageUrl);
            break;
          case "reviewFeed":
            if (imageUrl) setBackdropAsBackgroundReviewFeed(imageUrl);
            break;
        }
      }
    });
  }
}

function restoreComicBalloon(comicData) {
  if (!comicData) return;

  const comicBalloon = document.querySelector(".dialogo-comic");
  if (comicBalloon) {
    if (comicData.backgroundColor) {
      comicBalloon.style.backgroundColor = comicData.backgroundColor;
      const bgPicker = document.getElementById("comicBgColorPicker");
      if (bgPicker) bgPicker.value = comicData.backgroundColor;
    }

    if (comicData.borderColor) {
      comicBalloon.style.borderColor = comicData.borderColor;
      const borderPicker = document.getElementById("comicBorderColorPicker");
      if (borderPicker) borderPicker.value = comicData.borderColor;
    }

    if (comicData.color) {
      comicBalloon.style.color = comicData.color;
      const textPicker = document.getElementById("comicTextColorPicker");
      if (textPicker) textPicker.value = comicData.color;
    }

    if (comicData.tailBackgroundColor) {
      restoreComicTailColor(
        "comic-tail-bg-style",
        comicData.tailBackgroundColor,
        "background"
      );
    }

    if (comicData.tailBorderColor) {
      restoreComicTailColor(
        "comic-tail-border-style",
        comicData.tailBorderColor,
        "border"
      );
    }
  }
}

function restoreComicTailColor(styleElementId, color, type) {
  let styleElement = document.getElementById(styleElementId);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  if (type === "background") {
    styleElement.textContent = `.dialogo-comic::after { border-top-color: ${color} !important; }`;
  } else if (type === "border") {
    styleElement.textContent = `.comic-tail-border { border-top-color: ${color} !important; }`;
  }
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

document.addEventListener("DOMContentLoaded", function () {
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
});
