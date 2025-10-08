// src/components/TextComponent.stories.jsx

import React from 'react';
// Note the import syntax is different because you used "export default"
import TextComponent from '../components/TaskComponents/TextComponent'; 

// This default export describes your component for Storybook
export default {
  title: 'Components/TextComponent', // The name in the Storybook sidebar
  component: TextComponent,          // The component we're displaying
};

// A template for rendering the component
const Template = (args) => <TextComponent {...args} />;

// The actual story that will be displayed
export const Default = Template.bind({});
Default.args = {
  // Your component doesn't have any props, so this is empty
};