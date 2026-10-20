export interface SourceCredit {
  sourceId: string; sourceName: string; sourceUrl: string; sourceEntryId: string;
  license: string; licenseUrl: string; rightsStatus: string; attributionRequired: boolean;
  credit: string; notice: string; changes: string[];
  importer: { username: string; accountKind?: 'import' };
  dialect?: string; transliteration?: string;
}
export interface SourceExample {
  text: string; language: 'ar' | 'en' | 'ar-Latn'; script: 'Arabic' | 'Latin'; kind: string;
  id?:number|string; groupId?:string; alignment?:string; sourceId?:string; sourceEntryId?:string;
  generated?:boolean; generationMethod?:string; derivedFromExampleId?:number|string; derivedFromArabic?:string;
}
export interface SourcePronunciation {
  scheme: string; value: string; language: string; kind: string;
  sourceId: string; sourceName: string; sourceUrl: string; sourceEntryId: string; dialect: string;
}
export interface ProvenanceContent {
  definitionLanguages?: string[];
  arabicWord?: string;
  francoArabicWord?:string|null;
  sourceCredits?: SourceCredit[];
  sourceExamples?: SourceExample[];
  sourcePronunciations?: SourcePronunciation[];
  canonicalWordId?: number;
  dialect?: string;
  meaningForms?: {meaningId:string;arabic:string;franco:string;dialect:string;sourceId:string}[];
}
export function attributionText(credits: SourceCredit[] = []): string {
  return credits.filter(c => c.attributionRequired).map(c =>
    c.credit + ' — ' + c.sourceUrl + ' — ' + c.license + ' ' + c.licenseUrl +
    (c.notice ? '\n' + c.notice : '') + (c.changes.length ? '\nChanges: ' + c.changes.join(' ') : '')).join('\n\n');
}
