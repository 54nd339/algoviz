import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setNodeCount } from "@/redux/reducers/graphSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const CountTheme = createTheme({
  palette: {
    CountPrimary: {
      main: tailwindColors["cyan"],
    },
    CountSecondary: {
      main: tailwindColors["cyan-bg"],
    },
  },
});

export default function CountController() {
  const dispatch = useDispatch();
  const nodeCount = useSelector((s) => s.graph.nodeCount);

  const updateNodeCount = (val) => {
    dispatch(setNodeCount(val));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-cyan text-lg hover:cursor-pointer select-none">
      Nodes
      <ThemeProvider theme={CountTheme}>
        <Slider
          className="Slider"
          aria-label="Node Count Slider"
          defaultValue={nodeCount}
          min={4}
          max={20}
          color="CountPrimary"
          onChangeCommitted={(e, val) => updateNodeCount(val)}
        />
      </ThemeProvider>
    </div>
  );
}
