import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";

import { setSpeed } from "@/redux/reducers/minimaxSlice";

const tailwindConfig = require("/tailwind.config.js");
const colors = tailwindConfig.theme.colors;

const SpeedTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors["purple"],
      light: colors["purple"],
      dark: colors["purple"],
      contrastText: "#fff",
    },
  },
});

const SpeedController = () => {
  const dispatch = useDispatch();
  const maxSpeed = useSelector((state) => state.minimax.maxSpeed);
  const speed = useSelector((state) => state.minimax.speed);

  const updateSpeed = (value) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    dispatch(setSpeed(maxSpeed - normalized));
  };

  return (
    <div className="hidden w-full h-full px-[2rem] bg-purple-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-purple text-lg hover:cursor-pointer select-none">
      Speed
      <ThemeProvider theme={SpeedTheme}>
        <Slider
          className="Slider"
          aria-label="Minimax Speed Slider"
          defaultValue={maxSpeed - speed}
          min={0}
          max={maxSpeed}
          color="primary"
          onChangeCommitted={(e, val) => updateSpeed(val)}
        />
      </ThemeProvider>
    </div>
  );
};

export default SpeedController;

