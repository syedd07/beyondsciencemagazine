const { Client, Databases } = Appwrite;

// Initialize Appwrite Client
const client = new Appwrite.Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67efa9d90005502fbfa9");

const databases = new Appwrite.Databases(client);
const databaseId = "67efbe710015ee79508f";
const collectionId = "67f16ece002b3f15acb3";
const BUCKET_ID = "67f1709500236aedbcce";

// DOM Elements
const articlesGrid = document.getElementById("articles-grid");
const sortSelect = document.getElementById("sort-select");
const paginationContainer = document.getElementById("pagination-container");
// Get the pagination list element
const paginationList = document.querySelector("#pagination-container ul");
console.log("Pagination container found:", !!paginationContainer);

// Articles cache to avoid multiple fetches
let articlesCache = [];

// Pagination settings
const ITEMS_PER_PAGE = 6; // 2x3 grid
let currentPage = 1;
let totalPages = 1;

// Update icon when dropdown selection changes
function setupSortIconUpdater() {
  const sortSelect = document.getElementById("sort-select");
  const sortIcon = document.getElementById("sort-icon");

  if (!sortSelect || !sortIcon) return;

  // Icon mapping
  const iconMap = {
    trending: "fa-fire",
    newest: "fa-clock",
    oldest: "fa-history",
    "most-viewed": "fa-eye",
    "most-liked": "fa-heart",
    alphabetical: "fa-sort-alpha-down",
  };

  // Set initial icon
  sortIcon.className = "fas " + iconMap[sortSelect.value];

  // Update icon when selection changes
  sortSelect.addEventListener("change", function () {
    sortIcon.className = "fas " + iconMap[this.value];
  });
}

// Call this function at the end of your script
setupSortIconUpdater();

// Sort functions for different criteria
const sortFunctions = {
  newest: (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt),
  oldest: (a, b) => new Date(a.$createdAt) - new Date(b.$createdAt),
  "most-viewed": (a, b) => (b.views || 0) - (a.views || 0),
  "most-liked": (a, b) => (b.likes || 0) - (a.likes || 0),
  alphabetical: (a, b) => a.firstName.localeCompare(b.firstName),
  trending: (a, b) => {
    // Simple trending algorithm: 2x views + 3x likes within last 24 hours
    const aScore = (a.views || 0) * 2 + (a.likes || 0) * 3;
    const bScore = (b.views || 0) * 2 + (b.likes || 0) * 3;
    return bScore - aScore;
  },
};

// Helper function for timeAgo
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1)
    return interval + " year" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1)
    return interval + " month" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1)
    return interval + " day" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1)
    return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1)
    return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
  return Math.floor(seconds) + " seconds ago";
}

