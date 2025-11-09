import { Slider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { setBoardSize, setUserBoard } from "@/redux/reducers/sudokuSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const CountTheme = createTheme({
  palette: {
    CountPrimary: {
      main: tailwindColors["cyan"],
    },
    CountSecondary: {
      main: tailwindColors["cyan-bg"],
    },
  },
});

const sizeOptions = [
  { id: 1, size: 4, label: "4x4" },
  { id: 2, size: 6, label: "6x6" },
  { id: 3, size: 9, label: "9x9" },
  { id: 4, size: 16, label: "16x16" },
];

const SizeController = () => {
  const dispatch = useDispatch();
  const boardSize = useSelector((state) => state.sudoku.boardSize);
  const isRunning = useSelector((state) => state.sudoku.isRunning);

  // Map size to slider value (1-5)
  const sizeToSlider = (size) => {
    return sizeOptions.findIndex((opt) => opt.size === size) + 1;
  };

  // Map slider value to size
  const sliderToSize = (value) => {
    return sizeOptions[value - 1]?.size || 9;
  };

  const handleChange = (event, newValue) => {
    if (!isRunning) {
      const newSize = sliderToSize(newValue);
      dispatch(setBoardSize(newSize));
      // Initialize empty user board
      const emptyBoard = Array(newSize)
        .fill(null)
        .map(() => Array(newSize).fill(0));
      dispatch(setUserBoard(emptyBoard));
    }
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-cyan text-lg hover:cursor-pointer select-none">
      Size
      <ThemeProvider theme={CountTheme}>
        <Slider
          className="Slider"
          aria-label="Grid Size Slider"
          defaultValue={3}
          min={1}
          max={4}
          color="CountPrimary"
          value={sizeToSlider(boardSize)}
          onChange={handleChange}
        />
      </ThemeProvider>
    </div>
  );
};

export default SizeController;
