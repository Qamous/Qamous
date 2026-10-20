import React, {useRef,useState} from 'react';

const transliterationSymbols=[
  ['ʾ','ء'],['ʿ','ع'],['ḥ','ح'],['ḫ','خ'],['ġ','غ'],['š','ش'],['ṯ','ث'],['ḏ','ذ'],['ǧ','ج'],['ṣ','ص'],['ḍ','ض'],['ṭ','ط'],['ẓ','ظ'],
  ['ā','ا'],['ī','ي'],['ū','و'],['ē',''],['ō',''],
];
const ipaSymbols=[
  ['ʔ','ء'],['ʕ','ع'],['ħ','ح'],['x','خ'],['ɣ','غ'],['ʃ','ش'],['ʒ','ج'],['θ','ث'],['ð','ذ'],['q','ق'],
  ['sˤ','ص'],['dˤ','ض'],['tˤ','ط'],['ðˤ','ظ'],['ə',''],['æ',''],['ɑ',''],['ɛ',''],['ɪ',''],['ʊ',''],['ɔ',''],['ː','length'],['ˈ','stress'],
];

export default function SymbolInput({id,label,kind,value,onChange,ar,placeholder}:{
  id:string;label:string;kind:'transliteration'|'ipa';value:string;onChange:(value:string)=>void;ar:boolean;placeholder:string;
}) {
  const input=useRef<HTMLInputElement>(null),[open,setOpen]=useState(false);
  const symbols=kind==='ipa'?ipaSymbols:transliterationSymbols;
  const insert=(symbol:string)=>{
    const node=input.current;if(!node)return;
    const start=node.selectionStart??value.length,end=node.selectionEnd??start;
    const next=value.slice(0,start)+symbol+value.slice(end);
    if(next.length>255)return;
    onChange(next);
    requestAnimationFrame(()=>{if(node.isConnected){node.focus({preventScroll:true});node.setSelectionRange(start+symbol.length,start+symbol.length);}});
  };
  return <div className="contribute-field contribute-symbol-field">
    <label htmlFor={id}>{label}<span className="contribute-optional">{ar?'اختياري':'Optional'}</span></label>
    <input ref={input} id={id} dir="ltr" value={value} maxLength={255} placeholder={placeholder} onChange={event=>onChange(event.target.value)}/>
    <button type="button" className="contribute-symbol-toggle" aria-label={ar?`أضف رمز ${label}`:`Insert symbol for ${label}`} aria-expanded={open} aria-controls={id+'-symbols'} onClick={()=>setOpen(previous=>!previous)}>{ar?'أضف رمز':'Insert symbol'} <span aria-hidden="true">{kind==='ipa'?'ʕ ʃ':'ʿ š'}</span></button>
    {open&&<div id={id+'-symbols'} className="contribute-symbols" role="group" aria-label={ar?`الرموز المتاحة: ${label}`:`Available ${label} symbols`} dir="ltr">
      {symbols.map(([symbol,cue])=>{
        const hint=cue==='length'?(ar?'إطالة':'length'):cue==='stress'?(ar?'نبر':'stress'):cue;
        const title=(ar?'أضف ':'Insert ')+symbol+(hint?` (${hint})`:'');
        return <button type="button" key={symbol} title={title} aria-label={title} onClick={()=>insert(symbol)}><span>{symbol}</span>{hint&&<small dir="auto">{hint}</small>}</button>;
      })}
    </div>}
  </div>;
}
