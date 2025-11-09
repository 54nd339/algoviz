import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";

import { setBranchingFactor } from "@/redux/reducers/minimaxSlice";
import generateTree from "../MinimaxUtils/generateTree";

const tailwindConfig = require("/tailwind.config.js");
const colors = tailwindConfig.theme.colors;

const BranchTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors["yellow"],
      light: colors["yellow"],
      dark: colors["yellow"],
      contrastText: "#fff",
    },
  },
});

const BranchingController = () => {
  const dispatch = useDispatch();
  const branchingFactor = useSelector((state) => state.minimax.branchingFactor);

  const updateBranching = (value) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    dispatch(setBranchingFactor(normalized));
  };

  return (
    <div className="hidden w-full h-full px-[2rem] bg-yellow-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-yellow text-lg hover:cursor-pointer select-none">
      Branching
      <ThemeProvider theme={BranchTheme}>
        <Slider
          className="Slider"
          aria-label="Branching Factor Slider"
          value={branchingFactor}
          min={2}
          max={4}
          step={1}
          color="primary"
          onChange={(event, value) => {
            updateBranching(value);
          }}
          onChangeCommitted={(event, value) => {
            const normalized = Array.isArray(value) ? value[0] : value;
            generateTree({ branchingFactor: normalized });
          }}
        />
      </ThemeProvider>
      <div className="hidden xl:block text-[1rem] text-bg-1">{branchingFactor}</div>
    </div>
  );
};

export default BranchingController;

