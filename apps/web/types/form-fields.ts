import { FieldValues, Path } from "react-hook-form";

/**
 * Base configuration for all form fields.
 * @template TFieldValues - The form field values type, extending `FieldValues` from `react-hook-form`.
 */
type BaseFieldConfig<TFieldValues extends FieldValues> = {
  /**
   * The name of the field, corresponding to a key in `TFieldValues`.
   */
  name: Path<TFieldValues>;

  /**
   * The label to display for the form field.
   */
  label: string;

  /**
   * Optional description or helper text for the form field.
   */
  description?: string;

  /**
   * Optional placeholder text for the form field.
   */
  placeholder?: string;

  /**
   * Determines if the field is read-only.
   */
  disabled?: boolean;

  colSpan?: number;
};

/**
 * Configuration for standard text input fields.
 * @template TFieldValues - The form field values type.
 */
type TextFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as an input field.
     */
    type: "text" | "email" | "number" | "hidden";

    /**
     * Specifies the type of text input (e.g., text, email, or number).
     */
    // inputType: "text" | "email" | "number" | "hidden";
  };

/**
 * Configuration for password input fields with optional visibility toggle.
 * @template TFieldValues - The form field values type.
 */
type PasswordFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as an input field.
     */
    type: "input";

    /**
     * Specifies the input type as password.
     */
    inputType: "password";

    /**
     * Determines if the field should include a toggle to show/hide the password.
     */
    toggle?: boolean;
  };

/**
 * Configuration for file upload fields, with optional preview functionality.
 * @template TFieldValues - The form field values type.
 */
type FileFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as an input field.
     */
    type: "input";

    /**
     * Specifies the input type as file.
     */
    inputType: "file";

    /**
     * Determines if the field should display a preview of the uploaded file.
     */
    showPreview?: boolean;
  };

/**
 * Configuration for multi-line text area fields.
 * @template TFieldValues - The form field values type.
 */
type TextAreaFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as a text area.
     */
    type: "textarea";
  };

/**
 * Configuration for dropdown select fields.
 * @template TFieldValues - The form field values type.
 */
type SelectFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as a select dropdown.
     */
    type: "select";

    /**
     * An array of options to display in the dropdown.
     */
    options: { value: string; label: string }[];
  };

/**
 * Configuration for toggle switch fields.
 * @template TFieldValues - The form field values type.
 */
type SwitchFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as a switch.
     */
    type: "switch";
  };

/**
 * Configuration for profile picture upload fields.
 * @template TFieldValues - The form field values type.
 */
type ProfilePictureFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as a profile picture uploader.
     */
    type: "profilePicture";
  };

/**
 * Configuration for date picker fields.
 * @template TFieldValues - The form field values type.
 */
type DatePickerFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    /**
     * Specifies the field type as a date picker.
     */
    type: "datepicker";
  };

type DynamicListFieldConfig<TFieldValues extends FieldValues> =
  BaseFieldConfig<TFieldValues> & {
    type: "repeater";

    /**
     * An array of field configurations for the fields in the repeater.
     */
    details: FieldConfig<TFieldValues>[];
  };

/**
 * A union of all available field configurations.
 * @template TFieldValues - The form field values type.
 */
export type FieldConfig<TFieldValues extends FieldValues> =
  | TextFieldConfig<TFieldValues>
  | PasswordFieldConfig<TFieldValues>
  | FileFieldConfig<TFieldValues>
  | TextAreaFieldConfig<TFieldValues>
  | SelectFieldConfig<TFieldValues>
  | SwitchFieldConfig<TFieldValues>
  | ProfilePictureFieldConfig<TFieldValues>
  | DatePickerFieldConfig<TFieldValues>
  | DynamicListFieldConfig<TFieldValues>;
