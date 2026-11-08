import type { ProvenanceContent } from '../src/types/provenance';
import { API_URL, apiJson } from "../src/api";
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentBox from '../src/components/ContentBox';
import { useTranslation } from 'react-i18next';
import AdSense from 'react-adsense';
import { useInfiniteQuery } from 'react-query';
import {keywordSearchKey,keywordSearchPath,type KeywordSearchPage} from '../src/utils/keyword-search';
import './SearchResults.scss';
import Helmet from '../src/components/PageMetadata';
import LoadingSpinner from '../src/components/LoadingSpinner';
import AdSenseWrapper from '../src/components/AdSenseWrapper';

interface SearchResult extends ProvenanceContent {
  word: string;
  definition: string;
  isArabic: number;
  wordId: number;
  definitionId: number;
  isLiked: boolean;
  isDisliked: boolean;
  isReported: boolean;
  example: string;
  arabicExample?: string | null;
  arabicSpellings?: string[];
  francoSpellings?: string[];
  countryCode?:string;
}

interface JsonContent {
  word: string,
  definition: string
}

const fetchSearchResults = async (query: string,page=1,language='en'): Promise<KeywordSearchPage<SearchResult>> => {
  const apiUrl = `${API_URL}${keywordSearchPath(query,page,language)}`;
  
  try {
    
    const response = await fetch(apiUrl, {
      mode: 'cors',
      credentials: 'include',
    });
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }
    
    return apiJson<KeywordSearchPage<SearchResult>>(response);
  } catch (err) {
    console.error('Search request failed:', err);
    throw err;
  }
};

const SearchResults: React.FC = () => {
  const { query } = useParams();
  const { t, i18n } = useTranslation();
  const searchResults = t('search_results', {
    searchTerm: query,
    returnObjects: true,
  }) as JsonContent;
  const noResults = "No results found for \"" + query + "\"";
  
  const {data,isLoading,error,hasNextPage,fetchNextPage,isFetchingNextPage}=useInfiniteQuery<KeywordSearchPage<SearchResult>,Error>(
    keywordSearchKey(query||'',i18n.language),({pageParam=1})=>fetchSearchResults(query||'',pageParam,i18n.language),
    {getNextPageParam:last=>last.hasMore?last.page+1:undefined});
  const allResults=data?.pages.flatMap(page=>page.results)||[];
  
  const preferred=i18n.language==='ar'?1:0;
  const covered=new Set((allResults||[]).filter(item=>item.isArabic===preferred).map(item=>item.canonicalWordId||item.wordId));
  const filteredResults=(allResults||[]).filter(item=>item.isArabic===preferred||!covered.has(item.canonicalWordId||item.wordId));
  const [language, setLanguage] = useState(i18n.language);
  
  useEffect(() => {
    const searchbutton = document.getElementById('myOverlay');
    if (searchbutton) {
      searchbutton.style.display = 'block';
    }
    const searchboxsubmit = document.getElementById('search-overlay');
    if (searchboxsubmit) {
      searchboxsubmit.style.display = 'block';
    }
    
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error&&!allResults.length) {
    const typedError = error as Error;
    return (
      <div className={'container'} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={'container-left'}>
          <img
            src="/cool-dog.jpg"
            loading="lazy"
            alt={'Cool Dog'}
            className={'container-left-image'}
          />
          <h1 className="not-found-text-header" style={{ width: '100%' }}>
            {'Hmmm...'}
          </h1>
          <p className="not-found-text" style={{ width: '100%' }}>
            {`Error: ${typedError.message}`}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={'feed'}>
      <Helmet>
        <title>{`Search Results for "${query}"`}</title>
        <meta name="description" content={`Find the best definitions and translations for "${query}" in both Arabic and English. Explore detailed meanings, usage examples, and more.`} />
        <meta name="keywords" content={`search results, ${query}, Arabic to English, English to Arabic, definitions, translations, slang, dialect`} />
      </Helmet>
      <div className="feed-ad-space">
        <AdSenseWrapper
          client='ca-pub-4293590491700199'
          slot='7898075502'
          adKey='search-results-top'
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--tertiary-color)',
            border: '0',
            padding: '10px',
            fontFamily: 'var(--font-stack)',
            color: 'var(--primary-color)',
          }}
          format='auto'
          responsive='true'
        />
      </div>
      <div className="feed-posts">
        {
          filteredResults.length > 0 ? (
            <>
              <ContentBox
                item={searchResults}
                index={0}
                lang={i18n.language}
                definitionId={0}
                wordId={0}
                isLiked={false}
                isDisliked={false}
                isReported={false}
                definitionHuh={false}
                example={""}
              />
              <div className="feed-posts-ad-space">
                <AdSenseWrapper
                  client="ca-pub-4293590491700199"
                  slot="6473874271"
                  adKey="search-results-middle"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--tertiary-color)',
                    border: '0',
                    padding: '10px',
                    fontFamily: 'var(--font-stack)',
                    color: 'var(--primary-color)',
                  }}
                  format="auto"
                  responsive="true"
                />
              </div>
            </>
          ) : (
            <div className={'container'} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div className={'container-left'}>
                <img
                  src="/cool-dog.jpg"
                  loading="lazy"
                  alt={'Cool Dog'}
                  className={'container-left-image'}
                />
                <h1 className="not-found-text-header" style={{ width: '100%' }}>
                  {'Hmmm...'}
                </h1>
                <p className="not-found-text" style={{ width: '100%' }}>
                  {noResults}
                </p>
              </div>
            </div>
          )
        }
        {
          filteredResults.map((result, index) => (
            <ContentBox
              key={result.definitionId}
              item={{
                word: result.word,
                definition: result.definition
                ,arabicWord:result.arabicWord,francoArabicWord:result.francoArabicWord
              }}
              index={index + 1}
              lang={i18n.language} definitionLanguage={result.isArabic?'ar':'en'} countryCode={result.countryCode} dialect={result.dialect} canonicalWordId={result.canonicalWordId}
              definitionLanguages={result.definitionLanguages}
              wordId={result.wordId}
              definitionId={result.definitionId}
              isLiked={result.isLiked}
              isDisliked={result.isDisliked}
              isReported={result.isReported}
              example={result.example}
              arabicExample={result.arabicExample} sourceCredits={result.sourceCredits} sourceExamples={result.sourceExamples} sourcePronunciations={result.sourcePronunciations}
              arabicSpellings={result.arabicSpellings}
              francoSpellings={result.francoSpellings}
            />
          ))
        }
        {hasNextPage&&<div className="search-pagination">
          {error&&<p role="alert">{t('search_more_error')}</p>}
          <button type="button" className="search-load-more" disabled={isFetchingNextPage} onClick={()=>fetchNextPage()}>
            {t(isFetchingNextPage?'search_loading_more':'search_load_more')}
          </button>
        </div>}
      </div>
      <div className="feed-ad-space">
        <AdSenseWrapper
          client='ca-pub-4293590491700199'
          slot='1590891296'
          adKey='search-results-bottom'
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--tertiary-color)',
            border: '0',
            padding: '10px',
            fontFamily: 'var(--font-stack)',
            color: 'var(--primary-color)',
          }}
          format='auto'
          responsive='true'
        />
      </div>
    </div>
  );
};

export default SearchResults;
