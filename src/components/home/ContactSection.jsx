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

export default function ContactSection() {
  return (
    <section className="grid grid-cols-2 gap-4 items-center">
      <img
        src={ContactImage}
        alt="Mechanic working on a tire"
        className="w-64 mx-auto rounded-xl"
      />
      <Card size="sm" className="w-full mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Contact</h2>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="name">Name</Label>
                </div>
                <Input id="name" type="text" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email-spacing">Email</Label>
                <Input id="email-spacing" type="email" required />
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="mx-auto">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
