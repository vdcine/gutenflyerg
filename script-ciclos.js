const API_KEY = "c733c18f5b61209aa7ea217bd007b156";
const BASE_URL = "https://api.themoviedb.org/3";

let selectedMovies = [];
let allBackdrops = [];
let currentBackdrop = 0;

document.getElementById("movieForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = document.getElementById("movieSearch").value;
  const language = document.getElementById("movieLanguage").value || "en";

  try {
    const searchRes = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${language}`
    );
    const searchData = await searchRes.json();

    if (searchData.results.length === 0) {
      alert("No se encontró la película.");
      return;
    }

    displaySearchResults(searchData.results.slice(0, 10));
  } catch (error) {
    console.error("Error al buscar películas:", error);
    alert("Error al buscar películas. Por favor intenta de nuevo.");
  }
});

async function displaySearchResults(movies) {
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
        fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`)
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
          <div style="font-weight:bold;font-size:16px;margin-bottom:4px;">${movie.title}</div>
          <div style="color:#666;margin-bottom:2px;">
            <span>${new Date(movie.release_date).getFullYear()}</span>
            ${director ? ` • ${director.name}` : ''}
            ${movieDetails.runtime ? ` • ${movieDetails.runtime} min` : ''}
          </div>
          <div style="font-size:14px;color:#888;">${movie.overview ? movie.overview.substring(0, 120) + '...' : 'Sin sinopsis disponible'}</div>
        </div>
        <button onclick="addMovieToCycle(${movie.id})" 
                style="margin-left:10px;padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;"
                ${selectedMovies.length >= 4 ? 'disabled style="background:#ccc;"' : ''}>
          ${selectedMovies.some(m => m.id === movie.id) ? 'Ya agregada' : 'Agregar'}
        </button>
      `;

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

async function addMovieToCycle(movieId) {
  if (selectedMovies.length >= 4) {
    alert("Máximo 4 películas por ciclo.");
    return;
  }

  if (selectedMovies.some(m => m.id === movieId)) {
    alert("Esta película ya está en el ciclo.");
    return;
  }

  try {
    const [detailsRes, creditsRes, imagesRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}&language`)
    ]);

    const movieDetails = await detailsRes.json();
    const creditsData = await creditsRes.json();
    const imagesData = await imagesRes.json();

    const director = creditsData.crew.find((c) => c.job === "Director");

    const movieData = {
      id: movieId,
      title: movieDetails.title,
      year: new Date(movieDetails.release_date).getFullYear(),
      director: director ? director.name : "Director no disponible",
      runtime: movieDetails.runtime,
      poster_path: movieDetails.poster_path,
      overview: movieDetails.overview,
      backdrops: imagesData.backdrops || []
    };

    selectedMovies.push(movieData);

    allBackdrops = [...allBackdrops, ...movieData.backdrops];

    updateSelectedMoviesList();
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

