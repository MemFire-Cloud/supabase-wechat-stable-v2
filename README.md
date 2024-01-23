# `supabase-wechat-stable-v2`

一个用于 Supabase 的同构的微信客户端。

## Usage

首先，你需要安装这个库。

```sh
npm install supabase-wechat-stable-v2
```

然后你就可以导入库并与数据库建立连接。

```js
import { createClient } from 'supabase-wechat-stable-v2'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
```

查询数据(举例)

```js
const { data, error } = await supabase.from('countries').select()
```

## Sponsors

We are building the features of Firebase using enterprise-grade, open source products. We support existing communities wherever possible, and if the products don’t exist we build them and open source them ourselves. Thanks to these sponsors who are making the OSS ecosystem better for everyone.

[![New Sponsor](https://user-images.githubusercontent.com/10214025/90518111-e74bbb00-e198-11ea-8f88-c9e3c1aa4b5b.png)](https://github.com/sponsors/supabase)
