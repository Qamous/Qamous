import React from 'react';
import type {SourceExample} from '../types/provenance';
import {francoExample,FRANCO_METHOD} from '../utils/franco-example.mjs';

export default function ExampleList({entries=[],arabicExample,example,language}:{entries?:SourceExample[];arabicExample?:string|null;example?:string;language:string}) {
  const arabic=language==='ar',rows=[...entries];
  // Old submissions did not explicitly declare parallel sentences. Keep those
  // originals separate; new submissions and imports carry verified group IDs.
  const legacy=arabic?[[arabicExample,'ar','Arabic']]:example?.trim()?[[example,'ar-Latn','Latin']]:[[arabicExample,'ar','Arabic']];
  for(const [text,code,script] of legacy)if(text?.trim()&&!rows.some(e=>e.text===text&&e.language===code))rows.push({text,language:code as SourceExample['language'],script:script as SourceExample['script'],kind:'usage',groupId:'legacy:'+code});
  const groups=new Map<string,SourceExample[]>();
  rows.forEach((row,index)=>{
    if(!row.text.trim()||row.kind==='unclassified'||row.language==='en'&&(row.kind!=='translation'||!row.groupId||!['source','community'].includes(row.alignment||'')))return;
    const key=row.groupId||'unpaired:'+index,own=groups.get(key)||[];
    if(!own.some(e=>e.language===row.language&&e.text===row.text&&e.kind===row.kind))own.push(row);
    groups.set(key,own);
  });
  const visible=[...groups.entries()].flatMap(([key,values])=>{
    const original=values.find(e=>e.language==='ar'&&e.kind==='usage');
    let franco=values.find(e=>e.language==='ar-Latn'&&e.kind==='usage');
    if(!franco&&original){const text=francoExample(original.text);if(text)franco={...original,text,language:'ar-Latn',script:'Latin',generated:true,generationMethod:FRANCO_METHOD,derivedFromArabic:original.text};}
    const primary=arabic?original:franco||original;
    if(!primary)return [];
    const translations=values.filter(e=>e.language==='en'&&e.kind==='translation');
    return [{key,primary,original,translations}];
  });
  const render=({key,primary,original,translations}:typeof visible[number])=><div className="content-box-example" key={key}>
    <span className="content-box-example-label">{arabic?'مثال:':'Example:'}</span>
    <div className="example-sentence"><small className="source-example-language">{primary.language==='ar'?'العربية':primary.generated?(arabic?'فرانكو تقريبي':'Franco (approx.)'):'Franco'}</small><span lang={primary.language} dir={primary.script==='Arabic'?'rtl':'ltr'}>{primary.text}</span></div>
    {translations.map((row,i)=><div className="example-translation" key={i}><small className="source-example-language">{arabic?'الترجمة الإنجليزية':'English translation'}</small><span lang="en" dir="ltr">{row.text}</span></div>)}
    {!arabic&&original&&primary!==original&&<details className="example-original"><summary>{primary.generated?'Arabic original · automatic Franco':'Arabic original'}</summary><p lang="ar" dir="rtl">{original.text}</p>{primary.generated&&<small>Written-form approximation; missing vowels and dialect pronunciation are not inferred.</small>}</details>}
  </div>;
  return <>{visible.slice(0,3).map(render)}{visible.length>3&&<details className="example-more"><summary>{arabic?'أمثلة إضافية':'More examples'} ({visible.length-3})</summary>{visible.slice(3).map(render)}</details>}</>;
}
