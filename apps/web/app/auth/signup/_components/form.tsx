"use client";

import GeneralForm from "@/components/form/general-form";
import { signup, SignupFormData, signupSchema } from "../actions/signup";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";

export default function SignupForm() {
  const [state, action, isPending] = useActionState(signup, null);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      // confirmPassword: "",
    },
  });
  console.log(state);
  return (
    <GeneralForm
      formAction={action}
      isPending={isPending}
      formHeader="SignUp"
      form={form}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Jhon Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="jhondoe@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input placeholder="P@ssw0rd!" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comfirm Password</FormLabel>
            <FormControl>
              <Input placeholder="P@ssw0rd!" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
    </GeneralForm>
  );
}
