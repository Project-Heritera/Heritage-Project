import React from 'react';
import ReactMarkdown from 'react-markdown';

const Markdown = ({content}) => {
    
    return (
        <div>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default Markdown;