import {Link} from 'react-router-dom';
import {useQuery} from 'react-query';
import {API_URL,apiJson} from '../api';
import './RelatedWords.scss';

interface Country {countryCode:string;countryName:string}
interface RelatedWord {wordId:number;word:string;isArabic:number|boolean}
export default function RelatedWords({countryCode,wordId,lang}:{countryCode?:string;wordId:number;lang:string}) {
  const enabled=Boolean(countryCode&&/^[A-Z]{2}$/.test(countryCode));
  const ar=lang==='ar';
  const {data:country}=useQuery<Country>(['relatedCountry',countryCode],async({signal})=>
    apiJson<Country>(await fetch(`${API_URL}/countries/${countryCode}`,{signal,credentials:'omit'})),{enabled,staleTime:300000,refetchOnWindowFocus:false,retry:false});
  const {data}=useQuery<{results:RelatedWord[]}>(['relatedWords',countryCode,ar],async({signal})=>{
    const params=new URLSearchParams({country:countryCode!,script:ar?'ar':'franco'});
    return apiJson<{results:RelatedWord[]}>(await fetch(`${API_URL}/word/related?${params}`,{signal,credentials:'omit'}));
  },{enabled,staleTime:300000,refetchOnWindowFocus:false,retry:false});
  if(!enabled) return null;
  const words=(data?.results||[]).filter((word,index,list)=>word.wordId!==wordId&&list.findIndex(other=>other.wordId===word.wordId)===index).slice(0,4);
  if(!country&&!words.length) return null;
  return <nav className="related-words" aria-label={ar?'كلمات مرتبطة':'Related words'}>
    <h2>{ar?'استكشف كلمات أخرى':'Keep exploring'}</h2>
    <div>{country&&<Link to={`/advanced-search/${encodeURIComponent(country.countryName)}`}>{ar?'تصفح هذه اللهجة':`Browse ${country.countryName}'s dialect guide`}</Link>}
      {words.map(word=><Link key={word.wordId} to={`/word/${word.wordId}${word.isArabic?'/ar':''}`}>{word.word}</Link>)}
    </div>
  </nav>;
}
