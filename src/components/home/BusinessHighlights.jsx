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
      className="
        grid max-w-[400px] flex-1 grid-cols-[repeat(2,1fr)] gap-[30px]
        [@media(max-width:768px)]:w-full [@media(max-width:768px)]:gap-[25px]
      "
      aria-label="Why choose Garage Glo"
    >
      {highlights.map(({ icon, label }) => (
        <div
          className="flex flex-col items-center justify-center gap-[8px] text-center text-[19px] font-[650] text-[#222222]"
          key={label}
        >
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            width={113}
            height={86}
            className="block h-auto w-[113px] max-w-full"
          />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
