import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setSpeed } from "@/redux/reducers/graphSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const SpeedTheme = createTheme({
  palette: {
    SpeedPrimary: {
      main: tailwindColors["purple"],
    },
    SpeedSecondary: {
      main: tailwindColors["purple-bg"],
    },
  },
});

export default function SpeedController() {
  const dispatch = useDispatch();
  const maxSpeed = useSelector((s) => s.graph.maxSpeed);
  const speed = useSelector((s) => s.graph.speed);

  const updateAlgoSpeed = (val) => {
    dispatch(setSpeed(val));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-purple-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-purple text-lg hover:cursor-pointer select-none">
      Speed
      <ThemeProvider theme={SpeedTheme}>
        <Slider
          className="Slider"
          aria-label="Graph Speed Slider"
          defaultValue={speed}
          min={50}
          max={maxSpeed ?? 1000}
          color="SpeedPrimary"
          onChangeCommitted={(e, val) => updateAlgoSpeed(val)}
        />
      </ThemeProvider>
    </div>
  );
}
