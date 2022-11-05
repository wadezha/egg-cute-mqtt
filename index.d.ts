
import { Context } from "egg";

declare class MQTTClient {
  channel: MQTTChannel;
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
  inMiddleware: Array<string>;
  outMiddleware: Array<string>;
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