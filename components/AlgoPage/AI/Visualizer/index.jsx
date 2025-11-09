import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import TopBar from "@/components/TopBar";
import * as Colors from "@/components/AlgoPage/AI/AIUtils/colors.js";
import { addPoint } from "@/redux/reducers/aiSlice";

export default function VisualizerContainer() {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const dataPoints = useSelector((state) => state.ai.dataPoints);
  const slope = useSelector((state) => state.ai.slope);
  const intercept = useSelector((state) => state.ai.intercept);
  const algoId = useSelector((state) => state.page.algoId);
  const boundsRef = useRef({ minX: -5, maxX: 5, minY: -5, maxY: 5 });

  // Handle mouse clicks to add points (for KNN and Linear Regression)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (algoId !== "knn" && algoId !== "linear-regression")) return;

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert screen coordinates to data coordinates
      const padding = 60;
      const plotWidth = canvas.width - 2 * padding;
      const plotHeight = canvas.height - 2 * padding;

      const bounds = boundsRef.current;
      const dataX = bounds.minX + ((clickX - padding) / plotWidth) * (bounds.maxX - bounds.minX);
      const dataY = bounds.maxY - ((clickY - padding) / plotHeight) * (bounds.maxY - bounds.minY);

      // Add the new point
      dispatch(addPoint({ x: dataX, y: dataY }));
    };

    canvas.addEventListener("click", handleCanvasClick);
    return () => canvas.removeEventListener("click", handleCanvasClick);
  }, [algoId, dispatch]);

  useEffect(() => {
    if (!canvasRef.current || dataPoints.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Render based on algorithm type
    if (algoId === "linear-regression") {
      renderLinearRegressionVisualization(canvas, ctx, dataPoints, slope, intercept);
    } else if (algoId === "knn") {
      renderKNNVisualization(canvas, ctx, dataPoints);
    } else if (algoId === "k-means") {
      renderKMeansVisualization(canvas, ctx, dataPoints);
    }

  }, [dataPoints, slope, intercept, algoId]);

  const renderLinearRegressionVisualization = (canvas, ctx, dataPoints, slope, intercept) => {
    const padding = 60;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;

    // Find min/max values for scaling
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    dataPoints.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    // Add padding to ranges
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    minX -= rangeX * 0.1;
    maxX += rangeX * 0.1;
    minY -= rangeY * 0.1;
    maxY += rangeY * 0.1;

    // Update bounds ref for click handler
    boundsRef.current = { minX, maxX, minY, maxY };

    // Conversion functions
    const toCanvasX = (x) => padding + ((x - minX) / (maxX - minX)) * plotWidth;
    const toCanvasY = (y) => canvas.height - padding - ((y - minY) / (maxY - minY)) * plotHeight;

    // Clear canvas
    ctx.fillStyle = Colors.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = Colors.GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * plotWidth;
      const y = padding + (i / 10) * plotHeight;
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw axes
    ctx.strokeStyle = Colors.AXIS_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = Colors.TEXT_COLOR;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("X", canvas.width - padding + 20, canvas.height - padding + 15);
    ctx.save();
    ctx.translate(padding - 30, padding - 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Y", 0, 0);
    ctx.restore();

    // Draw data points
    ctx.fillStyle = Colors.DATA_POINTS_COLOR;
    dataPoints.forEach((point) => {
      const canvasX = toCanvasX(point.x);
      const canvasY = toCanvasY(point.y);
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw regression line
    if (dataPoints.length > 0) {
      ctx.strokeStyle = Colors.FIT_LINE_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const startX = minX;
      const endX = maxX;
      const startY = slope * startX + intercept;
      const endY = slope * endX + intercept;

      ctx.moveTo(toCanvasX(startX), toCanvasY(startY));
      ctx.lineTo(toCanvasX(endX), toCanvasY(endY));
      ctx.stroke();
    }
  };

  const renderKNNVisualization = (canvas, ctx, dataPoints) => {
    const padding = 60;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;

    // Find min/max values for scaling
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    dataPoints.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    // Add padding to ranges
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    minX -= rangeX * 0.1;
    maxX += rangeX * 0.1;
    minY -= rangeY * 0.1;
    maxY += rangeY * 0.1;

    // Update bounds ref for click handler
    boundsRef.current = { minX, maxX, minY, maxY };

    // Conversion functions
    const toCanvasX = (x) => padding + ((x - minX) / (maxX - minX)) * plotWidth;
    const toCanvasY = (y) => canvas.height - padding - ((y - minY) / (maxY - minY)) * plotHeight;

    // Clear canvas
    ctx.fillStyle = Colors.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = Colors.GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * plotWidth;
      const y = padding + (i / 10) * plotHeight;
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw axes
    ctx.strokeStyle = Colors.AXIS_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = Colors.TEXT_COLOR;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("X", canvas.width - padding + 20, canvas.height - padding + 15);
    ctx.save();
    ctx.translate(padding - 30, padding - 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Y", 0, 0);
    ctx.restore();

    // Draw data points with different colors for different classes
    dataPoints.forEach((point) => {
      const canvasX = toCanvasX(point.x);
      const canvasY = toCanvasY(point.y);
      
      // Color based on class
      if (point.class === -1) {
        ctx.fillStyle = "#9CA3AF"; // Gray for unclassified
      } else {
        // Use dynamic color based on class/group
        ctx.fillStyle = Colors.getGroupColor(point.class);
      }
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add border
      ctx.strokeStyle = Colors.AXIS_COLOR;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const renderKMeansVisualization = (canvas, ctx, dataPoints) => {
    // K-means visualization will be implemented here
    ctx.fillStyle = Colors.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = Colors.TEXT_COLOR;
    ctx.font = "16px Arial";
    ctx.fillText("K-Means Visualization - Coming Soon", canvas.width / 2 - 120, canvas.height / 2);
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] border-[1px] border-border-1 bg-graphPattern overflow-hidden select-none">
      <TopBar />
      <canvas
        ref={canvasRef}
        id="visualizer-container"
        className="w-full h-full"
      />
    </div>
  );
}
