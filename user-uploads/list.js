const { Client, Databases } = Appwrite;

// Initialize Appwrite Client
const client = new Appwrite.Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67efa9d90005502fbfa9');

const databases = new Appwrite.Databases(client);
const databaseId = '67efbe710015ee79508f';
const collectionId = '67f16ece002b3f15acb3';
const BUCKET_ID = '67f1709500236aedbcce';

// DOM Element
const articlesGrid = document.getElementById('articles-grid');

// Fetch and Render Articles
async function fetchArticles() {
    try {
      // Fetch all documents from the collection
      const response = await databases.listDocuments(databaseId, collectionId);
  
      // Check if there are articles
      if (response.documents.length === 0) {
        articlesGrid.innerHTML = '<p>No articles available at the moment.</p>';
        return;
      }
  
      // Render articles in the grid
      response.documents.forEach((article) => {
        const imageUrl = article.image_id
          ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${article.image_id}/view?project=67efa9d90005502fbfa9`
          : '/articles/images/default-thumbnail.jpg';
  
        const articleCard = document.createElement('article');
        articleCard.innerHTML = `
          <a href="/user-uploads/articles/view.html?articleID=${article.$id}" class="image">
          <img src="${imageUrl}" alt="${article.firstName} ${article.lastName}">
          </a>
          <h3>${article.firstName} ${article.lastName}</h3>
          <p>${article.shortBio || 'No description available.'}</p>
          <ul class="actions">
            <li><a href="/user-uploads/articles/view.html?articleID=${article.$id}" class="button">Continue Reading</a></li>
          </ul>
        `;
        articlesGrid.appendChild(articleCard);
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      articlesGrid.innerHTML = '<p>Error loading articles. Please try again later.</p>';
    }
  }
  
  // Call the function to fetch and render articles
  fetchArticles();