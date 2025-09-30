const API_KEY = "c733c18f5b61209aa7ea217bd007b156";
const BASE_URL = "https://api.themoviedb.org/3";

let selectedMovies = [];
let allBackdrops = [];
let currentBackdrop = 0;
let individualDates = {};
let elementColors = {};

document.getElementById("movieForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = document.getElementById("movieSearch").value;
  const language = document.getElementById("movieLanguage").value || "en";
  window.lastMovieLanguage = language;

  try {
    const searchRes = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${language}`
    );
    const searchData = await searchRes.json();

    if (searchData.results.length === 0) {
      alert("No se encontró la película.");
      return;
    }

    displaySearchResults(searchData.results.slice(0, 10), language);
  } catch (error) {
    console.error("Error al buscar películas:", error);
    alert("Error al buscar películas. Por favor intenta de nuevo.");
  }
});

async function displaySearchResults(movies, language) {
  const resultsDiv = document.getElementById("movie-results");
  resultsDiv.innerHTML = "";

  if (movies.length === 0) {
    resultsDiv.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  resultsDiv.innerHTML = "<h3>Resultados de búsqueda:</h3>";

  for (const movie of movies) {
    try {
      const [creditsRes, detailsRes] = await Promise.all([
        fetch(
          `${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}&language=${language}`
        ),
        fetch(
          `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=${language}`
        ),
      ]);

      const creditsData = await creditsRes.json();
      const movieDetails = await detailsRes.json();
      const director = creditsData.crew.find((c) => c.job === "Director");

      const result = document.createElement("div");
      result.style.cssText = `
        cursor: pointer;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        background: #f9f9f9;
        transition: background 0.2s;
      `;

      result.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" 
             style="width:60px;height:auto;margin-right:15px;border-radius:4px;" />
        <div style="flex: 1;">
          <div style="font-weight:bold;font-size:16px;margin-bottom:4px;">${
            movie.title
          }</div>
          <div style="color:#666;margin-bottom:2px;">
            <span>${new Date(movie.release_date).getFullYear()}</span>
            ${director ? ` • ${director.name}` : ""}
            ${movieDetails.runtime ? ` • ${movieDetails.runtime} min` : ""}
          </div>
          <div style="font-size:14px;color:#888;">${
            movie.overview
              ? movie.overview.substring(0, 120) + "..."
              : "Sin sinopsis disponible"
          }</div>
        </div>
        <button class="add-movie-btn" data-movie-id="${movie.id}"
                style="margin-left:10px;padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;"
                ${
                  selectedMovies.length >= 4
                    ? 'disabled style="background:#ccc;"'
                    : ""
                }>
          ${
            selectedMovies.some((m) => m.id === movie.id)
              ? "Ya agregada"
              : "Agregar"
          }
        </button>
      `;

      const addButton = result.querySelector(".add-movie-btn");
      if (addButton) {
        addButton.addEventListener("click", () => {
          addMovieToCycle(movie.id, language);
        });
      }

      result.addEventListener("mouseenter", () => {
        result.style.background = "#e9ecef";
      });

      result.addEventListener("mouseleave", () => {
        result.style.background = "#f9f9f9";
      });

      resultsDiv.appendChild(result);
    } catch (error) {
      console.error(`Error al obtener detalles de ${movie.title}:`, error);
    }
  }
}

