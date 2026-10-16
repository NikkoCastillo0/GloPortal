import {
  CircleGauge,
  Wrench,
  CalendarCheck,
  MapPin
} from "lucide-react";

const highlights = [
  { icon: CircleGauge, label: "Quality Tire Service" },
  { icon: Wrench, label: "Fast Service" },
  { icon: CalendarCheck, label: "Easy Booking" },
  { icon: MapPin, label: "Locally Owned" }
];

export default function BusinessHighlights() {
  return (
    <section
      className="business-highlights"
      aria-label="Why choose Garage Glo"
    >
      {highlights.map(({ icon: Icon, label }) => (
        <div className="business-highlight" key={label}>
          <Icon size={32} aria-hidden="true" />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
