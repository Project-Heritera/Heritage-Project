import React, {useState} from 'react';
import Markdown from "../../Utilities/Markdown"
import Toolbar from "./MarkdownToolbar"
import MarkdownButton from "./MarkdownButton"
import MarkdownArea from "./MarkdownArea"
import "../../../styles/Components/TaskComponents/TextComponent.css"

const EditTextComponent = ({text}) => {
    const [areaApi, setAreaApi] = useState(null);

    //Handle toggle for render
    const [isRenderd, setIsRenderd] = useState(true);

    const toggleRender = () => {
        setIsRenderd(!isRenderd);
    }
    
    //Toolbar Functions

    return (
        <div className="EditTextComponent">
            {/*Display tool bar at top*/}
            <Toolbar>
                <MarkdownButton onClick={() => areaApi?.italicize()}>
                    it
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.bulletpoint()}>
                    bu
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.bold()}>
                    bo
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.heading1()}>
                    he1
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.heading2()}>
                    he2
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.heading3()}>
                    he3
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.strike()}>
                    str
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.blockquote()}>
                    blq
                </MarkdownButton>

                <MarkdownButton onClick={toggleRender}>
                    tog
                </MarkdownButton>

            </Toolbar>
            {/*Display text that can be easily editable and be able to select where to edit with cursor*/}
            <MarkdownArea initText={text} isRenderd={isRenderd} setAreaApi={setAreaApi} />
        </div>
    );
};

export default EditTextComponent;