"use client";

import Link from "next/link";
import { MoveLeft, Save, Trash } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  ReactNode,
  ReactElement,
  RefObject,
  startTransition,
} from "react";

import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { Form } from "@workspace/ui/components/form";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface ActionResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
}

type GeneralFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  children: ReactNode;
  enableDelete?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  onDelete?: () => void;
  formHeader?: string;
  width?: "sm" | "md" | "lg" | "xl";
  columns?: 1 | 2 | 3 | 4;
  submitText?: string;
  submitIcon?: ReactNode;
  cancelPath?: string;
  footerAlign?: "left" | "center" | "right";
  cardClassName?: string;
  footerActions?: ReactElement[];
  showCancel?: boolean;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  formRef: RefObject<HTMLFormElement>;
};

export default function GeneralForm<T extends FieldValues>({
  children,
  enableDelete,
  setOpen,
  onDelete,
  formHeader,
  width = "md",
  columns = 1,
  submitText = "Save",
  submitIcon = <Save />,
  cancelPath = "/",
  footerAlign = "right",
  cardClassName = "",
  footerActions = [],
  showCancel = true,
  formAction,
  isPending,
  form,
  formRef,
}: GeneralFormProps<T>) {
  const widthClass = {
    sm: "w-full max-w-md",
    md: "w-full max-w-lg",
    lg: "w-full max-w-xl",
    xl: "w-full max-w-2xl",
  }[width];

  const columnClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  const footerAlignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[footerAlign];

  return (
    <div
      className={cn(
        "mx-auto flex w-full px-4 py-6 sm:py-10 flex-col justify-center",
        widthClass,
      )}
    >
      <Form {...form}>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(evt) => {
            evt.preventDefault();
            form.handleSubmit(() => {
              startTransition(() => formAction(new FormData(formRef.current!)));
            })(evt);
          }}
        >
          <Card className={cn(cardClassName)}>
            {formHeader && (
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg sm:text-xl">
                  {formHeader}
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className={cn("grid gap-4", columnClass)}>
              {children}
            </CardContent>
            <CardFooter
              className={cn(
                "flex flex-col sm:flex-row gap-4 items-center",
                footerAlignmentClass,
              )}
            >
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {submitIcon} {submitText}
              </Button>
              {showCancel && (
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full sm:w-auto text-center",
                  )}
                  href={cancelPath}
                >
                  <MoveLeft />
                  Cancel
                </Link>
              )}
              {enableDelete && (
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    onDelete ? onDelete() : setOpen && setOpen(true)
                  }
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <Trash />
                  Delete
                </Button>
              )}
              {footerActions.map((action, index) => (
                <div key={index}>{action}</div>
              ))}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
