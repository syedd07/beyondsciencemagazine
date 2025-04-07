import React from 'react';
import './modal.css';

interface AuthorModalProps {
    author: {
        firstName: string;
        lastName: string;
        bio: string;
        linkedIn?: string;
        instagram?: string;
        twitter?: string;
    };
    isVisible: boolean;
    onClose: () => void;
}

const AuthorModal: React.FC<AuthorModalProps> = ({ author, isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>X</button>
                <h2>{author.firstName} {author.lastName}</h2>
                <p>{author.bio}</p>
                <div className="social-links">
                    {author.linkedIn && <a href={author.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                    {author.instagram && <a href={author.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                    {author.twitter && <a href={author.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
                </div>
            </div>
        </div>
    );
};

export default AuthorModal;