//config/rabbitmq

const amqp = require('amqplib');
let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  channel = await connection.createChannel();
  await channel.assertQueue('sensor_data', { durable: true });
  return channel;
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };


