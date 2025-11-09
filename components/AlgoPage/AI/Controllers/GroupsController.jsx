import Slider from "@mui/material/Slider";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setK } from "@/redux/reducers/aiSlice";

let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

const GroupsTheme = createTheme({
  palette: {
    GroupsPrimary: {
      main: tailwindColors["cyan"],
    },
    GroupsSecondary: {
      main: tailwindColors["cyan-bg"],
    },
  },
});

export default function GroupsController() {
  const dispatch = useDispatch();
  const k = useSelector((state) => state.ai.k);

  const updateK = (val) => {
    dispatch(setK(val));
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-cyan-bg lg:flex gap-[1.5rem]
      justify-center items-center text-text-1 font-space uppercase border-l-[10px]
      border-cyan text-lg hover:cursor-pointer select-none">
      K Groups
      <ThemeProvider theme={GroupsTheme}>
        <Slider
          className="Slider"
          aria-label="Groups Slider"
          defaultValue={k}
          min={1}
          max={10}
          step={1}
          color="GroupsPrimary"
          onChangeCommitted={(e, val) => {
            updateK(val);
          }}
        />
      </ThemeProvider>
    </div>
  );
}
