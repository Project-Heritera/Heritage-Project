import React from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import remarkGfm from 'remark-gfm';       
import remarkBreaks from 'remark-breaks';

//This componet is simply used to render read only markdown
const Markdown = ({content}) => {
    
    return (
        <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
        </div>
    );
};

export default Markdown;