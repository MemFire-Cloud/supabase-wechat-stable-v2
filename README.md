# `supabase-js`

[![Coverage Status](https://coveralls.io/repos/github/supabase/supabase-js/badge.svg?branch=master)](https://coveralls.io/github/supabase/supabase-js?branch=master)

An isomorphic JavaScript client for Supabase.

- **Documentation:** https://supabase.com/docs/reference
- TypeDoc: https://supabase.github.io/supabase-js/v2/

## Usage

First of all, you need to install the library:

```sh
npm install supabase-wechat-stable-v2
```

Then you're able to import the library and establish the connection with the database:

```js
import { createClient } from 'supabase-wechat-stable-v2'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
```

### UMD

You can now use plain `<script>`s to import supabase-js from CDNs, like:

```html
<script src="https://cdn.jsdelivr.net/npm/supabase-wechat-stable-v2"></script>
```

or even:

```html
<script src="https://unpkg.com/@supabase/supabase-js"></script>
```

Then you can use it from a global `supabase` variable:

```html
<script>
  const { createClient } = supabase
  const _supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')

  console.log('Supabase Instance: ', _supabase)
  // ...
</script>
```




```js
import { createClient } from 'supabase-wechat-stable-v2'

// Provide a custom `fetch` implementation as an option
const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key', {
  global: {
    fetch: (...args) => fetch(...args),
  },
})
```

## Sponsors

We are building the features of Firebase using enterprise-grade, open source products. We support existing communities wherever possible, and if the products don’t exist we build them and open source them ourselves. Thanks to these sponsors who are making the OSS ecosystem better for everyone.

[![New Sponsor](https://user-images.githubusercontent.com/10214025/90518111-e74bbb00-e198-11ea-8f88-c9e3c1aa4b5b.png)](https://github.com/sponsors/supabase)
