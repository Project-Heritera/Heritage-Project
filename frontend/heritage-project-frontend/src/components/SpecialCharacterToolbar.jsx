import { LANGUAGE } from "@/utils/languageChars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SpecialCharToolbar({ language, onInsert }) {
  const chars = language?.specialLetterSet;

  if (!chars?.length) return null;

  return (
    <Card className="w-fit">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium">
          Special Characters for {language?.label || "Language"}
        </CardTitle>
      </CardHeader>

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
    </Card>
  );
}
