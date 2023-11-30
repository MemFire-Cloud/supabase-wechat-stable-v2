import StorageFileApi from './packages/StorageFileApi'
import StorageBucketApi from './packages/StorageBucketApi'
import { Fetch } from './lib/fetch'

export class StorageClient extends StorageBucketApi {
  constructor(
    supabaseKey: string,
    url: string,
    headers: { [key: string]: string } = {},
    fetch?: Fetch
  ) {
    super(supabaseKey, url, headers, fetch)
  }

  /**
   * Perform file operation in a bucket.
   *
   * @param id The bucket id to operate on.
   */
  from(id: string): StorageFileApi {
    return new StorageFileApi(this.supabaseKey, this.url, this.headers, id, this.fetch)
  }
}
