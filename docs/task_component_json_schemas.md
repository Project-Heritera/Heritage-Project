# Task Component JSON Formats

Right now there isn't any validation that the jsons follow this format since we're still early in development, and stuff is likely to change. If it makes since to add any other component types that should be here, don't be afraid to do so.

## TEXT

```json
{   
    "text": "What is 2 + 2?", 
    "style": {"bold": false}
}
```

## OPTION

```json
{
    "options": [{"label": "4", "is_correct": true}], 
    "shuffle": true
}
```

## IMAGE

```json
{
    "url": "https://example.com/image.png", 
    "alt": "Diagram"
}
```

## FILL

```json
{
    "prompt": "The capital of France is ___ .",
    "blanks": [
        {
            "blank_id": "b1",
            "correct_answers": ["Paris"],
            "user_response": "Paris"
        }
    ]
}
```