import Header from "../components/layout/Header.jsx";
import SignOutMenuButton from "../components/navigation/SignOutMenuButton.jsx";
import { useNavigate } from "react-router-dom";
import { vehicles } from "../mock/vehicles.js";

const vehicleFields = [
  { label: "Year", key: "year", width: "w-[14%]" },
  { label: "Make", key: "make", width: "w-[16%]" },
  { label: "Model", key: "model", width: "w-[17%]" },
  { label: "License Plate", key: "licensePlate", width: "w-[23%]" },
  { label: "Color", key: "color", width: "w-[15%]" },
];

const editButtonClass =
  "inline-flex min-h-[34px] min-w-[72px] items-center justify-center rounded-[9px] border border-[#c9cbd2] bg-white px-3.5 font-semibold text-black transition-colors hover:border-[#777] hover:bg-[#f3f3f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126b9b]";
const tableHeaderClass = "border-0 px-3 py-[9px] text-left font-bold";
const tableCellClass =
  "border-0 border-b border-[#e7e8eb] px-3 py-[9px] text-left";
const vehicleDetailClass =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-baseline gap-3";

function EditButton() {
  const navigate = useNavigate();

  return (
    <button
      className={editButtonClass}
      onClick={() => navigate("/vehicles/edit")}
      type="button"
    >
      Edit
    </button>
  );
}

export default function Vehicles() {
  const navigate = useNavigate();
  const customerMenuContent = <SignOutMenuButton />;

  return (
    <div className="min-h-screen bg-[#f8f5f3] text-[#171717]">
      <Header
        role="customer"
        isSignedIn
        customerMenuContent={customerMenuContent}
      />

      <main className="mx-auto box-border w-[calc(100%-48px)] max-w-280 py-8 pb-16 max-lg:w-[calc(100%-32px)] max-lg:max-w-120 max-lg:pt-7 max-lg:pb-12">
        <div className="mb-6 ml-6 flex items-center gap-6 max-lg:mb-5 max-lg:ml-0 max-lg:justify-between max-lg:gap-3 max-[360px]:flex-wrap">
          <h1 className="m-0 text-[clamp(28px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.035em] max-lg:text-[28px]">
            Your Vehicles
          </h1>
          <button
            className="inline-flex h-10 items-center rounded-lg bg-[#292929] px-5 text-sm font-semibold text-white hover:bg-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126b9b]"
            onClick={() => navigate("/vehicles/add")}
            type="button"
          >
            Add vehicle
          </button>
        </div>

        <section
          className="overflow-hidden rounded-2xl border border-[#e6e2e0] bg-white px-3 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-lg:p-3"
          aria-label="Your vehicles"
        >
          <table className="hidden w-full table-fixed border-0 border-separate border-spacing-0 text-[17px] lg:table">
            <thead className="bg-[#f0f0f2]">
              <tr>
                {vehicleFields.map((field, index) => (
                  <th
                    className={`${tableHeaderClass} ${field.width} ${index === 0 ? "rounded-l-[10px]" : ""}`}
                    key={field.key}
                    scope="col"
                  >
                    {field.label}
                  </th>
                ))}
                <th
                  className={`${tableHeaderClass} w-[15%] rounded-r-[10px] text-center`}
                  scope="col"
                >
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-[#171717]">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.licensePlate}>
                  {vehicleFields.map(({ key }) => (
                    <td className={tableCellClass} key={key}>
                      {vehicle[key]}
                    </td>
                  ))}
                  <td className={`${tableCellClass} text-center`}>
                    <EditButton />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid gap-3 lg:hidden">
            {vehicles.map((vehicle) => (
              <article
                className="min-w-0 rounded-xl border border-[#e7e8eb] bg-white p-3.5"
                key={vehicle.licensePlate}
              >
                <dl className="mb-3.5 grid gap-2.25">
                  {vehicleFields.map(({ label, key }) => (
                    <div className={vehicleDetailClass} key={key}>
                      <dt className="font-semibold">{label}</dt>
                      <dd className="m-0 min-w-0 text-right wrap-anywhere">
                        {vehicle[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="text-center [&>button]:w-full">
                  <EditButton />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
