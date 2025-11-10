import { useDispatch, useSelector } from "react-redux";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { setActivationFunction } from "@/redux/reducers/perceptronSlice";

const ActivationController = () => {
  const dispatch = useDispatch();
  const activationFunction = useSelector(
    (state) => state.perceptron.activationFunction
  );

  const handleChange = (event) => {
    dispatch(setActivationFunction(event.target.value));
  };

  return (
    <div className="hidden w-full h-full px-[2rem] bg-yellow-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-yellow text-lg hover:cursor-pointer select-none">
      Activation
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <Select
          value={activationFunction}
          onChange={handleChange}
          sx={{
            color: "white",
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.5)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e5c454",
            },
            ".MuiSvgIcon-root": {
              color: "white",
            },
          }}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="relu">ReLU</MenuItem>
          <MenuItem value="sigmoid">Sigmoid</MenuItem>
          <MenuItem value="tanh">Tanh</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default ActivationController;