async function addMovieToCycle(movieId, language) {
  if (selectedMovies.length >= 4) {
    alert("Máximo 4 películas por ciclo.");
    return;
  }

  if (selectedMovies.some((m) => m.id === movieId)) {
    alert("Esta película ya está en el ciclo.");
    return;
  }

  try {
    const lang = language || window.lastMovieLanguage || "en";
    const [detailsRes, creditsRes, imagesRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${lang}`),
      fetch(
        `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=${lang}`
      ),
      fetch(
        `${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}&include_image_language=null`
      ),
    ]);

    const movieDetails = await detailsRes.json();
    const creditsData = await creditsRes.json();
    const imagesData = await imagesRes.json();

    console.log("Movie details:", movieDetails);
    console.log("Credits data:", creditsData);
    console.log("Images data:", imagesData);

    if (!movieDetails || !movieDetails.title) {
      console.error("Invalid movie details:", movieDetails);
      throw new Error("No se pudieron obtener los detalles de la película");
    }

    const director =
      creditsData && creditsData.crew
        ? creditsData.crew.find((c) => c.job === "Director")
        : null;

    const movieData = {
      id: movieId,
      title: movieDetails.title || "Título no disponible",
      year: movieDetails.release_date
        ? new Date(movieDetails.release_date).getFullYear()
        : new Date().getFullYear(),
      director: director ? director.name : "Director no disponible",
      runtime: movieDetails.runtime || 120,
      poster_path: movieDetails.poster_path || "",
      overview: movieDetails.overview || "",
      backdrops: imagesData && imagesData.backdrops ? imagesData.backdrops : [],
      language: lang,
    };

    selectedMovies.push(movieData);
    console.log("Película agregada exitosamente:", movieData);

    allBackdrops = [...allBackdrops, ...movieData.backdrops];

    updateSelectedMoviesList(lang);
    updateFlyerDisplay();
    updateSearchButtons();

    if (allBackdrops.length > 0 && currentBackdrop === 0) {
      showBackdrop(0);
    }

    document.getElementById("movieSearch").value = "";
    document.getElementById("movie-results").innerHTML = "";
  } catch (error) {
    console.error("Error al agregar película:", error);
    alert("Error al agregar la película. Por favor intenta de nuevo.");
  }
}

function updateSelectedMoviesList(lang) {
  const listContainer = document.getElementById("selected-movies-list");

  if (!listContainer) {
    console.warn("Elemento selected-movies-list no encontrado");
    return;
  }

  if (selectedMovies.length === 0) {
    listContainer.innerHTML = `
      <p id="instrucciones" style="text-align: center; color: #666; font-style: italic;">
        No hay películas agregadas. Busca y selecciona hasta 4 películas para el ciclo.
      </p>
    `;
    const datesSection = document.getElementById("individual-dates-section");
    if (datesSection) {
      datesSection.style.display = "none";
    }
    return;
  }

  listContainer.innerHTML = "";

  selectedMovies.forEach((movie, index) => {
    const movieItem = document.createElement("div");
    movieItem.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f8f9fa;
    `;

    movieItem.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" 
           style="width:50px;height:auto;margin-right:12px;border-radius:4px;" />
      <div style="flex: 1;">
        <div style="font-weight:bold;">${movie.title}</div>
        <div style="color:#666;font-size:14px;">${movie.year} • ${
      movie.director
    } • ${movie.runtime} min</div>
      </div>

      <div style="display: flex; gap: 8px; margin-right: 10px;">
        <button class="edit-movie-flyer-btn""
                style="padding:4px 8px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;">Generar poster individual</button>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="move-up-btn" data-index="${index}" ${
      index === 0 ? "disabled" : ""
    }
                style="padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;">↑</button>
        <button class="move-down-btn" data-index="${index}" ${
      index === selectedMovies.length - 1 ? "disabled" : ""
    }
                style="padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;">↓</button>
        <button class="remove-movie-btn" data-index="${index}"
                style="padding:4px 8px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">✕</button>
      </div>
    `;

    const moveUpBtn = movieItem.querySelector(".move-up-btn");
    const moveDownBtn = movieItem.querySelector(".move-down-btn");
    const removeBtn = movieItem.querySelector(".remove-movie-btn");
    const editBtn = movieItem.querySelector(".edit-movie-flyer-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => editMovieFlyer(movie, lang));
    }

    if (moveUpBtn && !moveUpBtn.disabled) {
      moveUpBtn.addEventListener("click", () => moveMovie(index, -1));
    }
    if (moveDownBtn && !moveDownBtn.disabled) {
      moveDownBtn.addEventListener("click", () => moveMovie(index, 1));
    }
    if (removeBtn) {
      removeBtn.addEventListener("click", () => removeMovie(index));
    }

    listContainer.appendChild(movieItem);
  });

  const counter = document.createElement("div");
  counter.style.cssText = "text-align: center; margin-top: 10px; color: #666;";
  counter.textContent = `${selectedMovies.length}/4 películas agregadas`;
  listContainer.appendChild(counter);

  updateIndividualDatesSection();
}

function preserveCurrentColors() {
  const colors = {};
  const textShadows = {};

  selectedMovies.forEach((movie, index) => {
    const movieId = movie.id;
    const storyTitle = document.querySelectorAll(".movie-title")[index];
    const feedTitle = document.querySelectorAll(".movie-title-feed")[index];
    if (
      storyTitle &&
      (storyTitle.style.color ||
        storyTitle.style.backgroundColor ||
        storyTitle.style.textShadow)
    ) {
      colors[`movieTitle-${movieId}`] = {
        color: storyTitle.style.color,
        background: storyTitle.style.backgroundColor,
      };
      if (storyTitle.style.textShadow) {
        textShadows[`movieTitle-${movieId}`] = storyTitle.style.textShadow;
      }
    }

    const storyInfo = document.querySelectorAll(".movie-info")[index];
    const feedInfo = document.querySelectorAll(".movie-info-feed")[index];
    if (
      storyInfo &&
      (storyInfo.style.color ||
        storyInfo.style.backgroundColor ||
        storyInfo.style.textShadow)
    ) {
      colors[`movieInfo-${movieId}`] = {
        color: storyInfo.style.color,
        background: storyInfo.style.backgroundColor,
      };
      if (storyInfo.style.textShadow) {
        textShadows[`movieInfo-${movieId}`] = storyInfo.style.textShadow;
      }
    }

    const storyDate = document.querySelectorAll(".movie-date")[index];
    const feedDate = document.querySelectorAll(".movie-date-feed")[index];
    if (
      storyDate &&
      (storyDate.style.color ||
        storyDate.style.backgroundColor ||
        storyDate.style.textShadow)
    ) {
      colors[`movieDate-${movieId}`] = {
        color: storyDate.style.color,
        background: storyDate.style.backgroundColor,
      };
      if (storyDate.style.textShadow) {
        textShadows[`movieDate-${movieId}`] = storyDate.style.textShadow;
      }
    }

    const storyDetails = document.querySelectorAll(".movie-details")[index];
    if (
      storyDetails &&
      (storyDetails.style.color ||
        storyDetails.style.backgroundColor ||
        storyDetails.style.textShadow)
    ) {
      colors[`movieDetails-${movieId}`] = {
        color: storyDetails.style.color,
        background: storyDetails.style.backgroundColor,
      };
      if (storyDetails.style.textShadow) {
        textShadows[`movieDetails-${movieId}`] = storyDetails.style.textShadow;
      }
    }

    const storyItem = document.querySelectorAll(".movie-item-alternating")[
      index
    ];
    const feedItem = document.querySelectorAll(".movie-item-feed")[index];
    if (
      storyItem &&
      (storyItem.style.color ||
        storyItem.style.backgroundColor ||
        storyItem.style.textShadow)
    ) {
      colors[`movie-item-${movieId}`] = {
        color: storyItem.style.color,
        background: storyItem.style.backgroundColor,
      };
      if (storyItem.style.textShadow) {
        textShadows[`movie-item-${movieId}`] = storyItem.style.textShadow;
      }
    }
    if (
      feedItem &&
      (feedItem.style.color ||
        feedItem.style.backgroundColor ||
        feedItem.style.textShadow)
    ) {
      colors[`movie-item-feed-${movieId}`] = {
        color: feedItem.style.color,
        background: feedItem.style.backgroundColor,
      };
      if (feedItem.style.textShadow) {
        textShadows[`movie-item-feed-${movieId}`] = feedItem.style.textShadow;
      }
    }
  });

  const globalElements = [
    { id: "ciclo", selector: "#ciclo" },
    { id: "ciclo-feed", selector: "#ciclo-feed" },
    { id: "flyer-hour", selector: "#flyer-hour" },
    { id: "flyer-hour-feed", selector: "#flyer-hour-feed" },
    { id: "flyer-biblioteca", selector: "#flyer-biblioteca" },
    { id: "flyer-biblioteca-feed", selector: "#flyer-biblioteca-feed" },
    { id: "org", selector: "#org" },
    { id: "org-feed", selector: "#org-feed" },
    { id: "cycle-description-text", selector: "#cycle-description-text" },
    {
      id: "cycle-description-text-feed",
      selector: "#cycle-description-text-feed",
    },
    { id: "header", selector: ".header" },
    { id: "header-feed", selector: ".header-feed" },
  ];

  globalElements.forEach(({ id, selector }) => {
    const element = document.querySelector(selector);
    if (element && element.style.textShadow) {
      textShadows[id] = element.style.textShadow;
    }
  });

  return { colors, textShadows };
}

function restoreTextShadows(textShadows) {
  selectedMovies.forEach((movie, index) => {
    const movieId = movie.id;

    const titleKey = `movieTitle-${movieId}`;
    if (textShadows[titleKey]) {
      const storyTitle = document.querySelectorAll(".movie-title")[index];
      const feedTitle = document.querySelectorAll(".movie-title-feed")[index];
      if (storyTitle) storyTitle.style.textShadow = textShadows[titleKey];
      if (feedTitle) feedTitle.style.textShadow = textShadows[titleKey];
    }

    const infoKey = `movieInfo-${movieId}`;
    if (textShadows[infoKey]) {
      const storyInfo = document.querySelectorAll(".movie-info")[index];
      const feedInfo = document.querySelectorAll(".movie-info-feed")[index];
      if (storyInfo) storyInfo.style.textShadow = textShadows[infoKey];
      if (feedInfo) feedInfo.style.textShadow = textShadows[infoKey];
    }

    const dateKey = `movieDate-${movieId}`;
    if (textShadows[dateKey]) {
      const storyDate = document.querySelectorAll(".movie-date")[index];
      const feedDate = document.querySelectorAll(".movie-date-feed")[index];
      if (storyDate) storyDate.style.textShadow = textShadows[dateKey];
      if (feedDate) feedDate.style.textShadow = textShadows[dateKey];
    }

    const detailsKey = `movieDetails-${movieId}`;
    if (textShadows[detailsKey]) {
      const storyDetails = document.querySelectorAll(".movie-details")[index];
      if (storyDetails) storyDetails.style.textShadow = textShadows[detailsKey];
    }

    const itemKey = `movie-item-${movieId}`;
    if (textShadows[itemKey]) {
      const storyItem = document.querySelectorAll(".movie-item-alternating")[
        index
      ];
      if (storyItem) storyItem.style.textShadow = textShadows[itemKey];
    }

    const itemFeedKey = `movie-item-feed-${movieId}`;
    if (textShadows[itemFeedKey]) {
      const feedItem = document.querySelectorAll(".movie-item-feed")[index];
      if (feedItem) feedItem.style.textShadow = textShadows[itemFeedKey];
    }
  });

  const globalElementsMap = {
    ciclo: "#ciclo",
    "ciclo-feed": "#ciclo-feed",
    "flyer-hour": "#flyer-hour",
    "flyer-hour-feed": "#flyer-hour-feed",
    "flyer-biblioteca": "#flyer-biblioteca",
    "flyer-biblioteca-feed": "#flyer-biblioteca-feed",
    org: "#org",
    "org-feed": "#org-feed",
    "cycle-description-text": "#cycle-description-text",
    "cycle-description-text-feed": "#cycle-description-text-feed",
    header: ".header",
    "header-feed": ".header-feed",
  };

  Object.keys(globalElementsMap).forEach((key) => {
    if (textShadows[key]) {
      const element = document.querySelector(globalElementsMap[key]);
      if (element) {
        element.style.textShadow = textShadows[key];
      }
    }
  });
}

function restorePreservedColors(preservedData) {
  const { colors, textShadows } = preservedData;

  if (colors) {
    Object.keys(colors).forEach((key) => {
      if (!elementColors[key]) elementColors[key] = {};
      elementColors[key] = { ...elementColors[key], ...colors[key] };
    });
  }

  setTimeout(() => {
    applySavedColors("story");
    applySavedColors("feed");

    if (textShadows) {
      restoreTextShadows(textShadows);
    }
  }, 50);
}

function moveMovie(index, direction) {
  const currentColors = preserveCurrentColors();

  if (direction === -1 && index > 0) {
    [selectedMovies[index], selectedMovies[index - 1]] = [
      selectedMovies[index - 1],
      selectedMovies[index],
    ];
  } else if (direction === 1 && index < selectedMovies.length - 1) {
    [selectedMovies[index], selectedMovies[index + 1]] = [
      selectedMovies[index + 1],
      selectedMovies[index],
    ];
  }

  updateSelectedMoviesList();
  updateFlyerDisplay();
  restorePreservedColors(currentColors);
}

function removeMovie(index) {
  const movieId = selectedMovies[index].id;
  selectedMovies.splice(index, 1);
  delete individualDates[movieId];

  allBackdrops = [];
  selectedMovies.forEach((movie) => {
    allBackdrops = [...allBackdrops, ...movie.backdrops];
  });

  updateSelectedMoviesList();
  updateFlyerDisplay();
  updateSearchButtons();

  if (allBackdrops.length > 0) {
    currentBackdrop = 0;
    showBackdrop(0);
  } else {
    document.getElementById("backdrop-carousel-img").src = "";
    document.getElementById("backdrop-counter").textContent = "";
  }
}

function updateIndividualDatesSection() {
  const section = document.getElementById("individual-dates-section");
  const container = document.getElementById("individual-dates-container");

  if (!section || !container) {
    console.warn("Elementos de fechas individuales no encontrados");
    return;
  }

  if (selectedMovies.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  container.innerHTML = "";

  selectedMovies.forEach((movie, index) => {
    const dateInput = document.createElement("div");
    dateInput.style.cssText = "display: flex; align-items: center; gap: 10px;";

    if (!individualDates[movie.id]) {
      const baseDate = new Date("2025-08-06");
      baseDate.setDate(baseDate.getDate() + index);
      individualDates[movie.id] = baseDate.toISOString().split("T")[0];
    }

    dateInput.innerHTML = `
      <input type="text" id="movie-title-${
        movie.id
      }" value="${movie.title.replace(/"/g, "&quot;")}" 
        style="min-width: 180px; font-size: 13px; padding: 6px; border-radius: 6px; border: 1px solid #444; background: #fff; color: #222; margin-right: 8px;">
      <input type="date" id="movie-date-${movie.id}" value="${
      individualDates[movie.id]
    }" 
        style="padding: 6px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff;">
    `;

    container.appendChild(dateInput);
  });

  addIndividualDateListeners();
  addIndividualTitleListeners();
}

function updateSearchButtons() {
  const buttons = document.querySelectorAll("#movie-results button");
  buttons.forEach((button) => {
    if (selectedMovies.length >= 4) {
      button.disabled = true;
      button.style.background = "#ccc";
    } else {
      button.disabled = false;
      button.style.background = "#007bff";
    }
  });
}

function updateFlyerDisplay() {
  updateStoryFlyer();
  updateFeedFlyer();

  setTimeout(() => {
    addEyedropperToMoviePosters();
    addComicEyedropperToImages();
    syncColorsBetweenModes();
  }, 100);
}

function calculateMovieItemSize(movieCount) {
  if (movieCount === 0) return { width: 140, spacing: 25, padding: 20 };

  const availableHeight = 1920 - 600;

  let itemSpacing, itemPadding, posterWidth;

  switch (movieCount) {
    case 1:
      itemSpacing = 100;
      itemPadding = 40;
      posterWidth = 280;
      break;
    case 2:
      itemSpacing = 100;
      itemPadding = 30;
      posterWidth = 300;
      break;
    case 3:
      itemSpacing = 50;
      itemPadding = 20;
      posterWidth = 220;
      break;
    case 4:
      itemSpacing = 25;
      itemPadding = 10;
      posterWidth = 140;
      break;
    default:
      itemSpacing = 35;
      itemPadding = 30;
      posterWidth = 160;
  }

  return { width: posterWidth, spacing: itemSpacing, padding: itemPadding };
}

function getElementsForColorKey(key, mode) {
  const elements = [];

  switch (key) {
    case "ciclo":
      elements.push(document.getElementById("ciclo"));
      if (mode === "feed") elements.push(document.getElementById("ciclo-feed"));
      break;
    case "flyer-hour":
      elements.push(document.getElementById("flyer-hour"));
      if (mode === "feed")
        elements.push(document.getElementById("flyer-hour-feed"));
      break;
    case "flyer-biblioteca":
      elements.push(document.getElementById("flyer-biblioteca"));
      if (mode === "feed")
        elements.push(document.getElementById("flyer-biblioteca-feed"));
      break;
    case "org":
      elements.push(document.getElementById("org"));
      if (mode === "feed") elements.push(document.getElementById("org-feed"));
      break;
    case "cycle-description-text":
      elements.push(document.getElementById("cycle-description-text"));
      if (mode === "feed")
        elements.push(document.getElementById("cycle-description-text-feed"));
      break;
    case "header":
      elements.push(document.querySelector(".header"));
      if (mode === "feed")
        elements.push(document.querySelector(".header-feed"));
      break;
    case "rect":
      elements.push(document.querySelector(".rect"));
      if (mode === "feed") elements.push(document.querySelector(".rect-feed"));
      break;
    case "rect2":
      elements.push(document.querySelector(".rect2"));
      if (mode === "feed") elements.push(document.querySelector(".rect2-feed"));
      break;
    case "tape":
      elements.push(document.querySelector(".tape"));
      break;
    case "flyer-story":
      elements.push(document.getElementById("flyer-story"));
      break;
    case "flyer-feed":
      elements.push(document.getElementById("flyer-feed"));
      break;
  }

  return elements.filter((el) => el !== null);
}

function applySavedColors(mode) {
  selectedMovies.forEach((movie, index) => {
    const movieId = movie.id;

    const titleKey = `movieTitle-${movieId}`;
    if (elementColors[titleKey]) {
      const titleElements =
        mode === "story"
          ? [document.querySelectorAll(".movie-title")[index]]
          : [document.querySelectorAll(".movie-title-feed")[index]];

      titleElements.forEach((el) => {
        if (el) {
          if (elementColors[titleKey].color)
            el.style.color = elementColors[titleKey].color;
          if (elementColors[titleKey].background)
            el.style.backgroundColor = elementColors[titleKey].background;
        }
      });
    }

    const infoKey = `movieInfo-${movieId}`;
    if (elementColors[infoKey]) {
      const infoElements =
        mode === "story"
          ? [document.querySelectorAll(".movie-info")[index]]
          : [document.querySelectorAll(".movie-info-feed")[index]];

      infoElements.forEach((el) => {
        if (el) {
          if (elementColors[infoKey].color)
            el.style.color = elementColors[infoKey].color;
          if (elementColors[infoKey].background)
            el.style.backgroundColor = elementColors[infoKey].background;
        }
      });
    }

    const dateKey = `movieDate-${movieId}`;
    if (elementColors[dateKey]) {
      const dateElements =
        mode === "story"
          ? [document.querySelectorAll(".movie-date")[index]]
          : [document.querySelectorAll(".movie-date-feed")[index]];

      dateElements.forEach((el) => {
        if (el) {
          if (elementColors[dateKey].color)
            el.style.color = elementColors[dateKey].color;
          if (elementColors[dateKey].background)
            el.style.backgroundColor = elementColors[dateKey].background;
        }
      });
    }

    if (mode === "story") {
      const detailsKey = `movieDetails-${movieId}`;
      if (elementColors[detailsKey]) {
        const detailsElement =
          document.querySelectorAll(".movie-details")[index];
        if (detailsElement) {
          if (elementColors[detailsKey].color)
            detailsElement.style.color = elementColors[detailsKey].color;
          if (elementColors[detailsKey].background)
            detailsElement.style.backgroundColor =
              elementColors[detailsKey].background;
        }
      }
    }

    const itemKey =
      mode === "story" ? `movie-item-${movieId}` : `movie-item-feed-${movieId}`;
    if (elementColors[itemKey]) {
      const itemElement =
        mode === "story"
          ? document.querySelectorAll(".movie-item-alternating")[index]
          : document.querySelectorAll(".movie-item-feed")[index];

      if (itemElement) {
        if (elementColors[itemKey].color)
          itemElement.style.color = elementColors[itemKey].color;
        if (elementColors[itemKey].background)
          itemElement.style.backgroundColor = elementColors[itemKey].background;
      }
    }
  });

  Object.keys(elementColors).forEach((key) => {
    if (!key.includes("-") || !key.match(/-(\d+)$/)) {
      const elements = getElementsForColorKey(key, mode);
      elements.forEach((el) => {
        if (elementColors[key].color) el.style.color = elementColors[key].color;
        if (elementColors[key].background)
          el.style.backgroundColor = elementColors[key].background;
      });
    }
  });

  syncColorsBetweenModes();
}

function syncColorsBetweenModes() {
  selectedMovies.forEach((movie, index) => {
    const movieId = movie.id;
    const storyTitle = document.querySelectorAll(".movie-title")[index];
    const feedTitle = document.querySelectorAll(".movie-title-feed")[index];
    if (storyTitle && feedTitle) {
      if (storyTitle.style.color)
        feedTitle.style.color = storyTitle.style.color;
      if (storyTitle.style.backgroundColor)
        feedTitle.style.backgroundColor = storyTitle.style.backgroundColor;
      if (feedTitle.style.color) storyTitle.style.color = feedTitle.style.color;
      if (feedTitle.style.backgroundColor)
        storyTitle.style.backgroundColor = feedTitle.style.backgroundColor;
    }

    const storyInfo = document.querySelectorAll(".movie-info")[index];
    const feedInfo = document.querySelectorAll(".movie-info-feed")[index];
    if (storyInfo && feedInfo) {
      if (storyInfo.style.color) feedInfo.style.color = storyInfo.style.color;
      if (storyInfo.style.backgroundColor)
        feedInfo.style.backgroundColor = storyInfo.style.backgroundColor;
      if (feedInfo.style.color) storyInfo.style.color = feedInfo.style.color;
      if (feedInfo.style.backgroundColor)
        storyInfo.style.backgroundColor = feedInfo.style.backgroundColor;
    }

    const storyDate = document.querySelectorAll(".movie-date")[index];
    const feedDate = document.querySelectorAll(".movie-date-feed")[index];
    if (storyDate && feedDate) {
      if (storyDate.style.color) feedDate.style.color = storyDate.style.color;
      if (storyDate.style.backgroundColor)
        feedDate.style.backgroundColor = storyDate.style.backgroundColor;
      if (feedDate.style.color) storyDate.style.color = feedDate.style.color;
      if (feedDate.style.backgroundColor)
        storyDate.style.backgroundColor = feedDate.style.backgroundColor;
    }

    const storyItem = document.querySelectorAll(".movie-item-alternating")[
      index
    ];
    const feedItem = document.querySelectorAll(".movie-item-feed")[index];
    if (storyItem && feedItem) {
      if (storyItem.style.color) feedItem.style.color = storyItem.style.color;
      if (storyItem.style.backgroundColor)
        feedItem.style.backgroundColor = storyItem.style.backgroundColor;
      if (feedItem.style.color) storyItem.style.color = feedItem.style.color;
      if (feedItem.style.backgroundColor)
        storyItem.style.backgroundColor = feedItem.style.backgroundColor;
    }
  });

  const globalSyncPairs = [
    ["ciclo", "ciclo-feed"],
    ["flyer-hour", "flyer-hour-feed"],
    ["flyer-biblioteca", "flyer-biblioteca-feed"],
    ["org", "org-feed"],
    ["cycle-description-text", "cycle-description-text-feed"],
    [".header", ".header-feed"],
    [".rect", ".rect-feed"],
    [".rect2", ".rect2-feed"],
  ];

  globalSyncPairs.forEach(([storySelector, feedSelector]) => {
    const storyEl = storySelector.startsWith(".")
      ? document.querySelector(storySelector)
      : document.getElementById(storySelector);
    const feedEl = feedSelector.startsWith(".")
      ? document.querySelector(feedSelector)
      : document.getElementById(feedSelector);

    if (storyEl && feedEl) {
      if (storyEl.style.color) feedEl.style.color = storyEl.style.color;
      if (storyEl.style.backgroundColor)
        feedEl.style.backgroundColor = storyEl.style.backgroundColor;
      if (feedEl.style.color) storyEl.style.color = feedEl.style.color;
      if (feedEl.style.backgroundColor)
        storyEl.style.backgroundColor = feedEl.style.backgroundColor;
    }
  });

  const storyFlyer = document.getElementById("flyer-story");
  const feedFlyer = document.getElementById("flyer-feed");
  if (storyFlyer && feedFlyer) {
    if (storyFlyer.style.backgroundImage) {
      feedFlyer.style.backgroundImage = storyFlyer.style.backgroundImage;
      feedFlyer.style.backgroundSize = storyFlyer.style.backgroundSize;
      feedFlyer.style.backgroundPosition = storyFlyer.style.backgroundPosition;
    }
    if (storyFlyer.style.backgroundColor) {
      feedFlyer.style.backgroundColor = storyFlyer.style.backgroundColor;
    }
    if (feedFlyer.style.backgroundImage && !storyFlyer.style.backgroundImage) {
      storyFlyer.style.backgroundImage = feedFlyer.style.backgroundImage;
      storyFlyer.style.backgroundSize = feedFlyer.style.backgroundSize;
      storyFlyer.style.backgroundPosition = feedFlyer.style.backgroundPosition;
    }
    if (feedFlyer.style.backgroundColor && !storyFlyer.style.backgroundColor) {
      storyFlyer.style.backgroundColor = feedFlyer.style.backgroundColor;
    }
  }
}

function updateStoryFlyer() {
  const container = document.getElementById("cycle-movies");

  if (!container) {
    console.warn("Elemento cycle-movies no encontrado");
    return;
  }

  if (selectedMovies.length === 0) {
    container.innerHTML = `
      <div class="cycle-movies-placeholder">
        <p style="text-align: center; color: #666; font-style: italic; padding: 40px;">
          Agrega películas al ciclo para verlas aquí
        </p>
      </div>
    `;
    return;
  }

  const sizes = calculateMovieItemSize(selectedMovies.length);

  let html = `<div class="cycle-movies-alternating" style="display: flex; flex-direction: column; gap: ${sizes.spacing}px; margin: 20px 0; max-width: 900px;">`;

  selectedMovies.forEach((movie, index) => {
    const isLeft = index % 2 === 0;
    const alignStyle = isLeft ? "flex-start" : "flex-end";
    const textAlign = isLeft ? "left" : "right";
    const flexDirection = isLeft ? "row" : "row-reverse";

    const movieDate = individualDates[movie.id];
    let formattedMovieDate = "";
    if (movieDate) {
      const date = new Date(movieDate + "T00:00:00");
      const days = [
        "DOMINGO",
        "LUNES",
        "MARTES",
        "MIÉRCOLES",
        "JUEVES",
        "VIERNES",
        "SÁBADO",
      ];
      const months = [
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

      const dayName = days[date.getDay()];
      const dayNumber = date.getDate();
      const monthName = months[date.getMonth()];

      formattedMovieDate = `${dayName} <br/>${dayNumber} DE <br/>${monthName}`;
    }

    html += `
      <div class="movie-item-alternating" style="
        display: flex; 
        align-items: center; 
        justify-content: ${alignStyle};
        background: rgba(255, 255, 255, 0.95); 
        border-radius: 15px; 
        padding: ${sizes.padding}px; 
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        max-width: 900px;
        margin: 0 ${isLeft ? "0" : "auto"} 0 ${isLeft ? "auto" : "0"};
      ">
        ${
          isLeft
            ? `
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
               crossorigin="anonymous"
               style="
                 width: ${sizes.width}px; 
                 height: auto; 
                 border-radius: 12px; 
                 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                 margin-right: ${sizes.padding}px;
               " />
          <div class="movie-details" style="
            text-align: left;
            flex: 1;
            margin-right: ${sizes.padding}px;
          ">
            <div class="movie-title" style="
              font-weight: bold; 
              font-size: ${
                sizes.width > 140 ? "32px" : sizes.width > 120 ? "26px" : "22px"
              };
              margin-bottom: 8px;
              color: #2c3e50;
              text-shadow: none;
              line-height: 1.2;
            ">${movie.title}</div>
            <div class="movie-info" style="
              font-size: ${
                sizes.width > 140 ? "26px" : sizes.width > 120 ? "24px" : "20px"
              };
              color: #7f8c8d;
              line-height: 1.4;
              text-shadow: none;
            ">
              <div><strong>${movie.year}</strong></div>
              <div>${movie.director}</div>
              <div>${movie.runtime} minutos</div>
            </div>
          </div>
          <div class="movie-date" style="
            background: rgba(4, 63, 97, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Gilroy', sans-serif;
            font-weight: 600;
            font-size: ${sizes.width > 140 ? "28px" : "20px"};
            text-align: center;
            width: 160px;
            min-width: 120px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            margin-right: ${sizes.padding}px;

          ">
            ${formattedMovieDate}
          </div>
        `
            : `
          <div class="movie-date" style="
            background: rgba(4, 63, 97, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Gilroy', sans-serif;
            font-weight: 600;
            font-size: ${sizes.width > 140 ? "28px" : "20px"};
            text-align: center;
            width: 160px;
            min-width: 120px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            margin-left: ${sizes.padding}px;
          ">
            ${formattedMovieDate}
          </div>
          <div class="movie-details" style="
            text-align: right;
            flex: 1;
            margin-left: ${sizes.padding}px;
          ">
            <div class="movie-title" style="
              font-weight: bold; 
              font-size: ${
                sizes.width > 140 ? "32px" : sizes.width > 120 ? "26px" : "22px"
              };
              margin-bottom: 8px;
              color: #2c3e50;
              text-shadow: none;
              line-height: 1.2;
            ">${movie.title}</div>
            <div class="movie-info" style="
              font-size: ${
                sizes.width > 140 ? "26px" : sizes.width > 120 ? "24px" : "20px"
              };
              color: #7f8c8d;
              line-height: 1.4;
              text-shadow: none;
            ">
              <div><strong>${movie.year}</strong></div>
              <div>${movie.director}</div>
              <div>${movie.runtime} minutos</div>
            </div>
          </div>
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
               crossorigin="anonymous"
               style="
                 width: ${sizes.width}px; 
                 height: auto; 
                 border-radius: 12px; 
                 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                 margin-left: ${sizes.padding}px;
               " />
        `
        }
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;

  applySavedColors("story");

  container
    .querySelectorAll(
      ".movie-title, .movie-info, .movie-date, .movie-details, .movie-item-alternating"
    )
    .forEach((el) => {
      el.addEventListener("click", (event) => {
        showColorPickerForElement(el, event);
        event.stopPropagation();
      });
    });
}

function updateFeedFlyer() {
  const container = document.getElementById("cycle-movies-feed");
  if (!container) {
    console.warn("Elemento cycle-movies-feed no encontrado");
    return;
  }

  if (selectedMovies.length === 0) {
    container.innerHTML = `
      <div class="cycle-movies-placeholder">
        <p style="text-align: center; color: #666; font-style: italic; padding: 40px;">
          Agrega películas al ciclo para verlas aquí
        </p>
      </div>
    `;
    return;
  }

  const movieCount = selectedMovies.length;
  let posterSize, fontSize, spacing;

  switch (movieCount) {
    case 1:
      posterSize = 310;
      fontSize = { title: "28px", info: "20px", date: "35px" };
      spacing = 30;
      break;
    case 2:
      posterSize = 300;
      fontSize = { title: "24px", info: "18px", date: "35px" };
      spacing = 70;
      break;
    case 3:
      posterSize = 270;
      fontSize = { title: "22px", info: "16px", date: "35px" };
      spacing = 35;
      break;
    case 4:
      posterSize = 230;
      fontSize = { title: "20px", info: "14px", date: "30px" };
      spacing = 5;
      break;
    default:
      posterSize = 230;
      fontSize = { title: "18px", info: "12px", date: "30px" };
      spacing = 18;
  }

  let html = `<div class="cycle-movies-feed-horizontal" style="display: flex; gap: ${spacing}px; justify-content: center; flex-wrap: wrap;">`;

  selectedMovies.forEach((movie, index) => {
    const movieDate = individualDates[movie.id];
    let formattedMovieDate = "";
    if (movieDate) {
      const date = new Date(movieDate + "T00:00:00");
      const dayNumber = date.getDate();
      const month = date.getMonth() + 1;
      formattedMovieDate = `${dayNumber}/${month}`;
    }

    html += `
      <div class="movie-item-feed" style="
        text-align: center; 
        max-width: ${posterSize + 20}px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        position: relative;
      ">
        ${
          formattedMovieDate
            ? `
          <div class="movie-date-feed" style="
            position: absolute;
            top: 6px;
            right: 6px;
            background: rgba(4, 63, 97, 0.9);
            color: white;
            padding: 0;
            border-radius: 50%;
            font-family: 'Gilroy', sans-serif;
            font-weight: 600;
            font-size: ${fontSize.date};
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            width: 75px;
            height: 75px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            ${formattedMovieDate}
          </div>
        `
            : ""
        }
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
             crossorigin="anonymous"
             style="
               width: ${posterSize}px; 
               height: auto; 
               border-radius: 6px; 
               margin-bottom: 8px;
               box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
             " />
        <div class="movie-title-feed" style="
          font-weight: bold; 
          font-size: ${fontSize.title}; 
          margin-bottom: 4px;
          color: #2c3e50;
          line-height: 1.2;
          text-shadow: none;
        ">${movie.title}</div>
        <div class="movie-info-feed" style="
          font-size: ${fontSize.info}; 
          color: #7f8c8d;
          text-shadow: none;
        ">
          ${movie.year}<br>${movie.runtime}min
        </div>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;

  applySavedColors("feed");

  container
    .querySelectorAll(
      ".movie-title-feed, .movie-info-feed, .movie-date-feed, .movie-item-feed"
    )
    .forEach((el) => {
      el.addEventListener("click", (event) => {
        showColorPickerForElement(el, event);
        event.stopPropagation();
      });
    });
}

function showBackdrop(index) {
  if (allBackdrops.length === 0) return;

  const backdrop = allBackdrops[index];
  const imgElement = document.getElementById("backdrop-carousel-img");

  if (backdrop.file_path) {
    const fullUrl = backdrop.file_path.startsWith("http")
      ? backdrop.file_path
      : `https://image.tmdb.org/t/p/original${backdrop.file_path}`;
    imgElement.src = fullUrl;
  }

  document.getElementById("backdrop-counter").textContent = `${index + 1} de ${
    allBackdrops.length
  } backdrops`;
}

document.getElementById("backdrop-prev").addEventListener("click", () => {
  if (allBackdrops.length > 0) {
    currentBackdrop =
      (currentBackdrop - 1 + allBackdrops.length) % allBackdrops.length;
    showBackdrop(currentBackdrop);
  }
});

document.getElementById("backdrop-next").addEventListener("click", () => {
  if (allBackdrops.length > 0) {
    currentBackdrop = (currentBackdrop + 1) % allBackdrops.length;
    showBackdrop(currentBackdrop);
  }
});

document.getElementById("set-backdrop-as-bg").addEventListener("click", () => {
  if (allBackdrops.length > 0) {
    const backdrop = allBackdrops[currentBackdrop];
    const fullUrl = backdrop.file_path.startsWith("http")
      ? backdrop.file_path
      : `https://image.tmdb.org/t/p/original${backdrop.file_path}`;

    const storyFlyer = document.getElementById("flyer-story");
    const feedFlyer = document.getElementById("flyer-feed");

    [storyFlyer, feedFlyer].forEach((flyer) => {
      if (flyer) {
        flyer.style.backgroundImage = `url(${fullUrl})`;
        flyer.style.backgroundSize = "cover";
        flyer.style.backgroundPosition = "center";
      }
    });
  }
});

document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  const storyFlyer = document.getElementById("flyer-story");
  const feedFlyer = document.getElementById("flyer-feed");

  [storyFlyer, feedFlyer].forEach((flyer) => {
    if (flyer) {
      flyer.style.backgroundImage = "";
    }
  });
});

document
  .getElementById("load-backdrop-direct")
  .addEventListener("click", () => {
    const input = document.getElementById("backdrop-direct-input").value.trim();

    if (!input) {
      alert("Por favor, ingresa una URL.");
      return;
    }

    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      alert(
        "Por favor, ingresa una URL completa que comience con http:// o https://"
      );
      return;
    }

    const newBackdrop = {
      file_path: input,
      aspect_ratio: 1.78,
    };

    allBackdrops.unshift(newBackdrop);
    currentBackdrop = 0;
    showBackdrop(currentBackdrop);

    document.getElementById("backdrop-direct-input").value = "";
  });

