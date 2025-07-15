// import amqp, { Options, Channel, ChannelModel } from 'amqplib';
import { Consumer, Producer, Retry, DeadLetter, RabbitServer } from './src';
import { config } from 'dotenv';
config();
class server {
  public static async main() {
    const url = process.env.RABBITMQ_URL;
    console.log(url);
    const server = await RabbitServer.getInstance(url);
    server.onConnect(() => {
      console.log('Connected to RabbitMQssss');
    });
    server.connection.on('error', (err) => {
      console.error('RabbitMQ connection error test:', err);
    });
    const consumer = new Consumer(server);
    consumer.consumeQueue(
      'consumer.delete.queue',
      'producer.topic',
      async (msg, channel) => {
        if (!msg) throw new Error('No message received', { cause: msg });
        try {
          const data = JSON.parse(msg.content.toString());
          console.log(data);
          // if (typeof data !== 'string')
          //   throw new Error('No message received', { cause: msg });
          channel.ack(msg);
        } catch (error) {
          const retryCount = msg.properties.headers?.['x-retry'] || 0;
          if (retryCount >= 3) {
            await DeadLetter.publish(channel, {
              queue: 'consumer.delete.queue',
              exchange: 'dlx.topic',
              typeExchange: 'topic',
              routingKey: 'producer.delete',
              msg: msg,
              headers: {
                'x-code': 500,
                'x-reason': 'Error processing message',
              },
            });
            channel.ack(msg);
            return;
          }
          const retryQueue = await Retry.sendQueue(channel, {
            queue: 'consumer.delete.queue',
            exchange: 'producer.topic',
            retryDelay: 5000,
            typeExchange: 'topic',
            routingKey: ['producer.delete'],
          });
          channel.sendToQueue(retryQueue, msg.content, {
            persistent: true,
            headers: { 'x-retry': retryCount + 1 },
          });
          channel.ack(msg);
        }
      },
      { type: 'topic', routingKeys: ['producer.delete'] }
    );

    consumer.on('consume', (queue) => {
      console.log(`Message received from queue: ${queue}`);
    });

    let aux = 0;
    const message = { id: 2, message: 'hello world' };
    const producer = new Producer(server);

    setInterval(async () => {
      aux++;
      message.id = aux;
      await producer.publish('producer.topic', {
        message: JSON.stringify(message),
        type: 'topic',
        routingKey: 'producer.delete',
      });
    }, 5000);
    producer.on('produce', (queue) => {
      console.log(`Message sent to queues: ${queue}`);
    });
  }
}

server.main();
