// //config/rabbitmq

// const amqp = require('amqplib');
// let channel;

// async function connectRabbitMQ() {
//   const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
//   channel = await connection.createChannel();
//   await channel.assertQueue('sensor_data', { durable: true });
//   return channel;
// }

// function getChannel() {
//   if (!channel) throw new Error('RabbitMQ channel not initialized');
//   return channel;
// }

// module.exports = { connectRabbitMQ, getChannel };



// config/rabbitmq.js  
const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
  while (true) {
    try {
      connection = await amqp.connect('amqp://guest:guest@localhost:5672', {
        heartbeat: 60
      });

      channel = await connection.createChannel();
      await channel.assertQueue('sensor_data', { durable: true });

      console.log('RabbitMQ AMQP connected successfully');

      // Handle connection errors gracefully
      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        console.warn('RabbitMQ connection closed. Reconnecting in 5s...');
        setTimeout(connectRabbitMQ, 5000);
      });

      return channel;

    } catch (err) {
      console.error('Failed to connect to RabbitMQ:', err.message);
      console.log('Retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

function getChannel() {
  if (!channel) throw new Error('Channel not ready yet');
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };