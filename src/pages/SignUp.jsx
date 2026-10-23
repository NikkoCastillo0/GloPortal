import Header from "../components/layout/Header.jsx";

const labelClassName =
  "mb-1.5 block text-[1.05rem] font-medium text-[#2a2a2a] sm:text-[1.08rem]";
const inputClassName =
  "h-11 w-full rounded-lg border border-[#d8d8d8] bg-[#f0f0f0] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b5b5b5] focus:outline-none";

function SignUpField({ id, label, type, placeholder = "" }) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={inputClassName}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function SignUp() {
  return (
    <div className="flex min-h-svh flex-col bg-[#7a7a7a]">
      <Header role="customer" showNavigation />

      <div className="mx-auto mb-4 mt-3 w-[calc(100%-1.5rem)] max-w-170 rounded-3xl bg-[#ebebeb] p-5 shadow-sm sm:mb-0 sm:w-full sm:p-5 lg:p-6 xl:p-8">
        <h1 className="mb-4 text-center text-[2.1rem] font-bold tracking-[-0.04em] text-[#1c1c1c] sm:mb-5 sm:text-[2.5rem]">
          Sign Up
        </h1>

        <form className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <SignUpField id="first-name" label="First Name" type="text" />
            <SignUpField id="last-name" label="Last Name" type="text" />
          </div>
          <SignUpField
            id="email"
            label="Email"
            type="email"
            placeholder="you@email.com"
          />
          <SignUpField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="(XXX)XXX-XXXX"
          />
          <SignUpField
            id="password"
            label="Password"
            type="password"
            placeholder="Create Password"
          />
          <SignUpField
            id="confirm-password"
            label="Re-Enter Password"
            type="password"
            placeholder="Confirm Password"
          />

          <div className="pt-2 text-center">
            <button
              type="submit"
              className="h-12 w-full max-w-45 rounded-md bg-[#2f2f2f] px-6 text-lg font-medium text-white transition hover:bg-[#232323]"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
