import Header from "../components/layout/Header.jsx";
import "./Login.css";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-[#7c7c7c]">
      <Header role="customer" showNavigation />

      <div className="mx-auto mt-6 max-w-170 rounded-[30px] bg-[#e9e9e9] p-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] sm:p-8 lg:p-10">
        <h1 className="mb-6 text-center text-[2.1rem] font-bold tracking-[-0.04em] text-[#1f1f1f] sm:text-[2.5rem]">
          Sign Up
        </h1>

        <form className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first-name"
                className="mb-2 block text-[1.05rem] font-medium text-[#2c2c2c]"
              >
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-[#f2f2f2] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b4b4b4] focus:outline-none"
                placeholder=""
              />
            </div>

            <div>
              <label
                htmlFor="last-name"
                className="mb-2 block text-[1.05rem] font-medium text-[#2c2c2c]"
              >
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-[#f2f2f2] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b4b4b4] focus:outline-none"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[1.05rem] font-medium text-[#2c2c2c]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-[#f2f2f2] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b4b4b4] focus:outline-none"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-[1.05rem] font-medium text-[#2c2c2c]"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-[#f2f2f2] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b4b4b4] focus:outline-none"
              placeholder="(XXX)XXX-XXXX"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[1.05rem] font-medium text-[#2c2c2c]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-[#f2f2f2] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b4b4b4] focus:outline-none"
              placeholder="Create Password"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-[1.05rem] font-medium text-[#2c2c2c]"
            >
              Re-Enter Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-[#f2f2f2] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b4b4b4] focus:outline-none"
              placeholder="Confirm Password"
            />
          </div>

          <div className="pt-2 text-center">
            <button
              type="submit"
              className="h-12 min-w-37.5 rounded-md bg-[#2f2f2f] px-8 text-lg font-medium text-white shadow-sm transition hover:bg-[#232323]"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
