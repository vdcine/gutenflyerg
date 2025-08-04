document.getElementById("movieForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  function getApiToken() {
    const input = document.getElementById("tmdbToken");
    return input && input.value ? input.value : "";
  }

  const API_KEY = getApiToken();
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

document.getElementById("set-poster-as-bg").addEventListener("click", () => {
  if (!posters.length) return;
  const url = `https://image.tmdb.org/t/p/original${posters[currentPoster].file_path}`;
  const rect = document.querySelector(".rect");
  rect.style.display = "none";
  setBackdropAsBackground(url);
});

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

  floatingColorPicker.focus();
}

floatingColorPicker.addEventListener("blur", () => {
  setTimeout(() => {
    floatingColorPicker.style.display = "none";
    const eyedropperBtn = document.getElementById("floating-eyedropper-btn");
    if (eyedropperBtn) eyedropperBtn.style.display = "none";
  }, 200);
});

[
  document.querySelector(".header"),
  document.getElementById("title"),
  document.getElementById("year"),
  document.getElementById("director"),
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

comicBalloon.addEventListener("click", (event) => {
  const style = window.getComputedStyle(comicBalloon);
  comicBgPicker.value = rgbToHex(style.backgroundColor);
  comicBorderPicker.value = rgbToHex(style.borderColor);
  comicTextPicker.value = rgbToHex(style.color);

  comicColorPanel.style.left = event.pageX + "px";
  comicColorPanel.style.top = event.pageY + "px";
  comicColorPanel.style.display = "block";
  event.stopPropagation();
});

comicBgPicker.addEventListener("input", (e) => {
  comicBalloon.style.backgroundColor = e.target.value;
});
comicBorderPicker.addEventListener("input", (e) => {
  comicBalloon.style.borderColor = e.target.value;
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

    e.stopPropagation();
  });
document
  .getElementById("activateEyedropperBorder")
  .addEventListener("click", (e) => {
    comicEyedropperActive = true;
    comicEyedropperTarget = comicBorderPicker;
    posterImg.style.cursor = "crosshair";

    e.stopPropagation();
  });
document
  .getElementById("activateEyedropperText")
  .addEventListener("click", (e) => {
    comicEyedropperActive = true;
    comicEyedropperTarget = comicTextPicker;
    posterImg.style.cursor = "crosshair";

    e.stopPropagation();
  });

posterImg.addEventListener("click", (e) => {
  if (!comicEyedropperActive || !comicEyedropperTarget || !posterImg.src)
    return;

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

  comicEyedropperTarget.value = hex;
  comicEyedropperTarget.dispatchEvent(new Event("input"));

  posterImg.style.cursor = "";
  document.body.style.cursor = "";
  comicEyedropperActive = false;
  comicEyedropperTarget = null;
});

document.addEventListener("mousedown", (e) => {
  if (
    comicColorPanel.style.display === "block" &&
    !comicColorPanel.contains(e.target) &&
    !e.target.classList.contains("dialogo-comic")
  ) {
    comicColorPanel.style.display = "none";
  }
});

let eyedropperActive = false;
let eyedropperColor = null;
let eyedropperCallback = null;

const activateEyedropperBtn = document.getElementById("activateEyedropper");

function activateEyedropper(callback = null) {
  eyedropperActive = true;
  eyedropperCallback = callback;
  posterImg.style.cursor = "crosshair";
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

  if (eyedropperCallback) {
    eyedropperCallback(hex);
  } else {
    floatingColorPicker.value = hex;
    floatingColorPicker.dispatchEvent(new Event("input"));
  }

  posterImg.style.cursor = "";
  document.body.style.cursor = "";
  eyedropperActive = false;
  eyedropperCallback = null;
});
