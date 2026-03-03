function exportUserData() {
  const { colors, strokes } = extractElementColors();
  const userData = {
    selectedMovie: {
      id: window.selectedMovieId || null,
      title: document.getElementById("title-review").textContent,
      year: document.getElementById("year-review").textContent,
      director: document.getElementById("director-review").textContent,
      duration: document.getElementById("duracion-review").textContent,
      synopsis: {
        story: document.getElementById("sinapsis-review").textContent,
      },
      origin: {
        story: document.getElementById("origen-review").textContent,
      },
      posterUrl: document.getElementById("poster-review").src,
      ageRating: document.getElementById("edad-sugerida-review").textContent,
    },

    formData: {
      titleReview: document.getElementById("titleInputReview").value,
      synopsisReview: document.getElementById("sinapsisInputReview").value,
      ageRatingReview: document.getElementById("edadSugeridaInputReview").value,
    },

    designSettings: {
      fontSizes: {
        flyerTitleReview: document.getElementById("flyerTitleFontSizeInputReview").value,
        flyerSynopsisStory: document.getElementById("flyerSynopsisFontSizeInputStory").value,
      },
      colors: colors,
      textStrokes: strokes,
    },

    images: {
      currentBackdrop: currentBackdrop,
      currentPoster: currentPoster,
      backdrops: backdrops.slice(0, 10),
      posters: posters.slice(0, 10),
      backgroundImages: {
        review: extractBackgroundImage("flyer-blur-bg-review"),
      },
    },

    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  const movieTitle =
    userData.selectedMovie.title
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_") || "flyer";
  const filename = `${movieTitle}_datos_${new Date().toISOString().slice(0, 10)}.json`;

  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("Datos exportados exitosamente:", filename);
}

function extractElementColors() {
  const elements = [
    "header-review",
    "title-review",
    "year-review",
    "director-review",
    "duracion-review",
    "org-review",
    "sinapsis-review",
    "origen-review",
    "edad-sugerida-review"
  ];

  const colors = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    colors[id] = {
      color: element.style.color || "",
      backgroundColor: element.style.backgroundColor || "",
    };
  });

  const strokes = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element.style.textShadow) {
      strokes[id] = element.style.textShadow;
    }
  });

  const classElements = [
    { selector: ".rect2-review", name: "rect2-review" },
    { selector: ".tape", name: "tape" },
  ];

  classElements.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (element) {
      colors[name] = {
        color: element.style.color || "",
        backgroundColor: element.style.backgroundColor || "",
      };
    }
  });

  return { colors, strokes };
}

function extractBackgroundImage(elementId) {
  const element = document.getElementById(elementId);
  if (element && element.style.backgroundImage) {
    const match = element.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    return match ? match[1] : "";
  }
  return "";
}

function restoreMovieData(movieData) {
  if (!movieData) return;

  if (movieData.id) window.selectedMovieId = movieData.id;

  if (movieData.title) {
    document.getElementById("title-review").innerHTML = movieData.title.replace(/\n/g, "<br>");
  }
  if (movieData.year) {
    document.getElementById("year-review").textContent = movieData.year;
  }
  if (movieData.director) {
    document.getElementById("director-review").textContent = movieData.director;
  }
  if (movieData.duration) {
    document.getElementById("duracion-review").textContent = movieData.duration;
  }
  if (movieData.synopsis && movieData.synopsis.story) {
    document.getElementById("sinapsis-review").innerHTML = movieData.synopsis.story.replace(/\n/g, "<br>");
  }
  if (movieData.origin && movieData.origin.story) {
    document.getElementById("origen-review").textContent = movieData.origin.story;
  }
  if (movieData.posterUrl && movieData.posterUrl !== "") {
    document.getElementById("poster-review").src = movieData.posterUrl;
  }
  if (movieData.ageRating) {
    const el = document.getElementById("edad-sugerida-review");
    el.textContent = movieData.ageRating;
    el.style.display = "inline-block";

    if (movieData.ageRating === "ATP") {
      el.style.backgroundColor = "#4CAF50"; el.style.color = "white";
    } else if (movieData.ageRating === "+13" || movieData.ageRating === "SAM 13") {
      el.style.backgroundColor = "#2196F3"; el.style.color = "white";
    } else if (movieData.ageRating === "+16" || movieData.ageRating === "SAM 16") {
      el.style.backgroundColor = "#FF9800"; el.style.color = "white";
    } else if (movieData.ageRating === "+18" || movieData.ageRating === "SAM 18") {
      el.style.backgroundColor = "#f44336"; el.style.color = "white";
    } else {
      el.style.backgroundColor = "#777"; el.style.color = "white";
    }
  }
}

