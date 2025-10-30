import * as z from "zod";
import TextTaskComponent from "../components/TaskAndTaskComponents/TextComponent/TextTaskComponent";
import TextComponent from "../components/TaskComponents/TextComponent/TextComponent";
import ImageTaskComponent from "../components/TaskAndTaskComponents/imageTaskComponent";
import MCQTaskComponent from "../components/TaskAndTaskComponents/mcqTaskComponent";
import MultipleChoiceComponent from "../components/TaskComponents/MultipleChoiceComponent/MultipleChoiceComponent";
// Universal enum for task components
//Label is just its name
//component is its corresponding component foudn in components/TaskAndTaskComponents
//schema is a schema that the jsonData field of the task compnent must followed in order to be saved to database. Called in serialization function for basetaskcomponent editor component
//defaultValue jsons to be given to newly created component types that still fulfil schemas
const taskComponentTypes = Object.freeze({
  TEXT: {
    label: "Text Box",
    component: TextTaskComponent,
    schema: z.object({ text: z.string() }),
    defaultValue: { text: "" },
  },
  IMAGE: {
    label: "Image",
    component: ImageTaskComponent,
    schema: z.object({ url: z.string(), alt: z.string() }),
    defaultValue: { url: "", alt: "" },
  },
  MCQ: {
    label: "Multiple Choice Question",
    component: MultipleChoiceComponent,
    schema: z
      .object({
        id: z.string(),
        text: z.string(),
        correct: z.boolean(),
      })
      .refine(
        (data) => Object.values(data.options).some((val) => val === true),
        {
          message: "At least one answer must be marked as correct",
          path: ["options"],
        }
      ),
    defaultValue: {
      choiceArray: [
        { id: "a", text: "Edit Text", correct: false },
        { id: "b", text: "Edit Text", correct: false },
      ],
    },
  },
  // Add more components as needed
});

export { taskComponentTypes };
