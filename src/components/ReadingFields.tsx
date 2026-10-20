import React from 'react';
import {ArabicInput} from './ArabicInput';
export default function ReadingFields({ar,word,reading,transliteration,ipa,open,onToggle,onChange}:{
 ar:boolean;word:string;reading:string;transliteration:string;ipa:string;open:boolean;onToggle:(value:boolean)=>void;
 onChange:(field:'arabicForm'|'transliteration'|'ipa',value:string)=>void;
}) {
 return <details className="contribute-reading" open={open||undefined} onToggle={event=>onToggle(event.currentTarget.open)}>
  <summary>{ar?'النطق والتشكيل':'Pronunciation & vowels'} <span className="contribute-optional">{ar?'اختياري':'Optional'}</span></summary>
  <div className="contribute-field"><label htmlFor="vocalized-word">{ar?'الكلمة بالتشكيل':'Reading with vowels'}</label>
   <ArabicInput id="vocalized-word" value={reading||word} maxLength={255} onValueChange={value=>onChange('arabicForm',value)}/>
   <span className="contribute-hint">{ar?'أضف التشكيل اللي يوضح النطق، أو سيبها زي ما هي. هنحفظه مع المعنى ده.':'Add the vowels that help, or leave it as it is. This reading belongs to your meaning.'}</span>
  </div>
  <details className="contribute-advanced"><summary>{ar?'تفاصيل نطق إضافية':'More pronunciation details'}</summary><div className="contribute-grid">
   <div className="contribute-field"><label htmlFor="meaning-transliteration">{ar?'نقل صوتي بحروف لاتينية':'Transliteration'}</label><input id="meaning-transliteration" dir="ltr" value={transliteration} maxLength={255} placeholder="e.g. maʕliš" onChange={event=>onChange('transliteration',event.target.value)}/><span className="contribute-hint">{ar?'لو بتستخدم نظام نقل صوتي، خليه منفصل عن الفرانكو.':'For a transcription system; keep it separate from your Franco spelling.'}</span></div>
   <div className="contribute-field"><label htmlFor="meaning-ipa">IPA</label><input id="meaning-ipa" dir="ltr" value={ipa} maxLength={255} placeholder="e.g. /maʕliʃ/" onChange={event=>onChange('ipa',event.target.value)}/></div>
  </div></details>
 </details>;
}
