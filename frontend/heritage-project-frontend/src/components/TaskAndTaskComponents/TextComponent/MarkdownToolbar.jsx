import React from 'react';
import Markdown from "../../Utilities/Markdown"
import "../../../styles/Components/TaskComponents/TextComponent.css"
import { Card, CardContent } from "@/components/ui/card";

//Handles the styling for toolbar container
const Markdowntoolbar = ({ children }) => {
  return (
    <Card className="toolbar">
      <CardContent className="flex items-center gap-2 p-2">
        {children}
      </CardContent>
    </Card>
  );
};

export default Markdowntoolbar;