import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setSpeed } from "@/redux/reducers/gameOfLifeSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const SpeedTheme = createTheme({
  palette: {
    SpeedPrimary: {
      main: tailwindColors["green"],
    },
    SpeedSecondary: {
      main: tailwindColors["green-bg"],
    },
  },
});

const SpeedController = () => {
  const dispatch = useDispatch();
  const speed = useSelector((state) => state.gameOfLife.speed);
  const maxSpeed = useSelector((state) => state.gameOfLife.maxSpeed);

  const handleChange = (event, newValue) => {
    dispatch(setSpeed(newValue));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-green-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-lg hover:cursor-pointer select-none">
      Speed
      <ThemeProvider theme={SpeedTheme}>
        <Slider
          className="Slider"
          aria-label="Game of Life Speed Slider"
          defaultValue={maxSpeed - speed}
          min={0}
          max={maxSpeed}
          color="SpeedPrimary"
          onChange={(e, val) => {
            dispatch(setSpeed(maxSpeed - val));
          }}
        />
      </ThemeProvider>
    </div>
  );
};

export default SpeedController;
