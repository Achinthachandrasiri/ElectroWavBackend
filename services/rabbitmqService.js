//rabbitmqService

const amqp = require('amqplib');
const QUEUE = "sensor_data";
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";

let connection = null;
let channel = null;

async function consumeRabbitMQ(consumerCallback) {
  try {
    connection = await amqp.connect(RABBITMQ_URL);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
      reconnectRabbitMQ(consumerCallback);
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed, retrying...");
      reconnectRabbitMQ(consumerCallback);
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    console.log("✅ Connected to RabbitMQ, listening on queue:", QUEUE);

    channel.consume(
      QUEUE,
      (msg) => {
        if (msg !== null) {
          try {
            const data = JSON.parse(msg.content.toString());
            consumerCallback(data);
            channel.ack(msg);
          } catch (err) {
            console.error("Error processing message:", err.message);
            channel.nack(msg, false, true); 
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("RabbitMQ connection failed:", err.message);
    setTimeout(() => reconnectRabbitMQ(consumerCallback), 5000);
  }
}

function reconnectRabbitMQ(consumerCallback) {
  setTimeout(() => {
    console.log("🔄 Reconnecting to RabbitMQ...");
    consumeRabbitMQ(consumerCallback);
  }, 5000);
}

module.exports = { consumeRabbitMQ };