function updateSelectedMoviesList() {
  const listContainer = document.getElementById("selected-movies-list");

  if (selectedMovies.length === 0) {
    listContainer.innerHTML = `
      <p id="instrucciones" style="text-align: center; color: #666; font-style: italic;">
        No hay películas agregadas. Busca y selecciona hasta 4 películas para el ciclo.
      </p>
    `;
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
        <div style="color:#666;font-size:14px;">${movie.year} • ${movie.director} • ${movie.runtime} min</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="moveMovie(${index}, -1)" ${index === 0 ? 'disabled' : ''}
                style="padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;">↑</button>
        <button onclick="moveMovie(${index}, 1)" ${index === selectedMovies.length - 1 ? 'disabled' : ''}
                style="padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;">↓</button>
        <button onclick="removeMovie(${index})"
                style="padding:4px 8px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">✕</button>
      </div>
    `;

    listContainer.appendChild(movieItem);
  });

  const counter = document.createElement("div");
  counter.style.cssText = "text-align: center; margin-top: 10px; color: #666;";
  counter.textContent = `${selectedMovies.length}/4 películas agregadas`;
  listContainer.appendChild(counter);
}

function moveMovie(index, direction) {
  if (direction === -1 && index > 0) {
    [selectedMovies[index], selectedMovies[index - 1]] = [selectedMovies[index - 1], selectedMovies[index]];
  } else if (direction === 1 && index < selectedMovies.length - 1) {
    [selectedMovies[index], selectedMovies[index + 1]] = [selectedMovies[index + 1], selectedMovies[index]];
  }

  updateSelectedMoviesList();
  updateFlyerDisplay();
}

function removeMovie(index) {
  selectedMovies.splice(index, 1);

  allBackdrops = [];
  selectedMovies.forEach(movie => {
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

function updateSearchButtons() {
  const buttons = document.querySelectorAll('#movie-results button');
  buttons.forEach(button => {
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
}

function calculateMovieItemSize(movieCount) {
  if (movieCount === 0) return { width: 140, spacing: 25, padding: 20 };

  const availableHeight = 1920 - 600;

  let itemSpacing, itemPadding, posterWidth;

  switch (movieCount) {
    case 1:
      itemSpacing = 60;
      itemPadding = 35;
      posterWidth = 200;
      break;
    case 2:
      itemSpacing = 120;
      itemPadding = 40;
      posterWidth = 220;
      break;
    case 3:
      itemSpacing = 35;
      itemPadding = 25;
      posterWidth = 150;
      break;
    case 4:
      itemSpacing = 25;
      itemPadding = 20;
      posterWidth = 130;
      break;
    default:
      itemSpacing = 15;
      itemPadding = 12;
      posterWidth = 100;
  }

  return { width: posterWidth, spacing: itemSpacing, padding: itemPadding };
}

function updateStoryFlyer() {
  const container = document.getElementById("cycle-movies");

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
    const alignStyle = isLeft ? 'flex-start' : 'flex-end';
    const textAlign = isLeft ? 'left' : 'right';
    const flexDirection = isLeft ? 'row' : 'row-reverse';

    html += `
      <div class="movie-item-alternating" style="
        display: flex; 
        align-items: center; 
        justify-content: ${alignStyle};
        ${flexDirection === 'row-reverse' ? 'flex-direction: row-reverse;' : ''}
        background: rgba(255, 255, 255, 0.95); 
        border-radius: 15px; 
        padding: ${sizes.padding}px; 
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        max-width: 700px;
        margin: 0 ${isLeft ? '0' : 'auto'} 0 ${isLeft ? 'auto' : '0'};
      ">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
             style="
               width: ${sizes.width}px; 
               height: auto; 
               border-radius: 12px; 
               box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
               ${isLeft ? `margin-right: ${sizes.padding}px;` : `margin-left: ${sizes.padding}px;`}
             " />
        <div class="movie-details" style="
          text-align: ${textAlign};
          flex: 1;
        ">
          <div class="movie-title" style="
            font-weight: bold; 
            font-size: ${sizes.width > 140 ? '18px' : sizes.width > 120 ? '16px' : '14px'}; 
            margin-bottom: 8px;
            color: #2c3e50;
            text-shadow: none;
            line-height: 1.2;
          ">${movie.title}</div>
          <div class="movie-info" style="
            font-size: ${sizes.width > 140 ? '14px' : sizes.width > 120 ? '12px' : '11px'}; 
            color: #7f8c8d;
            line-height: 1.4;
            text-shadow: none;
          ">
            <div><strong>${movie.year}</strong></div>
            <div>${movie.director}</div>
            <div>${movie.runtime} minutos</div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function updateFeedFlyer() {
  const container = document.getElementById("cycle-movies-feed");

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
      posterSize = 120;
      fontSize = { title: '12px', info: '10px' };
      spacing = 20;
      break;
    case 2:
      posterSize = 100;
      fontSize = { title: '11px', info: '9px' };
      spacing = 18;
      break;
    case 3:
      posterSize = 85;
      fontSize = { title: '10px', info: '8px' };
      spacing = 15;
      break;
    case 4:
      posterSize = 75;
      fontSize = { title: '9px', info: '7px' };
      spacing = 12;
      break;
    default:
      posterSize = 70;
      fontSize = { title: '8px', info: '7px' };
      spacing = 10;
  }

  let html = `<div class="cycle-movies-feed-horizontal" style="display: flex; gap: ${spacing}px; justify-content: center; flex-wrap: wrap; background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">`;

  selectedMovies.forEach((movie, index) => {
    html += `
      <div class="movie-item-feed" style="
        text-align: center; 
        max-width: ${posterSize + 20}px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      ">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
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

  html += '</div>';
  container.innerHTML = html;
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

  document.getElementById("backdrop-counter").textContent = 
    `${index + 1} de ${allBackdrops.length} backdrops`;
}

document.getElementById("backdrop-prev").addEventListener("click", () => {
  if (allBackdrops.length > 0) {
    currentBackdrop = (currentBackdrop - 1 + allBackdrops.length) % allBackdrops.length;
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
    
    document.getElementById("flyer-story").style.backgroundImage = `url(${fullUrl})`;
    document.getElementById("flyer-story").style.backgroundSize = "cover";
    document.getElementById("flyer-story").style.backgroundPosition = "center";
    
    document.getElementById("flyer-feed").style.backgroundImage = `url(${fullUrl})`;
    document.getElementById("flyer-feed").style.backgroundSize = "cover";
    document.getElementById("flyer-feed").style.backgroundPosition = "center";
  }
});

document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  document.getElementById("flyer-story").style.backgroundImage = "";
  document.getElementById("flyer-feed").style.backgroundImage = "";
});

document.getElementById("load-backdrop-direct").addEventListener("click", () => {
  const input = document.getElementById("backdrop-direct-input").value.trim();

  if (!input) {
    alert("Por favor, ingresa una URL.");
    return;
  }

  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    alert("Por favor, ingresa una URL completa que comience con http:// o https://");
    return;
  }

  const newBackdrop = {
    file_path: input,
    aspect_ratio: 1.78
  };

  allBackdrops.unshift(newBackdrop);
  currentBackdrop = 0;
  showBackdrop(currentBackdrop);

  document.getElementById("backdrop-direct-input").value = "";
});

document.getElementById("applyTxtBtn").addEventListener("click", () => {
  const ciclo = document.getElementById("cicloInput").value.trim();
  const dateRaw = document.getElementById("dateInput").value.trim();
  const hourRaw = document.getElementById("hourInput").value.trim();

  document.getElementById("ciclo").textContent = ciclo || "Ciclo Temático";
  const cicloFeed = document.getElementById("ciclo-feed");
  if (cicloFeed) {
    cicloFeed.textContent = ciclo || "Ciclo Temático";
  }

  function formatDateToSpanish(dateStr) {
    if (!dateStr) return "MIÉRCOLES 6<br />DE AGOSTO";

    const date = new Date(dateStr + "T00:00:00");
    const days = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
    const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
                   "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    
    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const monthName = months[date.getMonth()];

    return `${dayName} ${dayNumber}<br />DE ${monthName}`;
  }

  const formattedDate = formatDateToSpanish(dateRaw);
  document.getElementById("flyer-date").innerHTML = formattedDate;
  const flyerDateFeed = document.getElementById("flyer-date-feed");
  if (flyerDateFeed) {
    flyerDateFeed.innerHTML = formattedDate;
  }

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";
  document.getElementById("flyer-hour").textContent = formattedHour;
  const flyerHourFeed = document.getElementById("flyer-hour-feed");
  if (flyerHourFeed) {
    flyerHourFeed.textContent = formattedHour;
  }
});

document.getElementById("flyerDateFontSizeInput").addEventListener("input", (e) => {
  const size = e.target.value + "px";
  document.querySelector(".flyer-date").style.fontSize = size;
  const flyerDateFeed = document.querySelector(".flyer-date-feed");
  if (flyerDateFeed) flyerDateFeed.style.fontSize = size;
});

document.getElementById("flyerHourFontSizeInput").addEventListener("input", (e) => {
  const size = e.target.value + "px";
  document.querySelector(".flyer-hour").style.fontSize = size;
  const flyerHourFeed = document.querySelector(".flyer-hour-feed");
  if (flyerHourFeed) flyerHourFeed.style.fontSize = size;
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
    scale: 2
  }).then(canvas => {
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
    scale: 2
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "ciclo-cine-feed.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.getElementById("applyStrokeBtn").addEventListener("click", () => {
  const selectedOptions = Array.from(document.getElementById("strokeTargetSelect").selectedOptions);
  const color = document.getElementById("strokeColorInput").value;

  selectedOptions.forEach(option => {
    const elements = document.querySelectorAll(`#${option.value}, .${option.value}`);
    elements.forEach(element => {
      element.style.textShadow = `2px 2px 0 ${color}, -2px -2px 0 ${color}, 2px -2px 0 ${color}, -2px 2px 0 ${color}`;
    });
  });
});

document.getElementById("removeStrokeBtn").addEventListener("click", () => {
  const selectedOptions = Array.from(document.getElementById("strokeTargetSelect").selectedOptions);

  selectedOptions.forEach(option => {
    const elements = document.querySelectorAll(`#${option.value}, .${option.value}`);
    elements.forEach(element => {
      element.style.textShadow = "";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  updateSelectedMoviesList();
  updateFlyerDisplay();
});