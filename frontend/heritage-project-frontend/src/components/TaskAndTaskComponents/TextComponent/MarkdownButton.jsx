import React from 'react';
import Markdown from "../../Utilities/Markdown"
import "../../../styles/Components/TaskComponents/TextComponent.css"
import { Button } from '@/components/ui/button';

//Handle what the buttons look like for toolbar
const MarkdownButton = ({onClick, children}) => {
    return (
        <Button className="button" onClick={onClick}>
            {children}
        </Button>
    );
};

export default MarkdownButton;