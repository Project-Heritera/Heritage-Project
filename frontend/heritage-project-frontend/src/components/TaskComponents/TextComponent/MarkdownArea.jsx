import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';
import { Markdown } from 'tiptap-markdown';

const MarkdownArea = ({initText}) => {
    //Convert mark down text into html to render right at start
    const initHtml = marked(initText)

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
        content: initHtml//Initial text
    })

    return(
        <>
            <EditorContent editor={editor} />
        </>
    )
}

export default MarkdownArea