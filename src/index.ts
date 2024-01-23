import SupabaseClient from './SupabaseClient'
import type { GenericSchema, SupabaseClientOptions } from './lib/types'
import myfetch from './wefetch'
export * from './gotrue-js/src/index'
export type { User as AuthUser, Session as AuthSession } from './gotrue-js/src/index'
export type {
  PostgrestResponse,
  PostgrestSingleResponse,
  PostgrestMaybeSingleResponse,
  PostgrestError,
} from './postgrest-js/src/index'
export {
  FunctionsHttpError,
  FunctionsFetchError,
  FunctionsRelayError,
  FunctionsError,
} from './functions-js/src/index'
export * from './realtime-js/src/index'
export { default as SupabaseClient } from './SupabaseClient'
export type { SupabaseClientOptions, QueryResult, QueryData, QueryError } from './lib/types'

/**
 * Creates a new Supabase Client.
 */
export const createClient = <
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<SchemaName>
): SupabaseClient<Database, SchemaName, Schema> => {
  return new SupabaseClient(supabaseUrl, supabaseKey, {
    ...options,
    global: {
      fetch: (...args) => myfetch(...args),
      headers: options?.global?.headers || {},
    },
  })
}