document.getElementById("applyTxtBtn").addEventListener("click", () => {
  const ciclo = document.getElementById("cicloInput").value.trim();
  const cycleDescription = document
    .getElementById("cycleDescriptionInput")
    .value.trim();
  const hourRaw = document.getElementById("hourInput").value.trim();

  document.getElementById("ciclo").textContent = ciclo || "Ciclo Temático";
  const cicloFeed = document.getElementById("ciclo-feed");
  if (cicloFeed) {
    cicloFeed.textContent = ciclo || "Ciclo Temático";
  }

  const cycleDescText = document.getElementById("cycle-description-text");
  const cycleDescTextFeed = document.getElementById(
    "cycle-description-text-feed"
  );
  if (cycleDescription === "") {
    if (cycleDescText) cycleDescText.style.display = "none";
    if (cycleDescTextFeed) cycleDescTextFeed.style.display = "none";
  } else {
    if (cycleDescText) {
      cycleDescText.style.display = "block";
      cycleDescText.textContent = cycleDescription;
    }
    if (cycleDescTextFeed) {
      cycleDescTextFeed.style.display = "block";
      cycleDescTextFeed.textContent = cycleDescription;
    }
  }

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";
  document.getElementById("flyer-hour").textContent = formattedHour;
  const flyerHourFeed = document.getElementById("flyer-hour-feed");
  if (flyerHourFeed) {
    flyerHourFeed.textContent = formattedHour;
  }
});

