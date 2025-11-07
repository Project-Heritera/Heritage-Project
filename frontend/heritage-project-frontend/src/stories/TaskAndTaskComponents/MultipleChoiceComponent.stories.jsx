import React from 'react';
// Note the import syntax is different because you used "export default"
import ImageComponent from '../../components/TaskAndTaskComponents/ImageTaskComponent/ImageTaskComponent';

// This default export describes your component for Storybook
export default {
  title: 'Components/ImageComponent', // The name in the Storybook sidebar
  component: ImageComponent,          // The component we're displaying
};

// A template for rendering the component
const Template = (args) => <ImageComponent {...args} />;

// The actual story that will be displayed
export const Default = Template.bind({});
Default.args = {
  // Your component doesn't have any props, so this is empty
  jsonData: {
  },
  isEditing: true,
};