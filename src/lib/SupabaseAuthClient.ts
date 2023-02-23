import { GoTrueClient } from '../gotrue-js/src/index'
import { SupabaseAuthClientOptions } from './types'

export class SupabaseAuthClient extends GoTrueClient {
  constructor(options: SupabaseAuthClientOptions) {
    super(options)
  }
}
