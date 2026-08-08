// import { useState, useMemo } from "react";
// import { Users, Search, Printer, Check, X, Clock, ArrowUp, ArrowDown, ArrowUpDown, Copy, XCircle } from "lucide-react";
// import { api } from "../api";

// const STATUS_META = {
//   done: { label: "Done", rowClass: "row-done" },
//   not_done: { label: "Not Done", rowClass: "row-not-done" },
//   pending: { label: "Pralambit", rowClass: "row-pending" },
// };

// export default function SearchResults({
//   voters,
//   filters,
//   loading,
//   onStatusChange,
// }) {
//   const [query, setQuery] = useState("");
//   const [updatingId, setUpdatingId] = useState(null);
//   const [sortOrder, setSortOrder] = useState(null); // null | "asc" | "desc"

//   // { label: "Address" | "Institute Name", value: string } | null
//   const [expandedCell, setExpandedCell] = useState(null);
//   const [copied, setCopied] = useState(false);

//   // Client-side name filter over whatever the API already returned.
//   const filteredVoters = useMemo(() => {
//     if (!query.trim()) return voters;
//     const q = query.trim().toLowerCase();
//     return voters.filter((v) =>
//       (v.electorName || "").toLowerCase().includes(q),
//     );
//   }, [voters, query]);

//   // Alphabetical sort by Voter Name, applied on top of the name filter.
//   const displayedVoters = useMemo(() => {
//     if (!sortOrder) return filteredVoters;
//     const sorted = [...filteredVoters].sort((a, b) =>
//       (a.electorName || "").localeCompare(b.electorName || "", undefined, {
//         sensitivity: "base",
//       }),
//     );
//     return sortOrder === "asc" ? sorted : sorted.reverse();
//   }, [filteredVoters, sortOrder]);

//   const toggleSort = () => {
//     setSortOrder((prev) =>
//       prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
//     );
//   };

//   const SortIcon =
//     sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleStatusClick = async (voter, status) => {
//     setUpdatingId(voter._id);
//     try {
//       const updated = await api.updateVoterStatus(voter._id, status);
//       onStatusChange?.(updated);
//     } catch (err) {
//       console.error(err);
//       alert("Could not update status. Please try again.");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const openExpanded = (label, value) => {
//     if (!value) return;
//     setCopied(false);
//     setExpandedCell({ label, value });
//   };

//   const closeExpanded = () => {
//     setExpandedCell(null);
//     setCopied(false);
//   };

//   const handleCopy = async () => {
//     if (!expandedCell) return;
//     try {
//       await navigator.clipboard.writeText(expandedCell.value);
//       setCopied(true);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <section className="card results-card">
//       <div className="results-header">
//         <h2 className="section-title">
//           <Users size={20} />
//           SEARCH RESULT
//         </h2>

//         <div className="total-records-badge">
//           {filters?.district ? `${filters.district} — ` : ""}
//           Total Records: <strong>{voters.length}</strong>
//         </div>

//         <div className="results-actions">
//           <div className="search-box">
//             <Search size={16} />
//             <input
//               type="text"
//               placeholder="नावावरून Search करा..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//           </div>

//           <button className="btn btn-primary" onClick={handlePrint}>
//             <Printer size={18} />
//             Print
//           </button>
//         </div>
//       </div>

