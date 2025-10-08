import React from 'react';
import ReactMarkdown from 'react-markdown';

const Markdown = ({content}) => {
    
    return (
        <ReactMarkdown>{content}</ReactMarkdown>
    );
};

export default Markdown;