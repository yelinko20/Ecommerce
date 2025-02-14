/**
 * Represents the configuration options for the queue system.
 *
 * @property {string} host - The hostname or IP address of the Redis server.
 * @property {string} port - The port number on which the Redis server is running.
 */
export type QueueConfig = {
  /** The hostname or IP address of the Redis server. */
  host: string;
  /** The port number on which the Redis server is running. */
  port: number;

  url: string;
};
