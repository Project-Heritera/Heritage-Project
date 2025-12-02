import * as z from "zod";
import TextTaskComponent from "../components/TaskAndTaskComponents/TextComponent/TextTaskComponent";
import VideoTaskComponent from "@/components/TaskComponents/VideoComponent/VideoTaskComponent";
import MatchTermsTaskComponent from "@/components/TaskComponents/MatchTermsComponent/MatchTermsTaskComponenet";
import FillInBlankTaskComponent from "@/components/TaskComponents/FillInBlankComponent/FillInBlankTaskComponent";
import ImageTaskComponent from "../components/TaskComponents/ImageComponent/ImageTaskComponent";
import MultipleChoiceComponent from "../components/TaskComponents/MultipleChoiceComponent/MultipleChoiceComponent";
const MatchTermsTaskSchema = z
  .object({
    terms: z.array(z.string()).min(1, "Must have at least one term"),
    answers: z.array(z.string()).min(1, "Must have at least one answer"),
    number_of_chances: z.number().int().min(1),
    hint: z.string(),
  })
  .refine((data) => data.terms.length === data.answers.length, {
    message: "Terms and answers must have the same length",
  });
// Universal enum for task components
//Label is just its name
//component is its corresponding component foudn in components/TaskAndTaskComponents
//schema is a schema that the jsonData field of the task compnent must followed in order to be saved to database. Called in serialization function for basetaskcomponent editor component
//defaultValue jsons to be given to newly created component types that still fulfil schemas
const taskComponentTypes = Object.freeze(
  {
    TEXT: {
      label: "Text Box",
      component: TextTaskComponent,
      category: "Static",
      schema: z.object({ text: z.string() }),
      defaultValue: { text: "" },
    },
    VIDEO: {
      label: "Video",
      category: "Static",
      component: VideoTaskComponent,
      schema: z.object({ url: z.string() }),
      defaultValue: { url: "" },
    },
    IMAGE: {
      label: "Image",
      category: "Static",
      component: ImageTaskComponent,
      schema: z.object({
        src: z.string(),
        alt: z.string(),
        image_type: z.string(),
      }),
      defaultValue: { src: "", alt: "", image_type: "" },
    },
    OPTION: {
      label: "Multiple Choice Question",
      component: MultipleChoiceComponent,
      category: "Question",
      schema: z.object({
        choiceArray: z
          .array(
            z.object({
              id: z.string(),
              text: z.string(),
              correct: z.boolean(),
            })
          )
          .refine(
            (data) => Object.values(data.correct).some((val) => val === true),
            {
              message: "At least one answer must be marked as correct",
              path: ["options"],
            }
          ),
      }),
      defaultValue: {
        choiceArray: [
          { id: "a", text: "Edit Text", correct: false },
          { id: "b", text: "Edit Text", correct: false },
        ],
        number_of_chances: 1,
        hint: "",
      },
    },
    FILL: {
      label: "Fill In Blank",
      component: FillInBlankTaskComponent,
      category: "Question",
      schema: z.object({ text: z.string(), answer: z.string() }),
      defaultValue: {
        text: "the ___th letter of the alphabet is e",
        answer: "5",
        number_of_chances: 1,
        hint: "",
      },
    },
    MATCH: {
      label: "Match Terms To Definitions",
      component: MatchTermsTaskComponent,
      category: "Question",
      schema: z
        .object({
          terms: z.array(z.string()).min(1, "Must have at least one term"),
          answers: z.array(z.string()).min(1, "Must have at least one answer"),
          number_of_chances: z.number().int().min(1),
          hint: z.string(),
        })
        .refine((data) => data.terms.length === data.answers.length, {
          message: "Terms and answers must have the same length",
        }),
      defaultValue: {
        terms: ["Milk", "Bread", "Eggs"],
        answers: ["Dairy", "Grain", "Protein"], // index i matches terms[i]
        number_of_chances: 1,
        hint: "",
      },
    },
  }
  // Add more components as needed
);

export { taskComponentTypes };
