import { EventEmitter } from 'events';
import RabbitServer from './server';
import type { Options } from 'amqplib';
import type { RabbitProducerMessage } from './global';

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
   * @deprecated
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

  /**
   * Publishes a message to a RabbitMQ exchange.
   * @param exchange The name of the exchange to publish the message to.
   * @param options The options for publishing the message.
   * @param options.message The message to publish.
   * @param options.type The type of the exchange. Defaults to 'fanout'.
   * @param options.options The options to pass to the `publish` method.
   * @param options.routingKey The routing key to use when publishing the message.
   * @returns A promise that resolves once the message has been published.
   * @throws {Error} If the message could not be published.
   * @emits produce The message has been published.
   * @emits error An error occurred while publishing the message.
   */
  public async publish(
    exchange: string,
    {
      message,
      type = 'fanout',
      options,
      routingKey = '',
    }: RabbitProducerMessage
  ): Promise<void> {
    try {
      const channel = this.server.getChannel();
      const payload = Buffer.from(
        typeof message === 'string' ? message : JSON.stringify(message)
      );
      await channel.assertExchange(exchange, type, { durable: true });
      channel.publish(exchange, routingKey, payload, {
        persistent: true,
        ...options?.optionsPublish,
      });
      // await channel.assertQueue(queue, { durable: true });
      // await channel.bindQueue(queue, exchange, options?.bindQueue || '');
      this.emit('produce', message);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

export default Producer;
