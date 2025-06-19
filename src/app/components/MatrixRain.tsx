"use client";

import { useEffect, useRef, useState } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState('');

  // Effect to fetch the code from the text file (no changes here)
  useEffect(() => {
    fetch('/cairo_code.txt')
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((text) => setCode(text))
      .catch((error) => console.error("Error fetching the code file:", error));
  }, []);

  // Effect to run the animation logic, now with horizontal scrolling
  useEffect(() => {
    const fps = 15;
    const frameDuration = 1000 / fps;
    
    if (!code) return; // Don't run animation until code is loaded

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    const alphabet = code;//.replace(/\s/g, '');
    const fontSize = 20;
    const rows = Math.floor(canvas.height / fontSize);

    // Create an array of stream objects, one for each row
    const horizontalStreams: { x: number; speed: number, start: number }[] = [];
    for (let i = 0; i < rows; i++) {
        horizontalStreams.push({
            // Start at a random horizontal position
            x: Math.random() * canvas.width,
            // Assign a random speed for a more organic feel
            speed: 0.1 * (0.5 + Math.random() * 2.5),
            // Start value
            start: Math.floor(Math.random() * alphabet.length),
        });
    }

    let animationFrameId: number;

    const draw = async () => {
      // const now = performance.now();
      // if (now - lastFrameTime < frameDuration) {
      //   animationFrameId = requestAnimationFrame(draw);
      //   return;
      // }
      // lastFrameTime = now;
      // The semi-transparent background creates the fading trail effect
      // Adjust alpha based on canvas width: smaller width = higher alpha (more fading)
      const minAlpha = 0.02;
      const maxAlpha = 0.08;
      const minWidth = 400;
      const maxWidth = 1000;
      const alpha =
        maxAlpha -
        ((Math.min(Math.max(canvas.width, minWidth), maxWidth) - minWidth) /
          (maxWidth - minWidth)) *
          (maxAlpha - minAlpha);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#34D399'; // Aesthetic green color
      ctx.font = `${fontSize}px monospace`;

      // Iterate over each stream and draw/update it
      horizontalStreams.forEach((stream, index) => {
        const currentChar = alphabet.charAt(stream.start);
        stream.start = (stream.start + 1) % alphabet.length; // Increment start position
        // Y position is determined by the row index
        const y = (index + 1) * fontSize;

        // Draw the character at the stream's current x, y position
        ctx.fillText(currentChar, stream.x, y);

        // Move the stream to the right
        stream.x += fontSize/2;//*stream.speed;

        // If the stream has moved off the right side of the screen,
        // reset it to the left side to create a continuous loop.
        if (stream.x > canvas.width) {
          stream.x = -fontSize; // Start just off-screen
        }
      });

      // Sleep for a bit to control frame rate (even if handled above)
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(frameDuration);
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [code]); // Re-run effect if code changes

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        background: '#000',
      }}
    />
  );
};

export default MatrixRain;