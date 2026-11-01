import Header from "../components/layout/Header.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { validateSignUp } from "../lib/signUpValidation.js";
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
  error,
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
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
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
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (field) => (event) => {
    const nextFormData = { ...formData, [field]: event.target.value };
    setFormData(nextFormData);
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors(validateSignUp(nextFormData).errors);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setSuccessMessage("");

    const validation = validateSignUp(formData);
    setFieldErrors(validation.errors);
    if (!validation.isValid) {
      const firstInvalidField = Object.keys(validation.errors)[0];
      const fieldIds = {
        firstName: "first-name",
        lastName: "last-name",
        confirmPassword: "confirm-password",
      };
      event.currentTarget.elements
        .namedItem(fieldIds[firstInvalidField] ?? firstInvalidField)
        ?.focus();
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

<form
  className="space-y-4"
  onSubmit={handleSubmit}
  noValidate
  aria-busy={isSubmitting}
>
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
              error={fieldErrors.firstName}
            />
            <SignUpField
              id="last-name"
              label="Last Name"
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={updateField("lastName")}
              error={fieldErrors.lastName}
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
            error={fieldErrors.email}
          />
          <SignUpField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="(XXX)XXX-XXXX"
            autoComplete="tel"
            value={formData.phone}
            onChange={updateField("phone")}
            error={fieldErrors.phone}
          />
          <SignUpField
            id="password"
            label="Password"
            type="password"
            placeholder="Create Password"
            autoComplete="new-password"
            value={formData.password}
            onChange={updateField("password")}
            error={fieldErrors.password}
          />
          <SignUpField
            id="confirm-password"
            label="Re-Enter Password"
            type="password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={updateField("confirmPassword")}
            error={fieldErrors.confirmPassword}
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
