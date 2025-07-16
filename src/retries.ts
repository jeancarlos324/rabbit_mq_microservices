import EventEmitter from 'events';
import { Channel } from 'amqplib';
import type { RetryConsumerMessage } from './global';

class Retry extends EventEmitter {
  public static queue = 'retry';

  constructor() {
    super();
  }
  public static async sendQueue(
    channel: Channel,
    {
      queue,
      exchange,
      retryDelay,
      typeExchange = 'topic',
      routingKey,
    }: RetryConsumerMessage
  ): Promise<string> {
    const retryQueue = [queue, this.queue].join('.');
    const retryExchange = exchange;
    const args = {
      ['x-message-ttl']: retryDelay,
      ['x-dead-letter-exchange']: retryExchange,
    };
    await channel.assertExchange(retryExchange, typeExchange, {
      durable: true,
    });
    for (const key of routingKey) {
      await channel.assertQueue(retryQueue, {
        durable: true,
        arguments: { ...args, ['x-dead-letter-routing-key']: key },
      });
      await channel.bindQueue(queue, retryExchange, key);
    }
    return retryQueue;
  }
}
export default Retry;
