import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import SignOutMenuButton from "../components/navigation/SignOutMenuButton.jsx";
import { vehicles } from "../mock/vehicles.js";

const fields = [
  { label: "Year", key: "year" },
  { label: "Make", key: "make" },
  { label: "Model", key: "model" },
  { label: "License plate", key: "licensePlate" },
  { label: "Color", key: "color" },
];

const inputClass =
  "h-10 min-w-0 rounded-lg border border-[#c9cbd2] bg-white px-3 text-base outline-none focus-visible:border-[#126b9b] focus-visible:ring-2 focus-visible:ring-[#126b9b]/30";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c9cbd2] bg-white px-6 text-base font-semibold text-black hover:bg-[#f3f3f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126b9b] max-lg:px-4";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#292929] bg-[#292929] px-6 text-base font-semibold text-white hover:bg-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126b9b] max-lg:px-4";

export default function VehicleForm({ mode }) {
  const navigate = useNavigate();
  const isEditing = mode === "edit";
  const exampleVehicle = vehicles[0];
  const customerMenuContent = <SignOutMenuButton />;

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[#f8f5f3] text-[#171717]">
      <Header
        role="customer"
        isSignedIn
        customerMenuContent={customerMenuContent}
      />

      <main className="mx-auto box-border w-[calc(100%-48px)] max-w-190 py-8 pb-16 max-lg:w-[calc(100%-32px)] max-lg:max-w-120 max-lg:pt-7 max-lg:pb-12">
        <h1 className="mb-4 ml-2 text-[clamp(28px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.035em] max-lg:ml-0 max-lg:text-[28px]">
          {isEditing ? "Edit vehicle" : "Add vehicle"}
        </h1>

        <form
          className="rounded-2xl border border-[#e6e2e0] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-lg:p-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2.5">
            {fields.map(({ label, key }) => (
              <div
                className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[360px]:grid-cols-[96px_minmax(0,1fr)]"
                key={key}
              >
                <label className="font-semibold" htmlFor={key}>
                  {label}
                </label>
                <input
                  className={inputClass}
                  defaultValue={isEditing ? exampleVehicle[key] : ""}
                  id={key}
                  name={key}
                  type="text"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-3 max-[360px]:gap-2">
            <button
              className={secondaryButtonClass}
              onClick={() => navigate("/vehicles")}
              type="button"
            >
              Cancel
            </button>
            <button className={primaryButtonClass} type="submit">
              {isEditing ? "Save changes" : "Create vehicle"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
