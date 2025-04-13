const { Client, Databases } = Appwrite;

// Initialize Appwrite Client
const client = new Appwrite.Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67efa9d90005502fbfa9');

const databases = new Appwrite.Databases(client);
const databaseId = '67efbe710015ee79508f';
const collectionId = '67f16ece002b3f15acb3';
const BUCKET_ID = '67f1709500236aedbcce';

// DOM Elements
const articlesGrid = document.getElementById('articles-grid');
const sortSelect = document.getElementById('sort-select');

// Articles cache to avoid multiple fetches
let articlesCache = [];


// Update icon when dropdown selection changes
function setupSortIconUpdater() {
  const sortSelect = document.getElementById('sort-select');
  const sortIcon = document.getElementById('sort-icon');
  
  if (!sortSelect || !sortIcon) return;
  
  // Icon mapping
  const iconMap = {
      'trending': 'fa-fire',
      'newest': 'fa-clock',
      'oldest': 'fa-history',
      'most-viewed': 'fa-eye',
      'most-liked': 'fa-heart', 
      'alphabetical': 'fa-sort-alpha-down'
  };
  
  // Set initial icon
  sortIcon.className = 'fas ' + iconMap[sortSelect.value];
  
  // Update icon when selection changes
  sortSelect.addEventListener('change', function() {
      sortIcon.className = 'fas ' + iconMap[this.value];
  });
}

// Call this function at the end of your script
setupSortIconUpdater();

// Sort functions for different criteria
const sortFunctions = {
  'newest': (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt),
  'oldest': (a, b) => new Date(a.$createdAt) - new Date(b.$createdAt),
  'most-viewed': (a, b) => (b.views || 0) - (a.views || 0),
  'most-liked': (a, b) => (b.likes || 0) - (a.likes || 0),
  'alphabetical': (a, b) => a.firstName.localeCompare(b.firstName)
};



// Render articles in the grid
function renderArticles(articles) {
  // Clear existing articles
  articlesGrid.innerHTML = '';
  
  if (articles.length === 0) {
    articlesGrid.innerHTML = '<p>No articles available at the moment.</p>';
    return;
  }
  
  // Render articles in the grid
  articles.forEach((article) => {
    const imageUrl = article.image_id
      ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${article.image_id}/view?project=67efa9d90005502fbfa9`
      : '/articles/images/default-thumbnail.jpg';

    const articleCard = document.createElement('article');
    const timeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
      return Math.floor(seconds) + " seconds ago";
    };

    articleCard.innerHTML = `
      <a href="/user-uploads/articles/view.html?articleID=${article.$id}" class="image">
        <div style="position: relative; width: 100%; height: 250px; border-radius: 8px; overflow: hidden; display: flex; justify-content: center; align-items: center;">
          <img src="${imageUrl}" alt="${article.firstName} ${article.lastName}">
        </div>
      </a>
      <h3>${article.firstName} ${article.lastName}</h3>
      <p>${article.shortBio || 'No description available.'}</p>
      
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
}

// Fetch and sort articles
async function fetchArticles() {
  try {
    // Fetch all documents from the collection
    const response = await databases.listDocuments(databaseId, collectionId);
    
    // Store in cache for future sorting
    articlesCache = response.documents;
    
    // Sort by default criteria (newest first)
    const sortCriteria = sortSelect ? sortSelect.value : 'newest';
    const sortedArticles = [...articlesCache].sort(sortFunctions[sortCriteria]);
    
    // Render sorted articles
    renderArticles(sortedArticles);
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    articlesGrid.innerHTML = '<p>Error loading articles. Please try again later.</p>';
  }
}

// Add event listener for the sort dropdown
if (sortSelect) {
  sortSelect.addEventListener('change', function() {
    const sortCriteria = this.value;
    const sortedArticles = [...articlesCache].sort(sortFunctions[sortCriteria]);
    renderArticles(sortedArticles);
  });
}

// Call the function to fetch and render articles
fetchArticles();