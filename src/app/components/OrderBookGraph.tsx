"use client";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const OrderBookGraph = ({ buyOrders, sellOrders }: any) => {
  const processOrders = (orders: any[], type: "buy" | "sell") => {
    let cumulativeVolume = 0;
    return orders
      .sort((a, b) => (type === "sell" ? a.yield - b.yield : b.yield - a.yield))
      .map((order) => {
        cumulativeVolume += order.volume;
        return { x: order.yield, y: cumulativeVolume };
      })
      .sort((a, b) => a.x - b.x);
  };

  let buyData = processOrders(buyOrders, "buy");
  let sellData = processOrders(sellOrders, "sell");

  if (buyData.length > 0 && sellData.length > 0) {
    let middle_value = (sellData[0].x + buyData[buyData.length - 1].x) / 2;
    buyData.push({x: middle_value, y: 0});
    sellData.unshift({x: middle_value, y: 0});
  }

  const data = {
    // labels: labels,
    datasets: [
      {
        stepped: true,
        label: "Borrow Orders (Bids)",
        data: buyData.reverse(),
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        borderColor: "rgba(255, 80, 80, 1)",
        pointBackgroundColor: "rgba(255, 80, 80, 1)",
        pointBorderColor: "#0f0",
        fill: "start",
      },
      {
        stepped: true,
        label: "Lend Orders (Asks)",
        data: sellData,
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        borderColor: "rgba(80, 255, 80, 1)",
        pointBackgroundColor: "rgba(80, 255, 80, 1)",
        pointBorderColor: "#fff",
        fill: "start",
      },
    ],
  };

  const options = {
    pointRadius: 3,
    pointHoverRadius: 6,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: "Yield (% APR)", color: "#0f0" },
        ticks: { color: "#0f0", font: { family: "'Share Tech Mono', monospace" } },
        grid: { color: "rgba(0, 255, 0, 0.1)" },
      },
      y: {
        title: { display: true, text: "Cumulative Volume", color: "#0f0" },
        ticks: { color: "#0f0", font: { family: "'Share Tech Mono', monospace" } },
        grid: { color: "rgba(0, 255, 0, 0.1)" },
      },
    },
    plugins: {
      title: { display: true, text: "Order Book Depth", color: "#0f0", font: { size: 18, family: "'Share Tech Mono', monospace" } },
      legend: { position: "top", labels: { color: "#0f0", font: { family: "'Share Tech Mono', monospace" } } },
    },
  };

  return <Line data={data as any} options={options as any} />;
};

export default OrderBookGraph;