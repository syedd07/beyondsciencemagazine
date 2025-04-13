(function() {
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

// Extract articleID from URL
const urlParams = new URLSearchParams(window.location.search);
const articleID = urlParams.get("articleID");

// DOM Elements
const articleTitle = document.getElementById("article-title");
const articleImage = document.getElementById("article-image");
const articleContent = document.getElementById("article-content");
const authorDetails = document.getElementById("author-details");

//  helper function for getting user likes from localStorage
function getUserLikes() {
  const likes = localStorage.getItem("userLikes");
  return likes ? JSON.parse(likes) : {};
}
// helper function to get user views from localStorage
function getUserViews() {
  const views = localStorage.getItem("userViews");
  return views ? JSON.parse(views) : {};
}

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
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

// Fetch and Render Article
async function fetchArticle() {
 // console.log("Fetching article...");
 // console.log("Article ID:", articleID);

  if (!articleID) {
   // console.error("No article ID found in URL");
    articleTitle.textContent = "Error: No Article Found";
    articleContent.textContent = "The requested article does not exist.";
    return;
  }

  try {
   // console.log("Attempting to fetch article with ID:", articleID);

    // 1. Fetch the existing document
    const article = await databases.getDocument(
      databaseId,
      collectionId,
      articleID
    );
   // console.log("Successfully fetched article:", article);

    // 2. Check if user has viewed this article within the last 24 hours
    const userViews = getUserViews();
    const lastViewTime = userViews[articleID] || 0;
    const viewExpired = Date.now() - lastViewTime > 24 * 60 * 60 * 1000; // 24 hours

    // Only increment views if this is a new view or the previous view has expired
    if (!lastViewTime || viewExpired) {
      // Store this view with timestamp
      userViews[articleID] = Date.now();
      localStorage.setItem("userViews", JSON.stringify(userViews));

      // Increment view in database
      const updatedViews = (article.views || 0) + 1;
      await databases.updateDocument(databaseId, collectionId, articleID, {
        views: updatedViews,
        likes: article.likes ?? 0,
        isEmailVerified: article.isEmailVerified,
      });
    }

    // 3. Re-fetch updated document after potential view update
    const updatedArticle = await databases.getDocument(
      databaseId,
      collectionId,
      articleID
    );

    // 4. Update UI with new views
    const viewsSpan = document.getElementById("article-views");
    if (viewsSpan) {
      viewsSpan.textContent = `Views: ${updatedArticle.views || 0}`;
    }

    // Use the articleTitle attribute for the title
    articleTitle.textContent =
      updatedArticle.articleTitle || "Untitled Article";

    // Populate the article image
    articleImage.src = updatedArticle.image_id
      ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${updatedArticle.image_id}/view?project=67efa9d90005502fbfa9`
      : "/articles/images/default-thumbnail.jpg";

    // Populate the article content
    articleContent.innerHTML = updatedArticle.story || "No content available.";

    // Update the page title
    document.title = `${updatedArticle.articleTitle || "Untitled Article"} - BEYOND SC!ENCE Magazine`;

    // Populate the author details section
    const socialLinks = `
      ${
        updatedArticle.linkedIn
          ? `<a href="${updatedArticle.linkedIn}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>`
          : ""
      }
      ${
        updatedArticle.instagram
          ? `<a href="${updatedArticle.instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>`
          : ""
      }
      ${
        updatedArticle.twitter
          ? `<a href="${updatedArticle.twitter}" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>`
          : ""
      }
    `;

    // Handle "Like" button
    $(function () {
      // Check if user already liked this article
      const userLikes = getUserLikes();
      const hasLiked = userLikes[articleID] === true;

      // Set initial UI state
      if (hasLiked) {
        $("#like-button").addClass("is-active");
      }

      $("#like-button").on("click", async function () {
        if (!articleID) return;

        // Toggle like status in localStorage
        const userLikes = getUserLikes();
        const isNowLiked = !userLikes[articleID];
        userLikes[articleID] = isNowLiked;
        localStorage.setItem("userLikes", JSON.stringify(userLikes));

        // Toggle UI feedback
        $(this).toggleClass("is-active");

        try {
          // Fetch current document
          const doc = await databases.getDocument(
            databaseId,
            collectionId,
            articleID
          );

          // Increment or decrement likes based on action
          const updatedLikes = isNowLiked
            ? (doc.likes || 0) + 1 // like
            : Math.max(0, (doc.likes || 0) - 1); // unlike (prevent negative)

          // Update the document with required fields
          await databases.updateDocument(databaseId, collectionId, articleID, {
            likes: updatedLikes,
            isEmailVerified: doc.isEmailVerified,
          });

          // Update displayed like count
          $("#like-count").text(updatedLikes);
        } catch (err) {
          console.error("Failed to update likes:", err);
          // Revert local storage on error
          userLikes[articleID] = !isNowLiked;
          localStorage.setItem("userLikes", JSON.stringify(userLikes));
        }
      });
    });

    const tags = (updatedArticle.researchFields || [])
      .map((tag) => `<span class="tag">${tag}</span>`)
      .join(" ");

    const createdTime = timeAgo(updatedArticle.$createdAt);

    authorDetails.innerHTML = `
    <div class="author-info">
      <i class="fas fa-user-circle fa-2x"></i>
      <span>${updatedArticle.firstName} ${updatedArticle.lastName}</span>
      ${
        updatedArticle.isEmailVerified
          ? `<i class="fas fa-check-circle tooltip-badge" style="color: #1DA1F2; margin-left: 2px; font-size: 1.2em; position: relative; cursor: help;">
           <span class="custom-tooltip">Author's email is verified!</span>
         </i>`
          : ""
      }
    </div>
    <br>
    <div class="created-time" style="margin-bottom: 0px;">
      <strong>Published:</strong> ${createdTime}
    </div>
    <div style="margin-right: 20px; margin-top: 10px">
    <i class="fa fa-eye"></i> Views: ${updatedArticle.views || "Unable to fetch"}
    </div>
      <div style="display: flex;  position: relative; margin-left: 0;">
        <div class="heart" id="like-button" style="margin-left: -40px; margin-top: -20px padding: 0;"></div>
        <span id="like-count" style="position: absolute; left: 28px; top: 39px; font-weight: bold; font-size: 1em; text-decoration: underline;">${updatedArticle.likes || "0"}</span>
      </div>
    
  `;
    const style = document.createElement("style");
    style.textContent = `
  .tooltip-badge {
    position: relative;
  }
  
  .custom-tooltip {
    visibility: hidden;
    background-color: #555;
    color: white;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    white-space: nowrap;
    font-size: 0.8em;
    font-weight: normal;
  }
  
  .custom-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
  
  .tooltip-badge:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
  }
  `;
    document.head.appendChild(style);
    // Load comments after article is loaded
    const commentPlaceholder = document.getElementById(
      "comment-box-placeholder"
    );
    if (commentPlaceholder) {
      fetch("/comment-box.html")
        .then((res) => res.text())
        .then((html) => {
          commentPlaceholder.innerHTML = html;

          // Load comment script dynamically
          const commentScript = document.createElement("script");
          commentScript.src = "/assets/js/comment.js";
          document.body.appendChild(commentScript);
        })
        .catch((err) => {
          console.error("Failed to load comments:", err);
        });
    } else {
      console.warn("Comment box placeholder not found");
    }
  } catch (error) {
    console.log("Article ID:", articleID);
    console.error("Error fetching article:", error);
    articleTitle.textContent = "Error: Article Not Found";
    articleContent.textContent = "The requested article could not be found.";
  }
}

// Fetch the article on page load
fetchArticle();
})();