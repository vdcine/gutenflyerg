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
      document.getElementById("title").textContent = movie.title;
      document.getElementById("titleInput").value = movie.title;
      document.getElementById("titleInputFeed").value = movie.title;
      document.getElementById("titleInputReview").value = movie.title;
      document.getElementById("titleInputReviewFeed").value = movie.title;
      document.getElementById("year").textContent = new Date(
        movie.release_date
      ).getFullYear();
      document.getElementById(
        "poster"
      ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      document.getElementById("director").textContent = director
        ? director.name
        : "Director no disponible";

      console.log(movieDetails);
      document.getElementById(
        "duracion"
      ).textContent = `${movieDetails.runtime} minutos`;

      const url = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

      setBackdropAsBackground(url);
      setBackdropAsBackgroundFeed(url);
      setBackdropAsBackgroundReview(url);
      setBackdropAsBackgroundReviewFeed(url);

      const flyerFeed = document.getElementById("flyer-feed");
      flyerFeed.querySelector("#title-feed").textContent = movie.title;
      flyerFeed.querySelector("#year-feed").textContent = new Date(
        movie.release_date
      ).getFullYear();
      flyerFeed.querySelector(
        "#poster-feed"
      ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      flyerFeed.querySelector("#director-feed").textContent = director
        ? director.name
        : "Director no disponible";
      flyerFeed.querySelector(
        "#duracion-feed"
      ).textContent = `${movieDetails.runtime} minutos`;

      document.getElementById(
        "poster-review"
      ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      document.getElementById(
        "duracion-review"
      ).textContent = `${movieDetails.runtime} minutos`;
      document.getElementById("title-review").textContent = movie.title;
      document.getElementById("year-review").textContent = new Date(
        movie.release_date
      ).getFullYear();
      document.getElementById("sinapsis-review").textContent =
        movieDetails.overview;
      document.getElementById("sinapsisInputReview").value =
        movieDetails.overview;
      document.getElementById("director-review").textContent = director
        ? director.name
        : "Director no disponible";

      const countryCode = movieDetails.origin_country[0];
      const flag = getCountryFlagEmoji(countryCode);
      const countryName = countryNamesES[countryCode] || countryCode;
      document.getElementById(
        "origen-review"
      ).textContent = `Origen: ${flag} ${countryName}`;

      document.getElementById(
        "poster-review-feed"
      ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      document.getElementById(
        "duracion-review-feed"
      ).textContent = `${movieDetails.runtime} minutos`;
      document.getElementById("title-review-feed").textContent = movie.title;
      document.getElementById("year-review-feed").textContent = new Date(
        movie.release_date
      ).getFullYear();
      document.getElementById("sinapsis-review-feed").textContent =
        movieDetails.overview;
      document.getElementById("sinapsisInputReviewFeed").value =
        movieDetails.overview;
      document.getElementById("director-review-feed").textContent = director
        ? director.name
        : "Director no disponible";

      document.getElementById(
        "origen-review-feed"
      ).textContent = `Origen: ${flag} ${countryName}`;

      const imagesRes = await fetch(
        `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}&language`
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
  const url = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;

  setPoster(url);
});
document.getElementById("poster-next").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster + 1) % posters.length;
  showPoster(currentPoster);
  if (!posters.length) return;
  const filePath = posters[currentPoster].file_path;
  const url = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;

  setPoster(url);
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
  const url = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;
  const rect = document.querySelector(".rect");
  const rectFeed = document.querySelector(".rect-feed");
  const rectReview = document.querySelector(".rect-review");
  rect.style.display = "none";
  rectFeed.style.display = "none";
  rectReview.style.display = "none";
  setBackdropAsBackground(url);
  setBackdropAsBackgroundFeed(url);
  setBackdropAsBackgroundReview(url);
  setBackdropAsBackgroundReviewFeed(url);
});

