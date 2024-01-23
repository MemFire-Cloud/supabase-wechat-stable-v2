// @ts-ignore
// import nodeFetch, { Headers as NodeFetchHeaders } from '@supabase/node-fetch'

type Fetch = typeof fetch

export const resolveFetch = (customFetch?: Fetch): Fetch => {
  let _fetch: Fetch
  if (customFetch) {
    _fetch = customFetch
  } else if (typeof fetch === 'undefined') {
    // _fetch = nodeFetch as unknown as Fetch
  } else {
    _fetch = fetch
  }
  return (...args) => _fetch(...args)
}

export const resolveHeaders = (init: any) => {
  return new Map(Object.entries(init.headers))
}

export const fetchWithAuth = (
  supabaseKey: string,
  getAccessToken: () => Promise<string | null>,
  customFetch?: Fetch
): Fetch => {
  const fetch = resolveFetch(customFetch)

  return async (input, init) => {
    const accessToken = (await getAccessToken()) ?? supabaseKey
    let headers = resolveHeaders(init)
    if (!headers.has('apikey')) {
      headers.set('apikey', supabaseKey)
    }

    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return fetch(input, { ...init, headers })
  }
}
