import { useDispatch, useSelector, useStore } from "react-redux";
import { setRunning, resetStats, setCentroids } from "@/redux/reducers/aiSlice";
import { performAlgorithmStep, initializeKMeansCentroids } from "../AIUtils/algorithms";

const StartButton = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const running = useSelector((state) => state.ai.running);
  const maxIterations = useSelector((state) => state.ai.maxIterations);
  const speed = useSelector((state) => state.ai.speed);
  const algoId = useSelector((state) => state.page.algoId);

  const startTraining = async () => {
    dispatch(resetStats());
    
    // Initialize centroids for K-means if needed
    if (algoId === "k-means-clustering") {
      const centroids = initializeKMeansCentroids();
      dispatch(setCentroids(centroids));
    }
    
    dispatch(setRunning(true));
    
    let currentIterations = 0;
    let isRunning = true;
    
    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      isRunning = store.getState().ai.running;
    });
    
    while (currentIterations < maxIterations && isRunning) {
      performAlgorithmStep();
      currentIterations++;
      
      // Wait based on speed slider
      const delay = Math.max(1, (200 - speed) / 10);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    
    unsubscribe();
    dispatch(setRunning(false));
  };

  const handleStop = () => {
    dispatch(setRunning(false));
  };

  return (
    <div className="relative w-full h-full lg:max-w-[250px] flex">
      {!running ? (
        <div
          className="w-full h-full bg-green-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-[1rem] md:text-lg hover:cursor-pointer hover:bg-green hover:text-bg-1 select-none leading-[105%]"
          onClick={startTraining}
        >
          Train
        </div>
      ) : (
        <div
          className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
          onClick={handleStop}
        >
          Stop
        </div>
      )}
    </div>
  );
};

export default StartButton;
