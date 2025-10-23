import React from 'react';
import Markdown from "../../Utilities/Markdown"

//The read version of the text componet.
const ReadTextComponent = ({text}) => {
    return (
        <div>
            <Markdown content={text}/>
        </div>
    );
};

export default ReadTextComponent;