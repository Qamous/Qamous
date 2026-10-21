export interface Country {countryCode:string;countryName:string}
export interface RenderSeed {word?:boolean;browse?:unknown;countries?:Country[];notFound?:boolean}
export type FetchData = <T = unknown>(path:string) => Promise<T>;
export interface RenderedApplication {
  html:string;head:string;robots:string;assets:string;state:string;
  language:string;theme:string;grain:boolean;
}
