import { EventEmitter } from 'events';
import RabbitServer from './server';
import type { Options } from 'amqplib';

class Producer extends EventEmitter {
  private server: RabbitServer;
  /**
   * Creates a new instance of the Producer class.
   * @param server The RabbitServer instance to use to send messages.
   */
  constructor(server: RabbitServer) {
    super();
    this.server = server;
  }
  /**
   * Sends a message to a RabbitMQ queue.
   * @param queue The name of the queue to send the message to.
   * @param exchange The name of the exchange to publish the message to.
   * @param message The message to send.
   * @param options Optional options to pass to the `publish` method.
   * @returns A promise that resolves once the message has been sent.
   */
  public async sendMessage(
    queue: string,
    exchange: string,
    message: string,

    options?: {
      optionsQueue?: Options.AssertQueue;
      optionsExchange?: Options.AssertExchange;
      optionsPublish?: Options.Publish;
      bindQueue?: string;
    }
  ) {
    const channel = this.server.getChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, options?.bindQueue || '');
    channel.publish(
      exchange,
      '',
      Buffer.from(message),
      options?.optionsPublish
    );
    this.emit('produce', queue);
  }
}

export default Producer;
