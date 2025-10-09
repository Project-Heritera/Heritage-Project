import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';
import { PasteMarkdown } from '../../../services/TaskComponents/TextComponent/MarkdownPaste';

const MarkdownArea = ({initText}) => {
    //Convert mark down text into html to render right at start
    const initHtml = marked(initText)

    const editor = useEditor({
        extensions: [StarterKit, PasteMarkdown],//Include extensios
        content: initHtml//Initial text
    })

    return(
        <>
            <EditorContent editor={editor} />
        </>
    )
}

export default MarkdownArea