function restoreFormData(formData) {
  if (!formData) return;
  document.getElementById("titleInputReview").value = formData.titleReview || "";
  document.getElementById("sinapsisInputReview").value = formData.synopsisReview || "";
  document.getElementById("edadSugeridaInputReview").value = formData.ageRatingReview || "";
}

function restoreDesignSettings(designSettings) {
  if (!designSettings) return;

  if (designSettings.colors) {
    Object.keys(designSettings.colors).forEach((elementKey) => {
      const colorData = designSettings.colors[elementKey];
      let element;

      if (elementKey.startsWith(".") || ["rect2-review", "tape"].includes(elementKey)) {
        const selector = elementKey.startsWith(".") ? elementKey : `.${elementKey}`;
        element = document.querySelector(selector);
      } else {
        element = document.getElementById(elementKey);
      }

      if (element && colorData) {
        if (colorData.color) element.style.color = colorData.color;
        if (colorData.backgroundColor) element.style.backgroundColor = colorData.backgroundColor;
      }
    });
  }

  if (designSettings.fontSizes) {
    const fontSizeFields = [
      { id: "flyerTitleFontSizeInputReview", value: designSettings.fontSizes.flyerTitleReview },
      { id: "flyerSynopsisFontSizeInputStory", value: designSettings.fontSizes.flyerSynopsisStory },
    ];

    fontSizeFields.forEach((field) => {
      if (field.value !== undefined && field.value !== null && field.value !== "") {
        const element = document.getElementById(field.id);
        if (element) {
          element.value = field.value;
          element.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (designSettings.textStrokes) {
    Object.keys(designSettings.textStrokes).forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.textShadow = designSettings.textStrokes[elementId];
      }
    });
  }
}

function restoreImages(imagesData) {
  if (!imagesData) return;

  if (imagesData.backdrops && Array.isArray(imagesData.backdrops)) {
    backdrops = [...imagesData.backdrops];
    if (typeof imagesData.currentBackdrop === "number") {
      currentBackdrop = Math.min(imagesData.currentBackdrop, backdrops.length - 1);
    }
    if (backdrops.length > 0) shiftBackdrop(currentBackdrop);
  }

  if (imagesData.posters && Array.isArray(imagesData.posters)) {
    posters = [...imagesData.posters];
    if (typeof imagesData.currentPoster === "number") {
      currentPoster = Math.min(imagesData.currentPoster, posters.length - 1);
    }
    if (posters.length > 0) shiftPoster(currentPoster);
  }

  if (imagesData.backgroundImages && imagesData.backgroundImages.review) {
    setBackdropAsBackgroundReview(imagesData.backgroundImages.review);
  }
}

function validateUserData(data) {
  const defaultData = {
    selectedMovie: {},
    formData: {},
    designSettings: {},
    images: {},
  };
  return { ...defaultData, ...data };
}

function importUserData(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const userData = JSON.parse(e.target.result);
      const validatedData = validateUserData(userData);

      console.log("Importando datos de usuario:", validatedData);

      try {
        restoreMovieData(validatedData.selectedMovie);
        restoreFormData(validatedData.formData);
        restoreDesignSettings(validatedData.designSettings);
        restoreImages(validatedData.images);
      } catch (restoreError) {
        console.error("Error durante la restauración:", restoreError);
      }
    } catch (error) {
      console.error("Error al parsear el JSON:", error);
      alert("Error al leer el archivo. Verifica que sea un JSON válido.");
    }
  };

  reader.onerror = function () {
    console.error("Error de lectura del archivo");
    alert("Hubo un problema al leer el archivo.");
  };

  reader.readAsText(file);
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    alert(
      "El archivo no es un JSON válido. Por favor selecciona un archivo con extensión .json"
    );
    event.target.value = "";
    return;
  }

  const fileInfo = `Datos del archivo cargado:
• Nombre: ${file.name}
• Tamaño: ${(file.size / 1024).toFixed(2)} KB
• Última modificación: ${new Date(file.lastModified).toLocaleString()}`;

  if (confirm(fileInfo)) {
    const loadingIndicator = showLoadingIndicator("Importando datos...");

    setTimeout(() => {
      importUserData(file);
      hideLoadingIndicator(loadingIndicator);
    }, 100);
  }

  event.target.value = "";
}

function showLoadingIndicator(message) {
  const indicator = document.createElement("div");
  indicator.id = "loading-indicator";
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px 40px;
    border-radius: 10px;
    z-index: 10001;
    text-align: center;
    font-size: 16px;
  `;
  indicator.innerHTML = `
    <div style="margin-bottom: 10px;">Cargando</div>
    <div>${message}</div>
  `;
  document.body.appendChild(indicator);
  return indicator;
}

function hideLoadingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}