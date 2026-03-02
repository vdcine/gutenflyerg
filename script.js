// --------------------------------------------------
// DESCARGA DE IMAGEN
// --------------------------------------------------

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

document.getElementById("saveFlyer").addEventListener("click", async () => {
  const flyerElement = document.getElementById("flyer-story");
  const blurBg = document.getElementById("flyer-blur-bg");

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
    const titleElement = document.getElementById("title");
    const flyerTitle = titleElement
      ? titleElement.textContent
          .trim()
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "")
      : "flyer";
    const date = new Date().toISOString().slice(0, 10);

    link.download = `${date}_${flyerTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (blurBg && blurBg.style.backgroundImage) {
    const bgImageMatch = blurBg.style.backgroundImage.match(
      /url\(['"]?([^'"]+)['"]?\)/,
    );

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
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError,
        );
        if (originalFilter !== undefined) blurBg.style.filter = originalFilter;
        if (originalBgImage !== undefined)
          blurBg.style.backgroundImage = originalBgImage;
      }
    }
  }

  await downloadCanvas();
});

document.getElementById("saveFlyer").addEventListener("click", async () => {
  const flyerElement = document.getElementById("flyer-story");
  const blurBg = document.getElementById("flyer-blur-bg");

  if (blurBg && blurBg.style.backgroundImage) {
    const bgImageMatch = blurBg.style.backgroundImage.match(
      /url\(['"]?([^'"]+)['"]?\)/,
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
          allowTaint: false,
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
        link.download = `${date}_${flyerTitle}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (blurError) {
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError,
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
    allowTaint: false,
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

document.getElementById("applyTxtBtn").addEventListener("click", () => {
  const titulo = document.getElementById("titleInput").value.trim();
  const sinapsis = document.getElementById("sinapsisInput").value.trim();
  const edadSugerida = document
    .getElementById("edadSugeridaInput")
    .value.trim();

  document.getElementById("title").innerHTML = (
    titulo || "Título de la película"
  ).replace(/\n/g, "<br>");
  document.getElementById("titleInput").value = titulo;

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
        document.getElementById("edadSugeridaInputReview").value =
          mappedCertification;
      } else {
        const edadSugeridaElement = document.getElementById(
          "edad-sugerida-review",
        );
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

// --------------------------------------------------
// BOOTSTRAPPER
// --------------------------------------------------

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
