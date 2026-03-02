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

// --------------------------------------------------
// COLORPICKER / EYEDROPPER
// --------------------------------------------------

const floatingColorPicker = document.getElementById("floatingColorPicker");
let colorTargets = [];
let lastUsedColor = "#ffffff";

const lastColorIndicators = [];

function updateGlobalLastColor(color) {
  lastUsedColor = color;
  if (lastColorSquare) lastColorSquare.style.backgroundColor = color;
  lastColorIndicators.forEach((ind) => (ind.style.backgroundColor = color));
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
    target.classList.contains("rect2") ||
    target.classList.contains("rect2") ||
    target.classList.contains("tape") ||
    target.id === "flyer-story"
  );
}

// funcion aux para convertir rgb a hexa
// el navegador devuelve estilos en RGB, pero el input type="color" requiere Hex
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#ffffff";
  const r = parseInt(result[0]).toString(16).padStart(2, "0");
  const g = parseInt(result[1]).toString(16).padStart(2, "0");
  const b = parseInt(result[2]).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

// sincroniza colores entre version story y feed(posiblemente se vaya)
function getColorTargets(el) {
  if (
    el.classList.contains("rect") ||
    el.classList.contains("rect2") ||
    el.classList.contains("rect-feed") ||
    el.classList.contains("rect2-feed")
  ) {
    return [".rect", ".rect2", ".rect-feed", ".rect2-feed"]
      .map((s) => document.querySelector(s))
      .filter(Boolean);
  }

  if (
    el.classList.contains("rect2-review") ||
    el.classList.contains("rect2-review-feed")
  ) {
    return [".rect2-review", ".rect2-review-feed"]
      .map((s) => document.querySelector(s))
      .filter(Boolean);
  }

  const idGroups = [
    [
      "flyer-hour",
      "flyer-biblioteca",
      "flyer-hour-feed",
      "flyer-biblioteca-feed",
    ],
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
    ["edad-sugerida-review", "edad-sugerida-review-feed"],
  ];

  for (const group of idGroups) {
    if (group.includes(el.id)) {
      return group.map((id) => document.getElementById(id)).filter(Boolean);
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
  return rgbToHex(
    isBackgroundElement(targets[0]) ? style.backgroundColor : style.color,
  );
}

[
  document.querySelector(".header"),
  document.getElementById("title"),
  document.getElementById("year"),
  document.getElementById("director"),
  document.getElementById("duracion"),
  document.getElementById("edad-sugerida"),
  document.getElementById("flyer-date"),
  document.getElementById("flyer-hour"),
  document.getElementById("flyer-biblioteca"),
  document.getElementById("org"),
  document.querySelector(".rect"),
  document.querySelector(".rect2"),
  document.getElementById("ciclo"),
  document.getElementById("flyer-story"),
  document.querySelector(".tape"),
].forEach((el) => {
  if (el) {
    el.addEventListener("click", (event) => {
      showColorPickerForElement(el, event);
      event.stopPropagation();
    });
  }
});

// --------------------------------------------------
// EDITOR DE TEXTOS DE FLYER
// --------------------------------------------------

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
