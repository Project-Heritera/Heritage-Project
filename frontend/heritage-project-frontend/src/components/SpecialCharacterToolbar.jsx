import { useState } from "react";
import { LANGUAGE } from "@/utils/languageChars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SpecialCharToolbar({ onInsert }) {
  // Automatically get all available language keys from the LANGUAGE utility
  const availableLanguages = Object.keys(LANGUAGE);
  const [selectedLanguageKey, setSelectedLanguageKey] = useState(
    availableLanguages[0]
  );

  const selectedLanguage = LANGUAGE[selectedLanguageKey];
  const chars = selectedLanguage?.specialLetterSet || [];

  return (
    <Card className="w-fit">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium">
            Special Characters
          </CardTitle>
          {availableLanguages.length > 1 && (
            <Select
              value={selectedLanguageKey}
              onValueChange={setSelectedLanguageKey}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((langKey) => (
                  <SelectItem key={langKey} value={langKey}>
                    {LANGUAGE[langKey]?.label || langKey}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      {chars.length > 0 && (
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-1">
            {chars.map((char) => (
              <Button
                key={char}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onInsert(char)}
                aria-label={`Insert ${char}`}
                className="min-w-8"
              >
                {char}
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
