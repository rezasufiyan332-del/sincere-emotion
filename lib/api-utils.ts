import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '@/lib/errors'

export function validateBody<T>(body: unknown, schema: ZodSchema<T>): T {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }
      throw new ValidationError(fieldErrors)
    }
    throw error
  }
}

export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const obj: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    obj[key] = value
  })
  try {
    return schema.parse(obj)
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }
      throw new ValidationError(fieldErrors)
    }
    throw error
  }
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}
