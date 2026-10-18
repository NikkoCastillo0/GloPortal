import { useState } from "react";
import emailjs from "@emailjs/browser";
import ContactImage from "../../assets/ContactImage.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { FacebookIcon } from "@/components/icons/simple-icons-facebook";
import { InstagramIcon } from "@/components/icons/simple-icons-instagram";

import { useForm } from "react-hook-form";

export default function ContactSection() {
  const [submissionStatus, setSubmissionStatus] = useState("");
  const sendEmail = async (data) => {
    setSubmissionStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: data.name,
          email: data.email,
          message: data.message,
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
      );
      setSubmissionStatus("success");
    } catch (error) {
      console.error("Failed to send contact form:", error);
      setSubmissionStatus("error");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <section
      className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2 md:gap-8 md:p-8"
      id="contact"
    >
      <img
        src={ContactImage}
        alt="Mechanic working on a tire"
        className="my-auto w-full max-w-64 mx-auto rounded-lg"
      />
      <Card size="sm" className="w-full mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Contact</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon className="text-white" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon className="text-white" />
            </a>
            <a
              href="mailto:Garagegloauto@gmail.com"
              className="text-white hover:underline"
            >
              Garagegloauto@gmail.com
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <form id="contact-form" onSubmit={handleSubmit(sendEmail)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="contact-name">Name</Label>
                </div>
                <Input
                  id="contact-name"
                  type="text"
                  {...register("name", {
                    required: "Please enter your name.",
                    maxLength: {
                      value: 80,
                      message: "Name must be 80 characters or fewer.",
                    },
                  })}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  {...register("email", {
                    required: "Please enter your email.",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email address.",
                    },
                  })}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  type="text"
                  {...register("message", {
                    required: "Please enter a message.",
                  })}
                  name="message"
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            form="contact-form"
            className="mx-auto"
            disabled={submissionStatus === "sending"}
          >
            {submissionStatus === "sending" ? "Sending..." : "Submit"}
          </Button>
          {submissionStatus === "success" && (
            <p role="status">Your message has been sent.</p>
          )}
          {submissionStatus === "error" && (
            <p className="text-sm text-destructive" role="alert">
              Sorry, your message could not be sent. Please try again.
            </p>
          )}
        </CardFooter>
      </Card>
    </section>
  );
}
