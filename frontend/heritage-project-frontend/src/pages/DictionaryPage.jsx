import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get_n_to_m_headwords, get_term_data } from "@/services/dictionary";
import { LANGUAGE } from "@/utils/languageChars";
import { useErrorStore } from "@/stores/errorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
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

  //for searching
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    partOfSpeech: "",
  });

  const [total, setTotal] = useState(0);
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

  //searching
  useEffect(() => {
    const fetchPage = async () => {
      if (searchTerm) return;

      setLoading(true);
      try {
        const start = (page - 1) * PAGE_SIZE;
        const res = await get_n_to_m_headwords(start, start + PAGE_SIZE);

        setEntries(res);
        setTotal(res.length);
        setMessage(null);
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
      const res = await get_term_data({
        language,
        term: searchTerm,
        filters,
      });

      setEntries(res.data);
      setTotal(res.data.length);
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
          <Input
            placeholder="Search word..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="sm:flex-1"
          />
          <Button onClick={handleSearchSubmit}>Search</Button>
          {searchTerm && (
            <Button variant="ghost" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-4">
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
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                />
                <PaginationNext
                  disabled={page * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                />
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
};

export default DictionaryPage;
