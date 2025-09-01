const API_KEY = "c733c18f5b61209aa7ea217bd007b156";
const BASE_URL = "https://api.themoviedb.org/3";

let selectedMovies = [];
let allBackdrops = [];
let currentBackdrop = 0;
let individualDates = {};

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
        <button class="add-movie-btn" data-movie-id="${movie.id}"
                style="margin-left:10px;padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;"
                ${selectedMovies.length >= 4 ? 'disabled style="background:#ccc;"' : ''}>
          ${selectedMovies.some(m => m.id === movie.id) ? 'Ya agregada' : 'Agregar'}
        </button>
      `;

      const addButton = result.querySelector('.add-movie-btn');
      if (addButton) {
        addButton.addEventListener('click', () => {
          addMovieToCycle(movie.id);
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
      fetch(`${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}&include_image_language=null`)
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

    const director = creditsData && creditsData.crew ? creditsData.crew.find((c) => c.job === "Director") : null;

    const movieData = {
      id: movieId,
      title: movieDetails.title || "Título no disponible",
      year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : new Date().getFullYear(),
      director: director ? director.name : "Director no disponible",
      runtime: movieDetails.runtime || 120,
      poster_path: movieDetails.poster_path || "",
      overview: movieDetails.overview || "",
      backdrops: (imagesData && imagesData.backdrops) ? imagesData.backdrops : []
    };

    selectedMovies.push(movieData);
    console.log("Película agregada exitosamente:", movieData);

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
        <div style="color:#666;font-size:14px;">${movie.year} • ${movie.director} • ${movie.runtime} min</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="move-up-btn" data-index="${index}" ${index === 0 ? 'disabled' : ''}
                style="padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;">↑</button>
        <button class="move-down-btn" data-index="${index}" ${index === selectedMovies.length - 1 ? 'disabled' : ''}
                style="padding:4px 8px;border:1px solid #ccc;background:#fff;border-radius:4px;cursor:pointer;">↓</button>
        <button class="remove-movie-btn" data-index="${index}"
                style="padding:4px 8px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">✕</button>
      </div>
    `;

    const moveUpBtn = movieItem.querySelector('.move-up-btn');
    const moveDownBtn = movieItem.querySelector('.move-down-btn');
    const removeBtn = movieItem.querySelector('.remove-movie-btn');

    if (moveUpBtn && !moveUpBtn.disabled) {
      moveUpBtn.addEventListener('click', () => moveMovie(index, -1));
    }
    if (moveDownBtn && !moveDownBtn.disabled) {
      moveDownBtn.addEventListener('click', () => moveMovie(index, 1));
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', () => removeMovie(index));
    }

    listContainer.appendChild(movieItem);
  });

  const counter = document.createElement("div");
  counter.style.cssText = "text-align: center; margin-top: 10px; color: #666;";
  counter.textContent = `${selectedMovies.length}/4 películas agregadas`;
  listContainer.appendChild(counter);

  updateIndividualDatesSection();
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
  const movieId = selectedMovies[index].id;
  selectedMovies.splice(index, 1);
  delete individualDates[movieId];

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
      const dateInputElement = document.getElementById("dateInput");
      const defaultDate = dateInputElement ? dateInputElement.value : "2025-08-06";
      const baseDate = new Date(defaultDate);
      baseDate.setDate(baseDate.getDate() + index);
      individualDates[movie.id] = baseDate.toISOString().split('T')[0];
    }

    dateInput.innerHTML = `
      <label style="min-width: 200px; text-align: left; font-size: 11px;">${movie.title}:</label>
      <input type="date" id="movie-date-${movie.id}" value="${individualDates[movie.id]}" 
             style="padding: 6px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff;">
    `;

    container.appendChild(dateInput);
  });

  // Agregar event listeners a los nuevos inputs de fecha
  addIndividualDateListeners();
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
      itemSpacing = 100;
      itemPadding = 60;
      posterWidth = 280;
      break;
    case 2:
      itemSpacing = 160;
      itemPadding = 65;
      posterWidth = 300;
      break;
    case 3:
      itemSpacing = 60;
      itemPadding = 45;
      posterWidth = 220;
      break;
    case 4:
      itemSpacing = 25;
      itemPadding = 30;
      posterWidth = 140;
      break;
    default:
      itemSpacing = 35;
      itemPadding = 30;
      posterWidth = 160;
  }

  return { width: posterWidth, spacing: itemSpacing, padding: itemPadding };
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
    const alignStyle = isLeft ? 'flex-start' : 'flex-end';
    const textAlign = isLeft ? 'left' : 'right';
    const flexDirection = isLeft ? 'row' : 'row-reverse';
    
    const movieDate = individualDates[movie.id];
    let formattedMovieDate = "";
    if (movieDate) {
      const date = new Date(movieDate + "T00:00:00");
      const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
      const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
                     "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
      
      const dayName = days[date.getDay()];
      const dayNumber = date.getDate();
      const monthName = months[date.getMonth()];

      formattedMovieDate = `${dayName} ${dayNumber} ${monthName}`;
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
        margin: 0 ${isLeft ? '0' : 'auto'} 0 ${isLeft ? 'auto' : '0'};
      ">
        ${isLeft ? `
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
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
          <div class="movie-date-individual" style="
            background: rgba(4, 63, 97, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Gilroy', sans-serif;
            font-weight: 600;
            font-size: ${sizes.width > 140 ? '14px' : '12px'};
            text-align: center;
            min-width: 80px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          ">
            ${formattedMovieDate}
          </div>
        ` : `
          <div class="movie-date-individual" style="
            background: rgba(4, 63, 97, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Gilroy', sans-serif;
            font-weight: 600;
            font-size: ${sizes.width > 140 ? '14px' : '12px'};
            text-align: center;
            min-width: 80px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            margin-right: ${sizes.padding}px;
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
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
               style="
                 width: ${sizes.width}px; 
                 height: auto; 
                 border-radius: 12px; 
                 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                 margin-left: ${sizes.padding}px;
               " />
        `}
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
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
      posterSize = 120;
      fontSize = { title: '12px', info: '10px', date: '8px' };
      spacing = 20;
      break;
    case 2:
      posterSize = 100;
      fontSize = { title: '11px', info: '9px', date: '7px' };
      spacing = 18;
      break;
    case 3:
      posterSize = 85;
      fontSize = { title: '10px', info: '8px', date: '6px' };
      spacing = 15;
      break;
    case 4:
      posterSize = 75;
      fontSize = { title: '9px', info: '7px', date: '6px' };
      spacing = 12;
      break;
    default:
      posterSize = 70;
      fontSize = { title: '8px', info: '7px', date: '5px' };
      spacing = 10;
  }

  let html = `<div class="cycle-movies-feed-horizontal" style="display: flex; gap: ${spacing}px; justify-content: center; flex-wrap: wrap; background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">`;

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
        ${formattedMovieDate ? `
          <div class="movie-date-feed" style="
            position: absolute;
            top: 6px;
            right: 6px;
            background: rgba(4, 63, 97, 0.9);
            color: white;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Gilroy', sans-serif;
            font-weight: 600;
            font-size: ${fontSize.date};
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          ">
            ${formattedMovieDate}
          </div>
        ` : ''}
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

  const formattedHour = hourRaw ? `${hourRaw} HS` : "19:00 HS";
  document.getElementById("flyer-hour").textContent = formattedHour;
  const flyerHourFeed = document.getElementById("flyer-hour-feed");
  if (flyerHourFeed) {
    flyerHourFeed.textContent = formattedHour;
  }

  if (dateRaw && selectedMovies.length > 0) {
    const baseDate = new Date(dateRaw + "T00:00:00");
    selectedMovies.forEach((movie, index) => {
      const movieDate = new Date(baseDate);
      movieDate.setDate(baseDate.getDate() + index);
      individualDates[movie.id] = movieDate.toISOString().split('T')[0];
    });
    
    updateIndividualDatesSection();
    updateFlyerDisplay();
  }
});

