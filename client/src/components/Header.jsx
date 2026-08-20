import "./header-additions.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-title-group">
            <h1 className="header-title">श्री. कौस्तुभ मुरलीधर गावडे</h1>
            <p className="header-subtitle header-subtitle--candidate">
              उमेदवार – पुणे विभाग शिक्षक मतदारसंघ निवडणूक 2026
            </p>
            <p className="header-subtitle header-subtitle--muted">
              Voter Search Portal
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}