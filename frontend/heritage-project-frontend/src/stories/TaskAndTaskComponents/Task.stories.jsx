import Task from "../../components/TaskAndTaskComponents/Task";
import TaskComponent from "../../components/TaskAndTaskComponents/TaskComponent";
// Task.stories.jsx
export default {
  title: "Task/Task",
  component: Task,
};
 
const Template = (args) => <Task {...args} />;

export const WithTextAndImageChildren = Template.bind({});
WithTextAndImageChildren.args = {
  tags: ["math", "reading"],
  children: [
    <TaskComponent
      key="1"
      componentType="TEXT"
      isEditing={true}
      taskComponentSpecificData={JSON.stringify({ text: "Describe your process." })}
    />,
    <TaskComponent
      key="2"
      componentType="IMAGE"
      isEditing={false}
      taskComponentSpecificData={JSON.stringify({ url: "https://picsum.photos/100" })}
    />,
  ],
};