document.getElementById("backdrop-next").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop + 1) % backdrops.length;
  showBackdrop(currentBackdrop);
  if (!backdrops.length) return;
  const filePath = backdrops[currentBackdrop].file_path;
  const url = filePath.startsWith("http")
    ? filePath
    : `https://image.tmdb.org/t/p/original${filePath}`;
  const rect = document.querySelector(".rect");
  const rectFeed = document.querySelector(".rect-feed");
  const rectReview = document.querySelector(".rect-review");
  rect.style.display = "none";
  rectFeed.style.display = "none";
  rectReview.style.display = "none";
  setBackdropAsBackground(url);
  setBackdropAsBackgroundFeed(url);
  setBackdropAsBackgroundReview(url);
  setBackdropAsBackgroundReviewFeed(url);
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
  if (
    el.classList.contains("rect") ||
    el.classList.contains("rect2") ||
    el.classList.contains("rect-feed") ||
    el.classList.contains("rect2-feed") ||
    el.classList.contains("rect2-review") ||
    el.classList.contains("rect2-review-feed")
  ) {
    return [
      document.querySelector(".rect"),
      document.querySelector(".rect2"),
      document.querySelector(".rect-feed"),
      document.querySelector(".rect2-feed"),
      document.querySelector(".rect2-review"),
      document.querySelector(".rect2-review-feed"),
    ];
  }

  if (
    el.id === "flyer-hour" ||
    el.id === "flyer-biblioteca" ||
    el.id === "flyer-hour-feed" ||
    el.id === "flyer-biblioteca-feed"
  ) {
    return [
      document.getElementById("flyer-hour"),
      document.getElementById("flyer-biblioteca"),
      document.getElementById("flyer-hour-feed"),
      document.getElementById("flyer-biblioteca-feed"),
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
  document.getElementById("title-review"),
  document.getElementById("origen-review"),
  document.getElementById("year-review"),
  document.getElementById("director-review"),
  document.getElementById("duracion-review"),
  document.getElementById("sinapsis-review"),
  document.getElementById("title-review-feed"),
  document.getElementById("origen-review-feed"),
  document.getElementById("year-review-feed"),
  document.getElementById("director-review-feed"),
  document.getElementById("duracion-review-feed"),
  document.getElementById("sinapsis-review-feed"),
  document.getElementById("title-feed"),
  document.getElementById("year-feed"),
  document.getElementById("director-feed"),
  document.getElementById("duracion-feed"),
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
  document.querySelector(".rect-feed"),
  document.querySelector(".rect2-feed"),
  document.querySelector(".rect2-review"),
  document.querySelector(".rect2-review-feed"),
  document.getElementById("ciclo"),
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

const comicBalloon = document.querySelector(".dialogo-comic");
const comicColorPanel = document.getElementById("comicColorPickerPanel");
const comicBgPicker = document.getElementById("comicBgColorPicker");
const comicBorderPicker = document.getElementById("comicBorderColorPicker");
const comicTextPicker = document.getElementById("comicTextColorPicker");
const posterImg = document.getElementById("poster");

let comicEyedropperActive = false;
let comicEyedropperTarget = null;
let lastComicEyedropperColor = null;

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
    comicColorPreview.style.background = hex;
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
    comicEyedropperActive = true;
    comicEyedropperTarget = comicBgPicker;
    posterImg.style.cursor = "crosshair";

    posterImg.addEventListener("mousemove", comicEyedropperMoveHandler);

    e.stopPropagation();
  });
document
  .getElementById("activateEyedropperBorder")
  .addEventListener("click", (e) => {
    comicEyedropperActive = true;
    comicEyedropperTarget = comicBorderPicker;
    posterImg.style.cursor = "crosshair";

    posterImg.addEventListener("mousemove", comicEyedropperMoveHandler);

    e.stopPropagation();
  });
document
  .getElementById("activateEyedropperText")
  .addEventListener("click", (e) => {
    comicEyedropperActive = true;
    comicEyedropperTarget = comicTextPicker;
    posterImg.style.cursor = "crosshair";

    posterImg.addEventListener("mousemove", comicEyedropperMoveHandler);

    e.stopPropagation();
  });

