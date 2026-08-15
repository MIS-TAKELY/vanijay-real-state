"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, Input } from "@repo/ui";
import { useDebounce } from "hooks/use-debounce";
import {
  fetchSearchSuggestionsGraphql,
  type SearchSuggestion,
} from "lib/api/services/properties/properties";

const SUGGESTION_TYPE_LABELS: Record<string, string> = {
  DISTRICT: "District",
  MUNICIPALITY: "Municipality",
  AREA: "Area",
};

/**
 * Landing-page search box. Typing shows debounced location suggestions;
 * submitting (Enter or a suggestion click) navigates to the dedicated
 * `/search` results page with the keyword in the URL.
 */
export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debouncedQuery = useDebounce(query, 250);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const goToSearch = (q: string) => {
    const needle = q.trim();
    router.push(
      needle ? `/search?q=${encodeURIComponent(needle)}` : "/search",
      { scroll: false },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    goToSearch(query);
  };

  const applySuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    setSuggestionsOpen(false);
    goToSearch(suggestion.value);
  };

  // Debounced location autocomplete for the search box.
  useEffect(() => {
    const needle = debouncedQuery.trim();
    if (needle.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
      return;
    }
    let cancelled = false;
    fetchSearchSuggestionsGraphql(needle)
      .then((data) => {
        if (!cancelled) {
          setSuggestions(data);
          setActiveSuggestion(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close the dropdown when clicking outside the search box.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0 || !suggestionsOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setSuggestionsOpen(false);
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      const suggestion = suggestions[activeSuggestion];
      if (suggestion) {
        e.preventDefault();
        applySuggestion(suggestion);
      }
    }
  };

  const showSuggestions =
    suggestionsOpen &&
    suggestions.length > 0 &&
    debouncedQuery.trim().length >= 2;

  return (
    <section className="relative z-10 pt-6 pb-4 md:pt-8 md:pb-4">
      <div className="mx-auto max-w-container-max px-gutter">
        <form
          aria-label="Search verified property listings"
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/20"
        >
          <div
            ref={searchWrapRef}
            className="relative flex min-w-[160px] flex-1 items-center gap-2"
          >
            <Icon
              name="search"
              className="text-on-surface-variant text-[18px]"
            />
            <Input
              type="text"
              name="q"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={handleKeyDown}
              aria-label="Search by location, property ID, or keyword"
              placeholder="Search properties by location or keyword..."
              autoComplete="off"
              className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
            />
            {showSuggestions && (
              <ul
                role="listbox"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-lg"
              >
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.type}:${suggestion.value}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeSuggestion}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(suggestion)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-container ${
                        index === activeSuggestion ? "bg-surface-container" : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon
                          name="location_on"
                          className="shrink-0 text-[14px] text-on-surface-variant"
                        />
                        <span className="truncate text-on-surface">
                          {suggestion.label}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                        {SUGGESTION_TYPE_LABELS[suggestion.type] ??
                          suggestion.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
