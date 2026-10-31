import Header from "../components/layout/Header.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { getSignUpFeedback } from "../lib/signUpFeedback.js";

const labelClassName =
  "mb-1.5 block text-[1.05rem] font-medium text-[#2a2a2a] sm:text-[1.08rem]";
const inputClassName =
  "h-11 w-full rounded-lg border border-[#d8d8d8] bg-[#f0f0f0] px-3 text-base text-[#1a1a1a] placeholder:text-[#7f7f7f] focus:border-[#b5b5b5] focus:outline-none";

function SignUpField({
  id,
  label,
  type,
  placeholder = "",
  value,
  onChange,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone: formData.phone.trim(),
          },
        },
      });

      const feedback = getSignUpFeedback(result, formData.email);
      if (feedback.status === "error") {
        setErrorMessage(feedback.message);
        return;
      }

      if (!feedback.requiresEmailConfirmation) {
        navigate("/customerportal", { replace: true });
        return;
      }

      setSuccessMessage(feedback.message);
      setFormData((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Sign up failed:", error);
      setErrorMessage(getSignUpFeedback({ data: null, error }).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-[#7a7a7a]">
      <Header role="customer" showNavigation />

      <div className="mx-auto mb-4 mt-3 w-[calc(100%-1.5rem)] max-w-170 rounded-3xl bg-[#ebebeb] p-5 shadow-sm sm:mb-0 sm:w-full sm:p-5 lg:p-6 xl:p-8">
        <h1 className="mb-4 text-center text-[2.1rem] font-bold tracking-[-0.04em] text-[#1c1c1c] sm:mb-5 sm:text-[2.5rem]">
          Sign Up
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit} aria-busy={isSubmitting}>
          {errorMessage && (
            <p role="alert" className="text-center text-sm text-red-700">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p role="status" className="text-center text-sm text-green-800">
              {successMessage}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <SignUpField
              id="first-name"
              label="First Name"
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={updateField("firstName")}
            />
            <SignUpField
              id="last-name"
              label="Last Name"
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={updateField("lastName")}
            />
          </div>
          <SignUpField
            id="email"
            label="Email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            value={formData.email}
            onChange={updateField("email")}
          />
          <SignUpField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="(XXX)XXX-XXXX"
            autoComplete="tel"
            value={formData.phone}
            onChange={updateField("phone")}
          />
          <SignUpField
            id="password"
            label="Password"
            type="password"
            placeholder="Create Password"
            autoComplete="new-password"
            value={formData.password}
            onChange={updateField("password")}
          />
          <SignUpField
            id="confirm-password"
            label="Re-Enter Password"
            type="password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={updateField("confirmPassword")}
          />

          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full max-w-45 rounded-md bg-[#2f2f2f] px-6 text-lg font-medium text-white transition hover:bg-[#232323]"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-[#2a2a2a]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="rounded-sm font-medium underline underline-offset-4 hover:text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f2f2f]"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
