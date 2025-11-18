import React from 'react';
import { taskComponentTypes } from '../utils/taskComponentTypes';
// Note the import syntax is different because you used "export default"
import MultipleChoiceComponent from '../components/TaskComponents/MultipleChoiceComponent/MultipleChoiceComponent';

// This default export describes your component for Storybook
export default {
  title: 'Components/MultipleChoiceComponent', // The name in the Storybook sidebar
  component: MultipleChoiceComponent,          // The component we're displaying
};

// A template for rendering the component
const Template = (args) => <MultipleChoiceComponent {...args} />;

// The actual story that will be displayed
export const Default = Template.bind({});
Default.args = {
  // Your component doesn't have any props, so this is empty
  jsonData: taskComponentTypes.MCQ.defaultValue,
  isEditing: true,
  serialize: (()=>{})};