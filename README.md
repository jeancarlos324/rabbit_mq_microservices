# Rabbitmq microservices package

[![npm version](https://badge.fury.io/js/rabbit_mq_microservices.svg)](https://badge.fury.io/js/rabbit_mq_microservices)

This is a package that allows you to create microservices with RabbitMQ and TypeScript in a simple and easy way.

## Installation

```bash
npm install rabbit_mq_microservices
```

#### Types

```bash
npm install --save-dev @types/rabbit_mq_microservices
```

## Getting started

### Set up

```typescript
import { RabbitServer } from 'rabbit_mq_microservices';

const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);

const chanel = server.getChannel();
```

## Producer/Consumer

### Producer

```typescript
import { RabbitServer, Producer } from 'rabbit_mq_microservices';

const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);
const producer = new Producer(chanel);
producer.sendMessage('queue_name', 'exchange_name', 'message', {
  persistent: true,
});
```

### Consumer

```typescript
import { RabbitServer, Consumer } from 'rabbit_mq_microservices';

const server = await RabbitServer.getInstance(
  'amqp://user:password@localhost:port'
);
const consumer = new Consumer(server);
consumer.consume<typeof message>('my-queue', (msg) => {
  console.log('Received message:', msg);
});
```

## API Reference

### Interfaces

### `Global setup`

- `url:string ` - The url of the RabbitMQ server to connect to.

#### `Producer`

- `queue_name:string ` - The name of the queue to send the message to.
- `exchange_name:string ` - The name of the exchange to publish the message to.
- `message:string ` - The message to send.
- `options:Options.Publish ` - Optional options to pass to the `publish` method.

#### `Consumer`

- `queue_name:string ` - The name of the queue to consume from.
- `exchange_name:string ` - The name of the exchange to consume from.
- `callback:(msg: K) => void ` - The callback function to call with each message.

### Clases

- `RabbitServer.getInstance(url?: string): Promise<RabbitServer>`
- `new Producer(server: RabbitServer)`
- `new Consumer(server: RabbitServer)`
