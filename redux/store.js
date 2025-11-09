import { configureStore } from "@reduxjs/toolkit";
import sortingSlice from "./reducers/sortingSlice";
import searchingSlice from "./reducers/searchingSlice";
import graphSlice from "./reducers/graphSlice";
import pageSlice from "./reducers/pageSlice";
import hanoiSlice from "./reducers/hanoiSlice";
import pathSlice from "./reducers/pathSlice";
import minimaxSlice from "./reducers/minimaxSlice";
import aiSlice from "./reducers/aiSlice";
import perceptronSlice from "./reducers/perceptronSlice";
import sudokuSlice from "./reducers/sudokuSlice";

export const store = configureStore({
  reducer: {
    sorting: sortingSlice,
    graph: graphSlice,
    page: pageSlice,
    searching: searchingSlice,
    hanoi: hanoiSlice,
    path: pathSlice,
    minimax: minimaxSlice,
    ai: aiSlice,
    perceptron: perceptronSlice,
    sudoku: sudokuSlice,
  },
});