//       <div className="table-wrapper">
//         <table className="results-table">
//           <thead>
//             <tr>
//               <th className="col-id">Part No</th>
//               <th className="col-id">Sr. No</th>
//               <th
//                 className="col-name"
//                 onClick={toggleSort}
//                 style={{ cursor: "pointer", userSelect: "none" }}
//                 title="Click to sort alphabetically"
//               >
//                 <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
//                   Voter Name
//                   <SortIcon size={14} style={{ opacity: sortOrder ? 1 : 0.4 }} />
//                 </span>
//               </th>
//               <th className="col-mobile">Mobile No.</th>
//               <th className="col-address">Address</th>
//               <th className="col-institute">Institute Name</th>
//               <th className="col-narrow">Village</th>
//               <th className="col-narrow">Taluka</th>
//               <th className="col-status">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={9} className="empty-row">
//                   Loading...
//                 </td>
//               </tr>
//             ) : displayedVoters.length === 0 ? (
//               <tr>
//                 <td colSpan={9} className="empty-row">
//                   No voters found. Try adjusting your search filters.
//                 </td>
//               </tr>
//             ) : (
//               displayedVoters.map((v, idx) => {
//                 const statusMeta = STATUS_META[v.status] || STATUS_META.pending;
//                 return (
//                   <tr
//                     key={v._id ?? `${v.part}-${v.srNo}-${idx}`}
//                     className={statusMeta.rowClass}
//                   >
//                     <td className="col-id">{v.part}</td>
//                     <td className="col-id">{v.srNo}</td>
//                     <td className="voter-name col-name">{v.electorName}</td>
//                     <td className="col-mobile">{v.mobileNo || "-"}</td>
//                     <td
//                       className="col-address clickable-cell"
//                       onClick={() => openExpanded("Address", v.address)}
//                     >
//                       {v.address || "-"}
//                     </td>
//                     <td
//                       className="institute-link col-institute clickable-cell"
//                       onClick={() => openExpanded("Institute Name", v.institute)}
//                     >
//                       {v.institute}
//                     </td>
//                     <td className="col-narrow">{v.village || "-"}</td>
//                     <td className="col-narrow">{v.taluka || "-"}</td>
//                     <td className="col-status">
//                       <div className="status-buttons">
//                         <button
//                           className={`status-btn status-btn-done ${v.status === "done" ? "active" : ""}`}
//                           onClick={() => handleStatusClick(v, "done")}
//                           disabled={updatingId === v._id}
//                           title="Done"
//                         >
//                           <Check size={16} />
//                         </button>
//                         <button
//                           className={`status-btn status-btn-not-done ${v.status === "not_done" ? "active" : ""}`}
//                           onClick={() => handleStatusClick(v, "not_done")}
//                           disabled={updatingId === v._id}
//                           title="Not Done"
//                         >
//                           <X size={16} />
//                         </button>
//                         <button
//                           className={`status-btn status-btn-pending ${v.status === "pending" ? "active" : ""}`}
//                           onClick={() => handleStatusClick(v, "pending")}
//                           disabled={updatingId === v._id}
//                           title="Pralambit (Pending)"
//                         >
//                           <Clock size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {expandedCell && (
//         <div className="cell-modal-overlay" onClick={closeExpanded}>
//           <div className="cell-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="cell-modal-header">
//               <span>{expandedCell.label}</span>
//               <button className="cell-modal-close" onClick={closeExpanded} title="Close">
//                 <XCircle size={20} />
//               </button>
//             </div>
//             <div className="cell-modal-body">{expandedCell.value}</div>
//             <div className="cell-modal-footer">
//               <button className="btn btn-outline" onClick={handleCopy}>
//                 <Copy size={16} />
//                 {copied ? "Copied!" : "Copy"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Printer,
  Check,
  X,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Copy,
  XCircle,
} from "lucide-react";
import { api } from "../api";

const STATUS_META = {
  done: { label: "Done", rowClass: "row-done" },
  not_done: { label: "Not Done", rowClass: "row-not-done" },
  pending: { label: "Pralambit", rowClass: "row-pending" },
};

