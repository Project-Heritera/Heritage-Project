import React, { useState, useEffect } from "react";
import api from "@/services/api";

const Dictionary = () => {
  const [query, setQuery] = useState("");
  const [searchDefinitions, setSearchDefinitions] = useState(false);
  const [selectedPos, setSelectedPos] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [includeExamples, setIncludeExamples] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchAccents, setMatchAccents] = useState(false);

  const [results, setResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [showExamples, setShowExamples] = useState({});
  const [showInfo, setShowInfo] = useState(false);

  const [allPos, setAllPos] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch POS and sources on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [posRes, srcRes] = await Promise.all([
          api.get("/dictionary/pos/"),
          api.get("/dictionary/sources/")
        ]);

        setAllPos(posRes.data);
        setAllSources(srcRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch results function
  const fetchResults = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await api.get("/dictionary/search_dict/", {
        params: {
          q: searchQuery,
          search_definitions: searchDefinitions,
          whole_word: wholeWord,
          match_accents: matchAccents,
          search_examples: includeExamples,
          part_of_speech: selectedPos,
          source: selectedSource
        }
      });

      setResults(response.data.results || []);
      setResultCount(response.data.result_count || 0);
      setShowExamples({});
      console.log(response.data)
    } catch (err) {
      console.error("Error fetching dictionary results:", err);
      setResults([]);
      setResultCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial search on page load
    useEffect(() => {
        if (!query) {
            fetchResults("");
        }
    }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults(query);
  };

  const toggleExample = (entryIndex, defIndex) => {
    const key = `${entryIndex}-${defIndex}`;
    setShowExamples((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dictionary of Louisiana Creole</h1>
      <p>The contents of this dictionary remain the intellectual property of the following authors: 
        Albert Valdman, Thomas A. Klingler, Margaret M. Marshall, Kevin J. Rottet</p>

      <p>
        Information on contents and orthography:{" "}
        <span
          style={{ cursor: "pointer", color: "#0066cc", textDecoration: "underline" }}
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? "(see less)" : "(see more)"}
        </span>
      </p>

      {showInfo && (
        <ul>
            <li>Warning: There has been no censoring of the data, including offensive language or racial slurs.</li>
            <li>
                Orthography: Entries use the modern Kouri-Vini Orthography; however, the examples retain their original orthography based on Haitian Creole from the book.
                There are also several examples written in a French Orthography; these have also been left as is in the book.
                Additionally, the acute (à) and circumflex (â) when used for stress, preterit, or disambiguation, have <i>not</i> been included separately (i.e., aren't used).
            </li>
            <li>
                There are several variants for certain sounds that have <i>not</i> been included in the variants for entries.
                Please use the variants in quotations in place of the others when searching for words with the following sounds:
                <ul>
                    <li>use "s" for /s/ ← s, ç</li>
                    <li>use "è" for /æ/ ← æ, è</li>
                    <li>use "i" for /ɪ/ ← ì, i</li>
                    <li>use "an" for /ã/ ← an, am, en, em</li>
                    <li>use "on" for /ɔ̃/ ← on, om</li>
                    <li>use "in" for /ɛ̃/ ← in, im</li>
                </ul>
            </li>
            <li>
                Parts of Speech abbreviation correspondences:
                <ul>
                    <li>adj. = Adjective</li>
                    <li>adv. = Adverb</li>
                    <li>adv.phr. = Adverbial Phrase</li>
                    <li>art.def. = Definite Article</li>
                    <li>art.indef. = Indefinite Article</li>
                    <li>conj. = Conjunction</li>
                    <li>dem. = Demonstrative</li>
                    <li>det. = Determiner</li>
                    <li>det.poss. = Possessive Determiner</li>
                    <li>f. = Feminine</li>
                    <li>int. = Interjection</li>
                    <li>interr.phr. = Interrogative Phrase</li>
                    <li>m. = Masculine</li>
                    <li>n. = Noun</li>
                    <li>n.phr. = Noun Phrase</li>
                    <li>num.card. = Cardinal Number</li>
                    <li>num.ord. = Ordinal Number</li>
                    <li>onom. = Onomatopoeia</li>
                    <li>pl. = Plural</li>
                    <li>place n. = Place Name</li>
                    <li>prep. = Preposition</li>
                    <li>pron. = Pronoun</li>
                    <li>pron.indef. = Indefinite Pronoun</li>
                    <li>pron.refl. = Reflexive Pronoun</li>
                    <li>pron.rel. = Relative Pronoun</li>
                    <li>prop.n. = Proper Noun</li>
                    <li>ptcl. = Preverbal Particle</li>
                    <li>sg. = Singular</li>
                    <li>v. = Verb</li>
                    <li>v.aux. = Auxiliary Verb</li>
                    <li>v.cop. = Copular Verb</li>
                    <li>v.intr. = Intransitive Verb</li>
                    <li>v.mod. = Modal Verb</li>
                    <li>v.phr. = Verb Phrase</li>
                    <li>v.refl. = Reflexive Verb</li>
                    <li>v.tr. = Transitive Verb</li>
                </ul>
            </li>
            <li>
                Sources abbreviation correspondences (post-1960):
                <ul>
                    <li>gen = (BT + CA + NE + PC + ST)</li>
                    <li>AN = Ancelet 1994</li>
                    <li>BT = Bayou Teche, field data</li>
                    <li>CA = Côte des Allemands, field data</li>
                    <li>DC = Clifton 1980</li>
                    <li>DT 77 = Tentchoff 1977</li>
                    <li>GY = Guidry, Richard</li>
                    <li>HW = Hebert Wiltz</li>
                    <li>MO 60 = Morgan 1960</li>
                    <li>MO 69 = Morgan 1969</li>
                    <li>MO 72 = Morgan 1972</li>
                    <li>NE = Neumann 1985</li>
                    <li>PC = Pointe Coupee, field data</li>
                    <li>ST = Saint Tammany, field data</li>
                </ul>

                Sources abbreviation correspondences (pre-1960):
                <ul>
                    <li>BD = Broussard 1942</li>
                    <li>BI = Bienvenu 1933</li>
                    <li>BO = Bourgeois 1927</li>
                    <li>DU = Durand 1930</li>
                    <li>FO T# = Fortier 1895</li>
                    <li>FO 1887 = Fortier 1887</li>
                    <li>GC1 = Cable 1886a</li>
                    <li>GC2 = Cable 1886b</li>
                    <li>JR = Jarreau 1931</li>
                    <li>KB = Krehbiel 1962</li>
                    <li>LA = Lavergne 1930</li>
                    <li>ME = Mercier 1881</li>
                    <li>ME 90 = Mercier 1890</li>
                    <li>ME 91 = Mercier 1891</li>
                    <li>PE = Perret 1933</li>
                    <li>T# = Neumann 1987 Text # (T12–T17 are satirized Creole, use with caution)</li>
                    <li>TM = Marie Augustin</li>
                    <li>TN = Tinker 1935</li>
                    <li>TP = Trappey 1916</li>
                    <li>WO = Marguerite Wogan</li>
                </ul>
            </li>
        </ul>
      )}

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={searchDefinitions}
            onChange={() => setSearchDefinitions((prev) => !prev)}
          /> Search definitions (English/French)
        </label>

        <select value={selectedPos} onChange={(e) => setSelectedPos(e.target.value)}>
          <option value="">All Parts of Speech</option>
          {allPos.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>

        <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}>
          <option value="">All Sources</option>
          {allSources.map((src) => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={includeExamples}
            onChange={() => setIncludeExamples((prev) => !prev)}
          /> Search examples
        </label>

        <label>
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={() => setWholeWord((prev) => !prev)}
          /> Match whole words
        </label>

        <label>
          <input
            type="checkbox"
            checked={matchAccents}
            onChange={() => setMatchAccents((prev) => !prev)}
          /> Match accents
        </label>

        <button type="submit">Search</button>
      </form>

      <hr />

      {results.length > 0 ? (
        <>
          <h2 style={{ marginLeft: "1em", color: "#666" }}>
            {resultCount} entr{resultCount === 1 ? "y" : "ies"} found
          </h2>

          <ul>
            {results.map((entry, entryIndex) => (
              <li key={entryIndex} style={{ marginBottom: "1em", position: "relative" }}>
                <strong>{entry.headword}</strong>
                <em>({entry.parts_of_speech?.map(p => p.part_of_speech).join(", ")})</em>

                {entry.sources?.length > 0 && (
                <p style={{ fontSize: "0.9em", color: "#666" }}>
                    Sources: {entry.sources.join(", ")}
                </p>
                )}

                {entry.variants?.length > 0 && entry.variants.map((variant, i) => (
                <p key={i} style={{ marginRight: "10px", display: "inline-block", fontSize: "0.9em" }}>
                    {variant.text} {variant.sources?.length ? `(${variant.sources.join(", ")})` : ""}
                </p>
                ))}

                <ol style={{ marginLeft: "2em", marginTop: "0.5em" }}>
                  {entry.definitions?.map((def, defIndex) => {
                    const key = `${entryIndex}-${defIndex}`;
                    return (
                      <li key={defIndex}>
                        {def.gloss}
                        {def.examples && (
                          <>
                            <span style={{ display: showExamples[key] ? "inline" : "none" }}>
                              <br />
                              {def.examples}
                            </span>
                            <a
                              href="#"
                              style={{ color: "#0066cc", fontSize: "0.9em" }}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleExample(entryIndex, defIndex);
                              }}
                            >
                              {showExamples[key] ? "Hide examples" : "See examples"}
                            </a>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h2 style={{ marginLeft: "1em", color: "#666" }}>No entries found.</h2>
      )}
    </div>
  );
};

export default Dictionary;
