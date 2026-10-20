import React, {useEffect,useRef} from 'react';
type YamliApi={init:(options:Record<string,unknown>)=>boolean;yamlify:(id:string,options:Record<string,unknown>)=>void;deyamlify?:(id:string)=>void};
declare global {interface Window {Yamli?:YamliApi}}
function useYamli<T extends HTMLInputElement|HTMLTextAreaElement>(id:string|undefined,onValue:(value:string)=>void) {
 const ref=useRef<T>(null),callback=useRef(onValue);
 useEffect(()=>{callback.current=onValue;},[onValue]);
 useEffect(()=>{
  const node=ref.current;if(!node||!id)return;
  let attached=false;
  const changed=()=>callback.current(node.value);
  function attach(){if(!node||attached||!node.isConnected||!window.Yamli)return;if(window.Yamli.init({uiLanguage:document.documentElement.lang==='ar'?'ar':'en',startMode:'onOrUserDefault',forceHTTPS:true})){
   window.Yamli.yamlify(id!,{settingsPlacement:'inside',forceHTTPS:true,generateOnChangeEvent:true});attached=true;
  }}
  node.addEventListener('change',changed);node.addEventListener('input',changed);
  const script=document.querySelector('script[src="https://api.yamli.com/js/yamli_api.js"]');
  script?.addEventListener('load',attach);attach();
  return()=>{script?.removeEventListener('load',attach);node.removeEventListener('change',changed);node.removeEventListener('input',changed);if(attached)window.Yamli?.deyamlify?.(id);};
 },[id]);
 return ref;
}
type InputProps=Omit<React.InputHTMLAttributes<HTMLInputElement>,'onChange'> & {onValueChange:(value:string)=>void};
type AreaProps=Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,'onChange'> & {onValueChange:(value:string)=>void};
export function ArabicInput({onValueChange,...props}:InputProps){const ref=useYamli<HTMLInputElement>(props.id,onValueChange);return <input {...props} ref={ref} dir="rtl" lang="ar" onChange={event=>onValueChange(event.currentTarget.value)}/>;}
export function ArabicTextarea({onValueChange,...props}:AreaProps){const ref=useYamli<HTMLTextAreaElement>(props.id,onValueChange);return <textarea {...props} ref={ref} dir="rtl" lang="ar" onChange={event=>onValueChange(event.currentTarget.value)}/>;}
