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

  // handleSearch records the requested filters. When the new filters are
  // all blank (e.g. the automatic search SearchFilters fires on mount, or
  // the user clears the form), the reset is done right here in the event
  // handler rather than in the effect below - calling setState
  // synchronously inside an effect body causes an extra cascading render,
  // which the react-hooks/set-state-in-effect rule flags. Doing it here
  // means the effect only ever calls setState after real async work (the
  // fetch itself).
  const handleSearch = (activeFilters) => {
    setSearched(true);

    const cleaned = Object.fromEntries(
      Object.entries(activeFilters).filter(([, v]) => v),
    );
    if (Object.keys(cleaned).length === 0) {
      // Bump the id so any response from a request still in flight gets
      // ignored when it eventually arrives, and cancel it outright.
      requestIdRef.current += 1;
      if (abortRef.current) abortRef.current.abort();
      setVoters([]);
      setLoading(false);
    }

    setFilters(activeFilters);
  };

  useEffect(() => {
    // The "no active filter" case is handled synchronously in
    // handleSearch above - nothing to do here.
    if (!hasActiveFilter) return;

    // Cancel any request still in flight from a previous filter change.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;

    // This is the canonical "fetching data" effect pattern (see
    // https://react.dev/learn/you-might-not-need-an-effect#fetching-data) -
    // setLoading(true) has to fire synchronously as the fetch starts so the
    // UI shows a spinner immediately. There's no event handler to move this
    // into: the fetch is triggered by cleanFilters changing, which can come
    // from more than just a direct user click.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