document
  .getElementById("flyerHourFontSizeInput")
  .addEventListener("input", (e) => {
    const size = e.target.value + "px";
    document.querySelector(".flyer-hour-ciclos").style.fontSize = size;
    const flyerHourFeed = document.querySelector(".flyer-hour-feed");
    if (flyerHourFeed) flyerHourFeed.style.fontSize = size;
  });

document
  .getElementById("cycleDescriptionFontSizeInput")
  .addEventListener("input", (e) => {
    const size = e.target.value + "px";
    document.getElementById("cycle-description-text").style.fontSize = size;
    const cycleDescFeed = document.getElementById(
      "cycle-description-text-feed"
    );
    if (cycleDescFeed) cycleDescFeed.style.fontSize = size;
  });

document.getElementById("rectWidthInput").addEventListener("input", (e) => {
  document.querySelector(".rect").style.width = e.target.value + "px";
  document.querySelector(".rect-feed").style.width = e.target.value + "px";
});

document.getElementById("toggle-rect").addEventListener("click", () => {
  const rect = document.querySelector(".rect");
  const rectFeed = document.querySelector(".rect-feed");
  const button = document.getElementById("toggle-rect");

  if (rect.style.display === "none") {
    rect.style.display = "block";
    rectFeed.style.display = "block";
    button.textContent = "Ocultar rectángulo vertical";
  } else {
    rect.style.display = "none";
    rectFeed.style.display = "none";
    button.textContent = "Mostrar rectángulo vertical";
  }
});

document.getElementById("tab-story").addEventListener("click", () => {
  document.getElementById("flyer-story").style.display = "block";
  document.getElementById("flyer-feed").style.display = "none";
  document.getElementById("tab-story").classList.add("active");
  document.getElementById("tab-feed").classList.remove("active");
  document.getElementById("saveFlyer").style.display = "block";
  document.getElementById("saveFlyerFeed").style.display = "none";
});

document.getElementById("tab-feed").addEventListener("click", () => {
  document.getElementById("flyer-story").style.display = "none";
  document.getElementById("flyer-feed").style.display = "block";
  document.getElementById("tab-story").classList.remove("active");
  document.getElementById("tab-feed").classList.add("active");
  document.getElementById("saveFlyer").style.display = "none";
  document.getElementById("saveFlyerFeed").style.display = "block";
});

