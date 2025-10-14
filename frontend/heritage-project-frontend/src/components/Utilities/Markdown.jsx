import React from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';

//This componet is simply used to render read only markdown
const Markdown = ({content}) => {
    
    return (
        <ReactMarkdown>{content}</ReactMarkdown>
    );
};

export default Markdown;