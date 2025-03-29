import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import SummaryApi from "../common";

const RevenueStatistics = () => {
  const [chartData, setChartData] = useState({ topProducts: [], salesByMonth: [] });
  const [loading, setLoading] = useState(true);
  const formattedData = [
    chartData.topProducts.slice(0, 5).reduce((acc, product) => {
      acc[product.name] = product.sales;
      return acc;
    }, { name: "Sản phẩm" })
  ];

  const FIXED_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];


  const fetchOrderStatistics = async () => {
    try {
      const response = await fetch(SummaryApi.revenueStatistics.url);
      const data = await response.json();
      setChartData(data);
      console.log(data);
      console.log("salesByMonth Data:", chartData.salesByMonth);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatistics();
  }, []);

  if (loading) {
    return <div className="text-center p-4">⏳ Đang tải dữ liệu...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Top 5 Sản phẩm bán chạy</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart width={500} height={300} data={formattedData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData.topProducts.slice(0, 5).map((product, index) => (
              <Bar
                key={product.name}
                dataKey={product.name}
                name={product.name}
                fill={FIXED_COLORS[index]}
              />
            ))}
          </BarChart>

        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Thống kê doanh số theo tháng</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.salesByMonth}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'dataMax']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#FF0000" strokeWidth={2} />
            {chartData.salesByMonth.length > 0 &&
              Object.keys(chartData.salesByMonth[0])
                .filter((key) => key !== "date" && key !== "totalSales")
                .map((key, index) => (
                  <Line key={index} type="monotone" dataKey={key} stroke={FIXED_COLORS[index % FIXED_COLORS.length]} strokeWidth={2} />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueStatistics;
