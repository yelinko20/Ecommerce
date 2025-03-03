"use client";

import GeneralForm from "@/components/form/general-form";
import { signup, SignupFormData } from "../actions/signup";
import { useActionState, useRef, useEffect } from "react";
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
import { signupSchema } from "../actions/schema";

export default function SignupForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const [state, action, isPending] = useActionState(signup, {
    success: false,
  });

  useEffect(() => {
    if (state?.fields) {
      Object.entries(state.fields).forEach(([key, value]) => {
        form.setValue(key as keyof SignupFormData, value);
      });
    }
  }, [state.fields, form.setValue, form]);

  return (
    <GeneralForm
      formAction={action}
      isPending={isPending}
      formHeader="SignUp"
      form={form}
      formRef={formRef}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
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
            {state?.errors?.email && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.email}
              </p>
            )}
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
              <Input type="password" placeholder="P@ssw0rd!" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="P@ssw0rd!" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </GeneralForm>
  );
}
