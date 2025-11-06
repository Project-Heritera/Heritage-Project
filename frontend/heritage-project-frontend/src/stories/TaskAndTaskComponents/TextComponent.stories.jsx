// src/components/TextComponent.stories.jsx

import React from 'react';
// Note the import syntax is different because you used "export default"
import TextComponent from '../../components/TaskAndTaskComponents/TextComponent/TextTaskComponent';

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
  jsonData: {
    text: `
# Heading 1: Main Title

## Heading 2: A Sub-Section

This is a paragraph with **bold text**, *italic text*, and \`inline code()\`. You can also combine them, like ***this***. Don't forget ~~strikethrough~~.

---

### Heading 3: Lists and Links

Here are some things to check:

* **Unordered List Item 1**
    * A nested item.
    * Another nested item.
* **Unordered List Item 2**

1.  **Ordered List Item 1**
2.  **Ordered List Item 2**
    1.  A nested ordered item.
3.  **Ordered List Item 3**

> This is a blockquote. It's often used for quoting text from another source. It should be visually distinct from regular paragraphs.

Check out the official [Markdown Guide](https://www.markdownguide.org) for more info.
`
  },

  isEditing: true,
};