document.getElementById("saveFlyer").addEventListener("click", () => {
  const flyerElement = document.getElementById("flyer-story");
  html2canvas(flyerElement, {
    allowTaint: true,
    useCORS: true,
    scale: 2,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "ciclo-cine-historia.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.getElementById("saveFlyerFeed").addEventListener("click", () => {
  const flyerElement = document.getElementById("flyer-feed");
  html2canvas(flyerElement, {
    allowTaint: true,
    useCORS: true,
    scale: 2,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "ciclo-cine-feed.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.getElementById("applyStrokeBtn").addEventListener("click", () => {
  const selectedOptions = Array.from(
    document.getElementById("strokeTargetSelect").selectedOptions
  );
  const color = document.getElementById("strokeColorInput").value;

  selectedOptions.forEach((option) => {
    let elements = [];

    if (option.value === "movie-title") {
      elements = document.querySelectorAll(".movie-title, .movie-title-feed");
    } else if (option.value === "movie-info") {
      elements = document.querySelectorAll(".movie-info, .movie-info-feed");
    } else if (option.value === "movie-date") {
      elements = document.querySelectorAll(".movie-date, .movie-date-feed");
    } else if (option.value === "movie-details") {
      elements = document.querySelectorAll(".movie-details");
    } else if (option.value === "subheader") {
      elements = document.querySelectorAll("#ciclo, #ciclo-feed");
    } else {
      elements = document.querySelectorAll(
        `#${option.value}, .${option.value}, .${option.value}-ciclos, .${option.value}-feed, .${option.value}-feed-ciclos`
      );
    }

    elements.forEach((element) => {
      element.style.textShadow = `2px 2px 0 ${color}, -2px -2px 0 ${color}, 2px -2px 0 ${color}, -2px 2px 0 ${color}`;
    });
  });
});

document.getElementById("removeStrokeBtn").addEventListener("click", () => {
  const selectedOptions = Array.from(
    document.getElementById("strokeTargetSelect").selectedOptions
  );

  selectedOptions.forEach((option) => {
    let elements = [];

    if (option.value === "movie-title") {
      elements = document.querySelectorAll(".movie-title, .movie-title-feed");
    } else if (option.value === "movie-info") {
      elements = document.querySelectorAll(".movie-info, .movie-info-feed");
    } else if (option.value === "movie-date") {
      elements = document.querySelectorAll(".movie-date, .movie-date-feed");
    } else if (option.value === "movie-details") {
      elements = document.querySelectorAll(".movie-details");
    } else if (option.value === "subheader") {
      elements = document.querySelectorAll("#ciclo, #ciclo-feed");
    } else {
      elements = document.querySelectorAll(
        `#${option.value}, .${option.value}, .${option.value}-ciclos, .${option.value}-feed, .${option.value}-feed-ciclos`
      );
    }

    elements.forEach((element) => {
      element.style.textShadow = "";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  updateSelectedMoviesList();
  updateFlyerDisplay();
});

document
  .getElementById("applyIndividualDatesBtn")
  .addEventListener("click", () => {
    const currentColors = preserveCurrentColors();

    selectedMovies.forEach((movie) => {
      const dateInput = document.getElementById(`movie-date-${movie.id}`);
      if (dateInput && dateInput.value) {
        individualDates[movie.id] = dateInput.value;
      }
    });

    updateFlyerDisplay();
    restorePreservedColors(currentColors);
  });

document.getElementById("hourInput").addEventListener("input", (e) => {
  const hourRaw = e.target.value.trim();
  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";

  document.getElementById("flyer-hour").textContent = formattedHour;
  const flyerHourFeed = document.getElementById("flyer-hour-feed");
  if (flyerHourFeed) {
    flyerHourFeed.textContent = formattedHour;
  }
});

document.getElementById("cicloInput").addEventListener("input", (e) => {
  const ciclo = e.target.value.trim();
  document.getElementById("ciclo").textContent = ciclo || "Ciclo Temático";
  const cicloFeed = document.getElementById("ciclo-feed");
  if (cicloFeed) {
    cicloFeed.textContent = ciclo || "Ciclo Temático";
  }
});

document
  .getElementById("cycleDescriptionInput")
  .addEventListener("input", (e) => {
    const cycleDescription = e.target.value.trim();
    const cycleDescText = document.getElementById("cycle-description-text");
    const cycleDescTextFeed = document.getElementById(
      "cycle-description-text-feed"
    );
    if (cycleDescription === "") {
      if (cycleDescText) cycleDescText.style.display = "none";
      if (cycleDescTextFeed) cycleDescTextFeed.style.display = "none";
    } else {
      if (cycleDescText) {
        cycleDescText.style.display = "block";
        cycleDescText.textContent = cycleDescription;
      }
      if (cycleDescTextFeed) {
        cycleDescTextFeed.style.display = "block";
        cycleDescTextFeed.textContent = cycleDescription;
      }
    }
  });

function addIndividualDateListeners() {
  selectedMovies.forEach((movie) => {
    const dateInput = document.getElementById(`movie-date-${movie.id}`);
    if (dateInput) {
      dateInput.removeEventListener("change", handleIndividualDateChange);
      dateInput.addEventListener("change", handleIndividualDateChange);
    }
  });
}

function addIndividualTitleListeners() {
  selectedMovies.forEach((movie) => {
    const titleInput = document.getElementById(`movie-title-${movie.id}`);
    if (titleInput) {
      titleInput.removeEventListener("change", handleIndividualTitleChange);
      titleInput.addEventListener("change", handleIndividualTitleChange);
    }
  });
}

function handleIndividualTitleChange(e) {
  const inputId = e.target.id;
  const movieId = inputId.replace("movie-title-", "");
  const newTitle = e.target.value;
  const movie = selectedMovies.find((m) => String(m.id) === String(movieId));
  if (movie && newTitle) {
    const currentColors = preserveCurrentColors();

    movie.title = newTitle;
    updateSelectedMoviesList();
    updateFlyerDisplay();
    restorePreservedColors(currentColors);
  }
}

function handleIndividualDateChange(e) {
  const inputId = e.target.id;
  const movieId = inputId.replace("movie-date-", "");
  const newDate = e.target.value;

  if (movieId && newDate) {
    const currentColors = preserveCurrentColors();

    individualDates[movieId] = newDate;
    updateFlyerDisplay();
    restorePreservedColors(currentColors);
  }
}

let colorTargets = [];
let colorPickerJustShown = false;
let isBackgroundMode = false;

const floatingColorPicker = document.getElementById("floatingColorPicker");

floatingColorPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;

  const firstTarget = colorTargets[0];
  const isBackground =
    firstTarget.classList.contains("rect") ||
    firstTarget.classList.contains("rect-feed") ||
    firstTarget.classList.contains("rect2") ||
    firstTarget.classList.contains("rect2-feed") ||
    firstTarget.classList.contains("tape") ||
    firstTarget.classList.contains("movie-item-alternating") ||
    firstTarget.classList.contains("movie-item-feed") ||
    firstTarget.id === "flyer-story" ||
    firstTarget.id === "flyer-feed" ||
    (firstTarget.classList.contains("movie-date") && isBackgroundMode) ||
    (firstTarget.classList.contains("movie-date-feed") && isBackgroundMode);

  colorTargets.forEach((target) => {
    const isTargetBackground =
      target.classList.contains("rect") ||
      target.classList.contains("rect-feed") ||
      target.classList.contains("rect2") ||
      target.classList.contains("rect2-feed") ||
      target.classList.contains("tape") ||
      target.classList.contains("movie-item-alternating") ||
      target.classList.contains("movie-item-feed") ||
      target.id === "flyer-story" ||
      target.id === "flyer-feed" ||
      (target.classList.contains("movie-date") && isBackgroundMode) ||
      (target.classList.contains("movie-date-feed") && isBackgroundMode);
    if (isTargetBackground) {
      target.style.backgroundColor = selectedColor;
    } else {
      target.style.color = selectedColor;
    }
  });

  const key = getColorKey(colorTargets[0]);
  if (key) {
    if (!elementColors[key]) elementColors[key] = {};
    if (isBackground) {
      elementColors[key].background = selectedColor;
    } else {
      elementColors[key].color = selectedColor;
    }
  }

  syncColorsBetweenModes();

  const colorPreview = document.getElementById("floating-color-preview");
  if (colorPreview) colorPreview.style.display = "none";
});

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#ffffff";
  return (
    "#" +
    (
      (1 << 24) +
      (parseInt(result[0]) << 16) +
      (parseInt(result[1]) << 8) +
      parseInt(result[2])
    )
      .toString(16)
      .slice(1)
  );
}

function getColorTargets(el) {
  if (
    el.classList.contains("rect") ||
    el.classList.contains("rect2") ||
    el.classList.contains("rect-feed") ||
    el.classList.contains("rect2-feed")
  ) {
    return [
      document.querySelector(".rect"),
      document.querySelector(".rect2"),
      document.querySelector(".rect-feed"),
      document.querySelector(".rect2-feed"),
    ].filter(Boolean);
  }

  if (
    el.id === "flyer-hour" ||
    el.id === "flyer-biblioteca" ||
    el.id === "flyer-hour-feed" ||
    el.id === "flyer-biblioteca-feed"
  ) {
    return [
      document.getElementById("flyer-hour"),
      document.getElementById("flyer-biblioteca"),
      document.getElementById("flyer-hour-feed"),
      document.getElementById("flyer-biblioteca-feed"),
    ].filter(Boolean);
  }

  if (el.id === "flyer-story" || el.id === "flyer-feed") {
    return [
      document.getElementById("flyer-story"),
      document.getElementById("flyer-feed"),
    ].filter(Boolean);
  }

  if (el.classList.contains("header") || el.classList.contains("header-feed")) {
    return [
      document.querySelector(".header"),
      document.querySelector(".header-feed"),
    ].filter(Boolean);
  }

  if (el.id === "ciclo" || el.id === "ciclo-feed") {
    return [
      document.getElementById("ciclo"),
      document.getElementById("ciclo-feed"),
    ].filter(Boolean);
  }

  if (el.id === "org" || el.id === "org-feed") {
    return [
      document.getElementById("org"),
      document.getElementById("org-feed"),
    ].filter(Boolean);
  }

  if (
    el.id === "cycle-description-text" ||
    el.id === "cycle-description-text-feed"
  ) {
    return [
      document.getElementById("cycle-description-text"),
      document.getElementById("cycle-description-text-feed"),
    ].filter(Boolean);
  }

  if (
    el.classList.contains("movie-title") ||
    el.classList.contains("movie-title-feed")
  ) {
    return Array.from(
      document.querySelectorAll(".movie-title, .movie-title-feed")
    );
  }

  if (
    el.classList.contains("movie-info") ||
    el.classList.contains("movie-info-feed")
  ) {
    return Array.from(
      document.querySelectorAll(".movie-info, .movie-info-feed")
    );
  }

  if (el.classList.contains("movie-date")) {
    return Array.from(
      document.querySelectorAll(".movie-date, .movie-date-feed")
    );
  }

  if (el.classList.contains("movie-date-feed")) {
    return Array.from(
      document.querySelectorAll(".movie-date, .movie-date-feed")
    );
  }

  if (el.classList.contains("movie-details")) {
    return Array.from(document.querySelectorAll(".movie-details"));
  }

  if (
    el.classList.contains("movie-item-alternating") ||
    el.classList.contains("movie-item-feed")
  ) {
    return Array.from(
      document.querySelectorAll(".movie-item-alternating, .movie-item-feed")
    );
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

  const isBackground =
    targets[0].classList.contains("rect") ||
    targets[0].classList.contains("rect-feed") ||
    targets[0].classList.contains("rect2") ||
    targets[0].classList.contains("rect2-feed") ||
    targets[0].classList.contains("movie-item-alternating") ||
    targets[0].classList.contains("movie-item-feed") ||
    targets[0].id === "flyer-story" ||
    targets[0].id === "flyer-feed" ||
    (targets[0].classList.contains("movie-date") && isBackgroundMode) ||
    (targets[0].classList.contains("movie-date-feed") && isBackgroundMode);
  const style = window.getComputedStyle(targets[0]);
  return rgbToHex(isBackground ? style.backgroundColor : style.color);
}

function getMovieElementIndex(target, selector) {
  const elements = document.querySelectorAll(selector);
  let index = Array.from(elements).indexOf(target);

  if (index >= selectedMovies.length) {
    index = index - selectedMovies.length;
  }

  return index;
}

function getColorKey(target) {
  if (
    target.classList.contains("movie-title") ||
    target.classList.contains("movie-title-feed")
  ) {
    const index = getMovieElementIndex(
      target,
      ".movie-title, .movie-title-feed"
    );
    if (index >= 0 && index < selectedMovies.length) {
      return `movieTitle-${selectedMovies[index].id}`;
    }
    return "movieTitle";
  }
  if (
    target.classList.contains("movie-info") ||
    target.classList.contains("movie-info-feed")
  ) {
    const index = getMovieElementIndex(target, ".movie-info, .movie-info-feed");
    if (index >= 0 && index < selectedMovies.length) {
      return `movieInfo-${selectedMovies[index].id}`;
    }
    return "movieInfo";
  }
  if (
    target.classList.contains("movie-date") ||
    target.classList.contains("movie-date-feed")
  ) {
    const index = getMovieElementIndex(target, ".movie-date, .movie-date-feed");
    if (index >= 0 && index < selectedMovies.length) {
      return `movieDate-${selectedMovies[index].id}`;
    }
    return "movieDate";
  }
  if (target.classList.contains("movie-details")) {
    const index = getMovieElementIndex(target, ".movie-details");
    if (index >= 0 && index < selectedMovies.length) {
      return `movieDetails-${selectedMovies[index].id}`;
    }
    return "movieDetails";
  }
  if (
    target.classList.contains("movie-item-alternating") ||
    target.classList.contains("movie-item-feed")
  ) {
    const isStory = target.classList.contains("movie-item-alternating");
    const allCards = document.querySelectorAll(
      isStory ? ".movie-item-alternating" : ".movie-item-feed"
    );
    const index = Array.from(allCards).indexOf(target);

    if (index >= 0 && index < selectedMovies.length) {
      const movieId = selectedMovies[index].id;
      return isStory ? `movie-item-${movieId}` : `movie-item-feed-${movieId}`;
    }
    return "movieItem";
  }

  if (target.classList.contains("rect")) return "rect";
  if (target.classList.contains("rect-feed")) return "rect-feed";
  if (target.classList.contains("rect2")) return "rect2";
  if (target.classList.contains("rect2-feed")) return "rect2-feed";
  if (target.classList.contains("tape")) return "tape";
  if (target.id === "flyer-story") return "flyer-story";
  if (target.id === "flyer-feed") return "flyer-feed";

  if (target.id === "ciclo" || target.id === "ciclo-feed") return "ciclo";
  if (target.id === "flyer-hour" || target.id === "flyer-hour-feed")
    return "flyer-hour";
  if (target.id === "flyer-biblioteca" || target.id === "flyer-biblioteca-feed")
    return "flyer-biblioteca";
  if (target.id === "org" || target.id === "org-feed") return "org";
  if (
    target.id === "cycle-description-text" ||
    target.id === "cycle-description-text-feed"
  )
    return "cycle-description-text";

  if (
    target.classList.contains("header") ||
    target.classList.contains("header-feed")
  )
    return "header";

  return target.id || null;
}

function showColorPickerForElement(element, event) {
  colorTargets = getColorTargets(element);

  if (
    element.classList.contains("movie-date") ||
    element.classList.contains("movie-date-feed")
  ) {
    const rect = element.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const elementWidth = rect.width;
    const elementHeight = rect.height;

    if (element.classList.contains("movie-date-feed")) {
      const centerX = elementWidth / 2;
      const centerY = elementHeight / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
      );
      const radius = Math.min(elementWidth, elementHeight) / 2;

      isBackgroundMode = distanceFromCenter > radius * 0.7;
    } else {
      isBackgroundMode = clickX < 20 || clickX > elementWidth - 20;
    }
  } else {
    isBackgroundMode = false;
  }

  const colorValue = getCurrentColorForTargets(colorTargets);

  floatingColorPicker.value = colorValue;
  floatingColorPicker.style.left = event.pageX + "px";
  floatingColorPicker.style.top = event.pageY + "px";
  floatingColorPicker.style.display = "block";
  floatingColorPicker.style.width = "48px";
  floatingColorPicker.style.height = "48px";
  floatingColorPicker.style.border = "2px solid #333";
  floatingColorPicker.style.borderRadius = "8px";

  let eyedropperBtn = document.getElementById("floating-eyedropper-btn");
  if (!eyedropperBtn) {
    eyedropperBtn = document.createElement("button");
    eyedropperBtn.id = "floating-eyedropper-btn";
    eyedropperBtn.textContent = "CuentaGotas";
    eyedropperBtn.title = "Seleccionar color del backdrop";
    eyedropperBtn.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 52px;
      top: 0px;
      width: 150px;
      height: 70px;
      border: 2px solid #333;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 20px;
      display: none;
    `;
    document.body.appendChild(eyedropperBtn);

    eyedropperBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      activateEyedropper((selectedColor) => {
        floatingColorPicker.value = selectedColor;
        floatingColorPicker.dispatchEvent(new Event("input"));
      });
    });
  }

  eyedropperBtn.style.left = event.pageX + 52 + "px";
  eyedropperBtn.style.top = event.pageY + "px";
  eyedropperBtn.style.display = "block";

  if (
    element.classList.contains("movie-date") ||
    element.classList.contains("movie-date-feed")
  ) {
    eyedropperBtn.textContent = isBackgroundMode
      ? "CuentaGotas (Fondo)"
      : "CuentaGotas (Texto)";
    eyedropperBtn.title = isBackgroundMode
      ? "Seleccionar color de fondo"
      : "Seleccionar color de texto";
  } else {
    eyedropperBtn.textContent = "CuentaGotas";
    eyedropperBtn.title = "Seleccionar color del backdrop";
  }

  let applyLastColorBtn = document.getElementById(
    "apply-last-eyedropper-color-btn"
  );
  if (!applyLastColorBtn) {
    applyLastColorBtn = document.createElement("button");
    applyLastColorBtn.id = "apply-last-eyedropper-color-btn";
    applyLastColorBtn.textContent = "Último color";
    applyLastColorBtn.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 52px;
      top: 80px;
      width: 140px;
      height: 40px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-size: 16px;
      display: none;
    `;
    document.body.appendChild(applyLastColorBtn);
    applyLastColorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.lastEyedropperColor) {
        floatingColorPicker.value = window.lastEyedropperColor;
        floatingColorPicker.dispatchEvent(new Event("input"));
      }
    });
  }

  if (window.lastEyedropperColor) {
    applyLastColorBtn.style.left = event.pageX + 52 + "px";
    applyLastColorBtn.style.top = event.pageY + 80 + "px";
    applyLastColorBtn.style.display = "block";
    applyLastColorBtn.style.background = window.lastEyedropperColor;
    applyLastColorBtn.style.color = "#222";
    applyLastColorBtn.title = window.lastEyedropperColor;
  } else {
    applyLastColorBtn.style.display = "none";
  }

  floatingColorPicker.focus();
  colorPickerJustShown = true;
}

floatingColorPicker.addEventListener("blur", () => {
  setTimeout(() => {
    floatingColorPicker.style.display = "none";
    const eyedropperBtn = document.getElementById("floating-eyedropper-btn");
    if (eyedropperBtn) eyedropperBtn.style.display = "none";
    const applyLastColorBtn = document.getElementById(
      "apply-last-eyedropper-color-btn"
    );
    if (applyLastColorBtn) applyLastColorBtn.style.display = "none";
  }, 200);
});

[
  document.querySelector(".header"),
  document.querySelector(".header-feed"),
  document.getElementById("ciclo"),
  document.getElementById("ciclo-feed"),
  document.getElementById("cycle-description-text"),
  document.getElementById("cycle-description-text-feed"),
  document.getElementById("flyer-hour"),
  document.getElementById("flyer-hour-feed"),
  document.getElementById("flyer-biblioteca"),
  document.getElementById("flyer-biblioteca-feed"),
  document.getElementById("org"),
  document.getElementById("org-feed"),
  document.querySelector(".rect"),
  document.querySelector(".rect-feed"),
  document.querySelector(".rect2"),
  document.querySelector(".rect2-feed"),
  document.getElementById("flyer-feed"),
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

document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("movie-title") ||
    e.target.classList.contains("movie-title-feed") ||
    e.target.classList.contains("movie-info") ||
    e.target.classList.contains("movie-info-feed") ||
    e.target.classList.contains("movie-date") ||
    e.target.classList.contains("movie-date-feed") ||
    e.target.classList.contains("movie-details") ||
    e.target.classList.contains("movie-item-alternating") ||
    e.target.classList.contains("movie-item-feed")
  ) {
    showColorPickerForElement(e.target, e);
    e.stopPropagation();
  }
});

