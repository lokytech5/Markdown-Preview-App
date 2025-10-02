import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

/** Create a CodeMirror editor and wire change events to `onDocChange`. */
export function createEditor(
  parent: HTMLElement,
  initialDoc: string,
  onDocChange: (value: string) => void
): EditorView {
  const state = EditorState.create({
    doc: initialDoc,
    extensions: [
      basicSetup,                             // core keymaps, history, line nums, etc.
      markdown({ base: markdownLanguage }),   // markdown syntax support
      oneDark,                                // theme
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onDocChange(u.state.doc.toString());
      }),
    ],
  });

  return new EditorView({ state, parent });
}

/** If the editor content differs from `nextDoc`, replace it (keeps history sane). */
export function syncEditor(view: EditorView, nextDoc: string) {
  const current = view.state.doc.toString();
  if (current !== nextDoc) {
    view.dispatch({ changes: { from: 0, to: current.length, insert: nextDoc } });
  }
}
