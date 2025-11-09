import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setMaxIterations } from "@/redux/reducers/aiSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const IterationsTheme = createTheme({
  palette: {
    primary: {
      main: tailwindColors["cyan"],
    },
  },
});

export default function IterationsController() {
  const dispatch = useDispatch();
  const maxIterations = useSelector((state) => state.ai.maxIterations);

  const updateIterations = (val) => {
    dispatch(setMaxIterations(val));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem]
      justify-center items-center text-text-1 font-space uppercase border-l-[10px]
      border-cyan text-lg hover:cursor-pointer select-none">
      Iterations
      <ThemeProvider theme={IterationsTheme}>
        <Slider
          className="Slider"
          aria-label="Max Iterations Slider"
          defaultValue={maxIterations}
          min={10}
          max={500}
          step={10}
          color="primary"
          onChangeCommitted={(e, val) => {
            updateIterations(val);
          }}
        />
      </ThemeProvider>
    </div>
  );
}
