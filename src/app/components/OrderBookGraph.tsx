import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const OrderBookGraph = ({ buyOrders, sellOrders }: any) => {
  // Convert order data into cumulative totals for graph
  const processOrders = (orders: any, type: any) => {
    let cumulativeVolume = 0;
    return orders
      .sort((a: any, b: any) => (type === "sell" ? a.yield - b.yield : b.yield - a.yield))
      .map((order: any) => {
        cumulativeVolume += order.volume;
        return { x: order.yield, y: cumulativeVolume };
      })
      .sort((a: any, b: any) => (a.x - b.x))
  };

  let buyData = processOrders(buyOrders, "buy");
  let sellData = processOrders(sellOrders, "sell");

  let left = buyData.map((data: any) => data.x);
  const right = sellData.map((data: any) => data.x);
  
  let labels = left.concat(right);

  if (buyData.length > 0 && sellData.length > 0) {
    let middle_value = (sellData[0].x + buyData[buyData.length - 1].x) / 2;
    buyData.push({x: middle_value, y: 0});
    sellData.unshift({x: middle_value, y: 0});
    labels = left.concat([middle_value]).concat(right);
  }

  console.log(buyData);
  console.log(sellData);

  
  const data = {
    labels: labels,
    datasets: [
      {
        stepped: 'after',
        label: "Borrow Orders",
        data: buyData, //buyData.map(data => data.y).concat(Array.from({length: 2 + sellData.length}, (_, i) => 0)),
        backgroundColor: "rgba(0, 200, 0, 0.2)",
        borderColor: "rgba(0, 200, 0, 1)",
      },
      {
        stepped: 'before',
        label: "Lend Orders",
        data: sellData, //Array.from({length: 2 + buyData.length}, (_, i) => 0).concat(sellData.map(data => data.y)),
        backgroundColor: "rgba(200, 0, 0, 0.2)",
        borderColor: "rgba(200, 0, 0, 1)",
      },
    ],
  };

  const options = {
    pointStyle: 'circle',
    pointRadius: 5,
    pointHoverRadius: 10,
    fill: true,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Yield, in % (APR)",
          color: "#ffffff", // Ensure the text is visible on dark backgrounds
        },
        ticks: {
          color: "#ffffff", // Ensure the ticks are visible
        },
      },
      y: {
        title: {
          display: true,
          text: "Cumulative Volume",
          color: "#ffffff", // Ensure the text is visible on dark backgrounds
        },
        ticks: {
          color: "#ffffff", // Ensure the ticks are visible
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Order Book",
        color: "#ffffff", // Ensure the title text is visible
        font: {
          size: 20, // Increase the font size
        },
      },
      legend: {
        position: "top",
        labels: {
          color: "#ffffff", // Ensure the legend text is visible
        },
      },
    },
  };

  return (
      <Line data={data as any} options={options as any} />
  );
};

export default OrderBookGraph;
