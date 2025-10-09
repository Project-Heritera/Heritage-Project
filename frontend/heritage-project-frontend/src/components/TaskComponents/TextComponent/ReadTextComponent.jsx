import React from 'react';
import Markdown from "../../Utilities/Markdown"

const ReadTextComponent = ({text}) => {
    return (
        <div>
            <Markdown content={text}/>
        </div>
    );
};

export default ReadTextComponent;