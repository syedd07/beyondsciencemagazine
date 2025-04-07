const { Client, Databases, Storage, ID } = Appwrite;
const BUCKET_ID = '67f1709500236aedbcce';

const client = new Appwrite.Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67efa9d90005502fbfa9');

const databases = new Databases(client);
const storage = new Storage(client);
const databaseId = '67efbe710015ee79508f';
const collectionId = '67f16ece002b3f15acb3';

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('storyForm');
  if (!form) return;

  let profilePicId = '';
  let uploadedImageURL = '';

  const statusDiv = document.getElementById('fileUploadStatus');

  document.getElementById('profilePic').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

    try {
      statusDiv.textContent = 'Uploading...';
      statusDiv.style.color = 'gray';

      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      profilePicId = uploadedFile.$id;

      const filePreview = await storage.getFilePreview(BUCKET_ID, profilePicId);
      uploadedImageURL = filePreview.href;

      statusDiv.textContent = '✅ Profile picture uploaded successfully!';
      statusDiv.style.color = 'green';
    } catch (error) {
      console.error('File upload failed:', error);
      statusDiv.textContent = '❌ Upload failed. Try again.';
      statusDiv.style.color = 'red';
    }
  });

  const previewBtn = document.getElementById('previewBtn');
  const previewContent = document.getElementById('previewContent');
  const previewModal = document.getElementById('previewModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModal = document.getElementById('closeModal');
  const finalSubmit = document.getElementById('finalSubmit');
  const dragHandle = document.querySelector('.modal-drag-handle');

  previewBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('FirstName').value;
    const lastName = document.getElementById('LastName').value || '';
    const email = document.getElementById('Email').value || '';
    const country = document.getElementById('Country').value || '';
    const linkedIn = document.getElementById('linkedIn').value || '';
    const instagram = document.getElementById('Instagram')?.value || '';
    const twitter = document.getElementById('Twitter')?.value || '';
    const university = document.getElementById('University')?.value || '';
    const articleTitle = document.getElementById('Title').value || '';
    const shortBio = document.getElementById('ShortBio').value || '';
    const tags = Array.from(document.querySelectorAll('#tags-wrapper span')).map(tag => tag.textContent).join(', ');
    const storyHTML = quill.root.innerHTML || '';

    previewContent.innerHTML = `
      <div class="modal-drag-indicator"></div>
      <div class="modal-body">
        ${uploadedImageURL ? `<img src="${uploadedImageURL}" class="modal-preview-image" alt="Uploaded Image">` : ''}
        <hr>
        <div class="author-info">
          <i class="fas fa-user-circle fa-2x"></i>
          <p style="margin-left: 8px; margin-bottom: 0;"><strong>Author:</strong> ${firstName} ${lastName}</p>
        </div>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Bio:</strong> ${shortBio}</p>
        <hr>
        <p><strong>Theme:</strong> ${tags}</p>
        <div class="social-links">
          ${linkedIn ? `<a href="${linkedIn}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
          ${instagram ? `<a href="${instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
          ${twitter ? `<a href="${twitter}" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>` : ''}
        </div>
        <br>
        <p><strong>Research Center/University:</strong> ${university}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Article Title:</strong> ${articleTitle}</p>
        <hr>
        <h3>Story:</h3>
        <div class="modal-story-content">${storyHTML}</div>
      </div>
    `;

    previewModal.classList.add('active');
    modalOverlay.classList.add('active');
    document.body.classList.add('modal-open');
  });

  finalSubmit.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const storyHTML = document.querySelector('#editor .ql-editor').innerHTML;

    // Truncate the HTML content to 1200 characters
    if (storyHTML.length > 1200) {
      alert('Your story is too long. Please shorten it to fit within 1200 characters.');
      return;
    }
    
    document.getElementById('StoryContent').value = document.querySelector('#editor .ql-editor').innerHTML;
  
    const requiredFields = ['FirstName', 'Email', 'Country', 'University', 'ShortBio'];
    for (const id of requiredFields) {
      if (!document.getElementById(id).value.trim()) {
        alert('Please fill out all required fields.');
        return;
      }
    }
  
    if (!profilePicId) {
      alert('Please upload a profile picture.');
      return;
    }
  
    const data = {
      firstName: document.getElementById('FirstName').value,
      lastName: document.getElementById('LastName').value,
      email: document.getElementById('Email').value,
      country: document.getElementById('Country').value,
      linkedIn: document.getElementById('linkedIn').value,
      instagram: document.getElementById('Instagram').value,
      twitter: document.getElementById('Twitter').value,
      other: document.getElementById('Other').value,
      shortBio: document.getElementById('ShortBio').value,
      university: document.getElementById('University').value,
      researchFields: Array.from(document.querySelectorAll('#tags-wrapper span')).map(tag => tag.textContent),
      image_id: profilePicId,
      story: document.getElementById('StoryContent').value,
      articleTitle: document.getElementById('Title').value,
    };
  
    try {
      await databases.createDocument(databaseId, collectionId, ID.unique(), data);
  
      // Redirect to the success page
      window.location.href = '/user-uploads/success.html'; // Replace with the actual path to your success page
  
    } catch (error) {
      console.error('Document creation failed:', error);
      alert('Something went wrong while submitting your story.');
    }
  });

  const closePreview = () => {
    previewModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  closeModal.addEventListener('click', closePreview);
  modalOverlay.addEventListener('click', closePreview);
  dragHandle.addEventListener('click', closePreview);

  let isDragging = false;
  let dragStartY = 0;
  let currentTranslateY = 0;

  dragHandle.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragStartY = e.touches[0].clientY;
    previewModal.style.transition = 'none';
  });

  dragHandle.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touchY = e.touches[0].clientY;
    currentTranslateY = touchY - dragStartY;
    if (currentTranslateY > 0) {
      previewModal.style.transform = `translateY(${currentTranslateY}px)`;
    }
  });

  dragHandle.addEventListener('touchend', () => {
    isDragging = false;
    previewModal.style.transition = 'transform 0.3s ease';
    if (currentTranslateY > 100) {
      previewModal.style.transform = 'translateY(100%)';
      setTimeout(closePreview, 300);
    } else {
      previewModal.style.transform = 'translateY(0)';
    }
    currentTranslateY = 0;
  });
});
