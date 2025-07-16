# Rabbitmq microservices package
![Rabbit mq](https://www.rabbitmq.com/img/rabbitmq-logo-with-name.svg)
[![npm version](https://badge.fury.io/js/rabbit_mq_microservices.svg)](https://badge.fury.io/js/rabbit_mq_microservices)

This is a package that allows you to create microservices with RabbitMQ and TypeScript in a simple and easy way.

## Installation

```bash
npm install rabbit_mq_microservices
```

### If you want use amqplib dependence, install types

```bash
npm install --save-dev @types/amqplib
```

#### Types

```bash
npm install --save-dev @types/rabbit_mq_microservices
```

## Getting started

### Nomenclature

- `<service>.topic` - Topic name
- `<service>.<action>.queue` - Queue custom name
- `<service>.<action>.queue.retry` - Queue retry custom name
- `<service>.<action>` - Key routing
- `dlx.topic` - Dead letter exchange

### Clases

#### Instances

- `RabbitServer.getInstance(url?: string): Promise<RabbitServer>`[View source](#set-up)
- `new Producer(server: RabbitServer)`[View source](#producer)
- `new Consumer(server: RabbitServer)`[View source](#consumer)

#### Statics

- `Retry.sendQueue(channel: Channel, message: RetryConsumerMessage): Promise<string>`[View source](#retries-queue)

- `DeadLetterMessage.publish(channel: Channel, message: DeadLetterMessage): Promise<void>`[View source](#dead-letter)

### Set up

```typescript
import { RabbitServer } from 'rabbit_mq_microservices';

const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);

const chanel = server.getChannel();
```

## API Reference

### Interfaces

### `Global setup`

- `url:string ` - The url of the RabbitMQ server to connect to.

## Producer/Consumer

### Producer

```typescript
import { RabbitServer, Producer } from 'rabbit_mq_microservices';

const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);
// example message with set interval to send a message every 5 seconds
const producer = new Producer(server);
const topic = 'producer.topic';
const routingKey = 'producer.delete';
const message = { id: 2, message: 'hello world' };
const typeTopic = 'topic';

setInterval(async () => {
  aux++;
  message.id = aux;
  await producer.publish(topic, {
    message: JSON.stringify(message),
    type: typeTopic,
    routingKey: routingKey,
  });
}, 5000);

producer.on('produce', (queue) => {
  console.log(`Message sent to queues: ${queue}`);
});
```

#### API Reference Producer

### `Producer.publish` class

- `topic:string ` - The name of the exchange to publish the message to.
- `options:RabbitProducerMessage ` - The options for publishing the message.

#### `RabbitProducerMessage` interface

- `message: string | Record<string, unknown>` - The message to publish.
- `type?: 'fanout' | 'direct' | 'topic' | 'headers'` - The type of the exchange. Defaults to 'fanout'.
- `routingKey?: string` - The routing key to use when publishing the message.
- `options?: Options.Publish` - The options to pass to the `publish` method.

### Consumer

```typescript
import { RabbitServer, Consumer } from 'rabbit_mq_microservices';
const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);

import { RabbitServer, Consumer } from 'rabbit_mq_microservices';

const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);

const consumerQueue = 'consumer.delete.queue';
const producerTopic = 'producer.topic';
const typeTopic = 'topic';
const routingKey = 'producer.delete';

const consumer = new Consumer(server);
consumer.consumeQueue(
  consumerQueue,
  producerTopic,
  async (msg, channel) => {
    if (!msg) throw new Error('No message received', { cause: msg });
    try {
      const data = JSON.parse(msg.content.toString());
      // Do something with the message
      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, false);
    }
  },
  { type: typeTopic, routingKeys: [routingKey] }
);

consumer.on('consume', (queue) => {
  console.log(`Message received from queue: ${queue}`);
});
```

#### API Reference Consumer

#### `Consumer` class

- `queue_name:string ` - The name of the queue to consume from.
- `exchange_name:string ` - The name of the exchange to consume from.
- `callback:(msg: K) => void ` - The callback function to call with each message.

#### `RabbitConsumerMessage` interface

- `queue: string` - The name of the queue to consume from.
- `exchange: string` - The name of the exchange to consume from.
- `type?: 'fanout' | 'direct' | 'topic' | 'headers'` - The type of the exchange. Defaults to 'fanout'.
- `routingKeys?: string[]` - The routing keys to use when consuming the message.
- `options?: Options.Consume` - The options to pass to the `consume` method.

### Retries Queue

```typescript
import { RabbitServer, Retry } from 'rabbit_mq_microservices';
try {
  // Do something with the message when dont have error
} catch (error) {
  const retryCount = msg.properties.headers?.['x-retry'] || 0;
  if (
    retryCount >= maxTries // Max tries
  ) {
    // Do something with the message when fail 3 times or send to dead letter
    return;
  }
  const queue = 'consumer.delete.queue';
  const exchange = 'producer.topic';
  const retryDelay = 5000;
  const typeExchange = 'topic';
  const routingKey = ['producer.delete'];
  const retryHeaders = { 'x-retry': retryCount + 1 };
  const retryQueue = await Retry.sendQueue(channel, {
    queue,
    exchange,
    retryDelay,
    typeExchange,
    routingKey,
  });
  channel.sendToQueue(retryQueue, msg.content, {
    persistent: true,
    headers: retryHeaders,
  });
  channel.ack(msg);
}
```

### Dead Letter

```typescript
try {
  // Do something with the message when dont have error
} catch (error) {
  const retryCount = msg.properties.headers?.['x-retry'] || 0;
  const queueName = 'consumer.delete.queue';
  const exchangeName = 'dlx.topic';
  const typeExchangeName = 'topic';
  const routingKeyName = 'producer.delete';
  const message = msg;
  const headers = {
    'x-code': 500,
    'x-reason': 'Error processing message',
  };

  if (retryCount >= maxTries) {
    await DeadLetterMessage.publish(channel, {
      queue: queueName,
      exchange: exchangeName,
      typeExchange: typeExchangeName,
      routingKey: routingKeyName,
      msg: message,
      headers,
    });
    channel.ack(msg);
    return;
  }
}
```

### Complete Example

```typescript
import Consumer from './src/consumer';
import Producer from './src/producer';
import Retry from './src/retries';
import DeadLetterMessage from './src/deadLetter';
import RabbitServer from './src/server';

class server {
  public static async main() {
    const url = 'amqp://admin:adminroot@server.rabbit.auladm.com:5672';
    const server = await RabbitServer.getInstance(url);
    server.onConnect(() => {
      console.log('Connected to RabbitMQssss');
    });

    // Producer Service
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

    // Consumer Service
    const consumer = new Consumer(server);
    consumer.consumeQueue(
      'consumer.delete.queue',
      'producer.topic',
      async (msg, channel) => {
        if (!msg) throw new Error('No message received', { cause: msg });
        try {
          const data = JSON.parse(msg.content.toString());
          if (typeof data !== 'string')
            throw new Error('No message received', { cause: msg });
          channel.ack(msg);
        } catch (error) {
          const retryCount = msg.properties.headers?.['x-retry'] || 0;
          if (retryCount >= 3) {
            // Dead letter queue section
            await DeadLetterMessage.publish(channel, {
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
          // Retries queue section
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
  }
}

server.main();
```
