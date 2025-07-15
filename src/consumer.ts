import { EventEmitter } from 'events';
import RabbitServer from './server';
import type { Channel, ConsumeMessage, Options } from 'amqplib';
import { IRabbitListeners, RabbitConsumerMessage } from './types/global';

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
    @deprecated
  */
  public async consume(
    queue: string,
    exchange: string,
    callback: (msg: ConsumeMessage | null, channel: Channel) => void,
    options?: {
      optionsQueue?: Options.AssertQueue;
      optionsExchange?: Options.AssertExchange;
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
/**
 * Consumes messages from a RabbitMQ queue with specified routing keys.
 * @param queue The name of the queue to consume from.
 * @param exchange The name of the exchange to consume from.
 * @param callback The callback function to handle each message.
 * @param {RabbitConsumerMessage} options Options for consuming messages.
 * @param {string} [options.type='fanout'] The type of the exchange.
 * @param {string[]} options.routingKeys The routing keys to bind the queue to.
 * @param {Options.AssertExchange} [options.optionsExchange] Options for asserting the exchange.
 * @param {Options.AssertQueue} [options.optionsQueue] Options for asserting the queue.
 * @param {number} [options.prefetch=10] The number of messages to prefetch.
 * @throws {Error} If no message is received or if the message could not be acknowledged.
 * @emits consume Emitted when a message is received from the queue.
 */

  public async consumeQueue(
    queue: string,
    exchange: string,
    callback: (msg: ConsumeMessage | null, channel: Channel) => void,
    {
      type = 'fanout',
      routingKeys,
      optionsExchange,
      optionsQueue,
      prefetch = 10,
    }: RabbitConsumerMessage
  ) {
    const channel = this.server.getChannel();
    await channel.assertExchange(exchange, type, {
      durable: true,
      ...optionsExchange,
    });
    await channel.assertQueue(queue, {
      durable: true,
      ...optionsQueue,
    });
    for (const key of routingKeys) {
      await channel.bindQueue(queue, exchange, type === 'fanout' ? '' : key);
    }
    channel.prefetch(prefetch);
    channel.consume(
      queue,
      (msg) => {
        if (!msg) throw new Error('No message received', { cause: msg });
        callback(msg, channel);
      },
      { noAck: false }
    );
    this.emit('consume', queue);
  }
}

export default Consumer;