posterImg.addEventListener("click", (e) => {
  if (comicEyedropperActive && comicEyedropperTarget && posterImg.src) {
    e.stopPropagation();
    var comicColorPreview = document.getElementById("comic-color-preview");
    if (comicColorPreview) {
      comicColorPreview.style.display = "none";
    }
    posterImg.removeEventListener("mousemove", comicEyedropperMoveHandler);

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

    lastComicEyedropperColor = hex;
    updateComicLastColorSquare();

    comicEyedropperTarget.value = hex;
    comicEyedropperTarget.dispatchEvent(new Event("input"));

    posterImg.style.cursor = "";
    document.body.style.cursor = "";
    comicEyedropperActive = false;
    comicEyedropperTarget = null;
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

const activateEyedropperBtn = document.getElementById("activateEyedropper");

function activateEyedropper(callback = null) {
  eyedropperActive = true;
  eyedropperCallback = callback;
  posterImg.style.cursor = "crosshair";

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

    const newBackdrop = {
      file_path: filePath,
      aspect_ratio: 1.778,
    };

    backdrops.unshift(newBackdrop);
    currentBackdrop = 0;

    showBackdrop(currentBackdrop);

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

  document.getElementById("poster-direct-input").value = "";
});

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
  });

document
  .getElementById("flyerHourFontSizeInput")
  .addEventListener("input", (e) => {
    document.getElementById("flyer-hour").style.fontSize =
      e.target.value + "px";
  });

document
  .getElementById("flyerDateFontSizeInputFeed")
  .addEventListener("input", (e) => {
    document.getElementById("flyer-date-feed").style.fontSize =
      e.target.value + "px";
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
  document.getElementById("title").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");

  document.getElementById("ciclo").textContent = ciclo || "Ciclo";

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

  const formattedDate = formatDateToSpanish(dateRaw);
  document.getElementById("flyer-date").innerHTML = formattedDate;

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";
  document.getElementById("flyer-hour").textContent = formattedHour;
});

document.getElementById("applyTxtBtnFeed").addEventListener("click", () => {
  const ciclo = document.getElementById("cicloInputFeed").value.trim();
  const dateRaw = document.getElementById("dateInputFeed").value.trim();
  const hourRaw = document.getElementById("hourInputFeed").value.trim();
  const titulo = document.getElementById("titleInputFeed").value.trim();

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

  const formattedDate = formatDateToSpanish(dateRaw);

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";

  const flyerFeed = document.getElementById("flyer-feed");
  if (flyerFeed) {
    flyerFeed.querySelector("#title-feed").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");
    flyerFeed.querySelector("#ciclo").textContent = ciclo || "Ciclo";
    flyerFeed.querySelector("#flyer-date-feed").innerHTML = formattedDate;
    flyerFeed.querySelector("#flyer-hour-feed").textContent = formattedHour;
  }
});

document.getElementById("applyTxtBtnReview").addEventListener("click", () => {
  const titulo = document.getElementById("titleInputReview").value.trim();
  const sinapsis = document.getElementById("sinapsisInputReview").value.trim();

  const flyerReview = document.getElementById("flyer-story-review");
  if (flyerReview) {
    flyerReview.querySelector("#title-review").innerHTML = (
      titulo || "Título de la película"
    ).replace(/\n/g, "<br>");

    flyerReview.querySelector("#sinapsis-review").innerHTML = (
      sinapsis || "Sinopsis de la película"
    ).replace(/\n/g, "<br>");
  }
});

document
  .getElementById("applyTxtBtnReviewFeed")
  .addEventListener("click", () => {
    const titulo = document.getElementById("titleInputReviewFeed").value.trim();
    const sinapsis = document
      .getElementById("sinapsisInputReviewFeed")
      .value.trim();

    const flyerReview = document.getElementById("flyer-feed-review");
    if (flyerReview) {
      flyerReview.querySelector("#title-review-feed").innerHTML = (
        titulo || "Título de la película"
      ).replace(/\n/g, "<br>");

      flyerReview.querySelector("#sinapsis-review-feed").innerHTML = (
        sinapsis || "Sinopsis de la película"
      ).replace(/\n/g, "<br>");
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
  const select = document.getElementById("strokeTargetSelect");
  const color = document.getElementById("strokeColorInput").value;
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
    const select = document.getElementById("strokeTargetSelectReview");
    const color = document.getElementById("strokeColorInputReview").value;
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
