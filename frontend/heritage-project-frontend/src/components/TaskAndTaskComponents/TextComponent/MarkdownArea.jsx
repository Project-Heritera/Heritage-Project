import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useState, useEffect, useRef } from 'react';
import "../../../styles/Components/TaskComponents/TextComponent.css"

//This componet supports viewing the markdown as renderd and as raw markdown.
//initText is the initial text to load in
//isRenderd is the state used to represent if the render is activated for the markdown
//setAreaApi us a state used in parent to have the api functions passed up to it.
const MarkdownArea = ({ initText, isRenderd, setAreaApi, setText }) => {
    //Save state of markdown when changes occur for toggle
const [content, setContent] = useState(initText);

    const editor = useEditor({
    extensions: [
        StarterKit,
        Markdown.configure({
            html: true,
            transformCopiedText: true,
            transformPastedText: true,
        }),
    ],
    content, // <-- initial content from state
    onUpdate: ({ editor }) => {
        const markdown = editor.storage.markdown.getMarkdown();
        setContent(markdown);       // update local state
        setText?.(markdown);        // optional: notify parent
    },
});

    //Set up API functions for toolbar
    const textAreaRef = useRef(null);

    //Function for wraping selected text in a notation. suffix becomes prefix if one is not provided
    //prefix is the first and left side of a wraped notation
    //suffix is the last and right side of a wraped notation character
    const wrapSelection = (prefix, suffix = prefix) => {
        const textArea = textAreaRef.current;//Retrieve text area once its made
        if (!textArea) return;

        //Get text area info. Retrieve indexes of start and end of highlighted text or end=front if just cursor
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = textArea.value;
        //Retrieve highlighted text to edit and embed inside of wrap
        const selectedText = text.substring(start, end);
        
        const updatedText = `${text.substring(0, start)}${prefix}${selectedText}${suffix}${text.substring(end)}`;

        //Update text for editor and textarea
        setText(updatedText);
        editor?.commands.setContent(updatedText);

        //Adjust cursor to be after what we just wrapped. Load after react rerender
        setTimeout(() => {
            textArea.focus();//Move users curser back into text box
            textArea.selectionStart = start + prefix.length;
            textArea.selectionEnd = end + prefix.length;
        }, 0);
    }

    const insertCharacter = (char) => {
        if (isRenderd) {
            editor?.chain().focus().insertContent(char).run();
        } else {
            wrapSelection(char, ""); // Insert char at cursor
        }
    };

    //Adds markdown notation that needs to be at the start of the current line like headers
    //lineMark is the notation you want to add
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
        setText(updatedText);
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

    //retrieve text
    const getContent = () => {
        return initText;
    }

    //Create text area view for non renderd mode. Handles when the text area changes
    const textAreaChange = (e) => {
        const newText = e.target.value;
        setText(newText);
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
                blockquote,
                getContent,
                insertCharacter,
            })
        }
    }, [editor, setAreaApi, isRenderd])

   return (
    <>
        {isRenderd ? (
            <EditorContent editor={editor} className="ProseMirror border border-gray-800" />
        ) : (
            <textarea
                className="text-area border border-gray-800"
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    editor?.commands.setContent(e.target.value); // sync TipTap
                    setText?.(e.target.value);
                }}
                ref={textAreaRef}
            />
        )}
    </>
);
}

export default MarkdownArea