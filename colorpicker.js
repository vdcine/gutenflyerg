let currentPaintColor = "#ffffff";
let isPaintModeActive = false;

// referencias a los elementos del modo edicion en el html
const paintPalette = document.getElementById("paintPaletteContainer");
const paintColorInput = document.getElementById("paintColorInput");
const closePaintMode = document.getElementById("closePaintMode");

paintColorInput.addEventListener("input", (e) => {
  currentPaintColor = e.target.value;
});

closePaintMode.addEventListener("click", () => {
  paintPalette.style.display = "none";
  isPaintModeActive = false;
  document.querySelectorAll('.paint-mode-highlight').forEach(el => el.classList.remove('paint-mode-highlight'));
});

// si es un elemento figura(rectangulos) hace el.style.backgroundColor. si es algun texto el.style.color
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

// funcion aux para convertir rgb a hexa
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#ffffff";
  const r = parseInt(result[0]).toString(16).padStart(2, '0');
  const g = parseInt(result[1]).toString(16).padStart(2, '0');
  const b = parseInt(result[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// sincroniza colores entre version story y feed
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

const editableIdsAndClasses = [
  "header", "header-feed", "header-review", "header-feed-review",
  "title", "year", "director", "duracion", "edad-sugerida",
  "title-review", "origen-review", "year-review", "director-review", "duracion-review", "edad-sugerida-review", "sinapsis-review",
  "title-review-feed", "origen-review-feed", "year-review-feed", "director-review-feed", "duracion-review-feed", "edad-sugerida-review-feed", "sinapsis-review-feed",
  "title-feed", "year-feed", "director-feed", "duracion-feed", "edad-sugerida-feed",
  "flyer-date", "flyer-date-feed", "flyer-hour", "flyer-hour-feed",
  "flyer-biblioteca", "flyer-biblioteca-feed",
  "org", "org-feed", "org-review", "org-review-feed",
  "ciclo", "ciclo-feed",
  "flyer-feed", "flyer-story", "flyer-story-review", "flyer-feed-review"
];

const editableClasses = ["rect", "rect2", "rect-feed", "rect2-feed", "rect2-review", "rect2-review-feed", "tape", "header", "header-feed", "header-review", "header-feed-review", "dialogo-comic", "comic-text"];

function isEditableElement(target) {
  if (target.id && editableIdsAndClasses.includes(target.id)) return true;
  for (const cls of editableClasses) {
    if (target.classList.contains(cls) || (target.closest && target.closest('.'+cls))) return true;
  }
  return false;
}

// estilos dinámicos para el globo porque tiene pseudo-elementos
let comicTailBgStyle = document.getElementById("comic-tail-bg-style");
if (!comicTailBgStyle) {
  comicTailBgStyle = document.createElement("style");
  comicTailBgStyle.id = "comic-tail-bg-style";
  document.head.appendChild(comicTailBgStyle);
}

// estilos para el highlighter del modo edicion de colores
const paintStyle = document.createElement("style");
paintStyle.textContent = `
  .paint-mode-highlight {
    outline: 3px dashed #ff007f !important;
    outline-offset: 2px !important;
    cursor: crosshair !important;
    transition: outline 0.1s ease-in-out;
  }
`;
document.head.appendChild(paintStyle);

// delegacion de eventos en todo el contenedor de flyers
const allFlyers = document.querySelectorAll(".flyer-version");

let hoveredPaintElement = null;

allFlyers.forEach(flyer => {
  // Efecto hover (highlighter)
  flyer.addEventListener("mouseover", (e) => {
    if (!isPaintModeActive) return;
    if (isEditableElement(e.target)) {
      hoveredPaintElement = e.target;
      hoveredPaintElement.classList.add("paint-mode-highlight");
    }
  });

  flyer.addEventListener("mouseout", (e) => {
    if (hoveredPaintElement && e.target === hoveredPaintElement) {
      hoveredPaintElement.classList.remove("paint-mode-highlight");
      hoveredPaintElement = null;
    }
  });

  flyer.addEventListener("click", (e) => {
    // si el modo pintura no está activo, lo activamos
    if (!isPaintModeActive) {
      paintPalette.style.display = "flex";
      isPaintModeActive = true;
      e.stopPropagation();
      return;
    }

    // si ya está activo, aplicamos el color al elemento si es editable
    if (isPaintModeActive && isEditableElement(e.target)) {
      const comicBalloon = e.target.closest('.dialogo-comic');
      
      if (comicBalloon) {
          if (e.target.classList.contains('comic-text')) {
               comicBalloon.style.color = currentPaintColor;
          } else {
               comicBalloon.style.backgroundColor = currentPaintColor;
               if (comicTailBgStyle) {
                   comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${currentPaintColor} !important; }`;
               }
          }
      } else {
          const targets = getColorTargets(e.target);
          targets.forEach(el => {
            if (isBackgroundElement(el)) {
              el.style.backgroundColor = currentPaintColor;
            } else {
              el.style.color = currentPaintColor;
            }
          });
      }
      e.stopPropagation();
    }
  });
});
