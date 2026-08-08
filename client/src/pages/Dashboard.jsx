import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import SearchFilters from "../components/SearchFilters";
import SearchResults from "../components/SearchResults";
import { api } from "../api";

export default function Dashboard() {
  const [voters, setVoters] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Keep the in-flight request around so we can cancel it if a newer
  // search starts before the old one finishes.
  const abortRef = useRef(null);

  // Belt-and-suspenders: even if a stale request isn't actually
  // cancelled in time (slow network, cancellation racing the response),
  // this sequence number ensures only the response matching the most
  // recent request is ever applied to state.
  const requestIdRef = useRef(0);

  const cleanFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    [filters],
  );
  const hasActiveFilter = Object.keys(cleanFilters).length > 0;

  // handleSearch just records the requested filters. The actual fetch
  // happens in the effect below, gated on hasActiveFilter, so a blank
  // search (e.g. the automatic one SearchFilters fires on mount) never
  // hits the API and never tries to pull down the whole dataset.
  const handleSearch = (activeFilters) => {
    setSearched(true);
    setFilters(activeFilters);
  };

  useEffect(() => {
    if (!hasActiveFilter) {
      // Bump the id so any response from a request started just before
      // filters were cleared gets ignored when it eventually arrives.
      requestIdRef.current += 1;
      setVoters([]);
      setLoading(false);
      return;
    }

    // Cancel any request still in flight from a previous filter change.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;

    setLoading(true);
    api
      .searchVoters(cleanFilters, controller.signal)
      .then((data) => {
        // Ignore this response if a newer search has started since.
        if (requestId !== requestIdRef.current) return;
        setVoters(data.results || []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (requestId !== requestIdRef.current) return;
        console.error(err);
        setVoters([]);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanFilters]);

  // Called after a volunteer clicks Done/Not Done/Pending on a row.
  // Updates just that voter in local state so the color reflects instantly.
  const handleStatusChange = (updatedVoter) => {
    setVoters((prev) =>
      prev.map((v) => (v._id === updatedVoter._id ? updatedVoter : v)),
    );
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <SearchFilters onSearch={handleSearch} />
        {searched && (
          <SearchResults
            voters={voters}
            filters={filters}
            loading={hasActiveFilter && loading}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
}
