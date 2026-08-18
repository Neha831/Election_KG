import "./header-additions.css";
import chiefPhoto from "../assets/kg.png";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-title-group">
            <h1 className="header-title">श्री. कौस्तुभ गावडे</h1>
            {/* <p className="header-subtitle header-subtitle--role">
              मुख्य कार्यकारी अधिकारी स्वामी विवेकानंद संस्था, कोल्हापूर
            </p> */}
            <p className="header-subtitle header-subtitle--candidate">
              उमेदवार – पुणे विभाग
            </p>
<p className="header-subtitle header-subtitle--election">शिक्षक मतदारसंघ निवडणूक 2026</p>
            <p className="header-subtitle header-subtitle--muted">
              Voter Search Portal
            </p>
          </div>

          <div className="header-photo">
            <img src={chiefPhoto} alt="Shri Kaustubh Muralidhar Gavde" />
          </div>
        </div>
      </div>
    </header>
  );
}
