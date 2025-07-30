document.getElementById("movieForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  function getApiToken() {
    const input = document.getElementById("tmdbToken");
    return input && input.value ? input.value : "";
  }

  // Cuando hagas fetch a TMDB, usa:
  const API_KEY = getApiToken();
  const BASE_URL = "https://api.themoviedb.org/3";

  const query = document.getElementById("movieSearch").value;

  // Buscar película
  const searchRes = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
  );
  const searchData = await searchRes.json();
  if (searchData.results.length === 0)
    return alert("No se encontró la película.");

  const movie = searchData.results[0];
  document.getElementById("title").textContent = movie.title;
  document.getElementById("year").textContent = new Date(
    movie.release_date
  ).getFullYear();
  document.getElementById(
    "poster"
  ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  // Obtener créditos (para director)
  const creditsRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`
  );
  const creditsData = await creditsRes.json();
  const director = creditsData.crew.find((c) => c.job === "Director");
  document.getElementById("director").textContent = director
    ? director.name
    : "Director no disponible";
});

const colorPicker = document.getElementById("bgColorPicker");
const rect = document.querySelector(".rect");
const eventData = document.querySelector(".event-data");
colorPicker.addEventListener("input", function (e) {
  rect.style.background = e.target.value;
  eventData.style.background = e.target.value;
});

const textColorPicker = document.getElementById("textColorPicker");
const title = document.getElementById("title");
const year = document.getElementById("year");
const director = document.getElementById("director");
const org = document.getElementById("org");
textColorPicker.addEventListener("input", function (e) {
  title.style.color = e.target.value;
  year.style.color = e.target.value;
  director.style.color = e.target.value;
  org.style.color = e.target.value;
});

const flyerDate = document.getElementById("flyer-date");
const flyerHour = document.getElementById("flyer-hour");
const dateInput = document.getElementById("dateInput");
const hourInput = document.getElementById("hourInput");

flyerDate.addEventListener("dblclick", () => {
  dateInput.style.display = "block";
  flyerDate.style.display = "none";
  dateInput.value = flyerDate.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  dateInput.focus();
});
dateInput.addEventListener("blur", () => {
  flyerDate.innerHTML = dateInput.value.replace(/\n/g, "<br>");
  flyerDate.style.display = "block";
  dateInput.style.display = "none";
});
dateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    flyerDate.innerHTML = dateInput.value.replace(/\n/g, "<br>");
    flyerDate.style.display = "block";
    dateInput.style.display = "none";
    e.preventDefault();
  }
});

flyerHour.addEventListener("dblclick", () => {
  hourInput.style.display = "block";
  flyerHour.style.display = "none";
  hourInput.value = flyerHour.textContent;
  hourInput.focus();
});
hourInput.addEventListener("blur", () => {
  flyerHour.textContent = hourInput.value;
  flyerHour.style.display = "block";
  hourInput.style.display = "none";
});
hourInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    flyerHour.textContent = hourInput.value;
    flyerHour.style.display = "block";
    hourInput.style.display = "none";
    e.preventDefault();
  }
});

document.getElementById("saveFlyer").addEventListener("click", () => {
  const flyer = document.getElementById("flyer");

  html2canvas(flyer, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: "white",
    scale: 2,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "flyer.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
