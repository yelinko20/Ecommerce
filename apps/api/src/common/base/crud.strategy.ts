import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ApiResponse } from './response-wrapper';
import * as schema from '@/drizzle/schema/index';
import { Column, InferSelectModel, Table, TableConfig } from 'drizzle-orm';

/**
 * Interface representing the options for finding records.
 * @template T - The type of the entity.
 */
export interface FindOptions<T> {
  /**
   * Page number for pagination.
   * @optional
   */
  page?: number;

  /**
   * Number of items per page for pagination.
   * @optional
   */
  limit?: number;

  /**
   * Filters to apply when finding records.
   * Accepts a partial object of the entity type.
   * @optional
   */
  filters?: Partial<T>;

  /**
   * Property of the entity to sort by.
   * @optional
   */
  sortBy?: keyof T;

  /**
   * Order of sorting: ascending ("asc") or descending ("desc").
   * @optional
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface representing the result of a paginated query.
 * @template T - The type of the entity.
 */
export interface PaginationResult<T> {
  /**
   * Array of data items matching the query.
   */
  data: T[];

  /**
   * Pagination metadata.
   */
  pagination: {
    /**
     * Total number of items matching the query.
     */
    total: number;

    /**
     * Current page number.
     */
    page: number;

    /**
     * Number of items per page.
     */
    limit: number;

    /**
     * Total number of pages.
     */
    totalPages: number;
  };
}

export interface AdvancedFilters {
  [key: string]:
    | string
    | number
    | boolean
    | Array<number | string>
    | {
        eq?: any;
        ne?: any;
        in?: any;
        notIn?: any;
        like?: string;
        gt?: number;
        gte?: number | string;
        lt?: number | string;
        lte?: number;
        between?: [number, number];
        isNull?: boolean;
        isNotNull?: boolean;
        or?: AdvancedFilters;
      };
}

export interface ICrudStrategy<EntityType, CreateDto, UpdateDto> {
  findOne(id: string): Promise<EntityType>;

  findAll(
    options?: FindOptions<EntityType>,
  ): Promise<EntityType[] | PaginationResult<EntityType>>;

  create(body: CreateDto): Promise<EntityType>;

  update(id: string, body: UpdateDto): Promise<EntityType>;

  delete(id: string): Promise<void>;

  count(options?: Partial<EntityType>): Promise<number>;
}

export interface ICrudController<
  EntityType extends Table<TableConfig<Column<any, object, object>>>,
  CreateDto,
  UpdateDto,
> {
  findOne(id: string): Promise<ApiResponse<EntityType>>;

  findAll(
    options?: FindOptions<EntityType>,
    filter?: AdvancedFilters,
  ): Promise<ApiResponse<EntityType[] | PaginationResult<EntityType>>>;

  create(body: CreateDto): Promise<ApiResponse<EntityType>>;

  update(id: string, body: UpdateDto): Promise<ApiResponse<EntityType>>;

  delete(id: string): Promise<ApiResponse<EntityType>>;

  count(options?: Partial<EntityType>): Promise<ApiResponse<number>>;

  bulkCreate(body: CreateDto[]): Promise<ApiResponse<EntityType[]>>;

  batchUpdate(
    ids: string[],
    body: Partial<EntityType>,
  ): Promise<ApiResponse<void>>;

  recover(id: string): Promise<ApiResponse<EntityType>>;

  alreadyExisted(
    fields: Partial<InferSelectModel<EntityType>>,
  ): Promise<ApiResponse<boolean>>;

  transaction<T>(
    callback: (trx: NodePgDatabase<typeof schema>) => Promise<ApiResponse<T>>,
  ): Promise<ApiResponse<T>>;
}
