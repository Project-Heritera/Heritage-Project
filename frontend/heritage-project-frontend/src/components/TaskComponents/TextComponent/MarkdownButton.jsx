import React from 'react';
import Markdown from "../../Utilities/Markdown"
import "../../../styles/Components/TaskComponents/TextComponent.css"

const MarkdownButton = ({onClick, children}) => {
    return (
        <button className="button" onClick={onClick}>
            {children}
        </button>
    );
};

export default MarkdownButton;