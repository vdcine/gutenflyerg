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
  const year = document.getElementById("movieYear").value;

  // Buscar película
  const searchRes = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&year=${year}`
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

  const imagesRes = await fetch(
    `${BASE_URL}/movie/${movie.id}/images?api_key=${API_KEY}`
  );
  const imagesData = await imagesRes.json();

  backdrops = imagesData.backdrops || [];
  currentBackdrop = 0;
  showBackdrop(currentBackdrop);

  posters = imagesData.posters || [];
  currentPoster = 0;
  showPoster(currentPoster);
});

let backdrops = [];
let currentBackdrop = 0;
let posters = [];
let currentPoster = 0;

function showBackdrop(index) {
  if (!backdrops.length) return;
  const img = document.getElementById("backdrop-carousel-img");
  img.src = `https://image.tmdb.org/t/p/original${backdrops[index].file_path}`;
  document.getElementById("backdrop-counter").textContent = `Backdrop ${
    index + 1
  } de ${backdrops.length}`;
}

function showPoster(index) {
  if (!posters.length) return;
  const img = document.getElementById("poster-carousel-img");
  img.src = `https://image.tmdb.org/t/p/original${posters[index].file_path}`;
  document.getElementById("poster-counter").textContent = `Poster ${
    index + 1
  } de ${posters.length}`;
}

document.getElementById("poster-prev").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster - 1 + posters.length) % posters.length;
  showPoster(currentPoster);
});
document.getElementById("poster-next").addEventListener("click", () => {
  if (!posters.length) return;
  currentPoster = (currentPoster + 1) % posters.length;
  showPoster(currentPoster);
});

document.getElementById("set-poster-as-bg").addEventListener("click", () => {
  if (!posters.length) return;
  const url = `https://image.tmdb.org/t/p/original${posters[currentPoster].file_path}`;
  const rect = document.querySelector(".rect");
  rect.style.display = "none";
  setBackdropAsBackground(url);
});

document.getElementById("backdrop-prev").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop - 1 + backdrops.length) % backdrops.length;
  showBackdrop(currentBackdrop);
});

document.getElementById("backdrop-next").addEventListener("click", () => {
  if (!backdrops.length) return;
  currentBackdrop = (currentBackdrop + 1) % backdrops.length;
  showBackdrop(currentBackdrop);
});

document.getElementById("set-backdrop-as-bg").addEventListener("click", () => {
  if (!backdrops.length) return;
  const url = `https://image.tmdb.org/t/p/original${backdrops[currentBackdrop].file_path}`;
  const rect = document.querySelector(".rect");
  rect.style.display = "none"; // Ocultar rectángulo
  setBackdropAsBackground(url);
});

function setBackdropAsBackground(url) {
  const flyer = document.getElementById("flyer");
  let blurBg = document.getElementById("flyer-blur-bg");

  if (!blurBg) {
    blurBg = document.createElement("div");
    blurBg.id = "flyer-blur-bg";
    blurBg.style.position = "absolute";
    blurBg.style.top = "0";
    blurBg.style.left = "0";
    blurBg.style.width = "100%";
    blurBg.style.height = "100%";
    blurBg.style.zIndex = "0";
    blurBg.style.pointerEvents = "none";
    blurBg.style.backgroundPosition = "center";
    blurBg.style.backgroundSize = "cover";
    blurBg.style.backgroundRepeat = "no-repeat";
    blurBg.style.filter = "blur(4px) brightness(0.9)";
    flyer.prepend(blurBg);
  }

  blurBg.style.backgroundImage = `url('${url}')`;
  flyer.style.backgroundImage = "";
}
document.getElementById("remove-backdrop-bg").addEventListener("click", () => {
  const flyer = document.getElementById("flyer");
  const rect = document.querySelector(".rect");
  rect.style.display = "block";

  flyer.style.backgroundImage = "";

  const blurBg = document.getElementById("flyer-blur-bg");
  if (blurBg) {
    blurBg.remove();
  }
});

const colorPicker = document.getElementById("bgColorPicker");
const rect = document.querySelector(".rect");
const rect2 = document.querySelector(".rect2");
const eventData = document.querySelector(".event-data");
colorPicker.addEventListener("input", function (e) {
  rect.style.background = e.target.value;
  rect2.style.background = e.target.value;
  eventData.style.background = e.target.value;
});

const textColorPicker = document.getElementById("textColorPicker");
const title = document.getElementById("title");
const year = document.getElementById("year");
const director = document.getElementById("director");
textColorPicker.addEventListener("input", function (e) {
  title.style.color = e.target.value;
  year.style.color = e.target.value;
  director.style.color = e.target.value;
});

const orgColorPicker = document.getElementById("orgColorPicker");
const flyerOrg = document.getElementById("org");
orgColorPicker.addEventListener("input", function (e) {
  flyerOrg.style.color = e.target.value;
});

const headerColorPicker = document.getElementById("headerColorPicker");
const flyerHeader = document.querySelector(".header");
headerColorPicker.addEventListener("input", function (e) {
  flyerHeader.style.color = e.target.value;
});

const dateColorPicker = document.getElementById("dateColorPicker");
const flyerDate = document.getElementById("flyer-date");
dateColorPicker.addEventListener("input", function (e) {
  flyerDate.style.color = e.target.value;
});

const hourColorPicker = document.getElementById("hourColorPicker");
const flyerHour = document.getElementById("flyer-hour");
const flyerBiblioteca = document.getElementById("flyer-biblioteca");
hourColorPicker.addEventListener("input", function (e) {
  flyerHour.style.color = e.target.value;
  flyerBiblioteca.style.color = e.target.value;
});

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

/* document.getElementById("saveFlyer").addEventListener("click", () => {
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
}); */

async function applyBlurToImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = "blur(4px) brightness(0.9)";
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL());
    };
    img.src = imageUrl;
  });
}

document.getElementById("saveFlyer").addEventListener("click", async () => {
  const flyerElement = document.getElementById("flyer");
  const blurBg = document.getElementById("flyer-blur-bg");

  if (blurBg && blurBg.style.backgroundImage) {
    const bgImageMatch = blurBg.style.backgroundImage.match(
      /url\(['"]?([^'"]+)['"]?\)/
    );

    if (bgImageMatch) {
      const imageUrl = bgImageMatch[1];

      // Crear una imagen blur procesada
      try {
        const blurredDataUrl = await applyBlurToImage(imageUrl);

        const originalFilter = blurBg.style.filter;
        const originalBgImage = blurBg.style.backgroundImage;

        blurBg.style.filter = "none";
        blurBg.style.backgroundImage = `url('${blurredDataUrl}')`;

        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(flyerElement, {
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
        link.download = `flyer-cine-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (blurError) {
        console.warn(
          "Error al aplicar blur, usando método alternativo:",
          blurError
        );

        await generateWithoutBlur(flyerElement);
      }
    } else {
      await generateWithoutBlur(flyerElement);
    }
  } else {
    await generateWithoutBlur(flyerElement);
  }
});

async function generateWithoutBlur(flyerElement) {
  const canvas = await html2canvas(flyerElement, {
    width: 1080,
    height: 1920,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
  });

  const link = document.createElement("a");
  link.download = `flyer-cine-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
