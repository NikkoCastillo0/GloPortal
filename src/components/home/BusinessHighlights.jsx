import tireIcon from "../../assets/home icons/Tire Icon 1.svg";
import toolsIcon from "../../assets/home icons/Tools icon 1.svg";
import bookingIcon from "../../assets/home icons/Booking icon 1.svg";
import mapPinIcon from "../../assets/home icons/map pin icon 1.svg";

const highlights = [
  { icon: tireIcon, label: "Quality Tire Service" },
  { icon: toolsIcon, label: "Fast Service" },
  { icon: bookingIcon, label: "Easy Booking" },
  { icon: mapPinIcon, label: "Locally Owned" }
];

export default function BusinessHighlights() {
  return (
    <section
      className="business-highlights"
      aria-label="Why choose Garage Glo"
    >
      {highlights.map(({ icon, label }) => (
        <div className="business-highlight" key={label}>
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            width={113}
            height={86}
            className="business-highlight-icon"
          />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
