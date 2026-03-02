document.getElementById("movieForm").addEventListener("submit", searchMovies);

const flyer = document.getElementById("flyer-story");

// PAINT PALETTE
//
//
// referencias a los elementos del modo edicion en el html
const paintPalette = document.getElementById("paintPaletteContainer");
const paintColorInput = document.getElementById("paintColorInput");
const closePaintMode = document.getElementById("closePaintMode");

paintColorInput.addEventListener("input", (e) => {
  localStorage.currentPaintColor = e.target.value;
});

closePaintMode.addEventListener("click", () => {
  paintPalette.style.display = "none";
  localStorage.isPaintModeActive = false;
  document
    .querySelectorAll("#paint-mode-highlight")
    .forEach((el) => el.classList.remove("paint-mode-highlight"));
});

// Efecto hover (highlighter)
flyer.addEventListener("mouseover", (e) => {
  if (!localStorage.isPaintModeActive) return;
  // if (isEditableElement(e.target)) {
  e.target.classList.add("paint-mode-highlight");
  // }
});

flyer.addEventListener("mouseout", (e) => {
  e.target.classList.remove("paint-mode-highlight");
});

flyer.addEventListener("click", paintEventHandler);