document.getElementById("flyerHourFontSizeInput").addEventListener("input", (e) => {
  const size = e.target.value + "px";
  document.querySelector(".flyer-hour-ciclos").style.fontSize = size;
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
    const elements = document.querySelectorAll(`#${option.value}, .${option.value}, .${option.value}-ciclos`);
    elements.forEach(element => {
      element.style.textShadow = `2px 2px 0 ${color}, -2px -2px 0 ${color}, 2px -2px 0 ${color}, -2px 2px 0 ${color}`;
    });
  });
});

document.getElementById("removeStrokeBtn").addEventListener("click", () => {
  const selectedOptions = Array.from(document.getElementById("strokeTargetSelect").selectedOptions);

  selectedOptions.forEach(option => {
    const elements = document.querySelectorAll(`#${option.value}, .${option.value}, .${option.value}-ciclos`);
    elements.forEach(element => {
      element.style.textShadow = "";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  updateSelectedMoviesList();
  updateFlyerDisplay();
});

document.getElementById("applyIndividualDatesBtn").addEventListener("click", () => {
  selectedMovies.forEach(movie => {
    const dateInput = document.getElementById(`movie-date-${movie.id}`);
    if (dateInput && dateInput.value) {
      individualDates[movie.id] = dateInput.value;
    }
  });
  
  updateFlyerDisplay();
  alert("Fechas individuales aplicadas correctamente");
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

function addIndividualDateListeners() {
  selectedMovies.forEach(movie => {
    const dateInput = document.getElementById(`movie-date-${movie.id}`);
    if (dateInput) {
      dateInput.removeEventListener("change", handleIndividualDateChange);
      dateInput.addEventListener("change", handleIndividualDateChange);
    }
  });
}

function handleIndividualDateChange(e) {
  const inputId = e.target.id;
  const movieId = inputId.replace('movie-date-', '');
  const newDate = e.target.value;
  
  if (movieId && newDate) {
    individualDates[movieId] = newDate;
    updateFlyerDisplay();
  }
}