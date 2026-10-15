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

import { useForm } from "react-hook-form";

export default function ContactSection() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);
  console.log(errors);

  return (
    <section className="grid grid-cols-2 gap-4">
      <img
        src={ContactImage}
        alt="Mechanic working on a tire"
        className="w-64 mx-auto rounded-lg"
      />
      <Card size="sm" className="w-full mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Contact</h2>
        </CardHeader>
        <CardContent>
          <form id="contact-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label>Name</Label>
                </div>
                <Input
                  type="text"
                  {...register("Name", { required: true, maxLength: 80 })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register("Email", {
                    required: true,
                    pattern: /^\S+@\S+$/i,
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea
                  type="text"
                  {...register("Message", { required: true })}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form="contact-form" className="mx-auto">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
