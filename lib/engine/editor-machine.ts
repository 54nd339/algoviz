import { assign, setup } from "xstate";

export type EditorMode =
  | "select"
  | "draw"
  | "erase"
  | "setStart"
  | "setEnd"
  | "setWeight";

export interface EditorContext {
  mode: EditorMode;
  undoStack: unknown[];
  redoStack: unknown[];
}

type EditorEvent =
  | { type: "SET_MODE"; mode: EditorMode }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "PUSH_STATE"; snapshot: unknown };

export const editorMachine = setup({
  types: {
    context: {} as EditorContext,
    events: {} as EditorEvent,
  },
  guards: {
    canUndo: ({ context }) => context.undoStack.length > 0,
    canRedo: ({ context }) => context.redoStack.length > 0,
  },
  actions: {
    setMode: assign(({ event }) => {
      if (event.type !== "SET_MODE") return {};
      return { mode: event.mode };
    }),
    pushState: assign(({ context, event }) => {
      if (event.type !== "PUSH_STATE") return {};
      return {
        undoStack: [...context.undoStack, event.snapshot],
        redoStack: [],
      };
    }),
    undo: assign(({ context }) => {
      if (context.undoStack.length === 0) return {};
      const newUndo = [...context.undoStack];
      const snapshot = newUndo.pop();
      return {
        undoStack: newUndo,
        redoStack: [...context.redoStack, snapshot],
      };
    }),
    redo: assign(({ context }) => {
      if (context.redoStack.length === 0) return {};
      const newRedo = [...context.redoStack];
      const snapshot = newRedo.pop();
      return {
        redoStack: newRedo,
        undoStack: [...context.undoStack, snapshot],
      };
    }),
  },
}).createMachine({
  id: "editor",
  initial: "active",
  context: {
    mode: "select",
    undoStack: [],
    redoStack: [],
  },
  states: {
    active: {
      on: {
        SET_MODE: { actions: "setMode" },
        PUSH_STATE: { actions: "pushState" },
        UNDO: { guard: "canUndo", actions: "undo" },
        REDO: { guard: "canRedo", actions: "redo" },
      },
    },
  },
});
