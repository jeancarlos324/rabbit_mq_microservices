import type { Channel, ConsumeMessage, Options } from 'amqplib';
/**
 * Options for creating a RabbitMQ queue.
 * @typedef {Object} RabbitOptions
 * @property {string} queue - The name of the RabbitMQ queue.
 * @property {string} exchange - The name of the RabbitMQ exchange.
 */
export interface RabbitOptions {
  queue: string;
  exchange: string;
}

export interface RabbitProducerMessage {
  message: string | Record<string, unknown>;
  type?: 'fanout' | 'direct' | 'topic' | 'headers';
  routingKey?: string;
  options?: {
    optionsQueue?: Options.AssertQueue;
    optionsExchange?: Options.AssertExchange;
    optionsPublish?: Options.Publish;
    bindQueue?: string;
  };
}

export interface RabbitConsumerMessage {
  type?: 'fanout' | 'direct' | 'topic' | 'headers';
  routingKeys: string[];
  optionsQueue?: Options.AssertQueue;
  optionsExchange?: Options.AssertExchange;
  optionsConsume?: Options.Consume;
  prefetch?: number;
}

export interface RetryConsumerMessage {
  queue: string;
  exchange: string;
  retryDelay: number;
  routingKey: string[];
  typeExchange?: 'fanout' | 'direct' | 'topic' | 'headers';
}

export interface IRabbitListeners {
  [queue: string]: {
    exchange: string;
    handler: (data: uknown) => Promise<void> | void;
    maxRetries: number;
    retryDelay: number;
  };
}