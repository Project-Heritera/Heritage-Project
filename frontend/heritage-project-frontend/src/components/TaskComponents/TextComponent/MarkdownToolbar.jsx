import React from 'react';
import Markdown from "../../Utilities/Markdown"
import "../../../styles/Components/TaskComponents/TextComponent.css"

const Markdowntoolbar = ({children}) => {
    return (
        <div className="toolbar">
            {children}
        </div>
    );
};

export default Markdowntoolbar;