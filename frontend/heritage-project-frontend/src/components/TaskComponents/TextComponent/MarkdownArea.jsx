import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';

const MarkdownArea = ({initText}) => {
    //Convert mark down text into html to render right at start
    const initHtml = marked(initText)

    const editor = useEditor({
        extensions: [StarterKit],//Include extensios
        content: initHtml//Initial text
    })

    return(
        <>
            <EditorContent editor={editor} />
        </>
    )
}

export default MarkdownArea