import React from 'react';
import Markdown from "../Utilities/Markdown"

const TextComponent = ({text}) => {
    return (
        <div>
            <Markdown content={text}/>
        </div>
    );
};

export default TextComponent;