import React from 'react';
import {ArabicInput} from './ArabicInput';
import SymbolInput from './SymbolInput';
export default function ReadingFields({ar,word,reading,transliteration,ipa,open,onToggle,onChange}:{
 ar:boolean;word:string;reading:string;transliteration:string;ipa:string;open:boolean;onToggle:(value:boolean)=>void;
 onChange:(field:'arabicForm'|'transliteration'|'ipa',value:string)=>void;
}) {
 return <details className="contribute-reading" open={open||undefined} onToggle={event=>onToggle(event.currentTarget.open)}>
  <summary>{ar?'النطق والتشكيل':'Pronunciation & vowels'} <span className="contribute-optional">{ar?'اختياري':'Optional'}</span></summary>
  <div className="contribute-field"><label htmlFor="vocalized-word">{ar?'الكلمة بالتشكيل':'Reading with vowels'} <span className="contribute-optional">{ar?'اختياري':'Optional'}</span></label>
   <ArabicInput id="vocalized-word" value={reading||word} maxLength={255} placeholder="مثلاً: عِلْم" onValueChange={value=>onChange('arabicForm',value)}/>
   <span className="contribute-reading-example">{ar?'مثلاً:':'Example:'} <bdi>علم</bdi> <span aria-hidden="true">→</span> <bdi>عِلْم</bdi></span>
  </div>
  <div className="contribute-grid contribute-reading-grid">
   <SymbolInput id="meaning-transliteration" label={ar?'نقل صوتي بحروف لاتينية':'Transliteration'} kind="transliteration" value={transliteration} ar={ar} placeholder="e.g. maʿliš" onChange={value=>onChange('transliteration',value)}/>
   <SymbolInput id="meaning-ipa" label="IPA" kind="ipa" value={ipa} ar={ar} placeholder="e.g. /maʕliʃ/" onChange={value=>onChange('ipa',value)}/>
  </div>
 </details>;
}
