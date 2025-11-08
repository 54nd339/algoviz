import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";

import { setMaxDepth } from "@/redux/reducers/minimaxSlice";
import generateTree from "../MinimaxUtils/generateTree";

const tailwindConfig = require("/tailwind.config.js");
const colors = tailwindConfig.theme.colors;

const DepthTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors["cyan"],
      light: colors["cyan"],
      dark: colors["cyan"],
      contrastText: "#fff",
    },
  },
});

const DepthController = () => {
  const dispatch = useDispatch();
  const maxDepth = useSelector((state) => state.minimax.maxDepth);

  const updateDepth = (value) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    dispatch(setMaxDepth(normalized));
  };

  return (
    <div className="hidden w-full h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-cyan text-lg hover:cursor-pointer select-none">
      Depth
      <ThemeProvider theme={DepthTheme}>
        <Slider
          className="Slider"
          aria-label="Tree Depth Slider"
          value={maxDepth}
          min={1}
          max={5}
          step={1}
          color="primary"
          onChange={(event, value) => {
            updateDepth(value);
          }}
          onChangeCommitted={(event, value) => {
            const normalized = Array.isArray(value) ? value[0] : value;
            generateTree({ maxDepth: normalized });
          }}
        />
      </ThemeProvider>
      <div className="hidden xl:block text-[1rem] text-blue">{maxDepth}</div>
    </div>
  );
};

export default DepthController;

