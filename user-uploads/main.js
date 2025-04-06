const { Client, Databases, Storage, ID } = Appwrite;
const BUCKET_ID = '67f1709500236aedbcce';

const client = new Appwrite.Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67efa9d90005502fbfa9');

const databases = new Databases(client);
const storage = new Storage(client);
const databaseId = '67efbe710015ee79508f';
const collectionId = '67f16ece002b3f15acb3';

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('storyForm');
  
    if (!form) {
    //   console.error('Form with ID "storyForm" not found.');
      return;
    }

    let profilePicId = ''; 

      document.getElementById('profilePic').addEventListener('change', async function () {
        const file = this.files[0];
      
        if (!file) return;
      
        try {
          const statusDiv = document.getElementById('fileUploadStatus');
          statusDiv.textContent = 'Uploading...';
          statusDiv.style.color = 'gray';
      
          const uploadedFile = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
          );
          profilePicId = uploadedFile.$id;
      
          statusDiv.textContent = '✅ Profile picture uploaded successfully!';
          statusDiv.style.color = 'green';
        } catch (error) {
          console.error('File upload failed:', error);
          const statusDiv = document.getElementById('fileUploadStatus');
          statusDiv.textContent = '❌ Upload failed. Try again.';
          statusDiv.style.color = 'red';
        }
      });
  
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
  
    //   console.log('Form submitted');
  
      const fileInput = document.getElementById('profilePic');
      const file = fileInput.files[0];
  
      if (!file) {
        alert('Please select a profile picture.');
        // console.log('No file selected');
        return;
      }
  
      
      

      document.getElementById('StoryContent').value = document.querySelector('#editor .ql-editor').innerHTML;

  
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
        story: document.getElementById('StoryContent').value

      };
  
      try {
        // console.log('Creating document with data:', data);
        await databases.createDocument(databaseId, collectionId, ID.unique(), data);
        alert('Submission successful!');
      } catch (error) {
        // console.error('Document creation failed:', error);
        alert('Something went wrong while submitting your story.');
      }
    });
  });
  