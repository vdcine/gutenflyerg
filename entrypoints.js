document.getElementById("movieForm").addEventListener("submit", searchMovies);

const flyer = document.getElementById("flyer");

// PAINT PALETTE
//
// referencias a los elementos del modo edicion en el html
const paintPalette = document.getElementById("paintPaletteContainer");
const paintColorInput = document.getElementById("paintColorInput");

paintColorInput.addEventListener("input", (e) => {
  GlobalState.currentPaintColor = e.target.value;
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


// MAIN
document.addEventListener("DOMContentLoaded", initializeControlValues);

// JSON EXPORT & IMPORT
document.getElementById("exportDataBtn").addEventListener("click",
    function (e) {
        try {
            exportUserData();
        } catch (error) {
            console.error("Error al exportar datos:", error);
            alert("Error al exportar los datos. Por favor intenta de nuevo.");
        }
    }
);

const fileInput = document.getElementById("importFileInput");
fileInput.addEventListener("change", handleFileImport);
// Este truco es para usar el file-picker sin que sea visible:
document.getElementById("importDataBtn").addEventListener("click", fileInput.click);


// PANEL

GlobalState.bandaHidden = GlobalState.bandaHidden || false;

document.getElementById("toggle-banda").addEventListener("click", (e) => {
    GlobalState.bandaHidden = ! GlobalState.bandaHidden;
    bandavertical.style.display = GlobalState.bandaHidden ? "none" : "block";
    this.textContent = GlobalState.bandaHidden ? "Mostrar banda vertical" : "Ocultar banda vertical";
});



document.getElementById("applyStrokeBtn").addEventListener("click", () => {
  const select = document.getElementById("strokeTargetSelect");
  const color = document.getElementById("strokeColorInput").value;
  Array.from(select.selectedOptions).forEach((option) => {
    const target = document.getElementById(option.value);
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

document.getElementById("removeStrokeBtn").addEventListener("click", () => {
  const select = document.getElementById("strokeTargetSelect");
  Array.from(select.selectedOptions).forEach((option) => {
    const target = document.getElementById(option.value);
    if (target) {
      target.style.textShadow = "";
    }
  });
});

document.getElementById("applyTxtBtn").addEventListener("click", () => {
  const ciclo = document.getElementById("cicloInput").value.trim();
  const dateRaw = document.getElementById("dateInput").value.trim();
  const hourRaw = document.getElementById("hourInput").value.trim();
  GlobalState.titulo = document.getElementById("titleInput").value.trim();

  document.getElementById("dateInput").value = dateRaw;
  document.getElementById("hourInput").value = hourRaw;

  const edadSugerida = document.getElementById("edadSugeridaInput").value.trim();
  GlobalState.edadSugerida = edadSugerida;

  document.getElementById("title").innerHTML = (
    GlobalState.titulo || "Título de la película"
  ).replace(/\n/g, "<br />");
  document.getElementById("titleInput").value = GlobalState.titulo;
  document.getElementById("ciclo").textContent = ciclo || "Ciclo";

  const mappedCertification = certificationMap[edadSugerida] || edadSugerida;
  const el = document.getElementById("edad-sugerida");

  if (mappedCertification) {
      document.getElementById("edadSugeridaInput").value = mappedCertification;
      el.textContent = mappedCertification;
      el.style.display = "inline-block";
      if (mappedCertification === "ATP") {
          el.style.backgroundColor = "#4CAF50"; // Verde para ATP
          el.style.color = "white";
      } else if (mappedCertification === "+13" || mappedCertification === "SAM 13") {
          el.style.backgroundColor = "#2196F3"; // Azul para +13
          el.style.color = "white";
      } else if (
          mappedCertification === "+16" ||
          mappedCertification === "SAM 16"
      ) {
          el.style.backgroundColor = "#FF9800"; // Naranja para +16
          el.style.color = "white";
      } else if (
          mappedCertification === "+18" ||
          mappedCertification === "SAM 18"
      ) {
          el.style.backgroundColor = "#f44336"; // Rojo para +18
          el.style.color = "white";
      } else {
          el.style.backgroundColor = "#777"; // Gris para otros
          el.style.color = "white";
      }
  } else {
      el.style.display = "none";
  }

  document.getElementById("flyer-date").innerHTML = formatDateToSpanish(dateRaw);
  document.getElementById("flyer-hour").textContent = hourRaw ? `${hourRaw} HS` : "19:00 HS";

  const orgInput = document.getElementById("orgInput");
  if (orgInput) {
    const orgValue = orgInput.value.trim();
    GlobalState.orgText = orgValue;
    const orgEl = document.getElementById("org");
    if (orgEl) orgEl.textContent = orgValue;
  }
});

document.getElementById("flyerDateFontSizeInput").addEventListener("input",
    (e) => {
        document.getElementById("flyer-date").style.fontSize = e.target.value + "px";
        console.log("Aplicado tamaño fecha Story:", e.target.value + "px");
    });

document.getElementById("flyerHourFontSizeInput").addEventListener("input",
    (e) => {
        document.getElementById("flyer-hour").style.fontSize = e.target.value + "px";
        console.log("Aplicado tamaño hora Story:", e.target.value + "px");
    });

document.getElementById("flyerTitleFontSizeInput").addEventListener("input",
    (e) => {
        document.getElementById("title").style.fontSize = e.target.value + "px";
    });


document.getElementById("flyerTitleMarginTopInput").addEventListener("input",
    (e) => {
        document.getElementById("title").style.fontSize = e.target.value + "px";
    });


document.getElementById("rectWidthInput").addEventListener("input",
    (e) => {
        document.getElementById("bandavertical").style.width = e.target.value + "px";
    });

document.getElementById("saveFlyer").addEventListener("click", async () => {
  const blurBg = document.getElementById("flyer-blur-bg-story");

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

        const canvas = await html2canvas(flyer, {
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
        link.download = `${date}_${flyerTitle}_story.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (blurError) {
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError
        );

        await generateWithoutBlur(flyer, true);
      }
    } else {
      await generateWithoutBlur(flyer, true);
    }
  } else {
    await generateWithoutBlur(flyer, true);
  }
});

// Backdrop Carousel

document.getElementById("backdrop-next").addEventListener("click",
    (e) => { shiftBackdrop(1); }
);

document.getElementById("backdrop-prev").addEventListener("click",
    (e) => { shiftBackdrop(-1); }
);

document.getElementById("poster-prev").addEventListener("click",
    (e) => { shiftPoster(-1); }
);

document.getElementById("poster-next").addEventListener("click",
    (e) => { shiftPoster(1); }
);


document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  const flyerStory = document.getElementById("flyer");

  bandavertical.style.display = "block";

  flyerStory.style.backgroundImage = "";

  const blurBgStory = document.getElementById("flyer-blur-bg-story");

  if (blurBgStory) {
    blurBgStory.remove();
  }
});

document.getElementById("load-backdrop-direct").addEventListener("click", () => {
    const input = document.getElementById("backdrop-direct-input").value.trim();

    if (!input) {
        alert("Por favor, ingresa una URL del backdrop");
        return;
    }

    if (!input.startsWith("http")) {
        alert("Por favor, ingresa una URL completa que comience con http:// o htt://");
        return;
    }

    let filePath = "";
    if (input.includes("image.tmdb.org/t/p/original")) {
        filePath = input.replace("https://image.tmdb.org/t/p/original", "");
    } else {
        filePath = input;
    }

    const newBackdrop = {file_path: filePath, aspect_ratio: 1.778};

    GlobalState.backdrops.unshift(newBackdrop);
    GlobalStatee.currentBackdrop = 0;

    showBackdrop(GlobalState.currentBackdrop);

    // Aplicar automáticamente como fondo del flyer
    const fullUrl = filePath.startsWith("http")
        ? filePath
        : `https://image.tmdb.org/t/p/original${filePath}`;
    // bandavertical.style.display = "none";
    setBackdropAsBackground(fullUrl);

    document.getElementById("backdrop-direct-input").value = "";
});


document.getElementById("backdrops").addEventListener("click", (e) => {
  e.preventDefault();
  if (!GlobalState.selectedMovie.id) return;
  window.open(
    `https://www.themoviedb.org/movie/${GlobalState.selectedMovie.id}/images/backdrops`,
    "_blank",
  );
});

// POSTERS
//
document.getElementById("load-poster-direct").addEventListener("click", () => {
  const input = document.getElementById("poster-direct-input").value.trim();

  if (!input) {
    alert("Por favor, ingresa una URL del poster");
    return;
  }

  if (!input.startsWith("http")) {
    alert("Por favor, ingresa una URL completa que comience con http:// o https://");
    return;
  }

  let filePath = "";
  if (input.includes("image.tmdb.org/t/p/original")) {
    filePath = input.replace("https://image.tmdb.org/t/p/original", "");
  } else {
    filePath = input;
  }

  const newPoster = {file_path: filePath, aspect_ratio: 0.667};

  GlobalState.posters.unshift(newPoster);
  GlobalState.currentPoster = 0;
  showPoster(GlobalState.currentPoster);
  const fullUrl = filePath.startsWith("http")? filePath : `https://image.tmdb.org/t/p/original${filePath}`;
  setPoster(fullUrl);
  document.getElementById("poster-direct-input").value = "";
});

document.getElementById("poster-carousel-img").addEventListener("click", () => {
    let posters = GlobalState.posters;
    let currentPoster = GlobalState.currentPoster;
    if (posters.length > 0) {
        const currentPosterData = posters[currentPoster];
        const filePath = currentPosterData.file_path;
        const fullUrl = filePath.startsWith("http")? filePath : `https://image.tmdb.org/t/p/original${filePath}`;

        navigator.clipboard.writeText(fullUrl).then(() => {
            alert("URL copiada al portapapeles");
        });
    }
});

document.getElementById("backdrop-carousel-img").addEventListener("click", () => {
    if (GlobalState.backdrops.length > 0) {
        const currentBackdropData = GlobalState.backdrops[GlobalState.currentBackdrop];
        const filePath = currentBackdropData.file_path;

        const fullUrl = filePath.startsWith("http")
            ? filePath
            : `https://image.tmdb.org/t/p/original${filePath}`;

        navigator.clipboard.writeText(fullUrl).then(() => {
            alert("URL copiada al portapapeles");
        });
    }
});

document.getElementById("posters").addEventListener("click", (e) => {
  e.preventDefault();
  if (!GlobalState.selectedMovie.id) return;
  window.open(
    `https://www.themoviedb.org/movie/${GlobalState.selectedMovie.id}/images/posters`,
    "_blank",
  );
});
