// import amqp, { Options, Channel, ChannelModel } from 'amqplib';
import Consumer from './src/consumer';
import Producer from './src/producer';
// class RabbitServer {
//   private server = amqp;
//   private url = 'amqp://admin:adimroot@localhost';
//   private static instance: RabbitServer;
//   private connection!: ChannelModel;
//   private channel!: Channel;

//   public static async getInstance(): Promise<RabbitServer> {
//     if (!RabbitServer.instance) {
//       RabbitServer.instance = new RabbitServer();
//       await RabbitServer.instance.init();
//     }
//     return RabbitServer.instance;
//   }

//   private constructor() {}

//   private async init(): Promise<void> {
//     try {
//       this.connection = await this.server.connect(this.url);
//       this.channel = await this.connection.createChannel();
//       this.connection.on('error', (err) => {
//         console.error('RabbitMQ connection error:', err);
//       });
//       this.connection.on('close', () => {
//         console.log('RabbitMQ connection closed');
//       });
//       console.log('Connected to RabbitMQ');
//     } catch (error) {
//       throw new Error('Failed to connect to RabbitMQ');
//     }
//   }

//   public getChannel(): Channel {
//     return this.channel;
//   }

//   public async close() {
//     await this.channel.close();
//     await this.connection.close();
//   }
// }
// export default RabbitServer;

// class Producer {
//   public async sendMessage(
//     queue: string,
//     message: string,
//     options?: Options.Publish
//   ) {
//     const server = await RabbitServer.getInstance();
//     const channel = server.getChannel();
//     await channel.assertExchange(queue + '_exchange', 'fanout', {
//       durable: true,
//     });
//     await channel.assertQueue(queue + '_queue', { durable: true });
//     await channel.bindQueue(queue + '_queue', queue + '_exchange', '');
//     // channel.publish(queue + '_exchange', '', Buffer.from(message), options);
//     // await channel.assertExchange(queue, 'fanout', { durable: true });
//     channel.publish(queue + '_exchange', '', Buffer.from(message), options);
//     // channel.assertQueue(queue, { durable: true });
//     // channel.sendToQueue(queue, Buffer.from(message), options);
//     console.log(`Message sent to queue: ${queue}`);
//   }
// }

// class Consumer {
//   public async consume<K = unknown>(queue: string, callback: (msg: K) => void) {
//     const server = await RabbitServer.getInstance();
//     const channel = server.getChannel();
//     const uniqueQueue = queue + '_queue' + Date.now();
//     // const uniqueQueue = queue;
//     await channel.assertExchange(queue + '_exchange', 'fanout', {
//       durable: true,
//     });
//     await channel.assertQueue(uniqueQueue, { durable: true });
//     await channel.bindQueue(uniqueQueue, queue + '_exchange', '');
//     channel.consume(
//       uniqueQueue,
//       (msg) => {
//         try {
//           if (msg) {
//             const data = JSON.parse(msg.content.toString());
//             callback(data);
//             channel.ack(msg);
//           } else {
//             console.log('No message received');
//           }
//         } catch (error) {
//           console.error('Error processing message:', error);
//         }
//       },
//       { noAck: false }
//     );
//     console.log(`Waiting for messages in queue: ${queue}`);
//   }
// }
// let aux = 0;
// const message = { id: 2, message: 'hello world' };

// setInterval(() => {
//   aux++;
//   const producer = new Producer();
//   message.id = aux;
//   producer.sendMessage('my-queue', JSON.stringify(message), {
//     persistent: true,
//   });
// }, 5000);

// const consumer = new Consumer();
// consumer.consume<typeof message>('my-queue', (msg) => {
//   console.log('Received message:', msg);
// });

// const ga = async () => {
//   const patito = await RabbitServer.getInstance();
//   const ganzito = patito.getChannel();
//   ganzito.deleteQueue('my-queue_queue1751638450966');
// };

// ga();

import RabbitServer from './src/server';
class server {
  public static async main() {
    const url = 'amqp://admin:adminroot@server.rabbit.auladm.com:5672';
    const server = await RabbitServer.getInstance(url);
    server.onConnect(() => {
      console.log('Connected to RabbitMQssss');
    });

    // server.connection.on('error', (err) => {
    //   console.error('RabbitMQ connection error test:', err);
    // });
    // 'amqp://admin:adimroot@localhost'
    // const channel = server.getChannel();
    // await channel.assertQueue('my-queue_queue1751638450966', { durable: true });
    // await channel.assertQueue('notifications_queue', { durable: true });
    // channel.consume(
    //   'notifications_queue',
    //   (msg) => {
    //     if (msg) {
    //       const data = JSON.parse(msg.content.toString());
    //       console.log(data);
    //       channel.ack(msg);
    //     }
    //   },
    //   { noAck: false }
    // );
    // const consumer = new Consumer(server);
    // consumer.consume('my-queue-unique', 'my-exchange', (msg, channel) => {
    //   try {
    //     if (!msg) throw new Error('No message received', { cause: msg });
    //     const data = JSON.parse(msg.content.toString());
    //     console.log(data);
    //     channel.ack(msg);
    //   } catch (error) {
    //     console.error('Error processing message:', error);
    //   }
    // });

    // consumer.on('consume', (queue) => {
    //   console.log(`Message received from queue: ${queue}`);
    // });
    // let aux = 0;
    // const message = { id: 2, message: 'hello world' };
    // const producer = new Producer(server);
    // setInterval(() => {
    //   aux++;
    //   message.id = aux;
    //   producer.sendMessage('my-queue', 'my-exchange', JSON.stringify(message), {
    //     persistent: true,
    //   });
    // }, 3000);
    // producer.on('produce', (queue) => {
    //   console.log(`Message sent to queues: ${queue}`);
    // });
  }
}

server.main();