document.addEventListener("click", (e) => {
  if (colorPickerJustShown) {
    colorPickerJustShown = false;
    return;
  }
  if (
    e.target !== floatingColorPicker &&
    e.target.id !== "floating-eyedropper-btn"
  ) {
    floatingColorPicker.style.display = "none";
    const eyedropperBtn = document.getElementById("floating-eyedropper-btn");
    if (eyedropperBtn) eyedropperBtn.style.display = "none";
    colorTargets = [];

    if (eyedropperActive) {
      eyedropperActive = false;
      eyedropperCallback = null;
      backdropImg.style.cursor = "";
      document.body.style.cursor = "";
      const message = document.getElementById("eyedropper-message");
      if (message) message.remove();
    }

    if (comicEyedropperActive) {
      cleanupComicEyedropper();
    }
  }
});

let eyedropperActive = false;
let eyedropperColor = null;
let eyedropperCallback = null;

const backdropImg = document.getElementById("backdrop-carousel-img");

function eyedropperMoveHandler(e) {
  if (!eyedropperActive) return;
  const colorPreview = document.getElementById("floating-color-preview");
  if (!colorPreview) return;
  colorPreview.style.left = e.pageX + 20 + "px";
  colorPreview.style.top = e.pageY - 24 + "px";

  const targetImg = e.currentTarget;
  if (
    !targetImg ||
    targetImg.tagName !== "IMG" ||
    !targetImg.naturalWidth ||
    !targetImg.naturalHeight ||
    !targetImg.complete
  ) {
    colorPreview.style.background = "#fff";
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetImg.naturalWidth;
    canvas.height = targetImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      targetImg,
      0,
      0,
      targetImg.naturalWidth,
      targetImg.naturalHeight
    );

    const rect = targetImg.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientX - rect.left) * (targetImg.naturalWidth / rect.width)
        ),
        targetImg.naturalWidth - 1
      )
    );
    const y = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientY - rect.top) * (targetImg.naturalHeight / rect.height)
        ),
        targetImg.naturalHeight - 1
      )
    );

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
    colorPreview.style.background = hex;
  } catch (error) {
    console.warn("Error al obtener color:", error);
    colorPreview.style.background = "#fff";
  }
}

