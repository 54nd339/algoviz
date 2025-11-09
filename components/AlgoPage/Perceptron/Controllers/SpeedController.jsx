import { useDispatch, useSelector } from "react-redux";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setSpeed } from "@/redux/reducers/perceptronSlice";

const tailwindConfig = require("/tailwind.config.js");
const colors = tailwindConfig.theme.colors;

const SpeedTheme = createTheme({
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

const SpeedController = () => {
  const dispatch = useDispatch();
  const speed = useSelector((state) => state.perceptron.speed);
  const maxSpeed = useSelector((state) => state.perceptron.maxSpeed);

  const handleChange = (value) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    dispatch(setSpeed(normalized));
  };

  return (
    <div className="hidden w-full h-full px-[2rem] bg-yellow-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-yellow text-lg hover:cursor-pointer select-none">
      Speed
      <ThemeProvider theme={SpeedTheme}>
        <Slider
          className="Slider"
          aria-label="Speed Slider"
          value={speed}
          min={0}
          max={maxSpeed}
          step={50}
          color="primary"
          onChange={(event, value) => {
            handleChange(value);
          }}
        />
      </ThemeProvider>
      <div className="hidden xl:block text-[1rem] text-bg-1">{speed}ms</div>
    </div>
  );
};

export default SpeedController;
