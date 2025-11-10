import { Slider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { setBoardSize, setBoard } from "@/redux/reducers/nQueenSlice";
import { initializeBoard } from "../NQueenUtils/algorithms";

const tailwindConfiger = require("/tailwind.config.js");
const tailwindColors = tailwindConfiger.theme.colors;

const CountTheme = createTheme({
  palette: {
    mode: "dark",
    CountPrimary: {
      main: tailwindColors["cyan"],
      light: tailwindColors["cyan"],
      dark: tailwindColors["cyan"],
      contrastText: "#fff",
    },
  },
});

const BoardSizeController = () => {
  const dispatch = useDispatch();
  const boardSize = useSelector((state) => state.nQueen.boardSize);
  
  const handleSizeChange = (event, newSize) => {
    dispatch(setBoardSize(newSize));
    const newBoard = initializeBoard(newSize);
    dispatch(setBoard(newBoard));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-cyan text-lg hover:cursor-pointer select-none">
      N
      <ThemeProvider theme={CountTheme}>
        <Slider
          className="Slider"
          aria-label="Board Size Slider"
          value={boardSize}
          defaultValue={3}
          min={4}
          max={12}
          step={1}
          color="CountPrimary"
          onChange={handleSizeChange}
        />
      </ThemeProvider>
    </div>
  );
};

export default BoardSizeController;
