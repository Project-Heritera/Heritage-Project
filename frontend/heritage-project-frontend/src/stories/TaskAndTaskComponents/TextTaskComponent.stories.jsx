import TextTaskComponent from "../../components/TaskAndTaskComponents/textTaskComponent";
export default {
  title: "Task/TextTaskComponent",
  component: TextTaskComponent,
};

const Template = (args) => <TextTaskComponent {...args} />;

export const Editing = Template.bind({});
Editing.args = {
  serialize: (type, json) => console.log("Serialized:", type, json),
  jsonData: JSON.stringify({ text: "Hello world!" }),
  isEditing: true,
};

export const Viewing = Template.bind({});
Viewing.args = {
  serialize: (type, json) => console.log("Serialized:", type, json),
  jsonData: JSON.stringify({ text: "Read-only example text" }),
  isEditing: false,
};
