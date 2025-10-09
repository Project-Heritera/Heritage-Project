import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useState, useEffect } from 'react';

//This componet supports viewing the markdown as renderd and as raw markdown
const MarkdownArea = ({ initText, isRenderd }) => {
    //Save state of markdown when changes occur for toggle
    const [rawMarkdown, setRawMarkdown] = useState(initText);

    const editor = useEditor({
        extensions: [
            StarterKit,
            //Auto convert to and from markdown to make copy and pasting more intuitive.
            Markdown.configure({
                html: true,
                transformCopiedText: true,
                transformPastedText: true,
            }),
        ],//Include extensios
        content: initText,//Initial text
        //Listen for updates to editor
        onUpdate: ({ editor }) => {
            setRawMarkdown(editor.storage.markdown.getMarkdown());
            console.log(rawMarkdown);
        }
    });

    //Create text area view for non renderd mode
    const textAreaChange = (e) => {
        const newText = e.target.value;
        setRawMarkdown(newText);
        //Update editor as well for renderd
        editor.commands.setContent(newText)
    }

    return (
        <>
            {/* If render is toggled used render editor, else use normal markdown text */}
            {isRenderd ? (
                //Render if true
                <EditorContent editor={editor} />
            ) : (
                //render is false
                <textarea value={rawMarkdown} onChange={textAreaChange} />
            )}
        </>
    )
}

export default MarkdownArea