export default function SearchResults({
  voters,
  filters,
  loading,
  onStatusChange,
}) {
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // null | "asc" | "desc"

  // { label: "Address" | "Institute Name", value: string } | null
  const [expandedCell, setExpandedCell] = useState(null);
  const [copied, setCopied] = useState(false);

  // Client-side name filter over whatever the API already returned.
  const filteredVoters = useMemo(() => {
    if (!query.trim()) return voters;
    const q = query.trim().toLowerCase();
    return voters.filter((v) =>
      (v.electorName || "").toLowerCase().includes(q),
    );
  }, [voters, query]);

  // Alphabetical sort by Voter Name, applied on top of the name filter.
  const displayedVoters = useMemo(() => {
    if (!sortOrder) return filteredVoters;
    const sorted = [...filteredVoters].sort((a, b) =>
      (a.electorName || "").localeCompare(b.electorName || "", undefined, {
        sensitivity: "base",
      }),
    );
    return sortOrder === "asc" ? sorted : sorted.reverse();
  }, [filteredVoters, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
    );
  };

  const SortIcon =
    sortOrder === "asc"
      ? ArrowUp
      : sortOrder === "desc"
        ? ArrowDown
        : ArrowUpDown;

  const handlePrint = () => {
    window.print();
  };

  const handleStatusClick = async (voter, status) => {
    setUpdatingId(voter._id);
    try {
      const updated = await api.updateVoterStatus(voter._id, status);
      onStatusChange?.(updated);
    } catch (err) {
      console.error(err);
      alert("Could not update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openExpanded = (label, value) => {
    if (!value) return;
    setCopied(false);
    setExpandedCell({ label, value });
  };

  const closeExpanded = () => {
    setExpandedCell(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!expandedCell) return;
    try {
      await navigator.clipboard.writeText(expandedCell.value);
      setCopied(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="card results-card">
      <div className="results-header">
        <h2 className="section-title">
          <Users size={20} />
          SEARCH RESULT
        </h2>

        <div className="total-records-badge">
          {filters?.district ? `${filters.district} — ` : ""}
          Total Records: <strong>{voters.length}</strong>
        </div>

        <div className="results-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="नावावरून Search करा..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* ===== Desktop / tablet table (hidden on mobile via CSS) ===== */}
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th className="col-id">Part No</th>
              <th className="col-id">Sr. No</th>
              <th
                className="col-name"
                onClick={toggleSort}
                style={{ cursor: "pointer", userSelect: "none" }}
                title="Click to sort alphabetically"
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Voter Name
                  <SortIcon
                    size={14}
                    style={{ opacity: sortOrder ? 1 : 0.4 }}
                  />
                </span>
              </th>
              <th className="col-mobile">Mobile No.</th>
              <th className="col-address">Address</th>
              <th className="col-institute">Institute Name</th>
              <th className="col-narrow">Village</th>
              <th className="col-narrow">Taluka</th>
              <th className="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="empty-row">
                  Loading...
                </td>
              </tr>
            ) : displayedVoters.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-row">
                  No voters found. Try adjusting your search filters.
                </td>
              </tr>
            ) : (
              displayedVoters.map((v, idx) => {
                const statusMeta = STATUS_META[v.status] || STATUS_META.pending;
                return (
                  <tr
                    key={v._id ?? `${v.part}-${v.srNo}-${idx}`}
                    className={statusMeta.rowClass}
                  >
                    <td className="col-id">{v.part}</td>
                    <td className="col-id">{v.srNo}</td>
                    <td className="voter-name col-name">{v.electorName}</td>
                    <td className="col-mobile">{v.mobileNo || "-"}</td>
                    <td
                      className="col-address clickable-cell"
                      onClick={() => openExpanded("Address", v.address)}
                    >
                      {v.address || "-"}
                    </td>
                    <td
                      className="institute-link col-institute clickable-cell"
                      onClick={() =>
                        openExpanded("Institute Name", v.institute)
                      }
                    >
                      {v.institute}
                    </td>
                    <td className="col-narrow">{v.village || "-"}</td>
                    <td className="col-narrow">{v.taluka || "-"}</td>
                    <td className="col-status">
                      <div className="status-buttons">
                        <button
                          className={`status-btn status-btn-done ${v.status === "done" ? "active" : ""}`}
                          onClick={() => handleStatusClick(v, "done")}
                          disabled={updatingId === v._id}
                          title="Done"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className={`status-btn status-btn-not-done ${v.status === "not_done" ? "active" : ""}`}
                          onClick={() => handleStatusClick(v, "not_done")}
                          disabled={updatingId === v._id}
                          title="Not Done"
                        >
                          <X size={16} />
                        </button>
                        <button
                          className={`status-btn status-btn-pending ${v.status === "pending" ? "active" : ""}`}
                          onClick={() => handleStatusClick(v, "pending")}
                          disabled={updatingId === v._id}
                          title="Pralambit (Pending)"
                        >
                          <Clock size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
{/* 
      
      <div className="mobile-cards">
        {loading ? (
          <div className="empty-row">Loading...</div>
        ) : displayedVoters.length === 0 ? (
          <div className="empty-row">
            No voters found. Try adjusting your search filters.
          </div>
        ) : (
          displayedVoters.map((v, idx) => {
            const statusMeta = STATUS_META[v.status] || STATUS_META.pending;
            return (
              <div
                key={v._id ?? `card-${v.part}-${v.srNo}-${idx}`}
                className={`voter-card ${statusMeta.rowClass}`}
              >
                <div className="voter-card-top">
                  <div className="voter-card-name">{v.electorName}</div>
                  <div className="voter-card-meta">
                    Part {v.part} · Sr {v.srNo}
                  </div>
                </div>

                <div className="voter-card-row">
                  <span>Mobile</span>
                  <span>{v.mobileNo || "-"}</span>
                </div>

                <div
                  className="voter-card-row clickable-cell"
                  onClick={() => openExpanded("Address", v.address)}
                >
                  <span>Address</span>
                  <span>{v.address || "-"}</span>
                </div>

                <div
                  className="voter-card-row clickable-cell"
                  onClick={() => openExpanded("Institute Name", v.institute)}
                >
                  <span>Institute</span>
                  <span>{v.institute || "-"}</span>
                </div>

                <div className="voter-card-row">
                  <span>Village / Taluka</span>
                  <span>
                    {v.village || "-"} / {v.taluka || "-"}
                  </span>
                </div>

                <div className="voter-card-status">
                  <button
                    className={`status-btn status-btn-done ${v.status === "done" ? "active" : ""}`}
                    onClick={() => handleStatusClick(v, "done")}
                    disabled={updatingId === v._id}
                    title="Done"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className={`status-btn status-btn-not-done ${v.status === "not_done" ? "active" : ""}`}
                    onClick={() => handleStatusClick(v, "not_done")}
                    disabled={updatingId === v._id}
                    title="Not Done"
                  >
                    <X size={16} />
                  </button>
                  <button
                    className={`status-btn status-btn-pending ${v.status === "pending" ? "active" : ""}`}
                    onClick={() => handleStatusClick(v, "pending")}
                    disabled={updatingId === v._id}
                    title="Pralambit"
                  >
                    <Clock size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div> */}

      {expandedCell && (
        <div className="cell-modal-overlay" onClick={closeExpanded}>
          <div className="cell-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cell-modal-header">
              <span>{expandedCell.label}</span>
              <button
                className="cell-modal-close"
                onClick={closeExpanded}
                title="Close"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="cell-modal-body">{expandedCell.value}</div>
            <div className="cell-modal-footer">
              <button className="btn btn-outline" onClick={handleCopy}>
                <Copy size={16} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
