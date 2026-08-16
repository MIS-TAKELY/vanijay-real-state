"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, Input } from "@repo/ui";
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

const SUGGESTIONS_LIST_ID = "search-suggestions";

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

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
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

  // Keep the keyboard-highlighted suggestion in view inside the dropdown.
  useEffect(() => {
    if (activeSuggestion < 0) return;
    document
      .getElementById(`suggestion-${activeSuggestion}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeSuggestion]);

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
      <div className="mx-auto max-w-containe px-gutter">
        <form
          aria-label="Search verified property listings"
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-xl items-center gap-1 rounded-xl border border-outline-variant bg-surface p-1.5 shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/20 sm:p-2"
        >
          <div
            ref={searchWrapRef}
            className="relative flex min-w-[160px] flex-1 items-center gap-2 pl-2"
          >
            <Icon
              name="search"
              className="shrink-0 text-[18px]"
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
              aria-controls={SUGGESTIONS_LIST_ID}
              aria-expanded={showSuggestions}
              aria-activedescendant={
                activeSuggestion >= 0
                  ? `suggestion-${activeSuggestion}`
                  : undefined
              }
              placeholder="Search properties by location or keyword..."
              autoComplete="off"
              className="h-9 border-0 bg-none text-sm shadow-none focus-visible:ring-0"
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Clear search"
                className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-container hover:text-on-surface active:bg-surface-container-high"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}

            {showSuggestions && (
              <ul
                id={SUGGESTIONS_LIST_ID}
                role="listbox"
                aria-label="Search suggestions"
                className="animate-dropdown-in absolute right-0 left-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-lg"
              >
                <li role="presentation">
                  <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-semibold tracking-wider text-on-surface-variant/70 uppercase">
                    Location suggestions
                  </p>
                </li>
                <li role="presentation" aria-hidden="true">
                  <div className="mx-3 h-px bg-outline-variant/60" />
                </li>
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.type}:${suggestion.value}`}>
                    <button
                      id={`suggestion-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeSuggestion}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(suggestion)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-surface-container active:bg-surface-container-high ${
                        index === activeSuggestion
                          ? "bg-surface-container-high"
                          : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          name="location_on"
                          className="shrink-0 text-[16px] text-on-surface-variant"
                        />
                        <span className="truncate text-on-surface">
                          {suggestion.label}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-semibold tracking-wide text-on-surface-variant">
                        {SUGGESTION_TYPE_LABELS[suggestion.type] ??
                          suggestion.type}
                      </span>
                    </button>
                  </li>
                ))}
                <li role="presentation" aria-hidden="true">
                  <div className="mx-3 h-px bg-outline-variant/60" />
                </li>
                <li role="presentation">
                  <p className="px-3 py-1.5 text-[10px] text-on-surface-variant/60">
                    <kbd className="font-sans font-medium">↑</kbd>{" "}
                    <kbd className="font-sans font-medium">↓</kbd> to navigate ·{" "}
                    <kbd className="font-sans font-medium">Enter</kbd> to select
                    · <kbd className="font-sans font-medium">Esc</kbd> to close
                  </p>
                </li>
              </ul>
            )}
          </div>

          <Button
            type="submit"
            className="h-9 shrink-0 gap-1.5 rounded-lg px-3 sm:px-4"
          >
            <Icon name="search" className="text-[16px]" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
