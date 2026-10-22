import React from 'react';
import {renderToReadableStream} from 'react-dom/server.browser';
import type {HelmetServerState} from 'react-helmet-async';
import type {Country,FetchData,RenderSeed} from './contracts';
import {StaticRouter} from 'react-router-dom';
import {dehydrate, type QueryKey} from 'react-query';
import Application, {makeQueryClient, type Bootstrap} from '../src/rendering/Application';
import {createLanguage} from '../src/rendering/i18n';
import {requestPreferences} from '../src/rendering/preferences';
import {preloadRoute, routeModule} from '../src/App';
import {mapWordDefinitions} from '../pages/WordPage';
import * as variables from '../src/assets/Variables.module.scss';
import '../src/index.scss';
import '../src/assets/Styles.scss';

declare const __CLIENT_MANIFEST__: Record<string,{file:string;css?:string[];imports?:string[]}>;
declare const __CLIENT_STYLES__: Record<string,string>;
const files:Record<string,string>={home:'Home',lucky:'WordOfTheDay',login:'LogIn',signup:'SignUp',contribute:'ContributionForm',search:'SearchResults',word:'WordPage',profile:'UserProfile',explore:'AdvancedSearch',blog:'Blog',about:'About',chatbot:'Chatbot',forgot:'ForgotPassword',reset:'ResetPassword',missing:'NotFound',sources:'SourceLibrary',construction:'PageUnderConstruction',browse:'Browse'};

function routeAssets(path:string) {
  const manifest=typeof __CLIENT_MANIFEST__==='undefined'?{}:__CLIENT_MANIFEST__;
  const styles=new Set<string>(), scripts=new Set<string>(), seen=new Set<string>();
  function visit(key:string) {
    if(seen.has(key)) return; seen.add(key);
    const item=manifest[key];if(!item) return;
    item.imports?.forEach(visit);
    item.css?.forEach(css=>styles.add('/'+css));
    if(item.file.endsWith('.js')) scripts.add('/'+item.file);
  }
  visit('index.html');visit('pages/'+files[routeModule(path)]+'.tsx');
  return [...styles].map(href=>{
    const css=__CLIENT_STYLES__[href];
    if(css===undefined) throw new Error('Missing initial stylesheet: '+href);
    // Firefox may paint before linked CSS arrives. Keep each inline/linked pair
    // adjacent so the cascade stays identical as downloads finish, and retain
    // the link for Vite's browser preloader and subsequent client navigation.
    return `<style data-qamous-stylesheet="${href}">${css}</style><link rel="stylesheet" href="${href}">`;
  }).join('')
    +[...scripts].map(href=>`<link rel="modulepreload" href="${href}">`).join('');
}

export const serializeState=(state:unknown)=>JSON.stringify(state).replace(/[<>&\u2028\u2029]/g,char=>({'<':'\\u003c','>':'\\u003e','&':'\\u0026','\u2028':'\\u2028','\u2029':'\\u2029'}[char]!));

