import { useFormStatus } from "react-dom";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export default function SubmitButton({
  className = "",
  loadingText = "Submitting...",
  submitText = "Submit",
}: {
  className?: string;
  loadingText?: string;
  submitText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={cn(className)}
      aria-disabled={pending}
      disabled={pending}
      aria-label={pending ? loadingText : submitText}
    >
      {pending ? (
        <span className="flex items-center">
          <Spinner className="mr-2" /> {loadingText}
        </span>
      ) : (
        submitText
      )}
    </Button>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-5 w-5 text-white", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
