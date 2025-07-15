import { Channel, ConsumeMessage } from 'amqplib';

interface DeadLetterMessage {
  queue: string;
  exchange: string;
  routingKey: string;
  typeExchange?: 'fanout' | 'direct' | 'topic' | 'headers';
  msg: ConsumeMessage;
  headers?: Record<string, unknown>;
}

class DeadLetter {
  public static queue = 'dead';
  public static async publish(
    channel: Channel,
    {
      queue,
      exchange,
      typeExchange = 'topic',
      routingKey = '',
      msg,
      headers,
    }: DeadLetterMessage
  ) {
    const deadLetter = [this.queue, queue].join('.');
    await channel.assertExchange(exchange, typeExchange, {
      durable: true,
    });
    await channel.assertQueue(deadLetter, { durable: true });
    await channel.bindQueue(deadLetter, exchange, routingKey);
    channel.publish(exchange, routingKey, msg.content, {
      persistent: true,
      headers: {
        ...msg,
        ...headers,
        'x-dead-lettered-at': new Date().toISOString(),
      },
    });
  }
}

export default DeadLetter;
