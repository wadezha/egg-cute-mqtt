
import { Context } from "egg";

export declare class Chain {
  private chain;
  private channel;
  ctx: Context;
  protected constructor(ctx: Context);
  protected next(...args: any[]): Promise<void>;
}

export declare class Parser {
  ctx: Context;
  protected constructor(ctx: Context);
}

declare class MQTTClient {
  channel: MQTTChannel;
  parser: any;
  chain: any;
}

declare class MQTTChannel {
  publish(topic: string, message: any, options?: any): Promise<any>;
  subscribe(topic: string, options?: any): Promise<any>;
  unsubscribe(topic: string, options?: any): Promise<any>;

  end(force?: boolean, options?: any): Promise<any>;
  removeOutgoingMessage(mId: string): Promise<any>;
  reconnect(): Promise<any>;
  handleMessage(packet: any): Promise<any>;
  getLastMessageId(): Promise<any>;
  on(event: string, cb: Function): Promise<any>;
}

interface WillTopic {
  topic: string;
  payload: string;
  qos: number;
  retain: boolean;
}

interface ClientOptions {
  keeplive: number;
  reconnectPeriod: number;
  connectTimeout: number;
  protocolId: string;
  protocolVersion: number;
  dataFormat: string;
  
  clean: boolean;
  rejectUnauthorized?: boolean;
  will?: WillTopic;
  onlinePayload: string;
}

interface ClientConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  clientId: string;

  options?: ClientOptions;
  topics: Array<any>;
  parserPath: string;
  chainPath: string;
  inChain: Array<string>;
  outChain: Array<string>;
}

interface EggClientConfig {
  app?: boolean;
  agent?: boolean;
  client?: ClientConfig;
  clients?: Record<string, ClientConfig>;
}

declare module 'egg' {
  interface Application {
    mqtt: MQTTClient & Singleton<MQTTClient>;
  }

  interface EggAppConfig {
    mqtt: EggClientConfig;
  }
}
