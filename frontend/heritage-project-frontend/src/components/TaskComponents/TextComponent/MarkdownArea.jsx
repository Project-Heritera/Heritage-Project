import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useState, useEffect, useRef } from 'react';
import "../../../styles/Components/TaskComponents/TextComponent.css"

//This componet supports viewing the markdown as renderd and as raw markdown
const MarkdownArea = ({ initText, isRenderd, setAreaApi }) => {
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
        }
    });

    //Set up API functions for toolbar
    const textAreaRef = useRef(null);

    //Function for wraping selected text in a notation. suffix becomes prefix if one is not provided
    const wrapSelection = (prefix, suffix = prefix) => {
        const textArea = textAreaRef.current;//Retrieve text area once its made
        if (!textArea) return;

        //Get text area info. Retrieve indexes of start and end of highlighted text or end=front if just cursor
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = textArea.value;
        //Retrieve highlighted text to edit and embed inside of wrap
        const selectedText = text.substring(start, end);
        const prevText = text.substring(0, start);
        const endText = text.substring(end);

        //Create updated text: {text before highlight}{prefix}{highlightedtext}{suffix}{text after highlight}
        let updatedText = null;
        if (start === end) {
            //Then just add the characters dont "wrap" since nothing highlight
            updatedText = `${prefix}${suffix}`;
            console.log("start is equal to end!");
            console.log(prefix);
            console.log(suffix);
        } else {
            console.log("Doing normal wrap!");
            updatedText = `${prevText}${prefix}${selectedText}${suffix}${endText}`;
        }
        console.log(updatedText);

        //Update text for editor and textarea
        setRawMarkdown(updatedText);

        //Adjust cursor to be after what we just wrapped. Load after react rerender
        setTimeout(() => {
            textArea.focus();//Move users curser back into text box
            textArea.selectionStart = start + prefix.length;
            textArea.selectionEnd = end + prefix.length;
        }, 0);
    }

    const addLineMarks = (lineMark) => {
        const textArea = textAreaRef.current;//Retrieve text area once its made
        if (!textArea) return;

        const start = textArea.selectionStart;
        const text = textArea.value;

        //Look for current line
        let lineStart = start;
        while (lineStart > 0 && text[lineStart - 1] !== '\n') {
            lineStart--;
        }

        //Update content
        const prevText = text.substring(0, lineStart);
        const endText = text.substring(lineStart);

        const updatedText = `${prevText}${lineMark} ${endText}`

        //Update
        setRawMarkdown(updatedText);
        editor?.commands.setContent(updatedText);

        //Move cursor back
        setTimeout(() => {
            textArea.focus();//Move users curser back into text box
            const cursPos = start + lineMark.length + 1
            textArea.selectionStart = cursPos; //Move cursor to after lineMark size + space
            textArea.selectionEnd = cursPos;
        }, 0);
    }

    //Create toolbar functions
    const italicize = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleItalic().run();
            console.log("You did an renderd italazize!");
            console.log(isRenderd);
        } else {
            wrapSelection('*');
            console.log("You did a non renderd italazize!");
        }
    };

    const bulletpoint = () => {
        console.log("You did a bulletpoint!");
        if (isRenderd) {
            editor?.chain().focus().toggleBulletList().run();   
        } else {
            addLineMarks("-");
        }
    };

    const bold = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleBold().run();
        } else {
            wrapSelection("**");
        }
    }

    //Handle headers
    const heading1 = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleHeading({ level: 1 }).run();
        } else {
            addLineMarks("#");
        }
    }

    const heading2 = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleHeading({ level: 2 }).run();
        } else {
            addLineMarks("##");
        }
    }

    const heading3 = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleHeading({ level: 3 }).run();
        } else {
            addLineMarks("###");
        }
    }

    //Strikethrough
    const strike = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleStrike().run();
        } else {
            wrapSelection("~~");
        }
    }

    //Link work in progress.
    const link = () => {
        if (isRenderd) {
            editor?.chain().focus().setLink().run();
        } else {
            wrapSelection("[", "]");
        }
    }

    //Blockquote
    const blockquote = () => {
        if (isRenderd) {
            editor?.chain().focus().toggleBlockquote().run();
        } else {
            addLineMarks(">");
        }
    }


    //Create text area view for non renderd mode
    const textAreaChange = (e) => {
        const newText = e.target.value;
        setRawMarkdown(newText);
        //Update editor as well for renderd
        editor.commands.setContent(newText)
    }

    //Pass editor to parent
    useEffect(() => {
        if (setAreaApi) {
            setAreaApi({
                italicize,
                bulletpoint,
                bold,
                heading1,
                heading2,
                heading3,
                strike,
                link,
                blockquote
            })
        }
    }, [editor, setAreaApi, isRenderd])

    return (
        <>
            {/* If render is toggled used render editor, else use normal markdown text */}
            {isRenderd ? (
                //Render if true
                <EditorContent className="ProseMirror" editor={editor} />
            ) : (
                //render is false
                <textarea className="text-area" value={rawMarkdown} onChange={textAreaChange} ref={textAreaRef} />
            )}
        </>
    )
}

export default MarkdownArea