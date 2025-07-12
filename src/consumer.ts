import { EventEmitter } from 'events';
import RabbitServer from './server';
import type { Channel, ConsumeMessage, Options } from 'amqplib';

class Consumer extends EventEmitter {
  private server: RabbitServer;
  /**
   * Creates a new instance of the Consumer class.
   * @param server The RabbitServer instance to use to consume messages.
   */
  constructor(server: RabbitServer) {
    super();
    this.server = server;
  }
  /**
   * Consume messages from a RabbitMQ queue.
   * @param queue The name of the queue to consume from.
   * @param exchange The name of the exchange to consume from.
   * @param callback The callback function to call with each message.
   * @returns A promise that resolves once the consumer has been started.
   * @throws {Error} If the queue, exchange, or bind operation fails.
   * @throws {Error} If the callback function throws an error.
   * @throws {Error} If the message could not be acknowledged.
   */
  public async consume(
    queue: string,
    exchange: string,
    callback: (msg: ConsumeMessage | null, channel: Channel) => void,
    options?: {
      optionsQueue: Options.AssertQueue;
      optionsExchange: Options.AssertExchange;
    }
  ) {
    const channel = this.server.getChannel();
    await channel.assertExchange(exchange, 'fanout', {
      durable: true,
      ...options?.optionsExchange,
    });
    await channel.assertQueue(queue, {
      durable: true,
      ...options?.optionsQueue,
    });
    await channel.bindQueue(queue, exchange, '');
    /**
     * Callback for consuming messages from a queue.
     * @param msg The message, or null if none was received.
     * @throws {Error} If no message was received.
     * @throws {Error} If the message content was not valid JSON.
     * @throws {Error} If the message could not be acknowledged.
     * @returns {void}
     */
    // const messageCallback = (msg: ConsumeMessage | null) => {
    //   try {
    //     if (!msg) throw new Error('No message received', { cause: msg });
    //     const data = JSON.parse(msg.content.toString());
    //     callback(data);
    //     channel.ack(msg);
    //   } catch (error) {
    //     console.error('Error processing message:', error);
    //   }
    // };
    channel.consume(
      queue,
      (msg) => {
        if (!msg) throw new Error('No message received', { cause: msg });
        callback(msg, channel);
      },
      { noAck: false }
    );
    this.emit('connect', queue);
  }
}

export default Consumer;