function activateEyedropper(callback = null) {
  eyedropperActive = true;
  eyedropperCallback = callback;

  backdropImg.style.cursor = "crosshair";
  document
    .querySelectorAll(
      ".cycle-movies-container img, .cycle-movies-feed-container img"
    )
    .forEach((img) => {
      img.style.cursor = "crosshair";
    });

  let colorPreview = document.getElementById("floating-color-preview");
  if (!colorPreview) {
    colorPreview = document.createElement("div");
    colorPreview.id = "floating-color-preview";
    colorPreview.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 0px;
      top: 0px;
      width: 48px;
      height: 48px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #fff;
      display: block;
      pointer-events: none;
    `;
    document.body.appendChild(colorPreview);
  }
  colorPreview.style.display = "block";
  colorPreview.style.background = "#fff";

  backdropImg.addEventListener("mousemove", eyedropperMoveHandler);
  document
    .querySelectorAll(
      ".cycle-movies-container img, .cycle-movies-feed-container img"
    )
    .forEach((img) => {
      img.addEventListener("mousemove", eyedropperMoveHandler);
    });
}

function handleEyedropperClick(e, targetImg) {
  if (!eyedropperActive || !targetImg || !targetImg.src || !targetImg.complete)
    return;

  e.stopPropagation();
  e.preventDefault();

  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetImg.naturalWidth;
    canvas.height = targetImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      targetImg,
      0,
      0,
      targetImg.naturalWidth,
      targetImg.naturalHeight
    );

    const rect = targetImg.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientX - rect.left) * (targetImg.naturalWidth / rect.width)
        ),
        targetImg.naturalWidth - 1
      )
    );
    const y = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientY - rect.top) * (targetImg.naturalHeight / rect.height)
        ),
        targetImg.naturalHeight - 1
      )
    );

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
    eyedropperColor = hex;

    window.lastEyedropperColor = hex;

    let colorPreview = document.getElementById("floating-color-preview");
    if (colorPreview) {
      colorPreview.style.background = hex;
      colorPreview.style.display = "block";
      colorPreview.style.left = e.pageX + 20 + "px";
      colorPreview.style.top = e.pageY - 24 + "px";
    }

    if (eyedropperCallback) {
      eyedropperCallback(hex);
    } else {
      floatingColorPicker.value = hex;
      floatingColorPicker.dispatchEvent(new Event("input"));
    }

    cleanupEyedropper();
  } catch (error) {
    console.error("Error al extraer color:", error);
    alert("Error al extraer el color de la imagen");
  }
}

function cleanupEyedropper() {
  backdropImg.removeEventListener("mousemove", eyedropperMoveHandler);
  document
    .querySelectorAll(
      ".cycle-movies-container img, .cycle-movies-feed-container img"
    )
    .forEach((img) => {
      img.removeEventListener("mousemove", eyedropperMoveHandler);
      img.style.cursor = "";
    });

  setTimeout(() => {
    const colorPreview = document.getElementById("floating-color-preview");
    if (colorPreview) colorPreview.style.display = "none";
  }, 400);

  backdropImg.style.cursor = "";
  document.body.style.cursor = "";
  eyedropperActive = false;
  eyedropperCallback = null;
}

backdropImg.addEventListener("click", (e) => {
  handleEyedropperClick(e, backdropImg);
});

function addEyedropperToMoviePosters() {
  document
    .querySelectorAll(
      ".cycle-movies-container img, .cycle-movies-feed-container img"
    )
    .forEach((img) => {
      img.removeEventListener("click", img._eyedropperClickHandler);

      img._eyedropperClickHandler = (e) => handleEyedropperClick(e, img);

      img.addEventListener("click", img._eyedropperClickHandler);

      if (!img.complete) {
        img.addEventListener("load", function () {});
      }
    });
}

let comicEyedropperActive = false;
let comicEyedropperTarget = null;

const comicBgPicker = document.getElementById("comicBgColorPicker");
const comicBorderPicker = document.getElementById("comicBorderColorPicker");
const comicTextPicker = document.getElementById("comicTextColorPicker");

function comicEyedropperMoveHandler(e) {
  if (!comicEyedropperActive) return;

  let comicColorPreview = document.getElementById("comic-color-preview");
  if (!comicColorPreview) {
    comicColorPreview = document.createElement("div");
    comicColorPreview.id = "comic-color-preview";
    comicColorPreview.style.cssText = `
      position: absolute;
      z-index: 99999;
      left: 0px;
      top: 0px;
      width: 48px;
      height: 48px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #fff;
      display: block;
      pointer-events: none;
    `;
    document.body.appendChild(comicColorPreview);
  }

  comicColorPreview.style.left = e.pageX + 20 + "px";
  comicColorPreview.style.top = e.pageY - 24 + "px";
  comicColorPreview.style.display = "block";

  const targetImg = e.currentTarget;
  if (
    !targetImg ||
    targetImg.tagName !== "IMG" ||
    !targetImg.naturalWidth ||
    !targetImg.naturalHeight ||
    !targetImg.complete
  ) {
    comicColorPreview.style.background = "#fff";
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetImg.naturalWidth;
    canvas.height = targetImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      targetImg,
      0,
      0,
      targetImg.naturalWidth,
      targetImg.naturalHeight
    );

    const rect = targetImg.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientX - rect.left) * (targetImg.naturalWidth / rect.width)
        ),
        targetImg.naturalWidth - 1
      )
    );
    const y = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientY - rect.top) * (targetImg.naturalHeight / rect.height)
        ),
        targetImg.naturalHeight - 1
      )
    );

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
    comicColorPreview.style.background = hex;
  } catch (error) {
    console.warn("Error al obtener color del panel:", error);
    comicColorPreview.style.background = "#fff";
  }
}

if (document.getElementById("activateEyedropperBg")) {
  document
    .getElementById("activateEyedropperBg")
    .addEventListener("click", (e) => {
      comicEyedropperActive = true;
      comicEyedropperTarget = comicBgPicker;

      backdropImg.style.cursor = "crosshair";
      document
        .querySelectorAll(
          ".cycle-movies-container img, .cycle-movies-feed-container img"
        )
        .forEach((img) => {
          img.style.cursor = "crosshair";
          img.addEventListener("mousemove", comicEyedropperMoveHandler);
        });
      backdropImg.addEventListener("mousemove", comicEyedropperMoveHandler);

      e.stopPropagation();
    });
}

if (document.getElementById("activateEyedropperBorder")) {
  document
    .getElementById("activateEyedropperBorder")
    .addEventListener("click", (e) => {
      comicEyedropperActive = true;
      comicEyedropperTarget = comicBorderPicker;

      backdropImg.style.cursor = "crosshair";
      document
        .querySelectorAll(
          ".cycle-movies-container img, .cycle-movies-feed-container img"
        )
        .forEach((img) => {
          img.style.cursor = "crosshair";
          img.addEventListener("mousemove", comicEyedropperMoveHandler);
        });
      backdropImg.addEventListener("mousemove", comicEyedropperMoveHandler);

      e.stopPropagation();
    });
}

if (document.getElementById("activateEyedropperText")) {
  document
    .getElementById("activateEyedropperText")
    .addEventListener("click", (e) => {
      comicEyedropperActive = true;
      comicEyedropperTarget = comicTextPicker;

      backdropImg.style.cursor = "crosshair";
      document
        .querySelectorAll(
          ".cycle-movies-container img, .cycle-movies-feed-container img"
        )
        .forEach((img) => {
          img.style.cursor = "crosshair";
          img.addEventListener("mousemove", comicEyedropperMoveHandler);
        });
      backdropImg.addEventListener("mousemove", comicEyedropperMoveHandler);

      e.stopPropagation();
    });
}

function handleComicEyedropperClick(e, targetImg) {
  if (
    !comicEyedropperActive ||
    !comicEyedropperTarget ||
    !targetImg ||
    !targetImg.src ||
    !targetImg.complete
  )
    return;

  e.stopPropagation();
  e.preventDefault();

  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetImg.naturalWidth;
    canvas.height = targetImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      targetImg,
      0,
      0,
      targetImg.naturalWidth,
      targetImg.naturalHeight
    );

    const rect = targetImg.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientX - rect.left) * (targetImg.naturalWidth / rect.width)
        ),
        targetImg.naturalWidth - 1
      )
    );
    const y = Math.max(
      0,
      Math.min(
        Math.round(
          (e.clientY - rect.top) * (targetImg.naturalHeight / rect.height)
        ),
        targetImg.naturalHeight - 1
      )
    );

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);

    window.lastEyedropperColor = hex;

    let comicColorPreview = document.getElementById("comic-color-preview");
    if (comicColorPreview) {
      comicColorPreview.style.background = hex;
      comicColorPreview.style.display = "block";
      comicColorPreview.style.left = e.pageX + 20 + "px";
      comicColorPreview.style.top = e.pageY - 24 + "px";
    }

    const lastColorSquare = document.getElementById("comicLastColorSquare");
    if (lastColorSquare) {
      lastColorSquare.style.background = hex;
      lastColorSquare.style.display = "block";
    }

    comicEyedropperTarget.value = hex;
    comicEyedropperTarget.dispatchEvent(new Event("input"));

    cleanupComicEyedropper();
  } catch (error) {
    console.error("Error al extraer color del panel:", error);
    alert("Error al extraer el color de la imagen");
  }
}

function cleanupComicEyedropper() {
  backdropImg.removeEventListener("mousemove", comicEyedropperMoveHandler);
  document
    .querySelectorAll(
      ".cycle-movies-container img, .cycle-movies-feed-container img"
    )
    .forEach((img) => {
      img.removeEventListener("mousemove", comicEyedropperMoveHandler);
      img.style.cursor = "";
    });

  setTimeout(() => {
    const comicColorPreview = document.getElementById("comic-color-preview");
    if (comicColorPreview) comicColorPreview.style.display = "none";
  }, 400);

  backdropImg.style.cursor = "";
  document.body.style.cursor = "";
  comicEyedropperActive = false;
  comicEyedropperTarget = null;
}

function addComicEyedropperToImages() {
  backdropImg.removeEventListener(
    "click",
    backdropImg._comicEyedropperClickHandler
  );
  backdropImg._comicEyedropperClickHandler = (e) => {
    if (comicEyedropperActive) {
      handleComicEyedropperClick(e, backdropImg);
    }
  };
  backdropImg.addEventListener(
    "click",
    backdropImg._comicEyedropperClickHandler
  );

  document
    .querySelectorAll(
      ".cycle-movies-container img, .cycle-movies-feed-container img"
    )
    .forEach((img) => {
      img.removeEventListener("click", img._comicEyedropperClickHandler);
      img._comicEyedropperClickHandler = (e) => {
        if (comicEyedropperActive) {
          handleComicEyedropperClick(e, img);
        }
      };
      img.addEventListener("click", img._comicEyedropperClickHandler);

      if (!img.complete) {
        img.addEventListener("load", function () {});
      }
    });
}

if (document.getElementById("comicLastColorSquare")) {
  document
    .getElementById("comicLastColorSquare")
    .addEventListener("click", (e) => {
      const lastColor = window.lastEyedropperColor;
      if (lastColor && floatingColorPicker) {
        floatingColorPicker.value = lastColor;
        floatingColorPicker.dispatchEvent(new Event("input"));
      }
    });
}

function editMovieFlyer(movie, lang) {
  const fecha = document.getElementById(`movie-date-${movie.id}`).value;
  window.open(
    "gutenflyerg.html?movieId=" +
      movie.id +
      "&language=" +
      lang +
      "&date=" +
      fecha,
    "_blank"
  );
}

// funciones para extraer y importar los datos
function extractElementColors() {
  const colors = {};
  const strokes = {};

  if (elementColors && typeof elementColors === "object") {
    Object.keys(elementColors).forEach((key) => {
      if (elementColors[key]) {
        colors[key] = {
          color: elementColors[key].color || "",
          backgroundColor: elementColors[key].background || "",
        };
      }
    });
  }

  const basicElements = [
    "ciclo",
    "ciclo-feed",
    "flyer-hour",
    "flyer-hour-feed",
    "flyer-biblioteca",
    "flyer-biblioteca-feed",
    "org",
    "org-feed",
    "cycle-description-text",
    "cycle-description-text-feed",
  ];

  basicElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      if (!colors[id]) colors[id] = {};
      colors[id] = {
        color: element.style.color || colors[id].color || "",
        backgroundColor:
          element.style.backgroundColor || colors[id].backgroundColor || "",
      };
      if (element.style.textShadow) {
        strokes[id] = element.style.textShadow;
      }
    }
  });

  const classElements = [
    { selector: ".header", name: "header" },
    { selector: ".header-feed", name: "header-feed" },
    { selector: ".rect", name: "rect" },
    { selector: ".rect-feed", name: "rect-feed" },
    { selector: ".rect2", name: "rect2" },
    { selector: ".rect2-feed", name: "rect2-feed" },
    { selector: ".tape", name: "tape" },
    { selector: "#flyer-story", name: "flyer-story" },
    { selector: "#flyer-feed", name: "flyer-feed" },
  ];

  classElements.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (element) {
      if (!colors[name]) colors[name] = {};
      colors[name] = {
        color: element.style.color || colors[name].color || "",
        backgroundColor:
          element.style.backgroundColor || colors[name].backgroundColor || "",
      };
      if (element.style.textShadow) {
        strokes[name] = element.style.textShadow;
      }
    }
  });

  document
    .querySelectorAll(".movie-title, .movie-title-feed")
    .forEach((el, index) => {
      if (el.style.color || el.style.backgroundColor) {
        colors[`movie-title-${index}`] = {
          color: el.style.color || "",
          backgroundColor: el.style.backgroundColor || "",
        };
      }
      if (el.style.textShadow) {
        strokes[`movie-title-${index}`] = el.style.textShadow;
      }
    });

  document
    .querySelectorAll(".movie-info, .movie-info-feed")
    .forEach((el, index) => {
      if (el.style.color || el.style.backgroundColor) {
        colors[`movie-info-${index}`] = {
          color: el.style.color || "",
          backgroundColor: el.style.backgroundColor || "",
        };
      }
      if (el.style.textShadow) {
        strokes[`movie-info-${index}`] = el.style.textShadow;
      }
    });

  document
    .querySelectorAll(".movie-date, .movie-date-feed")
    .forEach((el, index) => {
      if (el.style.color || el.style.backgroundColor) {
        colors[`movie-date-${index}`] = {
          color: el.style.color || "",
          backgroundColor: el.style.backgroundColor || "",
        };
      }
      if (el.style.textShadow) {
        strokes[`movie-date-${index}`] = el.style.textShadow;
      }
    });

  document.querySelectorAll(".movie-details").forEach((el, index) => {
    if (el.style.color || el.style.backgroundColor) {
      colors[`movie-details-${index}`] = {
        color: el.style.color || "",
        backgroundColor: el.style.backgroundColor || "",
      };
    }
    if (el.style.textShadow) {
      strokes[`movie-details-${index}`] = el.style.textShadow;
    }
  });

  selectedMovies.forEach((movie, index) => {
    const storyCards = document.querySelectorAll(".movie-item-alternating");
    const feedCards = document.querySelectorAll(".movie-item-feed");

    if (storyCards[index]) {
      const key = `movie-item-${movie.id}`;
      if (!colors[key]) colors[key] = {};
      colors[key] = {
        color: storyCards[index].style.color || colors[key].color || "",
        backgroundColor:
          storyCards[index].style.backgroundColor ||
          colors[key].backgroundColor ||
          "",
      };
    }

    if (feedCards[index]) {
      const key = `movie-item-feed-${movie.id}`;
      if (!colors[key]) colors[key] = {};
      colors[key] = {
        color: feedCards[index].style.color || colors[key].color || "",
        backgroundColor:
          feedCards[index].style.backgroundColor ||
          colors[key].backgroundColor ||
          "",
      };
    }
  });

  document
    .querySelectorAll('[style*="background-color"], [style*="backgroundColor"]')
    .forEach((el) => {
      if (el.id && !colors[el.id]) {
        colors[el.id] = {
          color: el.style.color || "",
          backgroundColor: el.style.backgroundColor || "",
        };
      }
    });

  return { colors, strokes };
}

function extractBackgroundImages() {
  const storyFlyer = document.getElementById("flyer-story");
  const feedFlyer = document.getElementById("flyer-feed");

  return {
    story:
      storyFlyer && storyFlyer.style.backgroundImage
        ? storyFlyer.style.backgroundImage.match(
            /url\(['"]?([^'"]+)['"]?\)/
          )?.[1] || ""
        : "",
    feed:
      feedFlyer && feedFlyer.style.backgroundImage
        ? feedFlyer.style.backgroundImage.match(
            /url\(['"]?([^'"]+)['"]?\)/
          )?.[1] || ""
        : "",
  };
}

function exportUserData() {
  const { colors, strokes } = extractElementColors();

  const userData = {
    cycleInfo: {
      name: document.getElementById("cicloInput").value || "",
      description: document.getElementById("cycleDescriptionInput").value || "",
      hour: document.getElementById("hourInput").value || "",
    },

    selectedMovies: selectedMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      director: movie.director,
      runtime: movie.runtime,
      poster_path: movie.poster_path,
      overview: movie.overview,
      language: movie.language,
      backdrops: movie.backdrops ? movie.backdrops.slice(0, 5) : [],
    })),

    individualDates: { ...individualDates },

    designSettings: {
      fontSizes: {
        flyerHour:
          document.getElementById("flyerHourFontSizeInput")?.value || "",
        cycleDescription:
          document.getElementById("cycleDescriptionFontSizeInput")?.value || "",
      },

      dimensions: {
        rectWidth: document.getElementById("rectWidthInput")?.value || "",
      },

      rectHidden: document.querySelector(".rect")?.style.display === "none",
      colors: colors,
      textStrokes: strokes,
      elementColors: { ...elementColors },
    },

    images: {
      currentBackdrop: currentBackdrop,
      allBackdrops: allBackdrops.slice(0, 10),
      backgroundImages: extractBackgroundImages(),
    },

    exportDate: new Date().toISOString(),
    version: "1.0-ciclos",
    type: "cycle-data",
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  const cycleName =
    userData.cycleInfo.name.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_") ||
    "ciclo";
  const filename = `${cycleName}_datos_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function validateUserData(userData) {
  try {
    if (!userData || typeof userData !== "object") {
      throw new Error("El archivo no contiene un objeto JSON válido");
    }

    if (!userData.version) {
      throw new Error(
        "El archivo no tiene información de versión. Puede ser un archivo incompatible"
      );
    }

    if (!userData.type || userData.type !== "cycle-data") {
      throw new Error(
        "Este archivo no parece ser de datos de ciclos de películas"
      );
    }

    if (!userData.cycleInfo || typeof userData.cycleInfo !== "object") {
      throw new Error("Faltan datos de información del ciclo");
    }

    if (!userData.selectedMovies || !Array.isArray(userData.selectedMovies)) {
      console.warn(
        "Array de películas seleccionadas no válido, se inicializará vacío"
      );
      userData.selectedMovies = [];
    }

    if (
      !userData.individualDates ||
      typeof userData.individualDates !== "object"
    ) {
      console.warn(
        "Datos de fechas individuales no válidos, se inicializarán vacíos"
      );
      userData.individualDates = {};
    }

    if (
      userData.images &&
      userData.images.allBackdrops &&
      Array.isArray(userData.images.allBackdrops)
    ) {
      userData.images.allBackdrops = userData.images.allBackdrops.filter(
        (backdrop) => {
          if (!backdrop.file_path) return false;
          if (
            backdrop.file_path.startsWith("http") &&
            !isValidUrl(backdrop.file_path)
          ) {
            console.warn(
              "URL de backdrop no válida, se omitirá:",
              backdrop.file_path
            );
            return false;
          }
          return true;
        }
      );
    }

    if (userData.images && userData.images.backgroundImages) {
      Object.keys(userData.images.backgroundImages).forEach((key) => {
        const url = userData.images.backgroundImages[key];
        if (url && !isValidUrl(url)) {
          console.warn(
            `URL de imagen de fondo no válida para ${key}, se omitirá`
          );
          userData.images.backgroundImages[key] = "";
        }
      });
    }

    userData = sanitizeUserData(userData);

    return userData;
  } catch (error) {
    throw new Error("Validación falló: " + error.message);
  }
}

function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeUserData(userData) {
  function sanitizeString(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }

  if (userData.cycleInfo) {
    ["name", "description", "hour", "baseDate"].forEach((field) => {
      if (userData.cycleInfo[field]) {
        userData.cycleInfo[field] = sanitizeString(userData.cycleInfo[field]);
      }
    });
  }

  if (userData.selectedMovies && Array.isArray(userData.selectedMovies)) {
    userData.selectedMovies.forEach((movie) => {
      ["title", "director", "overview"].forEach((field) => {
        if (movie[field]) {
          movie[field] = sanitizeString(movie[field]);
        }
      });
    });
  }

  return userData;
}

function importUserData(file) {
  if (file.size > 10 * 1024 * 1024) {
    alert("El archivo es demasiado grande. El tamaño max: 10MB");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      let userData;

      try {
        userData = JSON.parse(e.target.result);
      } catch (parseError) {
        throw new Error("El archivo no contiene JSON válido.");
      }

      const validatedData = validateUserData(userData);
      console.log("Importando datos del ciclo:", validatedData);

      try {
        restoreCycleInfo(validatedData.cycleInfo);
        restoreSelectedMovies(validatedData.selectedMovies);
        restoreIndividualDates(validatedData.individualDates);
        restoreDesignSettings(validatedData.designSettings);
        restoreImages(validatedData.images);
      } catch (restoreError) {
        console.error("Error durante la restauración:", restoreError);
        alert(
          "Error al restaurar algunos datos. Revisa la consola para más detalles."
        );
      }
    } catch (error) {
      console.error("Error al importar datos:", error);
      alert("Error al importar datos: " + error.message);
    }
  };

  reader.onerror = function () {
    alert("Error al leer el archivo. Por favor intenta de nuevo.");
  };

  reader.readAsText(file);
}

function restoreCycleInfo(cycleInfo) {
  if (!cycleInfo) return;

  const formFields = [
    { id: "cicloInput", value: cycleInfo.name },
    { id: "cycleDescriptionInput", value: cycleInfo.description },
    { id: "hourInput", value: cycleInfo.hour },
  ];

  formFields.forEach((field) => {
    if (field.value !== undefined && field.value !== null) {
      const element = document.getElementById(field.id);
      if (element) {
        element.value = field.value;
        element.dispatchEvent(new Event("input"));
      }
    }
  });

  if (cycleInfo.name) {
    document.getElementById("ciclo").textContent = cycleInfo.name;
    const cicloFeed = document.getElementById("ciclo-feed");
    if (cicloFeed) cicloFeed.textContent = cycleInfo.name;
  }

  if (cycleInfo.description) {
    const cycleDescText = document.getElementById("cycle-description-text");
    const cycleDescTextFeed = document.getElementById(
      "cycle-description-text-feed"
    );
    if (cycleDescText) {
      cycleDescText.style.display = "block";
      cycleDescText.textContent = cycleInfo.description;
    }
    if (cycleDescTextFeed) {
      cycleDescTextFeed.style.display = "block";
      cycleDescTextFeed.textContent = cycleInfo.description;
    }
  }

  if (cycleInfo.hour) {
    const formattedHour = `${cycleInfo.hour} HS`;
    document.getElementById("flyer-hour").textContent = formattedHour;
    const flyerHourFeed = document.getElementById("flyer-hour-feed");
    if (flyerHourFeed) flyerHourFeed.textContent = formattedHour;
  }
}

function restoreSelectedMovies(movies) {
  if (!movies || !Array.isArray(movies)) return;

  selectedMovies = [];
  allBackdrops = [];
  individualDates = {};

  movies.forEach((movie) => {
    if (movie && movie.id) {
      selectedMovies.push({
        id: movie.id,
        title: movie.title || "Título no disponible",
        year: movie.year || new Date().getFullYear(),
        director: movie.director || "Director no disponible",
        runtime: movie.runtime || 120,
        poster_path: movie.poster_path || "",
        overview: movie.overview || "",
        backdrops: movie.backdrops || [],
        language: movie.language || "en",
      });

      if (movie.backdrops && Array.isArray(movie.backdrops)) {
        allBackdrops = [...allBackdrops, ...movie.backdrops];
      }
    }
  });

  updateSelectedMoviesList();
  updateFlyerDisplay();
}

function restoreIndividualDates(dates) {
  if (!dates || typeof dates !== "object") return;

  individualDates = { ...dates };
  updateIndividualDatesSection();
  updateFlyerDisplay();
}

function restoreDesignSettings(designSettings) {
  if (!designSettings) return;

  if (designSettings.colors) {
    Object.keys(designSettings.colors).forEach((elementKey) => {
      const colorData = designSettings.colors[elementKey];
      let elements = [];

      if (
        [
          "ciclo",
          "flyer-hour",
          "flyer-biblioteca",
          "org",
          "cycle-description-text",
          "flyer-story",
          "flyer-feed",
        ].includes(elementKey)
      ) {
        const element = document.getElementById(elementKey);
        if (element) elements.push(element);
        const feedElement = document.getElementById(elementKey + "-feed");
        if (feedElement) elements.push(feedElement);
      } else if (elementKey.startsWith("movie-item-")) {
        const movieIdMatch = elementKey.match(/movie-item-(?:feed-)?(\d+)/);
        if (movieIdMatch) {
          const movieId = parseInt(movieIdMatch[1]);
          const movieIndex = selectedMovies.findIndex(
            (movie) => movie.id === movieId
          );

          if (movieIndex >= 0) {
            if (elementKey.includes("feed")) {
              const feedCards = document.querySelectorAll(".movie-item-feed");
              if (feedCards[movieIndex]) elements.push(feedCards[movieIndex]);
            } else {
              const storyCards = document.querySelectorAll(
                ".movie-item-alternating"
              );
              if (storyCards[movieIndex]) elements.push(storyCards[movieIndex]);
            }
          }
        }
      } else if (elementKey.startsWith("movie-title-")) {
        const index = parseInt(elementKey.replace("movie-title-", ""));
        const titleElements = document.querySelectorAll(
          ".movie-title, .movie-title-feed"
        );
        if (titleElements[index]) elements.push(titleElements[index]);
        if (titleElements[index + selectedMovies.length])
          elements.push(titleElements[index + selectedMovies.length]);
      } else if (elementKey.startsWith("movie-info-")) {
        const index = parseInt(elementKey.replace("movie-info-", ""));
        const infoElements = document.querySelectorAll(
          ".movie-info, .movie-info-feed"
        );
        if (infoElements[index]) elements.push(infoElements[index]);
        if (infoElements[index + selectedMovies.length])
          elements.push(infoElements[index + selectedMovies.length]);
      } else if (elementKey.startsWith("movie-date-")) {
        const index = parseInt(elementKey.replace("movie-date-", ""));
        const dateElements = document.querySelectorAll(
          ".movie-date, .movie-date-feed"
        );
        if (dateElements[index]) elements.push(dateElements[index]);
        if (dateElements[index + selectedMovies.length])
          elements.push(dateElements[index + selectedMovies.length]);
      } else if (elementKey.startsWith("movie-details-")) {
        const index = parseInt(elementKey.replace("movie-details-", ""));
        const detailsElements = document.querySelectorAll(".movie-details");
        if (detailsElements[index]) elements.push(detailsElements[index]);
      } else if (
        elementKey.startsWith("movie-") ||
        document.getElementById(elementKey)
      ) {
        const element = document.getElementById(elementKey);
        if (element) elements.push(element);
      } else if (
        [
          "rect",
          "rect-feed",
          "rect2",
          "rect2-feed",
          "tape",
          "header",
          "header-feed",
        ].includes(elementKey)
      ) {
        const element = document.querySelector(`.${elementKey}`);
        if (element) elements.push(element);
      }

      elements.forEach((element) => {
        if (colorData) {
          if (colorData.color) element.style.color = colorData.color;
          if (colorData.backgroundColor)
            element.style.backgroundColor = colorData.backgroundColor;
        }
      });
    });
  }

  if (designSettings.elementColors) {
    Object.keys(designSettings.elementColors).forEach((key) => {
      elementColors[key] = { ...designSettings.elementColors[key] };
    });
  }

  if (designSettings.fontSizes) {
    const fontSizeFields = [
      {
        id: "flyerHourFontSizeInput",
        value: designSettings.fontSizes.flyerHour,
      },
      {
        id: "cycleDescriptionFontSizeInput",
        value: designSettings.fontSizes.cycleDescription,
      },
    ];

    fontSizeFields.forEach((field) => {
      if (
        field.value !== undefined &&
        field.value !== null &&
        field.value !== ""
      ) {
        const element = document.getElementById(field.id);
        if (element) {
          element.value = field.value;
          element.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (designSettings.dimensions && designSettings.dimensions.rectWidth) {
    const rectWidthInput = document.getElementById("rectWidthInput");
    if (rectWidthInput) {
      rectWidthInput.value = designSettings.dimensions.rectWidth;
      rectWidthInput.dispatchEvent(new Event("input"));
    }
  }

  if (designSettings.rectHidden !== undefined) {
    const rect = document.querySelector(".rect");
    const rectFeed = document.querySelector(".rect-feed");
    const toggleBtn = document.getElementById("toggle-rect");

    if (rect && rectFeed && toggleBtn) {
      rect.style.display = designSettings.rectHidden ? "none" : "block";
      rectFeed.style.display = designSettings.rectHidden ? "none" : "block";
      toggleBtn.textContent = designSettings.rectHidden
        ? "Mostrar rectángulo vertical"
        : "Ocultar rectángulo vertical";
    }
  }

  if (designSettings.textStrokes) {
    Object.keys(designSettings.textStrokes).forEach((elementId) => {
      let elements = [];

      // manejo de los elementos indexados de películas
      if (elementId.startsWith("movie-title-")) {
        const index = parseInt(elementId.replace("movie-title-", ""));
        const titleElements = document.querySelectorAll(
          ".movie-title, .movie-title-feed"
        );
        if (titleElements[index]) elements.push(titleElements[index]);
        if (titleElements[index + selectedMovies.length])
          elements.push(titleElements[index + selectedMovies.length]);
      } else if (elementId.startsWith("movie-info-")) {
        const index = parseInt(elementId.replace("movie-info-", ""));
        const infoElements = document.querySelectorAll(
          ".movie-info, .movie-info-feed"
        );
        if (infoElements[index]) elements.push(infoElements[index]);
        if (infoElements[index + selectedMovies.length])
          elements.push(infoElements[index + selectedMovies.length]);
      } else if (elementId.startsWith("movie-date-")) {
        const index = parseInt(elementId.replace("movie-date-", ""));
        const dateElements = document.querySelectorAll(
          ".movie-date, .movie-date-feed"
        );
        if (dateElements[index]) elements.push(dateElements[index]);
        if (dateElements[index + selectedMovies.length])
          elements.push(dateElements[index + selectedMovies.length]);
      } else if (elementId.startsWith("movie-details-")) {
        const index = parseInt(elementId.replace("movie-details-", ""));
        const detailsElements = document.querySelectorAll(".movie-details");
        if (detailsElements[index]) elements.push(detailsElements[index]);
      } else if (elementId === "subheader") {
        elements.push(document.getElementById("ciclo"));
        elements.push(document.getElementById("ciclo-feed"));
      } else {
        const element =
          document.getElementById(elementId) ||
          document.querySelector(`.${elementId}`);
        if (element) elements.push(element);
      }

      elements.forEach((element) => {
        if (element) {
          element.style.textShadow = designSettings.textStrokes[elementId];
        }
      });
    });
  }

  if (designSettings.elementColors) {
    elementColors = { ...designSettings.elementColors };
  }
}

function restoreImages(imagesData) {
  if (!imagesData) return;

  if (imagesData.allBackdrops && Array.isArray(imagesData.allBackdrops)) {
    allBackdrops = [...imagesData.allBackdrops];
    if (typeof imagesData.currentBackdrop === "number") {
      currentBackdrop = Math.min(
        imagesData.currentBackdrop,
        allBackdrops.length - 1
      );
    }
    if (allBackdrops.length > 0) {
      showBackdrop(currentBackdrop);
    }
  }

  if (imagesData.backgroundImages) {
    const storyFlyer = document.getElementById("flyer-story");
    const feedFlyer = document.getElementById("flyer-feed");

    if (imagesData.backgroundImages.story && storyFlyer) {
      storyFlyer.style.backgroundImage = `url(${imagesData.backgroundImages.story})`;
      storyFlyer.style.backgroundSize = "cover";
      storyFlyer.style.backgroundPosition = "center";
    }

    if (imagesData.backgroundImages.feed && feedFlyer) {
      feedFlyer.style.backgroundImage = `url(${imagesData.backgroundImages.feed})`;
      feedFlyer.style.backgroundSize = "cover";
      feedFlyer.style.backgroundPosition = "center";
    }
  }
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

  if (confirm(`${fileInfo}`)) {
    const loadingIndicator = showLoadingIndicator(
      "Importando datos del ciclo..."
    );

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

document.addEventListener("DOMContentLoaded", function () {
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
});
