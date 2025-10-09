import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {marked} from "marked"

//Create custom extension that allows users to paste markdown into MarkdownAreas
export const PasteMarkdown = Extension.create({
    name: 'pasteMarkdown',//Internal tiptap name

    //Create plugin
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('handlePasteMarkdown'),//Key for plugin identification
                //Define how plugin interacts with editor/events using props
                props: {
                    //Called when a user pastes somthing
                    handlePaste: (view, event, slice) => {
                        const clipboardText = event.clipboardData.getData('text/plain')

                        //Check if clipboard actully had any text
                        if (clipboardText.length > 0) {
                            const clipHtml = marked(clipboardText)//clipboard text converted to markdown html
                            //Start making the actual editor
                            this.editor.commands.insertContent(clipHtml);

                            return true;//Overwrite default paste actions
                        }
                        //No text give it to tiptap
                        return false;
                    }
                }
            })
        ]
    }
})