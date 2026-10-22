import type {ProvenanceContent} from '../src/types/provenance';
export interface Country {countryCode:string;countryName:string}
export interface RelatedWord {wordId:number;word:string;isArabic:number|boolean}
export interface WordDefinition extends ProvenanceContent {
  id:number;wordId:number;definitionId?:number;isArabic:number|boolean;definition:string;
  word:{id:number;arabicWord:string;francoArabicWord:string|null};
  countryCode?:string|null;example?:string|null;arabicExample?:string|null;
  isLiked?:number|boolean;isDisliked?:number|boolean;isReported?:number|boolean;
  arabicSpellings?:string[];francoSpellings?:string[];
}
export interface WordData {
  rows: WordDefinition[];
  related?: {country?:Country|null;byLanguage?:{en?:{results:RelatedWord[]};ar?:{results:RelatedWord[]}}};
}
export interface RenderSeed {word?:boolean;wordData?:WordData;personalized?:boolean;browse?:unknown;countries?:Country[];notFound?:boolean}
export type FetchData = <T = unknown>(path:string) => Promise<T>;
export interface RenderedApplication {
  html:string;head:string;robots:string;assets:string;state:string;
  language:string;theme:string;grain:boolean;
}
