const express = require("express");
const http = require("http");
const cors = require("cors");
const { generateSensorData } = require("./utils/sensorUtils");
const { connectRabbitMQ } = require("./config/rabbitmq");
const { startSensorService } = require("./services/consumerService");
const { sendFourMinAverage } = require("./services/electricityCostService");
const sensorRoutes = require('./routes/sensor');
const connectDB = require("./config/database");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = 5000;
const QUEUE = "sensor_data";

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/api', sensorRoutes);

//  Connect to MongoDB
connectDB().then(() => {
  console.log("Database connected, starting RabbitMQ producer and consumer...");

  // --- Producer: generate fake sensor data every 4 sec ---
  connectRabbitMQ()
    .then((channel) => {
      console.log("Producer connected to RabbitMQ");

      setInterval(() => {
        const data = generateSensorData();
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
        console.log("[RAW DATA PUSHED → RabbitMQ]", data);
      }, 4000);

      // --- Start consumer + average calculation service ---
      startSensorService(io, QUEUE);
    })
    .catch(console.error);

  // --- Socket.IO connection ---
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send 4-min average from DB every 10 seconds
    const avgInterval = setInterval(() => {
      sendFourMinAverage(io);
    }, 10000);

    // Send monthly bill based on daily average every 1 hour (or adjust as needed)
    const monthlyInterval = setInterval(async () => {
      const monthlyBill = await calculateMonthlyBillFromDailyAverage();
      io.emit("monthly-bill", monthlyBill);
      console.log(" Monthly Bill Sent:", monthlyBill);
    }, 60 * 60 * 1000); // every hour

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      clearInterval(avgInterval);
      clearInterval(monthlyInterval);
    });
  });
  // --- Start server ---
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
