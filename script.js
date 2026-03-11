const API_KEY = "81ecff04b27a4d49ae89db5884c960d8";
const url = "https://newsapi.org/v2/everything?q=";

// --- Dark Mode Logic ---
const themeBtn = document.getElementById("theme-btn");
const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
}
themeBtn.addEventListener("click", () => {
    let mode = document.body.getAttribute("data-theme");
    if (mode === "dark") {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
    } else {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    }
});
// -----------------------

// --- Scroll to Top Logic ---
const scrollToTopBtn = document.getElementById("scroll-to-top");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
});
scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
// ---------------------------
window.addEventListener("load", () => {
    const cached = localStorage.getItem("India");
    if (cached) {
        bindData(JSON.parse(cached));
    } else {
        fetchNews("India");
    }
});

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    const cardsContainer = document.getElementById("cards-container");
    // check cache first
    const cachedData = localStorage.getItem(query);
    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            if (parsedData && parsedData.length > 0) {
                bindData(parsedData);
                return;
            }
        } catch (e) {
            console.error("Cache parsing error", e);
        }
    }

    // Render skeleton loaders before fetching
    const skeletonTemplate = document.getElementById("template-skeleton-card");
    cardsContainer.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const skeletonClone = skeletonTemplate.content.cloneNode(true);
        cardsContainer.appendChild(skeletonClone);
    }

    try {
        const res = await fetch(`${url}${encodeURIComponent(query)}&apiKey=${API_KEY}`);
        const data = await res.json();

        if (data.status === "error") {
            console.error("NewsAPI Error:", data.message);
            cardsContainer.innerHTML = `
                <div style="text-align:center;margin-top:50px">
                    <h2>⚠ Daily API Limit Reached</h2>
                    <p>Please try again tomorrow.</p>
                </div>`;
            return;
        }
        if (!data.articles || data.articles.length === 0) {
            cardsContainer.innerHTML = `
                <h3 style="text-align:center;margin-top:50px">
                No articles found.
                </h3>`;
            return;
        }
        // Sort the articles by published date (Descending - newest first)
        data.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        // save to cache
        localStorage.setItem(query, JSON.stringify(data.articles));
        bindData(data.articles);
    } catch (error) {
        console.error("Fetch Error:", error);
        cardsContainer.innerHTML = `
            <h3 style="color:red;text-align:center;margin-top:50px">
            Error fetching news. Please check console.
            </h3>`;
    }
}
function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

// Allow hitting ENTER to search
searchText.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        const query = searchText.value;
        if (!query) return;
        fetchNews(query);
        curSelectedNav?.classList.remove("active");
        curSelectedNav = null;
    }
});
