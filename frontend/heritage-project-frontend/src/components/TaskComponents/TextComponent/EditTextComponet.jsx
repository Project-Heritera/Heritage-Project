import React, {useState} from 'react';
import Markdown from "../../Utilities/Markdown"
import Toolbar from "./MarkdownToolbar"
import MarkdownButton from "./MarkdownButton"
import MarkdownArea from "./MarkdownArea"

const EditTextComponent = ({text}) => {
    const [areaApi, setAreaApi] = useState(null);

    //Handle toggle for render
    const [isRenderd, setIsRenderd] = useState(true);

    const toggleRender = () => {
        setIsRenderd(!isRenderd);
    }
    
    //Toolbar Functions

    return (
        <div>
            {/*Display tool bar at top*/}
            <Toolbar>
                <MarkdownButton onClick={() => areaApi?.italacize()}>
                    italacize
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.bulletpoint()}>
                    bulletpoint
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.bold()}>
                    bold
                </MarkdownButton>

                <MarkdownButton onClick={toggleRender}>
                    toggle render
                </MarkdownButton>

            </Toolbar>
            {/*Display text that can be easily editable and be able to select where to edit with cursor*/}
            <MarkdownArea initText={text} isRenderd={isRenderd} setAreaApi={setAreaApi} />
        </div>
    );
};

export default EditTextComponent;