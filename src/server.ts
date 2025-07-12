import amqp, { Channel, ChannelModel } from 'amqplib';
import { EventEmitter } from 'events';
class RabbitServer extends EventEmitter {
  /**
   * The singleton instance of the RabbitServer class.
   * @private
   */
  private static instance: RabbitServer;

  /**
   * The amqplib server instance.
   * @private
   */
  private server = amqp;

  /**
   * The URL of the RabbitMQ server to connect to.
   * @private
   */
  private url: string;

  /**
   * The RabbitMQ connection.
   * @private
   */
  public connection!: ChannelModel;

  /**
   * The RabbitMQ channel.
   * @private
   */
  private channel!: Channel;

  /**
   * Constructs a new instance of the RabbitServer class.
   * @param url The URL of the RabbitMQ server to connect to.
   * @throws {Error} If no URL is provided.
   * @private
   */
  private constructor(url?: string) {
    if (!url) throw new Error('No url provided');
    super();
    this.url = url;
  }

  /**
   * Initializes the RabbitServer instance by connecting to the RabbitMQ server
   * and establishing a channel.
   * @returns A promise that resolves once the connection and channel have been
   * established.
   * @throws {Error} If the connection to the RabbitMQ server fails.
   */

  /**
   * Indicates whether the RabbitServer instance is connected to the RabbitMQ server.
   * @internal
   */
  private isConnected = false;

/**
 * Registers a callback to be invoked when the RabbitMQ server connection is established.
 * If the connection is already established, the callback is invoked immediately.
 * Otherwise, the callback is registered to be called once the 'connect' event is emitted.
 *
 * @param callback The callback function to execute upon connection.
 */

  public onConnect(callback: () => void) {
    if (this.isConnected) {
      callback();
      return;
    }
    this.once('connect', callback);
  }

  private async init(): Promise<void> {
    try {
      this.connection = await this.server.connect(this.url);
      this.channel = await this.connection.createChannel();
      this.connection.on('error', (err) => {
        throw new Error(err.message);
      });
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
      });
      this.isConnected = true;
    } catch (error) {
      throw new Error(
        JSON.stringify({ message: 'Error connecting to RabbitMQ', error })
      );
    }
  }

  /**
   * Returns the singleton instance of the RabbitServer class.
   * If no instance has been created yet, it will create a new one
   * and initialize it.
   * @param url The url of the RabbitMQ server to connect to.
   * @returns A promise that resolves with the instance of RabbitServer.
   */
  public static async getInstance(url?: string): Promise<RabbitServer> {
    if (!RabbitServer.instance) {
      RabbitServer.instance = new RabbitServer(url);
      await RabbitServer.instance.init();
    }
    return RabbitServer.instance;
  }

  /**
   * Returns the RabbitMQ channel.
   * @returns The channel object.
   */
  public getChannel(): Channel {
    return this.channel;
  }
  /**
   * Closes the connection to the RabbitMQ server and the channel.
   * @returns A promise that resolves once the connection and channel have been
   * closed.
   */

  public async close() {
    await this.channel.close();
    await this.connection.close();
  }
}
export default RabbitServer;
