import axios from 'axios';

const API_URL = 'https://api.example.com/authors'; // Replace with your actual API endpoint

export const fetchAuthorData = async (authorId) => {
    try {
        const response = await axios.get(`${API_URL}/${authorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching author data:', error);
        throw error;
    }
};

export const fetchAllAuthors = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching authors:', error);
        throw error;
    }
};