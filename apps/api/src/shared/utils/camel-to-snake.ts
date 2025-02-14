import { AdvancedFilters } from '@/base/crud.strategy';

export function camelToSnakeCase(obj?: AdvancedFilters): AdvancedFilters {
  const operatorKeys = [
    'eq',
    'ne',
    'in',
    'notIn',
    'like',
    'gt',
    'gte',
    'lt',
    'lte',
    'between',
    'isNull',
    'isNotNull',
    'or',
  ];

  const convertKey = (key: string): string => {
    if (operatorKeys.includes(key)) {
      return key;
    }
    return key.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  };

  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const result: AdvancedFilters = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result[convertKey(key)] = camelToSnakeCase(value as AdvancedFilters);
    } else {
      result[convertKey(key)] = value;
    }
  }

  return result;
}
