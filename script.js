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

    const movieDetails = await(await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
    )).json();

    const result = document.createElement("div");
    result.style.cursor = "pointer";
    result.style.padding = "8px";
    result.style.borderBottom = "1px solid #ccc";
    result.style.display = "flex";
    result.style.alignItems = "center";
    result.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w92${
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
      document.getElementById("year").textContent = new Date(
        movie.release_date
      ).getFullYear();
      document.getElementById(
        "poster"
      ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      document.getElementById("director").textContent = director
        ? director.name
        : "Director no disponible";

      console.log(movieDetails)
      document.getElementById("duracion").textContent = `${movieDetails.runtime} minutos`;

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

  const btnBackdrops = document.getElementById("backdrops");

  btnBackdrops.addEventListener("click", () => {
    if (!window.selectedMovieId) return;
    window.open(
      `https://www.themoviedb.org/movie/${window.selectedMovieId}/images/backdrops`,
      "_blank"
    );
  });

  const btnPosters = document.getElementById("posters");

  btnPosters.addEventListener("click", () => {
    if (!window.selectedMovieId) return;
    window.open(
      `https://www.themoviedb.org/movie/${window.selectedMovieId}/images/posters`,
      "_blank"
    );
  });
});

let backdrops = [];
let currentBackdrop = 0;
let posters = [];
let currentPoster = 0;

function showBackdrop(index) {
  if (!backdrops.length) return;
  const img = document.getElementById("backdrop-carousel-img");
  img.src = `https://image.tmdb.org/t/p/original${backdrops[index].file_path}`;
  document.getElementById("backdrop-counter").textContent = `Backdrop ${
    index + 1
  } de ${backdrops.length}`;
}

function showPoster(index) {
  if (!posters.length) return;
  const img = document.getElementById("poster-carousel-img");
  img.src = `https://image.tmdb.org/t/p/original${posters[index].file_path}`;
  document.getElementById("poster-counter").textContent = `Poster ${
    index + 1
  } de ${posters.length}`;
}

document.getElementById("poster-prev").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster - 1 + posters.length) % posters.length;
  showPoster(currentPoster);
});
document.getElementById("poster-next").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster + 1) % posters.length;
  showPoster(currentPoster);
});

document.getElementById("set-poster-as-poster").addEventListener("click", () => {
  if (!posters.length) return;
  const url = `https://image.tmdb.org/t/p/original${posters[currentPoster].file_path}`;
  const rect = document.querySelector(".rect");
  rect.style.display = "none";
  setPoster(url);
});

function setPoster(url) {
    document.getElementById("poster").src = url;
}

document.getElementById("backdrop-prev").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop - 1 + backdrops.length) % backdrops.length;
  showBackdrop(currentBackdrop);
});

document.getElementById("backdrop-next").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop + 1) % backdrops.length;
  showBackdrop(currentBackdrop);
});

document.getElementById("set-backdrop-as-bg").addEventListener("click", () => {
  if (!backdrops.length) return;
  const url = `https://image.tmdb.org/t/p/original${backdrops[currentBackdrop].file_path}`;
  const rect = document.querySelector(".rect");
  rect.style.display = "none";
  setBackdropAsBackground(url);
});

function setBackdropAsBackground(url) {
  const flyer = document.getElementById("flyer");
  let blurBg = document.getElementById("flyer-blur-bg");
  if (blurBg) blurBg.remove();

  blurBg = document.createElement("div");
  blurBg.id = "flyer-blur-bg";
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
  flyer.prepend(blurBg);

  flyer.style.backgroundImage = "";
}

document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  const flyer = document.getElementById("flyer");
  const rect = document.querySelector(".rect");
  rect.style.display = "block";

  flyer.style.backgroundImage = "";

  const blurBg = document.getElementById("flyer-blur-bg");
  if (blurBg) {
    blurBg.remove();
  }
});

const flyerDate = document.getElementById("flyer-date");
const flyerHour = document.getElementById("flyer-hour");

const dateInput = document.getElementById("dateInput");
const hourInput = document.getElementById("hourInput");
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

flyerDate.addEventListener("dblclick", () => {
  dateInput.style.display = "block";
  flyerDate.style.display = "none";
  dateInput.value = flyerDate.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  dateInput.focus();
});
dateInput.addEventListener("blur", () => {
  flyerDate.innerHTML = dateInput.value.replace(/\n/g, "<br>");
  flyerDate.style.display = "block";
  dateInput.style.display = "none";
});
dateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    flyerDate.innerHTML = dateInput.value.replace(/\n/g, "<br>");
    flyerDate.style.display = "block";
    dateInput.style.display = "none";
    e.preventDefault();
  }
});

