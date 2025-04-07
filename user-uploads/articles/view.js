const { Client, Databases } = Appwrite;

// Initialize Appwrite Client
const client = new Appwrite.Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67efa9d90005502fbfa9');

const databases = new Appwrite.Databases(client);
const databaseId = '67efbe710015ee79508f';
const collectionId = '67f16ece002b3f15acb3';
const BUCKET_ID = '67f1709500236aedbcce';

// Extract articleID from URL
const urlParams = new URLSearchParams(window.location.search);
const articleID = urlParams.get('articleID'); 


// DOM Elements
const articleTitle = document.getElementById('article-title');
const articleImage = document.getElementById('article-image');
const articleContent = document.getElementById('article-content');
const authorDetails = document.getElementById('author-details');

// Helper function to format time as "1d ago", "1hr ago", etc.
function timeAgo(date) {
    const now = new Date();
    const createdDate = new Date(date);
    const seconds = Math.floor((now - createdDate) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const [unit, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count > 0) {
            return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}


// Fetch and Render Article
async function fetchArticle() {
    console.log('Fetching article...');
    console.log('Article ID:', articleID);
    
    if (!articleID) {
        articleTitle.textContent = 'Error: No Article Found';
        articleContent.textContent = 'The requested article does not exist.';
        return;
    }

    try {
        // Fetch the article from Appwrite
        const article = await databases.getDocument(databaseId, collectionId, articleID);
        console.log('Fetched Article:', article);

        // Use the articleTitle attribute for the title
        articleTitle.textContent = article.articleTitle || 'Untitled Article';

        // Populate the article image
        articleImage.src = article.image_id
            ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${article.image_id}/view?project=67efa9d90005502fbfa9`
            : '/articles/images/default-thumbnail.jpg';

        // Populate the article content
        articleContent.innerHTML = article.story || 'No content available.';

        // Update the page title
        document.title = `${article.articleTitle || 'Untitled Article'} - BEYOND SC!ENCE Magazine`;

        // Populate the author details section
        const socialLinks = `
            ${article.linkedIn ? `<a href="${article.linkedIn}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
            ${article.instagram ? `<a href="${article.instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
            ${article.twitter ? `<a href="${article.twitter}" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>` : ''}
        `;

        const tags = article.researchFields.map(tag => `<span class="tag">${tag}</span>`).join(' ');

        const createdTime = timeAgo(article.$createdAt);

        authorDetails.innerHTML = `
            <div class="author-info">
                <i class="fas fa-user-circle fa-2x"></i>
                <span>${article.firstName} ${article.lastName}</span>
            </div>           
            <br>
            <div class="created-time">
                <strong>Published:</strong> ${createdTime}
            </div>
        `;
    } catch (error) {
        console.log('Article ID:', articleID);
        console.error('Error fetching article:', error);
        articleTitle.textContent = 'Error: Article Not Found';
        articleContent.textContent = 'The requested article could not be found.';
    }

}

// Call the function to fetch and render the article
fetchArticle();