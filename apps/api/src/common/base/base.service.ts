import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  FindOptions,
  PaginationResult,
  AdvancedFilters,
} from './crud.strategy';
import {
  and,
  asc,
  Column,
  count as dataCount,
  desc,
  eq,
  InferInsertModel,
  sql,
  Table,
  TableConfig,
} from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
} from '@/exceptions/custom-exceptions';
import * as schema from '@/drizzle/schema/index';
import { camelToSnakeCase } from '@/utils/camel-to-snake';

export class BaseService<
  EntityType extends Table<TableConfig<Column<any, object, object>>>,
  CreateDto,
  UpdateDto,
> {
  constructor(
    private readonly $db: NodePgDatabase<typeof schema>,
    private readonly $table: PgTable<TableConfig>,
    private readonly enableSoftDeletes = true,
  ) {}

  private getFilters(filters?: Record<string, any>) {
    const baseFilters = filters
      ? Object.entries(filters).map(([key, val]) => {
          if (Array.isArray(val)) {
            return sql`${this.$table[key]} IN (${val})`;
          }
          if (typeof val === 'string' && val.includes('%')) {
            return sql`${this.$table[key]} LIKE ${val}`;
          }
          return eq(this.$table[key], val);
        })
      : [];

    if (this.enableSoftDeletes) {
      baseFilters.push(eq(this.$table['is_deleted'], false));
    }
    return baseFilters;
  }

  private buildFilters(filters: AdvancedFilters): string {
    const handleValue = (value: any): string => {
      if (typeof value === 'string') {
        return `'${value.replace("'", "''")}'`; // Prevent SQL injection
      }
      if (typeof value === 'boolean' || typeof value === 'number') {
        return value.toString();
      }
      return 'NULL'; // For any unsupported type or null values
    };

    const buildCondition = (key: string, value: any): string => {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        return `${key} = ${handleValue(value)}`;
      } else if (Array.isArray(value)) {
        return `${key} IN (${value.map(handleValue).join(', ')})`;
      } else if (typeof value === 'object') {
        const conditions: string[] = [];

        if (value.eq !== undefined)
          conditions.push(`${key} = ${handleValue(value.eq)}`);
        if (value.ne !== undefined)
          conditions.push(`${key} != ${handleValue(value.ne)}`);

        if (value.in !== undefined)
          conditions.push(
            `${key} IN (${value.in.map(handleValue).join(', ')})`,
          );
        if (value.notIn !== undefined)
          conditions.push(
            `${key} NOT IN (${value.notIn.map(handleValue).join(', ')})`,
          );

        if (value.like !== undefined)
          conditions.push(`${key} LIKE '%${value.like}%'`);

        if (value.gt !== undefined)
          conditions.push(`${key} > ${handleValue(value.gt)}`);
        if (value.gte !== undefined)
          conditions.push(`${key} >= ${handleValue(value.gte)}`);

        if (value.lt !== undefined)
          conditions.push(`${key} < ${handleValue(value.lt)}`);
        if (value.lte !== undefined)
          conditions.push(`${key} <= ${handleValue(value.lte)}`);

        if (value.between !== undefined) {
          const [start, end] = value.between;
          conditions.push(
            `${key} BETWEEN ${handleValue(start)} AND ${handleValue(end)}`,
          );
        }

        if (value.isNull !== undefined) conditions.push(`${key} IS NULL`);
        if (value.isNotNull !== undefined)
          conditions.push(`${key} IS NOT NULL`);

        if (conditions.length > 0) {
          return `(${conditions.join(' AND ')})`;
        }
      }
      return '';
    };

    const buildLogicalFilter = (filters: AdvancedFilters): string => {
      const logicalParts: string[] = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value instanceof Object && !Array.isArray(value) && value.or) {
          logicalParts.push(`(${buildLogicalFilter(value.or)})`);
        } else {
          logicalParts.push(buildCondition(key, value));
        }
      }
      return logicalParts.join(' AND ');
    };

    const filtersString = buildLogicalFilter(camelToSnakeCase(filters));
    return filtersString ? filtersString : '';
  }

  async findAll(
    options?: FindOptions<EntityType>,
    filters?: AdvancedFilters,
  ): Promise<PaginationResult<EntityType>> {
    try {
      const { page, limit, sortBy, sortOrder = 'asc' } = options || {};

      const pageSize = page ? Number(page) : 1;
      const dataLimit = limit ? Number(limit) : 10;

      const offset = (pageSize - 1) * dataLimit;

      const sorting = sortBy
        ? [
            sortOrder === 'asc'
              ? asc(this.$table[sortBy as string])
              : desc(this.$table[sortBy as string]),
          ]
        : [];

      const whereConditions = this.buildFilters(filters);
      const data = await this.$db
        .select()
        .from(this.$table)
        .where(whereConditions ? sql.raw(whereConditions) : sql`1=1`)
        .orderBy(...sorting)
        .limit(dataLimit)
        .offset(offset);

      const [{ count: total }] = await this.$db
        .select({ count: dataCount() })
        .from(this.$table)
        .where(whereConditions ? sql.raw(whereConditions) : sql`1=1`);

      const totalPages = Math.ceil(Number(total) / dataLimit);
      return {
        data: data as EntityType[],
        pagination: {
          total,
          page: pageSize,
          limit: dataLimit,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerException(
        `Failed to fetch records: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<EntityType> {
    try {
      const result = await this.$db
        .select()
        .from(this.$table)
        .where(and(eq(this.$table['id'], id)))
        .limit(1)
        .then((rows) => rows[0] || null);

      if (!result) {
        throw new NotFoundException(
          `Record with ID ${id} for ${this.$table} not found`,
        );
      }
      return result as EntityType;
    } catch (error) {
      throw new InternalServerException(
        `Failed to fetch the record: ${error.message}`,
      );
    }
  }

  async findUniqueOne(uniqueFields: Partial<EntityType>): Promise<EntityType> {
    try {
      const whereConditions = this.getFilters(uniqueFields);

      const result = await this.$db
        .select()
        .from(this.$table)
        .where(and(...whereConditions))
        .limit(1)
        .then((rows) => rows[0] || null);

      if (!result) {
        const conditions = Object.entries(uniqueFields)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
        throw new NotFoundException(
          `Record with unique fields { ${conditions} } for ${this.$table} not found`,
        );
      }
      return result as EntityType;
    } catch (error) {
      throw new InternalServerException(
        `Failed to fetch the unique record: ${error.message}`,
      );
    }
  }

  async create(data: CreateDto): Promise<EntityType> {
    try {
      const result = await this.$db
        .insert(this.$table)
        .values(data)
        .returning()
        .then((rows) => rows[0]);

      if (!result) {
        throw new BadRequestException(`Failed to create the record`);
      }

      await this.logAudit('create', '', { data });
      return result as EntityType;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create the record: ${error.message}`,
      );
    }
  }

  async update(id: string, data: UpdateDto): Promise<EntityType> {
    try {
      const result = await this.$db
        .update(this.$table)
        .set(data)
        .where(and(eq(this.$table['id'], id)))
        .returning()
        .then((rows) => rows[0]);

      if (!result) {
        throw new NotFoundException(
          `Record with ID ${id} for ${this.$table} not found`,
        );
      }
      await this.logAudit('update', '', { id, changes: data });

      return result as EntityType;
    } catch (error) {
      throw new InternalServerException(
        `Failed to update the record: ${error.message}`,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (this.enableSoftDeletes) {
        await this.$db
          .update(this.$table)
          .set({ is_deleted: true })
          .where(and(eq(this.$table['id'], id)));
        await this.logAudit('delete', '', { id, softDeleted: true });
      } else {
        const result = await this.$db
          .delete(this.$table)
          .where(eq(this.$table['id'], id));
        if (!result) {
          throw new NotFoundException(
            `Record with ID ${id} for ${this.$table} not found`,
          );
        }

        await this.logAudit('delete', '', { id });
      }
    } catch (error) {
      throw new InternalServerException(
        `Failed to delete the record: ${error.message}`,
      );
    }
  }

  async bulkCreate(data: CreateDto[]): Promise<EntityType[]> {
    try {
      const results = await this.$db
        .insert(this.$table)
        .values(data)
        .returning();

      if (!results || results.length === 0) {
        throw new BadRequestException(`Failed to create records.`);
      }
      return results as EntityType[];
    } catch (error) {
      throw new InternalServerException(
        `Failed to create records: ${error.message}`,
      );
    }
  }

  async batchUpdate(ids: string[], data: Partial<EntityType>): Promise<void> {
    try {
      const whereConditions = ids.map((id) => eq(this.$table['id'], id));
      await this.$db
        .update(this.$table)
        .set(data)
        .where(and(...whereConditions));
    } catch (error) {
      throw new InternalServerException(
        `Failed to batch update records: ${error.message}`,
      );
    }
  }

  async transaction(
    callback: (trx: NodePgDatabase<typeof schema>) => Promise<EntityType>,
  ): Promise<EntityType> {
    return await this.$db.transaction(async (trx) => {
      try {
        return await callback(trx);
      } catch (error) {
        throw new InternalServerException(
          `Transaction failed: ${error.message}`,
        );
      }
    });
  }

  async count(filters: Partial<EntityType>): Promise<number> {
    try {
      const whereConditions = this.buildFilters(filters);
      const [{ count }] = await this.$db
        .select({ count: dataCount() })
        .from(this.$table)
        .where(whereConditions ? sql.raw(whereConditions) : sql`1=1`);

      return count;
    } catch (error) {
      throw new InternalServerException(
        `Failed to count the records: ${error.message}`,
      );
    }
  }

  async alreadyExisted(
    fields: Partial<InferInsertModel<EntityType>>,
  ): Promise<boolean> {
    try {
      const whereConditions = this.buildFilters(fields);

      const result = await this.$db
        .select({ count: dataCount() })
        .from(this.$table)
        .where(whereConditions ? sql.raw(whereConditions) : sql`1=1`)
        .then((rows) => rows[0]?.count || 0);

      return result > 0;
    } catch (error) {
      throw new InternalServerException(
        `Failed to check if the record already exists: ${error.message}`,
      );
    }
  }

  async recover(id: string): Promise<EntityType> {
    if (!this.enableSoftDeletes) {
      throw new BadRequestException(
        'Soft deletes are not enabled for this service.',
      );
    }

    try {
      const whereConditions = this.getFilters({ id, is_deleted: true });
      const result = await this.$db
        .update(this.$table)
        .set({ is_deleted: false })
        .where(and(...whereConditions))
        .returning()
        .then((rows) => rows[0]);

      if (!result) {
        throw new NotFoundException(
          `Record with ID ${id} not found or not soft deleted.`,
        );
      }
      await this.logAudit('recover', '', { id });

      return result as EntityType;
    } catch (error) {
      throw new InternalServerException(
        `Failed to recover the record: ${error.message}`,
      );
    }
  }

  private async logAudit(
    action: 'create' | 'update' | 'delete' | 'recover',
    userId: string | null,
    metadata: Record<string, any> | null,
  ): Promise<void> {
    try {
      const auditLogTable = schema.AuditLog;

      const auditLogRecord = {
        action,
        userId,
        metadata,
      };

      await this.$db.insert(auditLogTable).values(auditLogRecord);
    } catch (error) {
      console.error('Failed to log audit action:', error.message);
    }
  }
}
