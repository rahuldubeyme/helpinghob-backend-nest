import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import {
  BaseError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ValidationError,
  DatabaseError,
} from 'sequelize';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';
    let errors: { field: string; error: string }[] = [];

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const responseObj = res as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;

        // Handle validation error array
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          errors = responseObj.message.map((msg: string) => {
            const parts = msg.split(' ');
            const field = parts[0];
            return {
              field,
              error: msg.replace(field, '').trim(),
            };
          });
        }
      }
    }

    // Handle RpcException (Microservices)
    else if (exception instanceof RpcException) {
      const rpcError = exception.getError();

      if (typeof rpcError === 'object' && rpcError !== null) {
        const errObj = rpcError as any;
        status = errObj.statusCode || errObj.status || HttpStatus.BAD_REQUEST;
        message = errObj.message || 'Microservice Error';
        error = errObj.error || 'RpcException';
        if (errObj.errors) {
          errors = errObj.errors;
        }
      } else {
        message = String(rpcError);
        error = 'RpcException';
        status = HttpStatus.BAD_REQUEST;
      }
    }

    // Handle Sequelize errors
    else if (exception instanceof BaseError) {
      if (exception instanceof UniqueConstraintError) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry';
        error = 'Conflict';
        errors = exception.errors.map((err) => ({
          field: err.path || 'unknown',
          error: err.message,
        }));
      } else if (exception instanceof ForeignKeyConstraintError) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint fails';
        error = 'Bad Request';
      } else if (exception instanceof ValidationError) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation failed';
        error = 'Bad Request';
        errors = exception.errors.map((err) => ({
          field: err.path || 'unknown',
          error: err.message,
        }));
      } else if (exception instanceof DatabaseError) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message;
        error = 'DatabaseError';
      }
    }

    // Generic JS Error fallback
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name || 'Error';
    }

    // Final response shape
    response.status(status).json({
      success: false,
      message,
      ...(errors.length > 0 && { errors }),
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
