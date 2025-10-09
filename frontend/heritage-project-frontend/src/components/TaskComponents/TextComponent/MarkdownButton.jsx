import React from 'react';
import Markdown from "../../Utilities/Markdown"

const MarkdownButton = ({onClick, children}) => {
    return (
        <button onClick={onClick}>
            {children}
        </button>
    );
};

export default MarkdownButton;