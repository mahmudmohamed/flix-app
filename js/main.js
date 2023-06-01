let state = {
  currentPage: window.location.pathname,
  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: "cc02e301a193c7797d965d31fde5c20b",
    apiUrl: "https://api.themoviedb.org/3/",
  },
};

// Create elements

function createElementWithClasses(el, classes = "") {
  let element = document.createElement(el);
  element.className = classes;
  return element;
}

function appendElement(parent, child) {
  parent.append(child);
  return parent;
}

function addInnerHtml(el, text) {
  let element = el;
  element.innerHTML = text;
  return element;
}

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}

function hideSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

// Fetch & Search Data

// Fetch data

async function fetchData(endpoint) {
  const apiKey = state.api.apiKey;
  const apiUrl = state.api.apiUrl;

  showSpinner();

  const response = await fetch(
    `${apiUrl}${endpoint}?api_key=${apiKey}&language=en-US`
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

async function searchData() {
  const apiKey = state.api.apiKey;
  const apiUrl = state.api.apiUrl;

  showSpinner();

  const response = await fetch(
    `${apiUrl}search/${state.search.type}?api_key=${apiKey}&language=en-US&query=${state.search.term}&page=${state.search.page}`
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

// Search Movies or Shows

async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  state.search.term = urlParams.get("search-term");
  state.search.type = urlParams.get("type");

  if (state.search.term !== "" && state.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchData();

    state.search.page = page;
    state.search.totalPages = total_pages;
    state.search.totalResults = total_results;

    if (results.lenght === 0) {
      showAlert("No results found");
      return;
    }

    displaySearchResults(results, total_results);

    document.querySelector("#search-term").value = "";
  } else {
    showAlert("Please enter the name of a movie or show");
  }
}

// Display popular Movies or Shows

async function displayPopular(endpoint) {
  const { results } = await fetchData(`${endpoint}/popular`);

  results.forEach((result) => {
    let div = createElementWithClasses("div", "card");
    let text = `
      <a href="${endpoint}-details.html?id=${result.id}">
         ${
           result.poster_path
             ? `
             <img src="https://image.tmdb.org/t/p/w500/${
               result.poster_path
             }" class="card-img-top" alt="${
                 endpoint === "movie" ? result.title : result.name
               }"/>`
             : `<img src="images/no-image.jpg" class="card-img-top" alt="${
                 endpoint === "movie" ? result.title : result.name
               }"/>`
         }
        </a>
        <div class="card-body">
          <h5 class="card-title">$${
            endpoint === "movie" ? result.title : result.name
          }</h5>
          <p class="card-text">
            <small class="text-muted">${
              endpoint === "movie" ? "Release" : "Air Date"
            }: ${
      endpoint === "movie" ? result.release_date : result.first_air_date
    }</small>
          </p>
        </div>
        `;
    div = addInnerHtml(div, text);
    appendElement(document.querySelector(`#popular-${endpoint}`), div);
  });
}

// Display Movie Details

async function displayDetails(endpoint) {
  const resultId = window.location.search.split("=")[1];
  const result = await fetchData(`${endpoint}/${resultId}`);

  displayBackgroundImage(endpoint, result.backdrop_path);

  const div = createElementWithClasses("div");
  addInnerHtml(
    div,
    `
      <div class="details-top">
      <div>
      ${
        result.poster_path
          ? `
            <img src="https://image.tmdb.org/t/p/w500/${
              result.poster_path
            }" class="card-img-top" alt="${
              endpoint === "movie" ? result.title : result.name
            }"/>`
          : `<img src="images/no-image.jpg" class="card-img-top" alt="${
              endpoint === "movie" ? result.title : result.name
            }"/>`
      }
      </div>
      <div>
        <h2>${endpoint === "movie" ? result.title : result.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${result.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">${
          endpoint === "movie" ? "Release Date" : "Last Air Date"
        }: ${
      endpoint === "movie" ? result.release_date : result.last_air_date
    }</p>
        <p>
        ${result.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
        ${result.genres.map((genre) => `<li>${genre.name}</li>`).join("")}
        </ul>
        <a href="${
          result.homepage
        }" target="_blank" class="btn">Visit Movie Homepage</a>
      </div>
    </div>
    <div class="details-bottom">
      <h2>Movie Info</h2>
      <ul>
        <li><span class="text-secondary">${
          endpoint === "movie" ? "Budget" : "Episodes"
        }:</span> ${
      endpoint === "movie"
        ? "$" + addCommasToNumber(result.budget)
        : result.number_of_episodes
    } </li>
        <li><span class="text-secondary">${
          endpoint === "movie" ? "Revenue" : "Last Episode To Air"
        }:</span> ${
      endpoint === "movie"
        ? "$" + addCommasToNumber(result.revenue)
        : result.last_episode_to_air.name
    } </li>
        ${
          endpoint === "movie"
            ? `  <li><span class="text-secondary">${
                endpoint === "movie" ? "Runtime:" : ""
              }</span> 
          ${endpoint === "movie" ? result.runtime + " minutes" : ""} </li>`
            : ""
        }
        <li><span class="text-secondary">Status:</span> ${result.status} </li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group"> ${result.production_companies
        .map((company) => `<span>${company.name}</span>`)
        .join(", ")} </div>
    </div>`
  );
  appendElement(document.querySelector(`#${endpoint}-details`), div);
}

