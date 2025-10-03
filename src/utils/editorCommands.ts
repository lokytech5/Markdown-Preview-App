import type { EditorView } from "@codemirror/view";

/** Run a transaction-safely mutating command */
function runTx(view: EditorView, mutator: () => void) {
  view.dispatch({ changes: [] }); // no-op to ensure view exists
  mutator();
  view.focus();
}

/** Wrap each selection with before/after (simple inline format like **bold**) */
function wrapSelection(view: EditorView, before: string, after = before, placeholder = "text") {
  runTx(view, () => {
    const { state } = view;
    const tr = state.update({
      changes: state.selection.ranges.map((r) => {
        const selected = state.sliceDoc(r.from, r.to) || placeholder;
        return { from: r.from, to: r.to, insert: `${before}${selected}${after}` };
      }),
      selection: { anchor: state.selection.main.from + before.length, head: state.selection.main.to + before.length },
      scrollIntoView: true,
    });
    view.dispatch(tr);
  });
}

/** Prefix each selected line (for lists/quotes) */
function prefixLines(view: EditorView, prefix: string) {
  runTx(view, () => {
    const { state } = view;
    const ranges = state.selection.ranges;
    const changes: { from: number; to: number; insert: string }[] = [];

    ranges.forEach((r) => {
      // expand to full lines
      let fromLine = state.doc.lineAt(r.from);
      let toLine = state.doc.lineAt(r.to);
      for (let line = fromLine.number; line <= toLine.number; line++) {
        const l = state.doc.line(line);
        changes.push({ from: l.from, to: l.from, insert: prefix });
      }
    });

    if (changes.length) view.dispatch(state.update({ changes, scrollIntoView: true }));
  });
}

/** Replace each selected line's start with the given heading marker (e.g. "# " or "## ") */
function setHeading(view: EditorView, hashes: string) {
  runTx(view, () => {
    const { state } = view;
    const changes: { from: number; to: number; insert: string }[] = [];

    state.selection.ranges.forEach((r) => {
      let fromLine = state.doc.lineAt(r.from);
      let toLine = state.doc.lineAt(r.to);
      for (let n = fromLine.number; n <= toLine.number; n++) {
        const line = state.doc.line(n);
        const text = line.text.replace(/^\s*(#{1,6}\s+)?/, "");
        changes.push({ from: line.from, to: line.to, insert: `${hashes} ${text}` });
      }
    });

    if (changes.length) view.dispatch(state.update({ changes, scrollIntoView: true }));
  });
}

/** Wrap block with triple backticks; ensures newlines */
function wrapCodeBlock(view: EditorView, lang = "") {
  runTx(view, () => {
    const { state } = view;
    const ranges = state.selection.ranges;
    const changes = ranges.map((r) => {
      const content = state.sliceDoc(r.from, r.to) || "code";
      const before = "```" + lang + "\n";
      const after = "\n```";
      return { from: r.from, to: r.to, insert: `${before}${content}${after}` };
    });
    if (changes.length) view.dispatch(state.update({ changes, scrollIntoView: true }));
  });
}

/** Insert markdown link: [text](https://example.com) */
function insertLink(view: EditorView) {
  wrapSelection(view, "[", "](https://example.com)", "link text");
}

/** Insert markdown image: ![alt](https://...) */
function insertImage(view: EditorView) {
  wrapSelection(view, "![", "](https://placehold.co/600x300/png)", "alt text");
}

export const mdCommands = {
  bold:     (view: EditorView) => wrapSelection(view, "**"),
  italic:   (view: EditorView) => wrapSelection(view, "_"),
  code:     (view: EditorView) => wrapSelection(view, "`"),
  link:     (view: EditorView) => insertLink(view),
  image:    (view: EditorView) => insertImage(view),
  h1:       (view: EditorView) => setHeading(view, "#"),
  h2:       (view: EditorView) => setHeading(view, "##"),
  quote:    (view: EditorView) => prefixLines(view, "> "),
  ul:       (view: EditorView) => prefixLines(view, "- "),
  ol:       (view: EditorView) => prefixLines(view, "1. "),
  codeBlock:(view: EditorView) => wrapCodeBlock(view, "js"),
};