export async function renderApplication(request:Request, fetchData:FetchData, seed:RenderSeed={}) {
  const url=new URL(request.url), preferences=requestPreferences(url,request.headers.get('Cookie')||'',request.headers.get('Accept-Language')||'');
  const client=makeQueryClient();
  const set=(key:QueryKey,data:unknown)=>client.setQueryData(key,data);
  const load=async<T=unknown>(key:QueryKey,path:string)=>{const data=await fetchData<T>(path);set(key,data);return data;};
  const path=url.pathname, params=url.searchParams, lang=preferences.language;
  try {
    await preloadRoute(seed.notFound?'/404':path);
    if(seed.notFound) { /* Render the same 404 tree on the server and browser. */ }
    else if(path==='/') {
      const script=lang==='ar'?'ar':'franco';
      const orderKey=['homeFeedOrder',script,'definition-language-v2'];
      const order=await fetchData<{definitionIds:number[]}>('/definitions/feed?script='+script);
      set(orderKey,order.definitionIds);
      const updatedAt=client.getQueryState(orderKey)!.dataUpdatedAt;
      const ids=order.definitionIds.slice(0,10);
      const page=ids.length?await fetchData<{results:unknown[]}>(`/word/explore?script=${script}&ids=${ids.join(',')}`):{results:[]};
      set(['homeContent',script,'definition-language-v2',updatedAt],{pages:[page.results],pageParams:[null]});
    } else if(seed.word) {
      const id=Number(path.split('/')[2]);
      // The public SEO payload includes every visible meaning and its provenance.
      // Reuse it for the actual page, including hydration, instead of repeating
      // definitions and a country-wide Explore count for every crawled URL.
      const rows=seed.wordData&&!seed.personalized?seed.wordData.rows
        :await fetchData<Parameters<typeof mapWordDefinitions>[0]>('/definitions/word/'+id);
      const meanings=mapWordDefinitions(rows);
      set(['homeContent',id],meanings);
      const shown=meanings.find(row=>row.lang===lang)||meanings[0];
      if(shown?.countryCode) {
        const related=seed.wordData?.related;
        if(seed.wordData) {
          const matchingCountry=related?.country?.countryCode===shown.countryCode;
          set(['relatedCountry',shown.countryCode],matchingCountry?related.country:null);
          set(['relatedWords',shown.countryCode,lang==='ar'],matchingCountry?related.byLanguage?.[lang]||{results:[]}:{results:[]});
        } else {
          // This widget is optional: budget pressure must not hide the meaning.
          await Promise.allSettled([
            load(['relatedCountry',shown.countryCode],'/countries/'+shown.countryCode),
            load(['relatedWords',shown.countryCode,lang==='ar'],`/word/related?country=${shown.countryCode}&script=${lang==='ar'?'ar':'franco'}`),
          ]);
        }
      }
    } else if(path.startsWith('/advanced-search')) {
      const countries=seed.countries||await fetchData<Country[]>('/countries');set('exploreCountries',countries);
      const countryName=path.split('/')[2]&&decodeURIComponent(path.split('/')[2]);
      const legacy=countries.find(c=>c.countryName.toLowerCase()===countryName?.toLowerCase());
      const selected=[...new Set(params.getAll('country').map(code=>code.toUpperCase()))];
      const codes=selected.length?selected:legacy?[legacy.countryCode]:[];
      const query=new URLSearchParams();
      if(params.get('q')) query.set('q',params.get('q')!);
      query.set('script',params.get('script')||(lang==='ar'?'ar':'franco'));
      query.set('scope',params.get('scope')||'all');query.set('sort',params.get('sort')||'popular');
      query.set('page',String(Math.max(1,Number(params.get('page'))||1)));query.set('limit','12');
      if(params.get('examples')==='1') query.set('examples','1');
      codes.forEach(code=>query.append('country',code));
      if(!countryName||legacy) await load(['explore',query.toString(),false],'/word/explore?'+query);
    } else if(seed.browse) set(['browse',lang,params.get('after')],seed.browse);
    else if(path==='/sources'||path.startsWith('/contributors/')) {
      const username=path.startsWith('/contributors/')?decodeURIComponent(path.split('/')[2]):undefined;
      const definition=params.get('definition');
      await load(['source-library',username,definition],username?'/contributors/'+encodeURIComponent(username):definition?'/definitions/'+encodeURIComponent(definition)+'/provenance':'/sources');
    } else if(path==='/blog') await load('posts','/posts');
    else if(path==='/feeling-lucky') await load('wordOfTheDayContent','/definitions/random-matching');
    else if(/^\/search\/[^/]+$/.test(path)) {
      const query=decodeURIComponent(path.slice('/search/'.length));
      await load(['searchResults',query],'/word/search/kwd='+encodeURIComponent(query));
    }
    // Authenticated routes use their own real loading states.
    // Session/account queries run in the browser. Public rows may contain the
    // visitor's existing reaction flags; those responses are never shared in cache.
    const bootstrap:Bootstrap={...preferences,now:Date.now(),...(seed.notFound?{notFoundPath:path}:{})};
    const helmetContext:{helmet?:HelmetServerState}={};
    const language=createLanguage(lang);
    let renderError:unknown;
    const stream=await renderToReadableStream(<StaticRouter location={url.pathname+url.search}>
      <Application bootstrap={bootstrap} client={client} language={language} helmetContext={helmetContext}/>
    </StaticRouter>,{signal:AbortSignal.timeout(15000),onError(error){renderError=error;}});
    await stream.allReady;
    const html=await new Response(stream).text();
    if(renderError) throw renderError;
    bootstrap.queries=dehydrate(client);
    const helmet=helmetContext.helmet;
    if(!helmet) throw new Error('Missing page metadata');
    const head=[helmet.title,helmet.meta,helmet.link,helmet.script].map(item=>item.toString()).join('');
    const suffix=preferences.theme==='light'?'Light':preferences.theme==='grain'?'Grain':'Dark';
    const theme=Object.entries({
      'primary-color':'primaryColor','secondary-color':'secondaryColor','tertiary-color':'tertiaryColor','quaternary-color':'quaternaryColor',
      'primary-color-90':'primaryColorNinety','primary-color-75':'primaryColorSeventyFive','primary-color-50':'primaryColorFifty','primary-color-40':'primaryColorForty',
      'secondary-color-90':'secondaryColorNinety','tertiary-color-90':'tertiaryColorNinety','header-border-color':'headerBorderColor','icon-background-color':'iconBackgroundColor',
    }).map(([property,key])=>`--${property}:${(variables as Record<string,string>)[key+suffix]}`).join(';');
    const robots=head.match(/name="robots" content="([^"]*)"/)?.[1]||'index, follow';
    return {html,head,robots,assets:routeAssets(seed.notFound?'/404':path),state:serializeState(bootstrap),language:lang,theme,grain:preferences.theme==='grain'};
  } finally {client.clear();}
}
