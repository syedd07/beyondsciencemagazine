import React, { useState } from 'react';
import AuthorCard from './components/AuthorCard';
import AuthorModal from './components/AuthorModal';

const App = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    const authors = [
        { id: 1, firstName: 'Brooke', lastName: 'Travis', bio: 'Deep-sea biologist and Harvard PhD candidate.', linkedIn: 'https://linkedin.com/in/brooketravis', instagram: 'https://instagram.com/brooketravis' },
        // Add more authors as needed
    ];

    const handleAuthorClick = (author) => {
        setSelectedAuthor(author);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedAuthor(null);
    };

    return (
        <div>
            <h1>Authors</h1>
            {authors.map(author => (
                <AuthorCard 
                    key={author.id} 
                    author={author} 
                    onClick={() => handleAuthorClick(author)} 
                />
            ))}
            {isModalOpen && selectedAuthor && (
                <AuthorModal 
                    author={selectedAuthor} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
};

export default App;