import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentBox from '../ContentBox';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

interface SearchResult {
  word: string;
  definition: string;
  isArabic: number;
  wordId: number;
  definitionId: number;
}

interface JsonContent {
  word: string,
  definition: string
}

const SearchResults: React.FC = () => {
  const { query } = useParams();
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(i18n.language);
  
  const { t } = useTranslation();
  const searchResults = t('search_results', {
    searchTerm: query,
    returnObjects: true,
  }) as JsonContent;
  
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
    const fetchResults = async () => {
      if (query) {
        try {
          const data = await fetchSearchResults(query);
          console.log(data);
          setAllResults(data);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch search results');
          setAllResults([]);
        }
      } else {
        setAllResults([]);
      }
    };
    
    fetchResults();
  }, [query]);
  
  useEffect(() => {
    const filterResults = () => {
      const filteredData = allResults.filter((item) =>
        i18n.language === 'ar' ? item.isArabic === 1 : item.isArabic === 0,
      );
      setFilteredResults(filteredData);
    };
    
    filterResults();
  }, [language, allResults]);
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className={'home'}>
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
      />
      {filteredResults.map((result, index) => (
        <ContentBox
          key={index}
          item={result}
          index={index + 1}
          lang={i18n.language}
          wordId={result.wordId}
          definitionId={result.definitionId}
          isLiked={false}
          isDisliked={false}
          isReported={false}
        />
      ))}
    </div>
  );
};

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const response = await fetch('http://localhost:3000/word/search/kwd=' + query, {
    mode: 'cors',
    credentials: 'include',
  });
  return response.json();
}

export default SearchResults;
