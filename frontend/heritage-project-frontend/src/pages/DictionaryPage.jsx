import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  get_n_to_m_headwords,
  get_term_data,
  get_definition_data,
} from "@/services/dictionary";
import { LANGUAGE } from "@/utils/languageChars";
import { useErrorStore } from "@/stores/errorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Languages } from "lucide-react";
import { SpecialCharToolbar } from "@/components/SpecialCharacterToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

const DictionaryPage = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const showError = useErrorStore((state) => state.showError);
  //for pagination
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  //for searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("term"); // 'term' or 'definition'
  const [filters, setFilters] = useState({
    partOfSpeech: "",
  });

  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const upperCaseLanguage = language?.toUpperCase();

  //check if language is valid
  useEffect(() => {
    if (!upperCaseLanguage || !LANGUAGE[upperCaseLanguage]) {
      showError("Invalid language.", "error");
      navigate("/home");
    }
  }, [upperCaseLanguage]);

  // Sync page input at bottom with page state
  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  //searching
  useEffect(() => {
    const fetchPage = async () => {
      if (searchTerm) return;

      setLoading(true);
      try {
        const start = (page - 1) * PAGE_SIZE;
        const res = await get_n_to_m_headwords(start, start + PAGE_SIZE);

        setEntries(res);
        setMessage(null);
        //set view to top of page
        window.scrollTo(0, 0);
      } catch {
        showError("Failed to fetch dictionary entries", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [page, searchTerm]);

  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      let res;
      if (searchType === "definition") {
        res = await get_definition_data(searchTerm);
      } else {
        res = await get_term_data(searchTerm);
      }
      setEntries(res);
      setMessage(res.message ?? null);
    } catch {
      showError("Search failed", "error");
    } finally {
      setLoading(false);
    }
  };
  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  const onSpecialCharacterInsert = (character) => {
    setSearchTerm((prev) => prev + character);
  };

  const handlePageInputSubmit = () => {
    const newPage = parseInt(pageInput, 10);
    if (!isNaN(newPage) && newPage >= 1) {
      setPage(newPage);
    } else {
      // Reset input to current page if invalid
      setPageInput(page.toString());
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">
          Dictionary – {LANGUAGE[upperCaseLanguage]?.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse alphabetically or search for a word
        </p>
      </header>

      <section className="rounded-lg border p-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term">Search by Term</SelectItem>
              <SelectItem value="definition">Search by Definition</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search word..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="sm:flex-1"
          />
          <Button
            variant={showSpecialChars ? "destructive" : "outline"}
            size="icon"
            onClick={() => setShowSpecialChars((prev) => !prev)}
          >
            <Languages size={18} className="lucide-icon text-gray-800" />
          </Button>
          <Button onClick={handleSearchSubmit}>Search</Button>
          {searchTerm && (
            <Button variant="ghost" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </div>
        {showSpecialChars && (
          <SpecialCharToolbar onInsert={onSpecialCharacterInsert} />
        )}
        <div></div>
      </section>

      <section className="space-y-4">
        {/* Pagination */}
        {!searchTerm && (
          <div className="flex justify-center pb-4">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => {
                    if (page > 1) setPage((p) => p - 1);
                  }}
                />
                <Input
                  type="number"
                  min="1"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handlePageInputSubmit()
                  }
                  onBlur={handlePageInputSubmit}
                  className="w-16 text-center"
                  aria-label="Current page"
                />
                <PaginationNext onClick={() => setPage((p) => p + 1)} />
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {message && (
          <div className="rounded-md border bg-muted p-3 text-sm">
            {message}
          </div>
        )}

        {loading && <p className="text-sm">Loading…</p>}

        {!loading && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No results found.</p>
        )}

        <div className="grid gap-4">
          {entries.map((entry, id) => (
            <Card key={id} className="rounded-xl shadow-sm">
              <CardContent className="pt-5 space-y-4">
                {/* Hddeadword + POS */}
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base font-semibold">
                    • {entry.headword}
                  </span>

                  {entry.parts_of_speech.length > 0 && (
                    <span className="text-sm italic text-muted-foreground">
                      (
                      {entry.parts_of_speech
                        .map((p) => p.part_of_speech)
                        .join(", ")}
                      )
                    </span>
                  )}
                </div>

                <Separator />

                {/* Definitions */}
                <ol className="space-y-4 pl-5">
                  {entry.definitions.map((def) => (
                    <li key={def.def_number} className="space-y-1">
                      <p className="text-sm leading-relaxed">{def.gloss}</p>

                      {def.examples && (
                        <p className="pl-3 text-sm italic text-muted-foreground">
                          {def.examples}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>

                {/* Variants */}
                {entry.variants.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Variants
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {entry.variants.map((v, i) => (
                        <span key={i} className="text-sm italic">
                          {v.text}
                          {v.sources.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              ({v.sources.join(", ")})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry sources */}
                {entry.sources.length > 0 && (
                  <div className="flex gap-1">
                    {entry.sources.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {entry.sources.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {!searchTerm && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => {
                    if (page > 1) setPage((p) => p - 1);
                  }}
                />
                <Input
                  type="number"
                  min="1"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handlePageInputSubmit()
                  }
                  onBlur={handlePageInputSubmit}
                  className="w-16 text-center"
                  aria-label="Current page"
                />
                <PaginationNext onClick={() => setPage((p) => p + 1)} />
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
};

export default DictionaryPage;
