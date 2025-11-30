/**
 * Services - Main Export
 */

export { searchService, SearchService } from './search.service';
export type { SearchResult, SearchResults, SearchOptions } from './search.service';

// Optimized search index service with FlexSearch
export { searchIndexService, SearchIndexService } from './search-index.service';
export type { 
  IndexedSearchResult, 
  IndexedSearchResults, 
  SearchIndexOptions 
} from './search-index.service';
