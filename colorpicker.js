if (!localStorage.currentPaintColor) {
  localStorage.currentPaintColor = "#00ff00";
}
if (!localStorage.isPaintModeActive) {
  localStorage.isPaintModeActive = false;
}

// si es un elemento figura(rectangulos) hace el.style.backgroundColor. si es algun texto el.style.color
function isBackgroundElement(target) {
  console.log(target);
  return (
    target.classList.contains("rect") ||
    target.classList.contains("rect2") ||
    target.classList.contains("tape") ||
    target.id === "flyer-story"
  );
}

// const editableIdsAndClasses = [
//   "header",
//   "header-feed",
//   "header-review",
//   "header-feed-review",
//   "title",
//   "year",
//   "director",
//   "duracion",
//   "edad-sugerida",
//   "title-review",
//   "origen-review",
//   "year-review",
//   "director-review",
//   "duracion-review",
//   "edad-sugerida-review",
//   "sinapsis-review",
//   "title-review-feed",
//   "origen-review-feed",
//   "year-review-feed",
//   "director-review-feed",
//   "duracion-review-feed",
//   "edad-sugerida-review-feed",
//   "sinapsis-review-feed",
//   "title-feed",
//   "year-feed",
//   "director-feed",
//   "duracion-feed",
//   "edad-sugerida-feed",
//   "flyer-date",
//   "flyer-date-feed",
//   "flyer-hour",
//   "flyer-hour-feed",
//   "flyer-biblioteca",
//   "flyer-biblioteca-feed",
//   "org",
//   "org-feed",
//   "org-review",
//   "org-review-feed",
//   "ciclo",
//   "ciclo-feed",
//   "flyer-feed",
//   "flyer-story",
//   "flyer-story-review",
//   "flyer-feed-review",
// ];

// const editableClasses = [
//   "rect",
//   "rect2",
//   "rect-feed",
//   "rect2-feed",
//   "rect2-review",
//   "rect2-review-feed",
//   "tape",
//   "header",
//   "header-feed",
//   "header-review",
//   "header-feed-review",
//   "dialogo-comic",
//   "comic-text",
// ];

// function isEditableElement(target) {
//   if (target.id && editableIdsAndClasses.includes(target.id)) return true;
//   for (const cls of editableClasses) {
//     if (
//       target.classList.contains(cls) ||
//       (target.closest && target.closest("." + cls))
//     )
//       return true;
//   }
//   return false;
// }

// estilos dinámicos para el globo porque tiene pseudo-elementos
// let comicTailBgStyle = document.getElementById("comic-tail-bg-style");
// if (!comicTailBgStyle) {
comicTailBgStyle = document.createElement("style");
comicTailBgStyle.id = "comic-tail-bg-style";
document.head.appendChild(comicTailBgStyle);
// }
//

function paintEventHandler(e) {
  // si el modo pintura no está activo, lo activamos
  if (!localStorage.isPaintModeActive) {
    paintPalette.style.display = "flex";
    localStorage.isPaintModeActive = true;
    // e.stopPropagation();
  } else {
    // si ya está activo, aplicamos el color al elemento si es editable
    // if (localStorage.isPaintModeActive && isEditableElement(e.target)) {
    const comicBalloon = e.target.closest(".dialogo-comic");

    if (comicBalloon) {
      if (e.target.classList.contains("comic-text")) {
        comicBalloon.style.color = localStorage.currentPaintColor;
      } else {
        comicBalloon.style.backgroundColor = localStorage.currentPaintColor;
        if (comicTailBgStyle) {
          comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${localStorage.currentPaintColor} !important; }`;
        }
      }
    } else {
      if (isBackgroundElement(e.target)) {
        e.target.style.backgroundColor = localStorage.currentPaintColor;
      } else {
        e.target.style.color = localStorage.currentPaintColor;
      }
    }
    // e.stopPropagation();
  }
}
