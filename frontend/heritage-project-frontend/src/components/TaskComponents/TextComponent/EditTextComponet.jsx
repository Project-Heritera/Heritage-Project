import React, {useState} from 'react';
import Markdown from "../../Utilities/Markdown"
import Toolbar from "./MarkdownToolbar"
import MarkdownButton from "./MarkdownButton"
import MarkdownArea from "./MarkdownArea"

const EditTextComponent = ({text}) => {

    const [content, setContent] = useState(text)

    //Handle update event
    const updateContent = (event) => {
        setContent(event.target.value);
    }
    
    //Toolbar Functions
    const italacize = () => {
        console.log("You did an italazize!");
    };

    const bulletpoint = () => {
        console.log("You did a bulletpoint!");
    };

    return (
        <div>
            {/*Display tool bar at top*/}
            <Toolbar>
                <MarkdownButton onClick={italacize}>
                    italacize
                </MarkdownButton>

                <MarkdownButton onClick={bulletpoint}>
                    bulletpoint
                </MarkdownButton>
            </Toolbar>
            {/*Display text that can be easily editable and be able to select where to edit with cursor*/}
            <MarkdownArea initText={text} />
        </div>
    );
};

export default EditTextComponent;