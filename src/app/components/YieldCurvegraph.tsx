"use client";
import { Line } from "react-chartjs-2";
import { Chart, registerables, TooltipItem, ChartType } from "chart.js";

Chart.register(...registerables);

// Define a type for a single order for better type safety
interface Order {
  yield: number;
  volume: number;
  minimal_duration: number;
  maximal_duration: number;
}

// Define the props for our new component, now including 'both'
interface YieldCurveGraphProps {
  buyOrders: Order[];
  durationType: 'minimal' | 'maximal' | 'both'; // Added 'both'
  size: number;
}

/**
 * Processes buy orders to create data points for the yield curve.
 * This helper function is now outside the component for reusability.
 * 1. Filters out orders with a volume smaller than the specified size.
 * 2. Maps the remaining orders to {x, y} points for the chart.
 *    - x: duration (based on the 'type' parameter)
 *    - y: yield
 * 3. Sorts the points by duration (x-value) to draw the curve correctly.
 */
const processYieldCurveData = (
  orders: Order[],
  size: number,
  type: 'minimal' | 'maximal'
) => {
  return orders
    .filter(order => order.volume >= size)
    .map(order => ({
      x: type === "minimal" ? order.minimal_duration : order.maximal_duration,
      y: order.yield,
    }))
    .sort((a, b) => a.x - b.x);
};


const YieldCurveGraph = ({ buyOrders, durationType, size }: YieldCurveGraphProps) => {

  let data;
  
  // Conditionally set up chart data based on the durationType
  if (durationType === 'both') {
    const minimalData = processYieldCurveData(buyOrders, size, 'minimal');
    const maximalData = processYieldCurveData(buyOrders, size, 'maximal');

    data = {
      datasets: [
        {
          label: `Minimal Duration (Bids > ${size})`,
          data: minimalData,
          borderColor: "rgba(80, 80, 255, 1)", // A different color for the minimal line
          backgroundColor: "rgba(80, 80, 255, 0.2)",
          pointRadius: 0,
          tension: 0.1,
          stepped: false,
          fill: false, // This dataset acts as the lower boundary
        },
        {
          label: `Maximal Duration (Bids > ${size})`,
          data: maximalData,
          borderColor: "rgba(255, 80, 80, 1)",
          backgroundColor: "rgba(255, 80, 80, 0.2)", // Color for the shaded area
          pointRadius: 0, // Hide points for a cleaner area chart
          tension: 0.1,
          stepped: false,
          fill: '+1', // Fill the area between this dataset and the next one
        },
      ],
    };
  } else {
    // Original logic for 'minimal' or 'maximal'
    const yieldCurveData = processYieldCurveData(buyOrders, size, durationType);
    data = {
      datasets: [
        {
          label: `Yield Curve (Bids > ${size}, ${durationType} duration)`,
          data: yieldCurveData,
          stepped: false,
          backgroundColor: "rgba(255, 80, 80, 0.2)",
          borderColor: "rgba(255, 80, 80, 1)",
          pointBackgroundColor: "rgba(255, 80, 80, 1)",
          pointBorderColor: "#fff",
          fill: false,
          tension: 0.1
        },
      ],
    };
  }


  const options = {
    pointRadius: durationType === 'both' ? 0 : 4, // Hide points in 'both' mode
    pointHoverRadius: 7,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: "Duration (days)",
          color: "#0f0",
          font: { family: "'Share Tech Mono', monospace" }
        },
        ticks: { color: "#0f0", font: { family: "'Share Tech Mono', monospace" } },
        grid: { color: "rgba(0, 255, 0, 0.1)" },
      },
      y: {
        title: {
          display: true,
          text: "Yield (% APR)",
          color: "#0f0",
          font: { family: "'Share Tech Mono', monospace" }
        },
        ticks: { color: "#0f0", font: { family: "'Share Tech Mono', monospace" } },
        grid: { color: "rgba(0, 255, 0, 0.1)" },
      },
    },
    plugins: {
      title: {
        display: true,
        // Dynamic title based on the view
        text: 'Yield Curve - ' + durationType,
        color: "#0f0",
        font: { size: 18, family: "'Share Tech Mono', monospace" }
      },
      legend: {
        position: "top",
        labels: { color: "#0f0", font: { family: "'Share Tech Mono', monospace" } }
      },
      tooltip: {
        callbacks: {
          // Tooltip dynamically shows correct info
          label: function(context: TooltipItem<ChartType>) {
            let label = context.dataset.label || '';

            if (label && durationType !== 'both') {
              label = 'Order: ';
            } else if (label) {
              label += ': '; // e.g., "Maximal Duration: "
            }

            if (context.parsed.y !== null) {
              label += `${context.parsed.y}% APR for ${context.parsed.x} days`;
            }
            return label;
          }
        }
      }
    },
  };

  return <Line data={data as any} options={options as any} />;
};

export default YieldCurveGraph;