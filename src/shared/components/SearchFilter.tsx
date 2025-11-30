import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, SortAsc, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useTranslation } from "@/shared/hooks/useTranslation";

export interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  placeholder?: string;
  categories?: FilterOption[];
  tags?: FilterOption[];
  sortOptions?: FilterOption[];
  onSearchChange: (search: string) => void;
  onCategoryChange?: (category: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onSortChange?: (sort: string) => void;
  showFilters?: boolean;
}

const SearchFilter = ({
  placeholder,
  categories = [],
  tags = [],
  sortOptions,
  onSearchChange,
  onCategoryChange,
  onTagsChange,
  onSortChange,
  showFilters = true,
}: SearchFilterProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const defaultSortOptions = [
    { value: "newest", label: t('sort.newest') },
    { value: "oldest", label: t('sort.oldest') },
    { value: "a-z", label: t('sort.az') },
    { value: "z-a", label: t('sort.za') },
    { value: "popular", label: t('sort.popular') },
  ];
  
  const effectiveSortOptions = sortOptions || defaultSortOptions;
  const effectivePlaceholder = placeholder || t('search.placeholder');
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (sort && sort !== "newest") params.set("sort", sort);
    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, selectedTags, sort, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange?.(value);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onTagsChange?.(newTags);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange?.(value);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedTags([]);
    setSort("newest");
    onSearchChange("");
    onCategoryChange?.("All");
    onTagsChange?.([]);
    onSortChange?.("newest");
  };

  const hasActiveFilters = search || selectedCategory !== "All" || selectedTags.length > 0 || sort !== "newest";

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={effectivePlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-card border-border/50"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <>
            {/* Category Filter */}
            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-[180px] h-11 bg-card border-border/50">
                  <SelectValue placeholder={t('filter.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t('filter.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[150px] h-11 bg-card border-border/50">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('filter.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {effectiveSortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 bg-card border-border/50">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('filter.tags')}
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{t('filter.filterByTags')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.value}
                          variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => handleTagToggle(tag.value)}
                        >
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{t('filter.activeFilters')}</span>
          {search && (
            <Badge variant="secondary" className="gap-1">
              {t('filter.searchLabel')} {search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearchChange("")} />
            </Badge>
          )}
          {selectedCategory !== "All" && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("All")} />
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tags.find(t => t.value === tag)?.label || tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            {t('filter.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
