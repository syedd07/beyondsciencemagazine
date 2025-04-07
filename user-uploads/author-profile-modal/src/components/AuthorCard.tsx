import React, { useState } from 'react';
import AuthorModal from './AuthorModal';

const AuthorCard = ({ author }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleMouseEnter = () => {
        setModalOpen(true);
    };

    const handleMouseLeave = () => {
        setModalOpen(false);
    };

    const handleClick = () => {
        setModalOpen(true);
    };

    return (
        <div>
            <span 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
                onClick={handleClick} 
                className="author-name"
            >
                {author.firstName} {author.lastName}
            </span>
            {isModalOpen && (
                <AuthorModal 
                    author={author} 
                    onClose={() => setModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default AuthorCard;