// Render articles in the grid for the current page
function renderArticles(articles) {
  // Calculate pagination
  totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

  // Get current page articles
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, articles.length);
  const currentPageArticles = articles.slice(startIndex, endIndex);

  // Clear existing articles
  articlesGrid.innerHTML = "";

  if (articles.length === 0) {
    articlesGrid.innerHTML = "<p>No articles available at the moment.</p>";
    paginationContainer.style.display = "none";
    return;
  } else {
    paginationContainer.style.display = "block";
  }

  // Render articles in the grid
  currentPageArticles.forEach((article) => {
    const imageUrl = article.image_id
      ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${article.image_id}/view?project=67efa9d90005502fbfa9`
      : "/articles/images/default-thumbnail.jpg";

    const articleCard = document.createElement("article");

    articleCard.innerHTML = `
      <a href="/user-uploads/articles/view.html?articleID=${article.$id}" class="image">
        <div style="position: relative; width: 100%; height: 250px; border-radius: 8px; overflow: hidden; display: flex; justify-content: center; align-items: center;">
          <img src="${imageUrl}" alt="${article.firstName} ${article.lastName}">
        </div>
      </a>
      <h3>${article.firstName} ${article.lastName}</h3>
      <p>${article.shortBio || "No description available."}</p>
      
      <div class="article-metrics" style="margin-top: 10px; font-size: 14px; color: #666; gap: 8px; display: flex;">
        <span><i class="fa fa-calendar"></i>  ${timeAgo(new Date(article.$createdAt))}</span>
        <span><i class="fa fa-heart"></i>  ${article.likes || 0}</span>
        <span><i class="fa fa-eye"></i>  ${article.views || 0}</span>
        <br >
      </div>
      
      <ul class="actions" style="margin-top: 10px;">
        <li><a href="/user-uploads/articles/view.html?articleID=${article.$id}" class="button">Continue Reading</a></li>
      </ul>
    `;
    articlesGrid.appendChild(articleCard);
  });

  // Render pagination controls
  renderPagination(articles.length);
}

// Function to render pagination controls
function renderPagination(totalItems) {
  console.log("Rendering pagination. Total pages:", totalPages);

  const paginationList = document.querySelector(
    "#pagination-container ul.pagination"
  );
  if (!paginationList) {
    console.error("Pagination list element not found");
    return;
  }

  // Clear existing pagination
  paginationList.innerHTML = "";

  // Always show pagination container
  if (paginationContainer) {
    paginationContainer.style.display = "block";
  }

  // Don't create pagination elements if there's only one page
  if (totalPages <= 1) {
    console.log("Only one page, not showing pagination numbers");
    paginationList.innerHTML = "<li><span>Page 1 of 1</span></li>";
    return;
  }

  // Previous button
  const prevLi = document.createElement("li");
  if (currentPage === 1) {
    prevLi.innerHTML = '<span class="button disabled">Prev</span>';
  } else {
    prevLi.innerHTML =
      '<a href="#" class="button page-nav" data-page="prev">Prev</a>';
  }
  paginationList.appendChild(prevLi);

  // Page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  // Adjust if we're near the end
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li");
    if (i === currentPage) {
      pageLi.innerHTML = `<span class="page active">${i}</span>`;
    } else {
      pageLi.innerHTML = `<a href="#" class="page page-nav" data-page="${i}">${i}</a>`;
    }
    paginationList.appendChild(pageLi);
  }

  // Next button
  const nextLi = document.createElement("li");
  if (currentPage === totalPages) {
    nextLi.innerHTML = '<span class="button disabled">Next</span>';
  } else {
    nextLi.innerHTML =
      '<a href="#" class="button page-nav" data-page="next">Next</a>';
  }
  paginationList.appendChild(nextLi);

  // Add event listeners to page navigation
  document.querySelectorAll(".page-nav").forEach((navItem) => {
    navItem.addEventListener("click", function (e) {
      e.preventDefault();
      const pageAction = this.getAttribute("data-page");

      if (pageAction === "prev") {
        if (currentPage > 1) currentPage--;
      } else if (pageAction === "next") {
        if (currentPage < totalPages) currentPage++;
      } else {
        currentPage = parseInt(pageAction);
      }

      // Re-sort and render with new page
      const sortCriteria = sortSelect ? sortSelect.value : "newest";
      const sortedArticles = [...articlesCache].sort(
        sortFunctions[sortCriteria]
      );
      renderArticles(sortedArticles);

      // Scroll to top of articles section
      document.querySelector(".major").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Fetch and sort articles
async function fetchArticles() {
  try {
    // Show loading state
    articlesGrid.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Loading articles...</div>
      </div>
    `;

    // Fetch all documents from the collection
    const response = await databases.listDocuments(databaseId, collectionId);

    // Store in cache for future sorting
    articlesCache = response.documents;

    // Sort by default criteria (newest first)
    const sortCriteria = sortSelect ? sortSelect.value : "newest";
    const sortedArticles = [...articlesCache].sort(sortFunctions[sortCriteria]);

    // Render sorted articles with pagination
    renderArticles(sortedArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    articlesGrid.innerHTML = `
      <div class="error-message" style="text-align: center; padding: 30px;">
        <i class="fas fa-exclamation-circle" style="color: #f56a6a; font-size: 2em; margin-bottom: 15px;"></i>
        <p>Error loading articles. Please try again later.</p>
        <button onclick="fetchArticles()" class="button">Try Again</button>
      </div>
    `;
    paginationContainer.style.display = "none";
  }
}

// Add event listener for the sort dropdown
if (sortSelect) {
  sortSelect.addEventListener("change", function () {
    const sortCriteria = this.value;

    // Show spinner during sort
    articlesGrid.innerHTML = `
  <div class="loading-spinner">
    <div class="spinner"></div>
    <div class="loading-text">Sorting articles...</div>
  </div>
`;

    // Reset to first page when sorting changes
    currentPage = 1;

    // Add small timeout to ensure spinner is visible (sorting might be too fast)
    setTimeout(() => {
      // Sort and render
      const sortedArticles = [...articlesCache].sort(
        sortFunctions[sortCriteria]
      );
      renderArticles(sortedArticles);
    }, 300);
  });
}

    // Similarly for pagination navigation
document.querySelectorAll('.page-nav').forEach(navItem => {
  navItem.addEventListener('click', function(e) {
    // Show loading state
    articlesGrid.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Loading page...</div>
      </div>
    `;

    // Sort and render
    const sortedArticles = [...articlesCache].sort(sortFunctions[sortCriteria]);
    renderArticles(sortedArticles);
  });
});


// Call the function to fetch and render articles
fetchArticles();
