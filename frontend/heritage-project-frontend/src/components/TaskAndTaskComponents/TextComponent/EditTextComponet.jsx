import React, { useState } from "react";
import MarkdownArea from "./MarkdownArea";
import { Button } from "@/components/ui/button";
import { SpecialCharToolbar } from "@/components/SpecialCharacterToolbar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import "../../../styles/Components/TaskComponents/TextComponent.css";
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
  ScrollText,
  Languages,
} from "lucide-react";

//Commponet used to render the edit version of the text componet
const EditTextComponent = ({
  text,
  setText,
  areaApi,
  setAreaApi,
}) => {
  //Handle toggle for render
  const [isRenderd, setIsRenderd] = useState(true); //Holds bool for render toggle
  const [showSpecialChars, setShowSpecialChars] = useState(false);

  const onSpecialCharacterInsert = (character) => {
    if (areaApi?.insertCharacter) {
      areaApi.insertCharacter(character);
    } else {
      // Fallback for when api is not ready yet
      setText(text + character);
    }
  };
  //Toggles between render and non render view
  const toggleRender = () => {
    setIsRenderd(!isRenderd);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap gap-2 border-b pb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => areaApi?.italicize()}
          >
            <Italic size={18} className="text-gray-800" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => areaApi?.bulletpoint()}
          >
            <List size={18} className="text-gray-800" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => areaApi?.bold()}>
            <Bold size={18} className="text-gray-800" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => areaApi?.heading1()}
          >
            <Heading1 size={18} className="text-gray-800" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => areaApi?.heading2()}
          >
            <Heading2 size={18} className="text-gray-800" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => areaApi?.heading3()}
          >
            <Heading3 size={18} className="text-gray-800" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => areaApi?.strike()}>
            <Strikethrough size={18} className="text-gray-800" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => areaApi?.blockquote()}
          >
            <TextQuote size={18} className="text-gray-800" />
          </Button>

          <Button variant="outline" size="icon" onClick={toggleRender}>
            <ScrollText size={18} className="text-gray-800" />
          </Button>

          <Button
            variant={showSpecialChars ? "destructive" : "outline"}
            size="icon"
            onClick={() => setShowSpecialChars((prev) => !prev)}
          >
            <Languages size={18} className="text-gray-800" />
          </Button>
        </div>
        
        {showSpecialChars && (
          <SpecialCharToolbar onInsert={onSpecialCharacterInsert} />
        )}

        <MarkdownArea
          initText={text}
          setText={setText}
          isRenderd={isRenderd}
          setAreaApi={setAreaApi}
        />
      </CardContent>
    </Card>
  );
};

export default EditTextComponent;