flyerHour.addEventListener("dblclick", () => {
  hourInput.style.display = "block";
  flyerHour.style.display = "none";
  hourInput.value = flyerHour.textContent;
  hourInput.focus();
});
hourInput.addEventListener("blur", () => {
  flyerHour.textContent = hourInput.value;
  flyerHour.style.display = "block";
  hourInput.style.display = "none";
});
hourInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    flyerHour.textContent = hourInput.value;
    flyerHour.style.display = "block";
    hourInput.style.display = "none";
    e.preventDefault();
  }
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
cicloH2.addEventListener("dblclick", () => {
  cicloInput.value = cicloH2.textContent;
  cicloInput.style.display = "block";
  cicloH2.style.display = "none";
  cicloInput.focus();
});

cicloInput.addEventListener("blur", () => {
  cicloH2.textContent = cicloInput.value;
  cicloH2.style.display = "block";
  cicloInput.style.display = "none";
});

cicloInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    cicloH2.textContent = cicloInput.value;
    cicloH2.style.display = "block";
    cicloInput.style.display = "none";
    e.preventDefault();
  }
});

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

titleH3.addEventListener("dblclick", () => {
  titleInput.value = titleH3.textContent;
  titleInput.style.display = "block";
  titleH3.style.display = "none";
  titleInput.focus();
});

titleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    titleH3.innerHTML = titleInput.value.replace(/\n/g, "<br>");
    titleH3.style.display = "block";
    titleInput.style.display = "none";
    e.preventDefault();
  } else if (e.key === "Enter" && e.shiftKey) {
    const cursorPos = titleInput.selectionStart;
    const value = titleInput.value;
    titleInput.value =
      value.slice(0, cursorPos) + "<br>" + value.slice(cursorPos);

    titleInput.selectionStart = titleInput.selectionEnd = cursorPos + 4;
    e.preventDefault();
  }
});

titleInput.addEventListener("blur", () => {
  titleH3.innerHTML = titleInput.value.replace(/\n/g, "<br>");
  titleH3.style.display = "block";
  titleInput.style.display = "none";
});

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
  const flyerElement = document.getElementById("flyer");
  const blurBg = document.getElementById("flyer-blur-bg");

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
        link.download = `${date}_${flyerTitle}_flyer.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (blurError) {
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError
        );

        await generateWithoutBlur(flyerElement);
      }
    } else {
      await generateWithoutBlur(flyerElement);
    }
  } else {
    await generateWithoutBlur(flyerElement);
  }
});

async function generateWithoutBlur(flyerElement) {
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

  const link = document.createElement("a");
  link.download = `flyer-cine-${Date.now()}.png`;
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
      target.classList.contains("rect2") ||
      target.id === "flyer";

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
    return [document.querySelector(".rect"), document.querySelector(".rect2")];
  }

  if (el.id === "flyer-hour" || el.id === "flyer-biblioteca") {
    return [
      document.getElementById("flyer-hour"),
      document.getElementById("flyer-biblioteca"),
    ];
  }

  if (el.id === "flyer") {
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
    targets[0].classList.contains("rect2") ||
    targets[0].id === "flyer";
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

  let applyLastColorBtn = document.getElementById("apply-last-eyedropper-color-btn");
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
    const applyLastColorBtn = document.getElementById("apply-last-eyedropper-color-btn");
    if (applyLastColorBtn) applyLastColorBtn.style.display = "none";
  }, 200);
});

[
  document.querySelector(".header"),
  document.getElementById("title"),
  document.getElementById("year"),
  document.getElementById("director"),
  document.getElementById("duracion"),
  document.getElementById("flyer-date"),
  document.getElementById("flyer-hour"),
  document.getElementById("flyer-biblioteca"),
  document.getElementById("org"),
  document.querySelector(".rect"),
  document.querySelector(".rect2"),
  document.getElementById("ciclo"),
  document.getElementById("flyer"),
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
  comicColorPreview.style.left = (e.pageX + 20) + "px";
  comicColorPreview.style.top = (e.pageY - 24) + "px";

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

document.getElementById("comicLastColorSquare").addEventListener("click", (e) => {
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
        { text: "Aplicar al texto", target: comicTextPicker }
      ];
      
      options.forEach(option => {
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
    
    contextMenu.style.left = (e.pageX + 5) + "px";
    contextMenu.style.top = (e.pageY + 5) + "px";
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

let comicTailBgStyle = document.getElementById('comic-tail-bg-style');
if (!comicTailBgStyle) {
  comicTailBgStyle = document.createElement('style');
  comicTailBgStyle.id = 'comic-tail-bg-style';
  document.head.appendChild(comicTailBgStyle);
}

let comicTailBorderStyle = document.getElementById('comic-tail-border-style');
if (!comicTailBorderStyle) {
  comicTailBorderStyle = document.createElement('style');
  comicTailBorderStyle.id = 'comic-tail-border-style';
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
    comicTailBorderStyle.textContent = `.dialogo-comic::before { border-top-color: ${selectedColor} !important; }`;
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
  if (contextMenu && contextMenu.style.display === "block" && !contextMenu.contains(e.target)) {
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
  colorPreview.style.left = (e.pageX + 20) + "px";
  colorPreview.style.top = (e.pageY - 24) + "px";

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
    colorPreview.style.left = (e.pageX + 20) + "px";
    colorPreview.style.top = (e.pageY - 24) + "px";
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
