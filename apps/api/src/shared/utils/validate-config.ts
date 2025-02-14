import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

/**
 * Converts validation errors into a readable format.
 */
function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map(
      (error) =>
        `❌ [${error.property}]: ${Object.values(error.constraints || {}).join(
          ', ',
        )}`,
    )
    .join('\n');
}

/**
 * Validates and transforms environment variables against a class schema.
 *
 * @param config - The raw environment variables object (e.g., `process.env`).
 * @param envSchema - The class schema to validate against.
 * @param strict - If `true`, throws an error on validation failure. If `false`, logs warnings.
 * @returns The validated and typed configuration object.
 * @throws An error if validation fails (in strict mode).
 */
function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envSchema: ClassConstructor<T>,
  strict: boolean = true,
): T {
  const transformedConfig = plainToInstance(envSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(transformedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessage = formatValidationErrors(errors);

    if (strict) {
      throw new Error(`Configuration validation failed:\n${errorMessage}`);
    } else {
      console.warn(`⚠️ Configuration validation warnings:\n${errorMessage}`);
    }
  }

  return transformedConfig;
}

export default validateConfig;
