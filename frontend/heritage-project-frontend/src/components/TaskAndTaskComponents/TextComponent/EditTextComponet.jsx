import React, { useState } from 'react';
import Markdown from '../../Utilities/Markdown';
import Toolbar from "./MarkdownToolbar"
import MarkdownButton from "./MarkdownButton"
import MarkdownArea from "./MarkdownArea"
import "../../../styles/Components/TaskComponents/TextComponent.css"
//Import icons
import {
    Bold,
    Italic,
    List,
    Heading1,
    Heading2,
    Heading3,
    Strikethrough,
    TextQuote,
    ScrollText
} from 'lucide-react';

//Commponet used to render the edit version of the text componet
const EditTextComponent = ({ text, setText, areaApi, setAreaApi }) => {

    //Handle toggle for render
    const [isRenderd, setIsRenderd] = useState(true);//Holds bool for render toggle

    //Toggles between render and non render view
    const toggleRender = () => {
        setIsRenderd(!isRenderd);
    }

    return (
        <div className="EditTextComponent">
            {/*Display tool bar at top*/}
            <Toolbar>
                <MarkdownButton onClick={() => areaApi?.italicize()}>
                    <Italic size={18} className='text-gray-800' />
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.bulletpoint()}>
                    <List size={18} className='text-gray-800'/>
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.bold()}>
                    <Bold size={18} className='text-gray-800'/>
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.heading1()}>
                    <Heading1 size={18} className='text-gray-800'/>
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.heading2()}>
                    <Heading2 size={18} className='text-gray-800'/>
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.heading3()}>
                    <Heading3 size={18}className='text-gray-800' />
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.strike()}>
                    <Strikethrough size={18} className='text-gray-800'/>
                </MarkdownButton>

                <MarkdownButton onClick={() => areaApi?.blockquote()}>
                    <TextQuote size={18} className='text-gray-800'/>
                </MarkdownButton>

                <MarkdownButton onClick={toggleRender}>
                    <ScrollText size={18} className='text-gray-800'/>
                </MarkdownButton>

            </Toolbar>
            {/*Display text that can be easily editable and be able to select where to edit with cursor*/}
            <MarkdownArea initText={text} setText={setText} isRenderd={isRenderd} setAreaApi={setAreaApi} />
        </div>
    );
};

export default EditTextComponent;