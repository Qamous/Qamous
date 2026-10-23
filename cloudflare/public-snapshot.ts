// Emergency public reads use a reviewed, current export deployed with these
// assets. This path never contacts the API, D1 or Durable Objects. Content
// writes must remain paused until a new snapshot release replaces it.
type Row=Record<string,any>;
export interface SnapshotEnvironment {
  ASSETS:{fetch(request:Request):Promise<Response>};
  PUBLIC_SNAPSHOT_ID?:string;
  PUBLIC_SNAPSHOT_EXPIRES_AT?:string;
  // Release tooling verifies the deployed API and importer are both paused,
  // including an empty live importer schedule, before allowing this mode.
  PUBLIC_SNAPSHOT_FROZEN?:string;
}
interface Manifest {
  schemaVersion:number;snapshotId:string;generatedAt:string;exportStartedAt:string;exportCompletedAt:string;expiresAt?:string;
  resources:{key:string;file:string;bytes:number;sha256:string}[];
}
class SnapshotError extends Error {
  constructor(readonly status:number,message:string) {super(message);}
}
const missing=()=>new SnapshotError(404,'This entry is not available.');
const invalid=()=>new SnapshotError(400,'Invalid public dictionary request.');
const unavailable=()=>new SnapshotError(503,'Qamous is temporarily in read-only mode. Please try again later.');
const stores=new WeakMap<object,Map<string,Promise<Snapshot>>>();
export function snapshotEnabled(env:SnapshotEnvironment):boolean {return !!env.PUBLIC_SNAPSHOT_ID;}
export function snapshotExpired(env:SnapshotEnvironment):boolean {
  return snapshotEnabled(env)&&env.PUBLIC_SNAPSHOT_FROZEN!=='true'&&(!env.PUBLIC_SNAPSHOT_EXPIRES_AT||Date.parse(env.PUBLIC_SNAPSHOT_EXPIRES_AT)<=Date.now()||!Number.isFinite(Date.parse(env.PUBLIC_SNAPSHOT_EXPIRES_AT)));
}
async function jsonAsset(env:SnapshotEnvironment,path:string,maxBytes:number) {
  const response=await env.ASSETS.fetch(new Request(new URL(path,'https://qamous.org')));
  if(!response.ok) {await response.body?.cancel();throw unavailable();}
  const declared=Number(response.headers.get('content-length'));
  if(declared>maxBytes) {await response.body?.cancel();throw unavailable();}
  const text=await response.text();
  if(new TextEncoder().encode(text).byteLength>maxBytes) throw unavailable();
  try{return JSON.parse(text);}catch{throw unavailable();}
}
class Snapshot {
  private entries:Map<string,Manifest['resources'][number]>;
  private values=new Map<string,Promise<any>>();
  constructor(private env:SnapshotEnvironment,private manifest:Manifest) {
    this.entries=new Map(manifest.resources.map(entry=>[entry.key,entry]));
  }
  static async load(env:SnapshotEnvironment) {
    const id=env.PUBLIC_SNAPSHOT_ID!;
    if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,100}$/.test(id)||snapshotExpired(env)) throw unavailable();
    const manifest=await jsonAsset(env,`/public-data/${id}/manifest.json`,4_000_000) as Manifest;
    const exported=Date.parse(manifest.exportCompletedAt),generated=Date.parse(manifest.generatedAt);
    if(manifest.schemaVersion!==1||manifest.snapshotId!==id||!Array.isArray(manifest.resources)||manifest.resources.length>20_000
      ||!Number.isFinite(exported)||!Number.isFinite(generated)||exported>generated||generated>Date.now()+300_000
      ||(env.PUBLIC_SNAPSHOT_FROZEN!=='true'&&Date.parse(env.PUBLIC_SNAPSHOT_EXPIRES_AT!)>exported+24*60*60_000)
      ||manifest.resources.some(entry=>typeof entry.key!=='string'||!/^[a-f0-9]{64}\.json$/.test(entry.file)||entry.bytes<1||entry.bytes>25_000_000)) throw unavailable();
    return new Snapshot(env,manifest);
  }
  async value<T=any>(key:string):Promise<T> {
    if(snapshotExpired(this.env)) throw unavailable();
    const entry=this.entries.get(key);if(!entry) throw missing();
    let pending=this.values.get(key);
    if(!pending) {
      pending=jsonAsset(this.env,`/public-data/${this.manifest.snapshotId}/${entry.file}`,Math.min(entry.bytes+1024,25_000_000))
        .then(payload=>{if(payload.key!==key||!('value' in payload))throw unavailable();return payload.value;});
      this.values.set(key,pending);
      // Bound isolate memory. The compact discovery index is reused for local
      // search; ordinary word/card entries are a small recent working set.
      if(this.values.size>48) {const old=[...this.values.keys()].find(item=>item!=='discovery'&&item!==key);if(old)this.values.delete(old);}
      pending.catch(()=>{if(this.values.get(key)===pending)this.values.delete(key);});
    }
    return pending;
  }
  async cards(ids:number[]):Promise<Row[]> {
    const keys=[...new Set(ids.map(id=>'cards:'+Math.floor(id/100)))];
    const groups=await Promise.all(keys.map(key=>this.value<Row[]>(key).catch(error=>{if(error.status===404)return [];throw error;})));
    const byId=new Map(groups.flat().map(row=>[Number(row.definitionId??row.id),row]));
    return ids.map(id=>byId.get(id)).filter((row):row is Row=>!!row);
  }
  async word(id:number) {
    const rows=await this.value<Row[]>('word:'+id);
    let related:Row={country:null,words:[],byLanguage:{en:{results:[]},ar:{results:[]}}};
    const country=rows[0]?.countryCode;
    if(typeof country==='string'&&/^[A-Z]{2}$/.test(country)) {
      const [countries,en,ar]=await Promise.all([this.value<Row[]>('countries'),this.value('related:'+country+':franco'),this.value('related:'+country+':ar')]);
      const links=[...new Map([...en.results,...ar.results].map((row:Row)=>[Number(row.wordId),row])).values()]
        .filter((row:Row)=>Number(row.wordId)!==id).slice(0,5) as Row[];
      related={country:countries.find(row=>row.countryCode===country)||null,
        words:links.map(row=>({id:row.wordId,canonicalArabic:row.arabicWord,francoArabicWord:row.francoArabicWord})),byLanguage:{en,ar}};
    }
    return {rows,related};
  }
  async explore(params:URLSearchParams) {
    const script=params.get('script')||'both',scope=params.get('scope')||'all',sort=params.get('sort')||'popular';
    if(!['ar','franco','both'].includes(script)||!['all','words','definitions'].includes(scope)||!['popular','newest','az'].includes(sort))throw invalid();
    if(params.has('ids')) {
      const raw=params.get('ids')!;
      if(!/^\d+(,\d+)*$/.test(raw)||raw.length>850)throw invalid();
      const ids=raw.split(',').map(positive);
      if(ids.length>50||new Set(ids).size!==ids.length)throw invalid();
      const results=(await this.cards(ids)).filter(row=>script==='both'||Number(row.isArabic)===(script==='ar'?1:0));
      return {results,total:results.length,page:1,limit:ids.length};
    }
    const page=Number(params.get('page')||1),limit=Number(params.get('limit')||12),query=(params.get('q')||'').trim();
    const countries=[...new Set(params.getAll('country').map(value=>value.toUpperCase()))];
    if(!Number.isInteger(page)||page<1||!Number.isInteger(limit)||limit<1||limit>50||(page-1)*limit>10000||query.length>200
      ||countries.length>25||countries.some(code=>!/^[A-Z]{2}$/.test(code)))throw invalid();
    const preferred=script==='ar'?1:0,needle=normalize(query);
    const rows=(await this.value<Row[]>('discovery')).filter(row=>
      (query||script==='both'||Number(row.isArabic)===preferred)&&(!countries.length||countries.includes(row.countryCode))
      &&(params.get('examples')!=='1'||row.example||row.arabicExample||row.hasExamples)
      &&(!needle||((scope!=='definitions'&&normalize([row.arabicWord,row.francoArabicWord,...(row.arabicSpellings||[]),...(row.francoSpellings||[])].join(' ')).includes(needle))
        ||(scope!=='words'&&normalize(row.definition||'').includes(needle)))));
    const ranked=[...rows].sort((a,b)=>(script==='both'?0:Number(Number(b.isArabic)===preferred)-Number(Number(a.isArabic)===preferred))||score(b)-score(a)||Number(a.definitionId)-Number(b.definitionId));
    const groups=new Map<string,Row>();
    for(const row of ranked) {const key=(row.canonicalArabic||row.arabicWord)+(script==='both'?':'+row.isArabic:'');if(!groups.has(key))groups.set(key,row);}
    const matches=[...groups.values()].sort((a,b)=>sort==='newest'
      ?String(b.AddedTimestamp||'').localeCompare(String(a.AddedTimestamp||''))||Number(b.definitionId)-Number(a.definitionId)
      :sort==='az'?String(a.word||a.francoArabicWord||a.arabicWord).localeCompare(String(b.word||b.francoArabicWord||b.arabicWord))||Number(a.definitionId)-Number(b.definitionId)
      :score(b)-score(a)||Number(a.definitionId)-Number(b.definitionId));
    const results=await this.cards(matches.slice((page-1)*limit,page*limit).map(row=>Number(row.definitionId)));
    return {results,total:matches.length,page,limit};
  }
  async route(url:URL) {
    const path=url.pathname,params=url.searchParams;
    if(path==='/countries'||path==='/posts'||path==='/sources')return this.value(path.slice(1));
    if(path==='/seo/index')return this.value('seo-index');
    let match;
    if((match=/^\/countries\/([A-Za-z]{2})$/.exec(path))) {
      const row=(await this.value<Row[]>('countries')).find(row=>row.countryCode===match![1].toUpperCase());if(!row)throw missing();return row;
    }
    if((match=/^\/(?:seo\/word|definitions\/word)\/([1-9]\d*)$/.exec(path)))return path.startsWith('/seo/')?this.word(positive(match[1])):this.value('word:'+positive(match[1]));
    if((match=/^\/word\/([1-9]\d*)\/seo$/.exec(path)))return this.value('word:'+positive(match[1]));
    if((match=/^\/seo\/sitemap\/(0|[1-9]\d*)$/.exec(path)))return this.value('seo-shard:'+Number(match[1]));
    if((match=/^\/seo\/browse\/(en|ar)$/.exec(path)))return this.value('seo-browse:'+match[1]+':'+(params.has('after')?positive(params.get('after')!):''));
    if((match=/^\/seo\/dialect\/([^/]+)$/.exec(path)))return this.value('seo-dialect:'+encodeURIComponent(decodeURIComponent(match[1])));
    if(path==='/definitions/feed') {
      const script=params.get('script');if(!['ar','franco'].includes(script||''))throw invalid();
      return {definitionIds:shuffledFeed(await this.value<Row[]>('feed:'+(script==='ar'?1:0)))};
    }
    if(path==='/word/related') {
      const country=(params.get('country')||'').toUpperCase(),script=params.get('script');
      if(!/^[A-Z]{2}$/.test(country)||!['ar','franco'].includes(script||''))throw invalid();
      return this.value(`related:${country}:${script}`);
    }
    if(path==='/word/explore')return this.explore(params);
    if((match=/^\/definitions\/([1-9]\d*)(?:\/(provenance|country))?$/.exec(path))) {
      const row=(await this.cards([positive(match[1])]))[0];if(!row)throw missing();
      return match[2]==='country'?(await this.value<Row[]>('countries')).find(country=>country.countryCode===row.countryCode)||null:row;
    }
    if((match=/^\/word\/search\/kwd=(.+)$/.exec(path)))return (await this.explore(new URLSearchParams({q:decodeURIComponent(match[1]),script:'both',limit:'50'}))).results;
    if((match=/^\/word\/search\/iso=([A-Za-z]{2})$/.exec(path)))return (await this.explore(new URLSearchParams({country:match[1],script:'both',limit:'50'}))).results;
    if(path==='/word/suggestions') {
      const results=(await this.explore(new URLSearchParams({q:params.get('q')||'',scope:'words',script:'both',limit:'20'}))).results;
      return [...new Map(results.map(row=>[row.wordId,{id:row.wordId,arabicWord:row.arabicWord,francoArabicWord:row.francoArabicWord,
        arabicSpellings:row.arabicSpellings,francoSpellings:row.francoSpellings}])).values()].slice(0,10);
    }
    if(path==='/definitions/random-matching') {
      const rows=await this.value<Row[]>('discovery'),languages=new Map<number,number>();
      for(const row of rows)languages.set(Number(row.wordId),(languages.get(Number(row.wordId))||0)|(Number(row.isArabic)===1?2:1));
      const ids=[...languages].filter(([,mask])=>mask===3).map(([id])=>id);if(!ids.length)return [];
      const id=ids[Math.floor(Math.random()*ids.length)];return this.cards(rows.filter(row=>Number(row.wordId)===id).map(row=>Number(row.definitionId)));
    }
    if((match=/^\/sources\/([^/]+)\/license$/.exec(path)))return this.value('license:'+decodeURIComponent(match[1]));
    if((match=/^\/sources\/([^/]+)$/.exec(path))) {
      const row=(await this.value<Row[]>('sources')).find(row=>row.id===decodeURIComponent(match![1]));if(!row)throw missing();return row;
    }
    if((match=/^\/contributors\/([^/]+)$/.exec(path)))return this.value('contributor:'+decodeURIComponent(match[1]).toLowerCase());
    // Auth/session, account/profile data, reactions, exports and writes never
    // receive fabricated success or an anonymous identity from this snapshot.
    throw unavailable();
  }
}
function positive(value:string|number):number {const id=Number(value);if(!Number.isSafeInteger(id)||id<1)throw invalid();return id;}
const normalize=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').replace(/ـ/g,'').toLocaleLowerCase('en');
const score=(row:Row)=>Number(row.likeCount||0)-Number(row.dislikeCount||0);
export function shuffledFeed(rows:Row[],random=Math.random):number[] {
  return rows.map(row=>({id:Number(row.definitionId),key:-Math.log(1-random())/(0.75+0.5*(Number(row.likeCount)+3)/(Number(row.likeCount)+Number(row.dislikeCount)+6))}))
    .sort((a,b)=>a.key-b.key||a.id-b.id).map(row=>row.id);
}
async function snapshot(env:SnapshotEnvironment) {
  let byId=stores.get(env.ASSETS);if(!byId){byId=new Map();stores.set(env.ASSETS,byId);}
  const id=env.PUBLIC_SNAPSHOT_ID!;
  let pending=byId.get(id);if(!pending){pending=Snapshot.load(env);byId.set(id,pending);pending.catch(()=>byId!.delete(id));}
  return pending;
}
export async function publicSnapshotResponse(request:Request,env:SnapshotEnvironment):Promise<Response|null> {
  if(!snapshotEnabled(env))return null;
  const headers=new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60',
    'X-Qamous-Snapshot':env.PUBLIC_SNAPSHOT_ID!,'X-Qamous-Personalization':'unavailable','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
  let value:unknown,status=200;
  let plainText:string|undefined;
  try {
    if(!['GET','HEAD'].includes(request.method)||snapshotExpired(env))throw unavailable();
    value=await(await snapshot(env)).route(new URL(request.url));
    if(/^\/sources\/[^/]+\/license$/.test(new URL(request.url).pathname)) {
      const license=value as {fileName:string;text:string};
      if(typeof license.text!=='string'||typeof license.fileName!=='string')throw unavailable();
      plainText=license.text;headers.set('Content-Type','text/plain; charset=utf-8');
      headers.set('Content-Disposition','inline; filename="'+license.fileName.replace(/[^a-zA-Z0-9._-]/g,'_')+'"');
    }
  }catch(error) {
    status=error instanceof SnapshotError?error.status:503;
    value={statusCode:status,...(status===503?{code:'PUBLIC_READ_ONLY'}:{}),message:error instanceof SnapshotError?error.message:unavailable().message};
    headers.set('Cache-Control','no-store');if(status===503)headers.set('Retry-After','60');
  }
  return new Response(request.method==='HEAD'?null:plainText??JSON.stringify(value),{status,headers});
}
