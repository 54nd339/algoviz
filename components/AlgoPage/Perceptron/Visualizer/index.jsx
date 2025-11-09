import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TopBar from "@/components/TopBar";

const VisualizerContainer = () => {
  const network = useSelector((state) => state.perceptron.network);
  const currentInput = useSelector((state) => state.perceptron.currentInput);
  const currentOutput = useSelector((state) => state.perceptron.currentOutput);
  const [canvasReady, setCanvasReady] = useState(false);
  const [nodePositions, setNodePositions] = useState({});
  const [draggingNode, setDraggingNode] = useState(null);
  const canvas = useRef(null);

  // Get node position (either dragged or default)
  const getNodePosition = (layerIndex, nodeIndex, defaultX, defaultY) => {
    const key = `${layerIndex}-${nodeIndex}`;
    if (nodePositions[key]) {
      return nodePositions[key];
    }
    return { x: defaultX, y: defaultY };
  };

  // Check if a point is inside a circle (for hit detection)
  const isPointInCircle = (px, py, cx, cy, radius) => {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  };

  // Draw function
  const drawNetwork = () => {
    if (!canvas.current || !network) return;

    const ctx = canvas.current.getContext("2d");
    const width = canvas.current.width;
    const height = canvas.current.height;

    // Clear canvas - transparent background
    ctx.clearRect(0, 0, width, height);

    if (!network || network.length === 0) return;

    const padding = 120;
    const numLayers = network.length;
    const availableWidth = width - 2 * padding;
    const layerWidth = availableWidth / (numLayers + 1);
    const nodeRadius = 22;
    const verticalSpacing = 70;

    // Enable better rendering
    ctx.imageSmoothingEnabled = true;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Calculate all default positions first
    const defaultPositions = {};
    for (let i = 0; i < network.length; i++) {
      const layer = network[i];
      const layerHeight = Math.max(1, layer.neurons.length - 1) * verticalSpacing;
      const startY = (height - layerHeight) / 2;
      const x = padding + i * layerWidth;
      
      for (let j = 0; j < layer.neurons.length; j++) {
        const y = startY + j * verticalSpacing;
        const key = `${i}-${j}`;
        defaultPositions[key] = { x, y };
      }
    }

    // Draw connections
    for (let i = 0; i < network.length - 1; i++) {
      const layer = network[i];
      const nextLayer = network[i + 1];

      for (let j = 0; j < layer.neurons.length; j++) {
        const pos1 = getNodePosition(i, j, defaultPositions[`${i}-${j}`].x, defaultPositions[`${i}-${j}`].y);
        const x1 = pos1.x;
        const y1 = pos1.y;

        for (let k = 0; k < nextLayer.neurons.length; k++) {
          const pos2 = getNodePosition(i + 1, k, defaultPositions[`${i + 1}-${k}`].x, defaultPositions[`${i + 1}-${k}`].y);
          const x2 = pos2.x;
          const y2 = pos2.y;

          // Weight-based color and thickness
          const weight = layer.weights && layer.weights[k] ? layer.weights[k][j] || 0 : 0;
          const intensity = Math.min(Math.abs(weight) * 300, 255);
          const thickness = Math.abs(weight) * 4 + 1.5;

          if (weight > 0) {
            ctx.strokeStyle = `rgba(0, ${Math.floor(intensity)}, 220, 0.7)`;
          } else {
            ctx.strokeStyle = `rgba(${Math.floor(intensity)}, 120, 0, 0.7)`;
          }

          ctx.lineWidth = thickness;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Draw weight label at midpoint
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          
          // Draw a small background for better readability
          const text = weight.toFixed(2);
          const textWidth = ctx.measureText(text).width;
          ctx.fillStyle = "rgba(30, 30, 40, 0.85)";
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          
          // Draw border around weight
          ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          
          ctx.fillStyle = "rgba(220, 220, 240, 1)";
          ctx.font = "bold 11px 'Courier New', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, midX, midY);
        }
      }
    }

    // Draw nodes for each layer
    for (let i = 0; i < network.length; i++) {
      const layer = network[i];

      // Layer label
      ctx.fillStyle = "rgba(120, 220, 150, 1)";
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Layer ${i}`, defaultPositions[`${i}-0`].x, 30);

      for (let j = 0; j < layer.neurons.length; j++) {
        const pos = getNodePosition(i, j, defaultPositions[`${i}-${j}`].x, defaultPositions[`${i}-${j}`].y);
        const x = pos.x;
        const y = pos.y;

        const value = layer.neurons[j] && layer.neurons[j].value ? layer.neurons[j].value : 0;
        const intensity = Math.floor(Math.min(Math.max(value, 0) * 255, 255));

        // Draw node circle with gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius);
        gradient.addColorStop(0, `rgba(100, ${intensity}, 240, 0.9)`);
        gradient.addColorStop(1, `rgba(50, ${Math.floor(intensity * 0.7)}, 200, 0.8)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw border with glow
        ctx.strokeStyle = `rgba(120, 200, 255, 0.8)`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw outer glow
        ctx.strokeStyle = `rgba(100, 200, 255, 0.3)`;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Draw value text
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value.toFixed(2), x, y);

        // Draw bias below the node
        const bias = layer.biases[j] || 0;
        const biasColor = bias >= 0 ? "rgba(100, 200, 100, 0.9)" : "rgba(200, 100, 100, 0.9)";
        const biasY = y + nodeRadius + 20;
        
        ctx.fillStyle = "rgba(30, 30, 40, 0.8)";
        const biasText = `b:${bias.toFixed(2)}`;
        const biasTextWidth = ctx.measureText(biasText).width;
        ctx.fillRect(x - biasTextWidth / 2 - 3, biasY - 10, biasTextWidth + 6, 16);
        
        ctx.strokeStyle = biasColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - biasTextWidth / 2 - 3, biasY - 10, biasTextWidth + 6, 16);
        
        ctx.fillStyle = biasColor;
        ctx.font = "bold 9px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(biasText, x, biasY);
      }
    }

    // Draw input values if available
    if (currentInput && currentInput.length > 0) {
      const x = padding - layerWidth * 0.6;
      ctx.fillStyle = "rgba(150, 220, 180, 1)";
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Input", x, 30);

      for (let j = 0; j < currentInput.length; j++) {
        const value = currentInput[j] || 0;
        const intensity = Math.floor(Math.min(Math.max(value, 0) * 255, 255));
        const defaultPos = defaultPositions[`0-${j}`];
        const y = defaultPos ? defaultPos.y : height / 2;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius);
        gradient.addColorStop(0, `rgba(${intensity}, 150, 240, 0.9)`);
        gradient.addColorStop(1, `rgba(${Math.floor(intensity * 0.7)}, 100, 200, 0.8)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "rgba(200, 180, 150, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.strokeStyle = "rgba(200, 180, 150, 0.3)";
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value.toFixed(2), x, y);
      }
    }

    // Draw output value
    if (currentOutput !== null) {
      const x = padding + (numLayers) * layerWidth;
      const y = height / 2;

      ctx.fillStyle = "rgba(150, 220, 180, 1)";
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Output", x, 30);

      const intensity = Math.floor(Math.min(Math.max(currentOutput, 0) * 255, 255));
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius + 4);
      gradient.addColorStop(0, `rgba(${intensity}, 150, 255, 0.9)`);
      gradient.addColorStop(1, `rgba(${Math.floor(intensity * 0.7)}, 100, 220, 0.8)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius + 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "rgba(200, 150, 150, 0.8)";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.strokeStyle = "rgba(200, 150, 150, 0.3)";
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(currentOutput.toFixed(3), x, y);
    }
  };

  // Draw when canvas is ready or when dependencies change
  useEffect(() => {
    if (canvas.current) {
      setCanvasReady(true);
      drawNetwork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, currentInput, currentOutput, nodePositions]);

  // Handle mouse down
  const handleMouseDown = (e) => {
    if (!canvas.current || !network) return;

    const rect = canvas.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padding = 120;
    const numLayers = network.length;
    const availableWidth = canvas.current.width - 2 * padding;
    const layerWidth = availableWidth / (numLayers + 1);
    const nodeRadius = 22;
    const verticalSpacing = 70;
    const height = canvas.current.height;

    // Check each node to see if clicked
    for (let i = 0; i < network.length; i++) {
      const layer = network[i];
      for (let j = 0; j < layer.neurons.length; j++) {
        const key = `${i}-${j}`;
        const layerHeight = Math.max(1, layer.neurons.length - 1) * verticalSpacing;
        const startY = (height - layerHeight) / 2;
        const defaultX = padding + i * layerWidth;
        const defaultY = startY + j * verticalSpacing;

        const pos = getNodePosition(i, j, defaultX, defaultY);

        if (isPointInCircle(mouseX, mouseY, pos.x, pos.y, nodeRadius)) {
          setDraggingNode({ key, offsetX: mouseX - pos.x, offsetY: mouseY - pos.y });
          return;
        }
      }
    }
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!draggingNode || !canvas.current) return;

    const rect = canvas.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setNodePositions((prev) => ({
      ...prev,
      [draggingNode.key]: {
        x: mouseX - draggingNode.offsetX,
        y: mouseY - draggingNode.offsetY,
      },
    }));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  return (
    <div
      className="relative w-full min-h-[60vh] border-[1px] border-border-1 bg-graphPattern select-none overflow-x-auto"
      style={{ maxWidth: '100%', boxSizing: 'border-box', overflowX: 'auto' }}
    >
      <TopBar />
      <div className="min-h-[50vh] py-[2rem]">
        <div style={{ maxWidth: '76vw', width: '100%', margin: '0 auto' }}>
          {network && network.length > 0 ? (
            <div
              className="relative flex justify-start items-start"
              style={{ width: 'max-content' }}
            >
              <canvas
                ref={canvas}
                width={1400}
                height={500}
                style={{
                  display: "block",
                  position: 'relative',
                  zIndex: 10,
                  cursor: draggingNode ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          ) : (
            <div className="text-text-3 font-space uppercase tracking-[0.1em]">
              Generate a network to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizerContainer;
