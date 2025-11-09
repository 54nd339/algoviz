import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setClusters, setCentroids } from "@/redux/reducers/aiSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const ClustersTheme = createTheme({
  palette: {
    primary: {
      main: tailwindColors["cyan"],
    },
  },
});

export default function ClustersController() {
  const dispatch = useDispatch();
  const clusters = useSelector((state) => state.ai.clusters);

  const updateClusters = (val) => {
    dispatch(setClusters(val));
    // Reset centroids when cluster count changes
    dispatch(setCentroids([]));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem]
      justify-center items-center text-text-1 font-space uppercase border-l-[10px]
      border-cyan text-lg hover:cursor-pointer select-none">
      Clusters
      <ThemeProvider theme={ClustersTheme}>
        <Slider
          className="Slider"
          aria-label="Clusters Slider"
          defaultValue={clusters}
          min={1}
          max={10}
          step={1}
          color="primary"
          onChangeCommitted={(e, val) => {
            updateClusters(val);
          }}
        />
      </ThemeProvider>
    </div>
  );
}
