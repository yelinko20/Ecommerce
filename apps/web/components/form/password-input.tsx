"use client";

import React, { useState, useCallback, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import { Input } from "@workspace/ui/components/input";

interface PasswordInputProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  placeholder?: string;
  className?: string;
}

export const PasswordInput = <TFieldValues extends FieldValues>({
  field,
  placeholder,
  className,
}: PasswordInputProps<TFieldValues>) => {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <Input
        {...field}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        className={className}
        aria-live="polite"
      />
      <button
        ref={buttonRef}
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3"
        onClick={toggleVisibility}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
      >
        {isVisible ? (
          <Eye size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
