import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setLearningRate } from "@/redux/reducers/aiSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const LearningRateTheme = createTheme({
  palette: {
    LearningRatePrimary: {
      main: tailwindColors["yellow"],
    },
    LearningRateSecondary: {
      main: tailwindColors["yellow-bg"],
    },
  },
});

export default function LearningRateController() {
  const dispatch = useDispatch();
  const learningRate = useSelector((state) => state.ai.learningRate);

  const updateLearningRate = (val) => {
    dispatch(setLearningRate(val / 100));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-yellow-bg lg:flex gap-[1.5rem]
      justify-center items-center text-text-1 font-space uppercase border-l-[10px]
      border-yellow text-lg hover:cursor-pointer select-none">
      Learning Rate
      <ThemeProvider theme={LearningRateTheme}>
        <Slider
          className="Slider"
          aria-label="Learning Rate Slider"
          defaultValue={learningRate * 100}
          min={1}
          max={50}
          step={1}
          color="LearningRatePrimary"
          onChangeCommitted={(e, val) => {
            updateLearningRate(val);
          }}
        />
      </ThemeProvider>
    </div>
  );
}
