import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentBox from '../ContentBox';

interface SearchResult {
  word: string;
  definition: string;
}

const SearchResults: React.FC = () => {
  const { query } = useParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (query) {
      fetchSearchResults(query)
        .then((data) => {
          setResults(data);
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch search results');
          setResults([]);
        });
      console.log("query", query);
    } else {
      setResults([]);
    }
  }, [query]);
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div>
      {results.map((result, index) => (
        <ContentBox
          key={index}
          item={result}
          index={index}
          lang={'en'}
          wordId={0}
          definitionId={0}
          isLiked={false}
          isDisliked={false}
          isReported={false}
        />
      ))}
    </div>
  );
};

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const response = fetch('http://localhost:3000/word/search/kwd=' + query, {
    mode: 'cors',
    credentials: 'include',
  });
  console.log("response", response);
  return (await response).json();
}

export default SearchResults;
