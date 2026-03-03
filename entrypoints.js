document.getElementById("movieForm").addEventListener("submit", searchMovies);

const flyer = document.getElementById("flyer");

// PAINT PALETTE
//
// referencias a los elementos del modo edicion en el html
const paintPalette = document.getElementById("paintPaletteContainer");
const paintColorInput = document.getElementById("paintColorInput");

paintColorInput.addEventListener("input", (e) => {
  localStorage.currentPaintColor = e.target.value;
});

// Efecto hover (highlighter)
flyer.addEventListener("mouseover", (e) => {
  // if (isEditableElement(e.target)) {
  e.target.classList.add("paint-mode-highlight");
  // }
});

flyer.addEventListener("mouseout", (e) => {
  e.target.classList.remove("paint-mode-highlight");
});

flyer.addEventListener("click", paintEventHandler);

// Backdrop Carousel

document.getElementById("backdrop-next").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop + 1) % backdrops.length;
  showBackdrop(currentBackdrop);
  if (!backdrops.length) return;
  const filePath = backdrops[currentBackdrop].file_path;
  const backdropUrlNext = getSimpleCorsProxiedUrl(
    `https://image.tmdb.org/t/p/original${filePath}`
  );

  bandavertical.style.display = "none";
  setBackdropAsBackground(backdropUrlNext);
});
