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


// --------------------------------------------------
// COLORPICKER / EYEDROPPER de comic balloon (a borrar)
// --------------------------------------------------

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


// --------------------------------------------------
// EDITOR DE TEXTOS DE FLYER
// --------------------------------------------------

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
