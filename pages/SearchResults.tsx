import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentBox from '../src/components/ContentBox';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import AdSense from 'react-adsense';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../src/components/LoadingSpinner';

interface SearchResult {
  word: string;
  definition: string;
  isArabic: number;
  wordId: number;
  definitionId: number;
  isLiked: boolean;
  isDisliked: boolean;
  isReported: boolean;
  example: string;
}

interface JsonContent {
  word: string,
  definition: string
}

const fetchSearchResults = async (query: string): Promise<SearchResult[]> => {
  const apiUrl = `${import.meta.env.VITE_API_URL}/word/search/kwd=${query}`;
  
  try {
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      mode: 'cors',
      credentials: 'include',
    });
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Received non-JSON response:', text);
      console.error('Content type:', contentType);
      throw new Error('API returned non-JSON response');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  } catch (err) {
    console.error('Search request failed:', err);
    throw err;
  }
};

const SearchResults: React.FC = () => {
  const { query } = useParams();
  const { t } = useTranslation();
  const searchResults = t('search_results', {
    searchTerm: query,
    returnObjects: true,
  }) as JsonContent;
  const noResults = "No results found for \"" + query + "\"";
  
  const { data: allResults, isLoading, error } = useQuery(['searchResults', query], () => fetchSearchResults(query || ''));
  
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
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
  
  useEffect(() => {
    if (allResults) {
      const filteredData = allResults.filter((item) =>
        i18n.language === 'ar' ? item.isArabic === 1 : item.isArabic === 0,
      );
      setFilteredResults(filteredData);
    }
  }, [language, allResults]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
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
        <AdSense.Google
          client='ca-pub-4293590491700199'
          slot='7898075502'
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
                <AdSense.Google
                  client="ca-pub-4293590491700199"
                  slot="6473874271"
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
              key={index}
              item={{
                word: result.word,
                definition: result.definition
              }}
              index={index + 1}
              lang={i18n.language}
              wordId={result.wordId}
              definitionId={result.definitionId}
              isLiked={result.isLiked}
              isDisliked={result.isDisliked}
              isReported={result.isReported}
              example={result.example}
            />
          ))
        }
      </div>
      <div className="feed-ad-space">
        <AdSense.Google
          client='ca-pub-4293590491700199'
          slot='1590891296'
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
