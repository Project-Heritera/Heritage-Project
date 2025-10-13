import TaskComponent from "../../components/TaskAndTaskComponents/TaskComponent";
export default {
  title: "Task/TaskComponent",
  component: TaskComponent,
  argTypes: {
    componentType: {
      control: { type: "radio" },
      options: ["TEXT", "MCQ", "IMAGE"],
    },
  },
};

const Template = (args) => <TaskComponent {...args} />;

export const Text = Template.bind({});
Text.args = {
  componentType: "TEXT",
  taskComponentSpecificData: JSON.stringify({ text: "Example text" }),
  isEditing: true,
};

export const MCQ = Template.bind({});
MCQ.args = {
  componentType: "MCQ",
  taskComponentSpecificData: JSON.stringify({ question: "What is 2+2?", options: ["3", "4"], answer: "4" }),
  isEditing: true,
};

export const Image = Template.bind({});
Image.args = {
  componentType: "IMAGE",
  taskComponentSpecificData: JSON.stringify({ url: "https://picsum.photos/200" }),
  isEditing: false,
};
