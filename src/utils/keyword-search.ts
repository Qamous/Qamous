export const KEYWORD_SEARCH_PAGE_SIZE=20;
export interface KeywordSearchPage<T=unknown> {results:T[];page:number;limit:number;hasMore:boolean}
export const keywordSearchKey=(query:string,language='en')=>['searchResults',query,'paged-v1',language==='ar'?'ar':'en'] as const;
export const keywordSearchPath=(query:string,page=1,language='en')=>'/word/search/kwd='+encodeURIComponent(query)+'?page='+page+'&limit='+KEYWORD_SEARCH_PAGE_SIZE+'&language='+(language==='ar'?'ar':'en');
