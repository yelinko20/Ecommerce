import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ArgumentMetadata, Type } from '@nestjs/common/interfaces';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BaseService } from './base.service';
import {
  AdvancedFilters,
  FindOptions,
  ICrudController,
  PaginationResult,
} from './crud.strategy';
import { ApiResponse } from './response-wrapper';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/drizzle/schema/index';
import { Column, InferInsertModel, Table, TableConfig } from 'drizzle-orm';
import { CacheInterceptor } from '@nestjs/cache-manager';

// https://stackoverflow.com/questions/71394797/nestjs-reusable-controller-with-validation/71396211#71396211
@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: { body?: Type; query?: Type; param?: Type },
  ) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const targetType = this.targetTypes[metadata.type];
    if (!targetType) {
      return super.transform(value, metadata);
    }
    return super.transform(value, { ...metadata, metatype: targetType });
  }
}

export function ControllerFactory<
  T extends Table<TableConfig<Column<any, object, object>>>,
  C,
  U,
>(createDto: Type<C>, updateDto: Type<U>): Type<ICrudController<T, C, U>> {
  const createPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: createDto },
  );
  const updatePipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: updateDto },
  );

  @Injectable()
  @UseInterceptors(CacheInterceptor)
  class BaseController implements ICrudController<T, C, U> {
    constructor(private readonly service: BaseService<T, C, U>) {}

    @ApiOperation({ summary: 'Create a new entity' })
    @ApiBody({ type: createDto })
    @Post()
    @UsePipes(createPipe)
    async create(@Body() body: C): Promise<ApiResponse<T>> {
      try {
        const result = await this.service.create(body);
        return new ApiResponse(true, 'Data created successfully', result);
      } catch (error) {
        this.handleError(error);
      }
    }

    @ApiOperation({ summary: 'Count entities' })
    @ApiQuery({
      name: 'query',
      required: false,
      description: 'Query parameters for filtering',
      schema: { type: 'object' },
    })
    @Get('count')
    async count(@Body() filters?: Partial<T>): Promise<ApiResponse<number>> {
      try {
        const result = await this.service.count(filters);
        return new ApiResponse(true, 'Count retrieved successfully', result);
      } catch (error) {
        this.handleError(error);
      }
    }

    @ApiOperation({ summary: 'Check if an entity already exists' })
    @ApiQuery({
      name: 'criteria',
      required: true,
      description: 'Criteria for checking existence of an entity',
      schema: { type: 'object' },
    })
    @Get('exists')
    async alreadyExisted(
      @Body() criteria: Partial<InferInsertModel<T>>,
    ): Promise<ApiResponse<boolean>> {
      try {
        const exists = await this.service.alreadyExisted(criteria);
        return new ApiResponse(
          true,
          exists ? 'Entity already exists' : 'Entity does not exist',
          exists,
        );
      } catch (error) {
        this.handleError(error);
      }
    }

    @ApiOperation({ summary: 'Retrieve an entity by ID' })
    @ApiParam({
      name: 'id',
      required: true,
      description: 'Entity ID',
      type: String,
    })
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ApiResponse<T>> {
      try {
        const result = await this.service.findOne(id);
        return result
          ? new ApiResponse(true, 'Data found', result)
          : new ApiResponse(false, 'Data not found', null);
      } catch (error) {
        this.handleError(error);
      }
    }

    @ApiOperation({ summary: 'Retrieve all entities' })
    @ApiQuery({
      name: 'query',
      required: false,
      description: 'Query parameters for filtering, sorting, and pagination',
      schema: { type: 'object' },
    })
    @Get()
    async findAll(
      @Query() options?: FindOptions<T>,
      @Body() filters?: AdvancedFilters,
    ): Promise<ApiResponse<T[] | PaginationResult<T>>> {
      try {
        const result = await this.service.findAll(options, filters);
        return new ApiResponse(true, 'Data retrieved successfully', result);
      } catch (error) {
        this.handleError(error);
      }
    }

    @ApiOperation({ summary: 'Delete an entity by ID' })
    @ApiParam({
      name: 'id',
      required: true,
      description: 'Entity ID',
      type: String,
    })
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<ApiResponse<T>> {
      try {
        await this.service.delete(id);
        return new ApiResponse(true, 'Data deleted successfully');
      } catch (error) {
        this.handleError(error);
      }
    }

    @ApiOperation({ summary: 'Update an existing entity' })
    @ApiBody({ type: updateDto })
    @Patch()
    @UsePipes(updatePipe)
    async update(
      @Param('id') id: string,
      @Body() body: U,
    ): Promise<ApiResponse<T>> {
      try {
        const result = await this.service.update(id, body);
        return new ApiResponse(true, 'Data updated successfully', result);
      } catch (error) {
        this.handleError(error);
      }
    }

    async bulkCreate(@Body() body: C[]): Promise<ApiResponse<T[]>> {
      try {
        const result = await this.service.bulkCreate(body);
        return new ApiResponse(true, 'Data created successfully', result);
      } catch (error) {
        this.handleError(error);
      }
    }

    async batchUpdate(
      @Body() ids: string[],
      @Body() body: Partial<T>,
    ): Promise<ApiResponse<void>> {
      try {
        await this.service.batchUpdate(ids, body);
        return new ApiResponse(true, 'Data updated successfully');
      } catch (error) {
        this.handleError(error);
      }
    }

    async recover(@Param('id') id: string): Promise<ApiResponse<T>> {
      try {
        const result = await this.service.recover(id);
        return new ApiResponse(true, 'Data recovered successfully', result);
      } catch (error) {
        this.handleError(error);
      }
    }

    async transaction<T>(
      @Body()
      callback: (trx: NodePgDatabase<typeof schema>) => Promise<ApiResponse<T>>,
    ): Promise<ApiResponse<T>> {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const result = await this.service.transaction(callback);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return new ApiResponse(
          true,
          'Transaction completed successfully',
          result,
        );
      } catch (error) {
        this.handleError(error);
      }
    }

    private handleError(error: unknown): never {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new HttpException(
          {
            success: false,
            message: 'Type error occurred',
            details: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof SyntaxError) {
        throw new HttpException(
          {
            success: false,
            message: 'Syntax error occurred',
            details: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if ('code' in (error as any)) {
        const knownError = error as any;
        switch (knownError.code) {
          case 'ENTITY_NOT_FOUND':
            throw new HttpException(
              {
                success: false,
                message: 'Entity not found',
                details: knownError.message,
              },
              HttpStatus.NOT_FOUND,
            );
          case 'DATABASE_ERROR':
            throw new HttpException(
              {
                success: false,
                message: 'Database error occurred',
                details: knownError.message,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          default:
            throw new HttpException(
              {
                success: false,
                message: 'Unexpected error occurred',
                details: knownError.message,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
      }

      throw new HttpException(
        {
          success: false,
          message: 'Unexpected error occurred',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  return BaseController;
}
