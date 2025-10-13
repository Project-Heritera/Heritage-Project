import * as z from "zod";
// Universal enum for task components
const taskComponentTypes = Object.freeze({
  MCQ: "MCQ",
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  // Add more components as needed
});

//Contains schemas for all jsons that must be followed in order to be saved to database. Called in serialization function for basetaskcomponent editor component
const TEXT_JSON_SCHEMA = z.object({
  text: z.string()
});
const IMAGE_JSON_SCHEMA = z.object({
  url: z.string(),
 alt: z.string(),
});

const MCQ_JSON_SCHEMA = z.object({
  options: z.record(z.boolean()), // dictionary: { "option1": true, "option2": false }
  hints: z.array(z.string()),     // list of string hints
}).refine((data) => {
    return Object.values(data.options).some((val) => val === true); //ensure that at least one option is correct
}, {
    message: "At least one of the answer choices must marked as correct",path: ["options"]
});

function getComponentTypeSchema(componentType) {
  switch (componentType) {
    case taskComponentTypes.TEXT:
      return TEXT_JSON_SCHEMA;
    case taskComponentTypes.IMAGE:
      return IMAGE_JSON_SCHEMA;
    case taskComponentTypes.MCQ:
      return MCQ_JSON_SCHEMA;
    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
}

//default jsons to be given to newly created component types that still fulfil schemas
const DEFAULT_TEXT_JSON = {
    text: ""
};

const DEFAULT_IMAGE_JSON = {
    url: "",
    alt: ""
};

const DEFAULT_MCQ_JSON = {
    options: { "Option 1": false, "Option 2": false},
    hints: []
};

// Getter for default JSONs
function getDefaultComponentJson(componentType) {
    switch (componentType) {
        case taskComponentTypes.TEXT:
            return { ...DEFAULT_TEXT_JSON };
        case taskComponentTypes.IMAGE:
            return { ...DEFAULT_IMAGE_JSON };
        case taskComponentTypes.MCQ:
            return { ...DEFAULT_MCQ_JSON };
        default:
            throw new Error(`Unknown component type: ${componentType}`);
    }
}

export {taskComponentTypes, getComponentTypeSchema, getDefaultComponentJson};
