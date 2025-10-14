import React from 'react';
import Markdown from "../../Utilities/Markdown"
import "../../../styles/Components/TaskComponents/TextComponent.css"

//Handle what the buttons look like for toolbar
const MarkdownButton = ({onClick, children}) => {
    return (
        <button className="button" onClick={onClick}>
            {children}
        </button>
    );
};

export default MarkdownButton;