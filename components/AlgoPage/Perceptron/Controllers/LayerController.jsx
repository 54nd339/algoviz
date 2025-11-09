import { useDispatch, useSelector } from "react-redux";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setLayers } from "@/redux/reducers/perceptronSlice";
import { initializeNetwork } from "../PerceptronUtils/algorithms";
import { setNetwork } from "@/redux/reducers/perceptronSlice";

const tailwindConfig = require("/tailwind.config.js");
const colors = tailwindConfig.theme.colors;

const LayerTheme = createTheme({
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

const LayerController = () => {
  const dispatch = useDispatch();
  const layers = useSelector((state) => state.perceptron.layers);
  const maxLayers = useSelector((state) => state.perceptron.maxLayers);
  const neuronsPerLayer = useSelector(
    (state) => state.perceptron.neuronsPerLayer
  );

  const handleChange = (value) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    dispatch(setLayers(normalized));
    const network = initializeNetwork(2, normalized, neuronsPerLayer);
    dispatch(setNetwork(network));
  };

  return (
    <div className="hidden w-full h-full px-[2rem] bg-purple-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-purple text-lg hover:cursor-pointer select-none">
      Layers
      <ThemeProvider theme={LayerTheme}>
        <Slider
          className="Slider"
          aria-label="Layers Slider"
          value={layers}
          min={1}
          max={maxLayers}
          step={1}
          color="primary"
          onChange={(event, value) => {
            handleChange(value);
          }}
        />
      </ThemeProvider>
      <div className="hidden xl:block text-[1rem] text-bg-1">{layers}</div>
    </div>
  );
};

export default LayerController;
