declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      HOST: string;
      PORT: number;
      USERNAME: string;
      PASSWORD: string;
      DATABASE: string;
    }
  }
}