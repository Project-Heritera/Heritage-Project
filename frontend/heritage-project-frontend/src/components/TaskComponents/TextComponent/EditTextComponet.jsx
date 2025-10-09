import React, {useState} from 'react';
import Markdown from "../../Utilities/Markdown"
import Toolbar from "./MarkdownToolbar"
import MarkdownButton from "./MarkdownButton"
import MarkdownArea from "./MarkdownArea"

const EditTextComponent = ({text}) => {

    //Handle toggle for render
    const [isRenderd, setIsRenderd] = useState(true);

    const toggleRender = () => {
        setIsRenderd(!isRenderd);
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

                <MarkdownButton onClick={toggleRender}>
                    toggle render
                </MarkdownButton>

            </Toolbar>
            {/*Display text that can be easily editable and be able to select where to edit with cursor*/}
            <MarkdownArea initText={text} isRenderd={isRenderd} />
        </div>
    );
};

export default EditTextComponent;