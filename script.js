// --------------------------------------------------
// DESCARGA DE IMAGEN
// --------------------------------------------------

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
  bandavertical.style.display = "none";
  setBackdropAsBackground(fullUrl);
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

// --------------------------------------------------
// BOOTSTRAPPER
// --------------------------------------------------

// Función auxiliar para obtener el fontsize
async function initializeControlValues() {
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
  console.log("Valores de controles inicializados con CSS por defecto");
}

