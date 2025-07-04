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