// Display Search Results

function displaySearchResults(results, total_results) {
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  results.forEach((result) => {
    let div = createElementWithClasses("div", "card");
    let text = `
          <a href="${state.search.type}-details.html?id=${result.id}">
             ${
               result.poster_path
                 ? `
                 <img src="https://image.tmdb.org/t/p/w500/${
                   result.poster_path
                 }" class="card-img-top" alt="${
                     state.search.type === "movie" ? result.title : result.name
                   }"/>`
                 : `<img src="images/no-image.jpg" class="card-img-top" alt="${
                     state.search.type === "movie" ? result.title : result.name
                   }"/>`
             }
            </a>
            <div class="card-body">
              <h5 class="card-title">${
                state.search.type === "movie" ? result.title : result.name
              }</h5>
              <p class="card-text">
                <small class="text-muted">${
                  state.search.type === "movie" ? "Release" : "Air Date"
                }: ${
      state.search.type === "movie"
        ? result.release_date
        : result.first_air_date
    }</small>
              </p>
            </div>
            `;
    div = addInnerHtml(div, text);

    if (state.search.page === state.search.totalPages) {
      document.querySelector("#search-results-heading").innerHTML = `
          <h2>${state.search.totalResults} of ${state.search.totalResults} Reuslts for ${state.search.term}</h2>
          `;
    } else {
      document.querySelector("#search-results-heading").innerHTML = `
          <h2>${state.search.page * results.length} of ${
        state.search.totalResults
      } Reuslts for ${state.search.term}</h2>
          `;
    }

    appendElement(document.querySelector("#search-results"), div);
  });

  displayPagination();
}

// Display Movie Slider

function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

async function displaySlider(endpoint) {
  const { results } = await fetchData(
    `${
      endpoint === "movie" ? `${endpoint}/now_playing` : `${endpoint}/top_rated`
    }`
  );

  results.forEach((result) => {
    let div = createElementWithClasses("div", "swiper-slide");
    div.innerHTML = addInnerHtml(`
          <a href="${endpoint}-details.html?id=${result.id}">
          ${
            result.poster_path
              ? `
                  <img src="https://image.tmdb.org/t/p/w500${
                    result.poster_path
                  }" class="card-img-top" alt="${
                  endpoint === "movie" ? result.title : result.name
                }"/>`
              : `<img src="images/no-image.jpg" class="card-img-top" alt="${
                  endpoint === "movie" ? result.title : result.name
                }"/>`
          }
        </a>
        <h4 class="swiper-rating">
          <i class="fas fa-star text-secondary"></i> $${result.vote_average.toFixed(
            1
          )} / 10
        </h4>
          `);
    appendElement(document.querySelector(".swiper-wrapper"), div);
  });

  initSwiper();
}

// Other Functions

function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  if (type === "movie") {
    document.querySelector("#movie-details").appendChild(overlayDiv);
  } else {
    document.querySelector("#tv-details").appendChild(overlayDiv);
  }
}

function displayPagination() {
  let div = createElementWithClasses("div", "pagination");
  div.innerHTML = addInnerHtml(`
      <button class="btn btn-primary" id="prev">Prev</button>
      <button class="btn btn-primary" id="next">Next</button>
      <div class="page-counter">Page ${state.search.page} of ${state.search.totalPages}</div>
      `);
  document.querySelector("#pagination").appendChild(div);

  if (state.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }

  if (state.search.page === state.search.totalPages) {
    document.querySelector("#next").disabled = true;
  }

  document.querySelector("#next").addEventListener("click", async () => {
    state.search.page++;
    const { results } = await searchData();
    displaySearchResults(results);
  });

  document.querySelector("#prev").addEventListener("click", async () => {
    state.search.page--;
    const { results } = await searchData();
    displaySearchResults(results);
  });
}

function showAlert(message, className = "error") {
  const alertEl = createElementWithClasses("div", "alert");
  alertEl.classList.add(className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector("#alert").appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000);
}

// Highlight active link

function highlightActiveLink() {
  let links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    if (link.getAttribute("href") === state.currentPage) {
      link.classList.add("active");
    }
  });
}

// Init

function init() {
  switch (state.currentPage) {
    case "/":
    case "/index.html":
      displaySlider("movie");
      displayPopular("movie");
      break;
    case "/shows.html":
      displaySlider("tv");
      displayPopular("tv");
      break;
    case "/movie-details.html":
      displayDetails("movie");
      break;
    case "/tv-details.html":
      displayDetails("tv");
      break;
    case "/search.html":
      search();
      break;
  }

  highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
