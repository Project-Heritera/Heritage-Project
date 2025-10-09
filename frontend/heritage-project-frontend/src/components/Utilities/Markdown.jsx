import React from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';

const Markdown = ({content}) => {
    
    return (
        <ReactMarkdown>{content}</ReactMarkdown>
    );
};

export default Markdown;