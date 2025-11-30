import * as z from "zod";
import TextTaskComponent from "../components/TaskAndTaskComponents/TextComponent/TextTaskComponent";
import ImageTaskComponent from "../components/TaskComponents/ImageComponent/ImageTaskComponent";
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
    category: "Static",
    schema: z.object({ text: z.string() }),
    defaultValue: { text: "" },
  },
  IMAGE: {
    label: "Image",
    category: "Static",
    component: ImageTaskComponent,
    schema: z.object({ src: z.string(), alt: z.string() }),
    defaultValue: { src: "", alt: "" },
  },
  OPTION: {
    label: "Multiple Choice Question",
    component: MultipleChoiceComponent,
    category: "Question",
    schema: z
      .object({
        choiceArray: z.array(z.object({
          id: z.string(),
          text: z.string(),
          correct: z.boolean()
        })).refine((data) => Object.values(data.correct).some((val) => val === true), {
          message: "At least one answer must be marked as correct",
          path: ["options"],
        })
      }),
    defaultValue: {
      choiceArray: [
        { id: "a", text: "Edit Text", correct: false },
        { id: "b", text: "Edit Text", correct: false },
      ],
      number_of_chances: 1,
      hint: ""
    },
  },
  // Add more components as needed
});

export { taskComponentTypes };
