var url_parse = require('./lib/bootstrap/url-parse-wechat')

// const { inspect } = require('util/inspect');
/**
 * Echos the value of any input. Tries to print the value out
 * in the best way possible given the different types.
 *
 * @param {any} value The value to print out.
 * @param {object} opts Optional options object that alters the output.
 */
/* Legacy: value, showHidden, depth, colors */
function inspect(value, opts) {
  // Default options
  const ctx = {
    budget: {},
    indentationLvl: 0,
    seen: [],
    currentDepth: 0,
    stylize: stylizeNoColor,
    showHidden: inspectDefaultOptions.showHidden,
    depth: inspectDefaultOptions.depth,
    colors: inspectDefaultOptions.colors,
    customInspect: inspectDefaultOptions.customInspect,
    showProxy: inspectDefaultOptions.showProxy,
    maxArrayLength: inspectDefaultOptions.maxArrayLength,
    maxStringLength: inspectDefaultOptions.maxStringLength,
    breakLength: inspectDefaultOptions.breakLength,
    compact: inspectDefaultOptions.compact,
    sorted: inspectDefaultOptions.sorted,
    getters: inspectDefaultOptions.getters,
    numericSeparator: inspectDefaultOptions.numericSeparator,
  }
  if (arguments.length > 1) {
    // Legacy...
    if (arguments.length > 2) {
      if (arguments[2] !== undefined) {
        ctx.depth = arguments[2]
      }
      if (arguments.length > 3 && arguments[3] !== undefined) {
        ctx.colors = arguments[3]
      }
    }
    // Set user-specified options
    if (typeof opts === 'boolean') {
      ctx.showHidden = opts
    } else if (opts) {
      const optKeys = Object.keys(opts)
      for (let i = 0; i < optKeys.length; ++i) {
        const key = optKeys[i]
        // TODO(BridgeAR): Find a solution what to do about stylize. Either make
        // this function public or add a new API with a similar or better
        // functionality.
        if (ObjectPrototypeHasOwnProperty(inspectDefaultOptions, key) || key === 'stylize') {
          ctx[key] = opts[key]
        } else if (ctx.userOptions === undefined) {
          // This is required to pass through the actual user input.
          ctx.userOptions = opts
        }
      }
    }
  }
  if (ctx.colors) ctx.stylize = stylizeWithColor
  if (ctx.maxArrayLength === null) ctx.maxArrayLength = Infinity
  if (ctx.maxStringLength === null) ctx.maxStringLength = Infinity
  return formatValue(ctx, value, 0)
}
const { encodeStr, hexTable, isHexTable } = require('./lib/bootstrap/querystring')

const {
  getConstructorOf,
  removeColors,
  toUSVString,
  kEnumerableProperty,
} = require('./lib/bootstrap/util')

const {
  codes: {
    ERR_ARG_NOT_ITERABLE,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_FILE_URL_HOST,
    ERR_INVALID_FILE_URL_PATH,
    ERR_INVALID_THIS,
    ERR_INVALID_TUPLE,
    ERR_INVALID_URL,
    ERR_INVALID_URL_SCHEME,
    ERR_MISSING_ARGS,
    ERR_NO_CRYPTO,
  },
} = require('./lib/bootstrap/errors')
const {
  CHAR_AMPERSAND,
  CHAR_BACKWARD_SLASH,
  CHAR_EQUAL,
  CHAR_FORWARD_SLASH,
  CHAR_LOWERCASE_A,
  CHAR_LOWERCASE_Z,
  CHAR_PERCENT,
  CHAR_PLUS,
} = require('./lib/bootstrap/constants')
// const path = require('path');

const { validateFunction, validateObject } = require('./lib/bootstrap/validators')

const querystring = require('./lib/bootstrap/querystring')

const context = Symbol('context')
const cannotBeBase = Symbol('cannot-be-base')
const cannotHaveUsernamePasswordPort = Symbol('cannot-have-username-password-port')
const special = Symbol('special')
const searchParams = Symbol('query')
const kFormat = Symbol('format')

// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))

// Refs: https://html.spec.whatwg.org/multipage/browsers.html#concept-origin-opaque
const kOpaqueOrigin = 'null'

// Refs: https://html.spec.whatwg.org/multipage/browsers.html#ascii-serialisation-of-an-origin
function serializeTupleOrigin(scheme, host, port) {
  return `${scheme}//${host}${port === null ? '' : `:${port}`}`
}

// This class provides the internal state of a URL object. An instance of this
// class is stored in every URL object and is accessed internally by setters
// and getters. It roughly corresponds to the concept of a URL record in the
// URL Standard, with a few differences. It is also the object transported to
// the C++ binding.
// Refs: https://url.spec.whatwg.org/#concept-url
class URLContext {
  constructor() {
    this.flags = 0
    this.scheme = ':'
    this.username = ''
    this.password = ''
    this.host = null
    this.port = null
    this.path = []
    this.query = null
    this.fragment = null
    this.pathname = ''
  }
}

function isURLSearchParams(self) {
  return self && self[searchParams] && !self[searchParams][searchParams]
}

class URLSearchParams {
  // URL Standard says the default value is '', but as undefined and '' have
  // the same result, undefined is used to prevent unnecessary parsing.
  // Default parameter is necessary to keep URLSearchParams.length === 0 in
  // accordance with Web IDL spec.
  constructor(init = undefined) {
    if (init === null || init === undefined) {
      this[searchParams] = []
    } else if (typeof init === 'object' || typeof init === 'function') {
      const method = init[Symbol.iterator]
      if (method === this[Symbol.iterator]) {
        // While the spec does not have this branch, we can use it as a
        // shortcut to avoid having to go through the costly generic iterator.
        const childParams = init[searchParams]
        this[searchParams] = childParams.slice()
      } else if (method !== null && method !== undefined) {
        if (typeof method !== 'function') {
          throw new ERR_ARG_NOT_ITERABLE('Query pairs')
        }

        // Sequence<sequence<USVString>>
        // Note: per spec we have to first exhaust the lists then process them
        const pairs = []
        for (const pair of init) {
          if (
            (typeof pair !== 'object' && typeof pair !== 'function') ||
            pair === null ||
            typeof pair[Symbol.iterator] !== 'function'
          ) {
            throw new ERR_INVALID_TUPLE('Each query pair', '[name, value]')
          }
          const convertedPair = []
          for (const element of pair) push(convertedPair, toUSVString(element))
          push(pairs, convertedPair)
        }

        this[searchParams] = []
        for (const pair of pairs) {
          if (pair.length !== 2) {
            throw new ERR_INVALID_TUPLE('Each query pair', '[name, value]')
          }
          this[searchParams].push(pair[0], pair[1])
          //
        }
      } else {
        // Record<USVString, USVString>
        // Need to use reflection APIs for full spec compliance.
        const visited = {}
        this[searchParams] = []
        const keys = Reflect.ownKeys(init)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          const desc = Reflect.getOwnPropertyDescriptor(init, key)
          if (desc !== undefined && desc.enumerable) {
            const typedKey = toUSVString(key)
            const typedValue = toUSVString(init[key])

            // Two different key may result same after `toUSVString()`, we only
            // leave the later one. Refers to WPT.
            if (visited[typedKey] !== undefined) {
              this[searchParams][visited[typedKey]] = typedValue
            } else {
              visited[typedKey] = this[searchParams].push(typedKey, typedValue) - 1
            }
          }
        }
      }
    } else {
      // USVString
      init = toUSVString(init)
      if (init[0] === '?') init = init.slice(1)
      initSearchParams(this, init)
    }

    // "associated url object"
    this[context] = null
  }

  [inspect.custom](recurseTimes, ctx) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (typeof recurseTimes === 'number' && recurseTimes < 0)
      return ctx.stylize('[Object]', 'special')

    const separator = ', '
    const innerOpts = { ...ctx }
    if (recurseTimes !== null) {
      innerOpts.depth = recurseTimes - 1
    }
    const innerInspect = (v) => inspect(v, innerOpts)

    const list = this[searchParams]
    const output = []
    for (let i = 0; i < list.length; i += 2)
      output.push(`${innerInspect(list[i])} => ${innerInspect(list[i + 1])}`)

    const length = output.reduce(
      (prev, cur) => prev + removeColors(cur).length + separator.length,
      -separator.length
    )
    if (length > ctx.breakLength) {
      return `${this.constructor.name} {\n` + `  ${output.join(',\n  ')} }`
    } else if (output.length) {
      return `${this.constructor.name} { ` + `${output.join(separator)} }`
    }
    return `${this.constructor.name} {}`
  }

  append(name, value) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (arguments.length < 2) {
      throw new ERR_MISSING_ARGS('name', 'value')
    }

    name = toUSVString(name)
    value = toUSVString(value)
    this[searchParams].push(name, value)
    update(this[context], this)
  }

  delete(name) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (arguments.length < 1) {
      throw new ERR_MISSING_ARGS('name')
    }

    const list = this[searchParams]
    name = toUSVString(name)
    for (let i = 0; i < list.length; ) {
      const cur = list[i]
      if (cur === name) {
        list.splice(i, 2)
      } else {
        i += 2
      }
    }
    update(this[context], this)
  }

  get(name) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (arguments.length < 1) {
      throw new ERR_MISSING_ARGS('name')
    }

    const list = this[searchParams]
    name = toUSVString(name)
    for (let i = 0; i < list.length; i += 2) {
      if (list[i] === name) {
        return list[i + 1]
      }
    }
    return null
  }

  getAll(name) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (arguments.length < 1) {
      throw new ERR_MISSING_ARGS('name')
    }

    const list = this[searchParams]
    const values = []
    name = toUSVString(name)
    for (let i = 0; i < list.length; i += 2) {
      if (list[i] === name) {
        values.push(list[i + 1])
      }
    }
    return values
  }

  has(name) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (arguments.length < 1) {
      throw new ERR_MISSING_ARGS('name')
    }

    const list = this[searchParams]
    name = toUSVString(name)
    for (let i = 0; i < list.length; i += 2) {
      if (list[i] === name) {
        return true
      }
    }
    return false
  }

  set(name, value) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    if (arguments.length < 2) {
      throw new ERR_MISSING_ARGS('name', 'value')
    }

    const list = this[searchParams]
    name = toUSVString(name)
    value = toUSVString(value)

    // If there are any name-value pairs whose name is `name`, in `list`, set
    // the value of the first such name-value pair to `value` and remove the
    // others.
    let found = false
    for (let i = 0; i < list.length; ) {
      const cur = list[i]
      if (cur === name) {
        if (!found) {
          list[i + 1] = value
          found = true
          i += 2
        } else {
          list.splice(i, 2)
        }
      } else {
        i += 2
      }
    }

    // Otherwise, append a new name-value pair whose name is `name` and value
    // is `value`, to `list`.
    if (!found) {
      list.push(name, value)
    }

    update(this[context], this)
  }

  sort() {
    const a = this[searchParams]
    const len = a.length

    if (len <= 2) {
      // Nothing needs to be done.
    } else if (len < 100) {
      // 100 is found through testing.
      // Simple stable in-place insertion sort
      // Derived from v8/src/js/array.js
      for (let i = 2; i < len; i += 2) {
        const curKey = a[i]
        const curVal = a[i + 1]
        let j
        for (j = i - 2; j >= 0; j -= 2) {
          if (a[j] > curKey) {
            a[j + 2] = a[j]
            a[j + 3] = a[j + 1]
          } else {
            break
          }
        }
        a[j + 2] = curKey
        a[j + 3] = curVal
      }
    } else {
      // Bottom-up iterative stable merge sort
      const lBuffer = new Array(len)
      const rBuffer = new Array(len)
      for (let step = 2; step < len; step *= 2) {
        for (let start = 0; start < len - 2; start += 2 * step) {
          const mid = start + step
          let end = mid + step
          end = end < len ? end : len
          if (mid > end) continue
          merge(a, start, mid, end, lBuffer, rBuffer)
        }
      }
    }

    update(this[context], this)
  }

  // https://heycam.github.io/webidl/#es-iterators
  // Define entries here rather than [Symbol.iterator] as the function name
  // must be set to `entries`.
  entries() {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    return createSearchParamsIterator(this, 'key+value')
  }

  forEach(callback, thisArg = undefined) {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    validateFunction(callback, 'callback')

    let list = this[searchParams]

    let i = 0
    while (i < list.length) {
      const key = list[i]
      const value = list[i + 1]
      callback.call(thisArg, value, key, this)
      // In case the URL object's `search` is updated
      list = this[searchParams]
      i += 2
    }
  }

  // https://heycam.github.io/webidl/#es-iterable
  keys() {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    return createSearchParamsIterator(this, 'key')
  }

  values() {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    return createSearchParamsIterator(this, 'value')
  }

  // https://heycam.github.io/webidl/#es-stringifier
  // https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
  toString() {
    if (!isURLSearchParams(this)) throw new ERR_INVALID_THIS('URLSearchParams')

    return serializeParams(this[searchParams])
  }
}

Object.defineProperties(URLSearchParams.prototype, {
  append: kEnumerableProperty,
  delete: kEnumerableProperty,
  get: kEnumerableProperty,
  getAll: kEnumerableProperty,
  has: kEnumerableProperty,
  set: kEnumerableProperty,
  sort: kEnumerableProperty,
  entries: kEnumerableProperty,
  forEach: kEnumerableProperty,
  keys: kEnumerableProperty,
  values: kEnumerableProperty,
  toString: kEnumerableProperty,
  [Object.prototype.toString()]: { __proto__: null, configurable: true, value: 'URLSearchParams' },

  // https://heycam.github.io/webidl/#es-iterable-entries
  [Symbol.iterator]: {
    __proto__: null,
    configurable: true,
    writable: true,
    value: URLSearchParams.prototype.entries,
  },
})

function onParseComplete(
  obj,
  flags,
  protocol,
  username,
  password,
  host,
  port,
  path,
  query,
  fragment,
  pathname,
  href
) {
  //
  const ctx = obj[context]
  ctx.flags = flags
  ctx.scheme = protocol
  ctx.protocol = protocol
  ctx.username = username
  ctx.password = password
  ctx.port = port
  ctx.path = path
  ctx.query = query
  ctx.fragment = fragment
  if (host.includes(':')) {
    ctx.host = host.substring(0, host.lastIndexOf(':'))
  } else {
    ctx.host = host
  }
  ctx.href = href
  ctx.pathname = pathname

  if (!obj[searchParams]) {
    // Invoked from URL constructor
    obj[searchParams] = new URLSearchParams()
    obj[searchParams][context] = obj
  }
  initSearchParams(obj[searchParams], query)
}

function onParseError(input, flags) {
  throw new ERR_INVALID_URL(input)
}

function onParseProtocolComplete(obj, protocol, port) {
  const ctx = obj[context]
  ctx.scheme = protocol
  ctx.port = port
}
function onhrefComplete(obj, href) {
  const ctx = obj[context]
  ctx.href = href
}

function onParseHostnameComplete(obj, host) {
  const ctx = obj[context]
  if ((flags & URL_FLAGS_HAS_HOST) !== 0) {
    ctx.host = host
  } else {
    ctx.host = null
  }
}

function onParsePortComplete(obj, port) {
  obj[context].port = port
}

function onParseHostComplete(
  flags,
  protocol,
  username,
  password,
  host,
  port,
  path,
  query,
  fragment
) {
  ReflectApply(onParseHostnameComplete, this, arguments)
  if (port !== null || (flags & URL_FLAGS_IS_DEFAULT_SCHEME_PORT) !== 0)
    ReflectApply(onParsePortComplete, this, arguments)
}

function onParsePathComplete(obj, host, pathname) {
  const ctx = obj[context]
  if ((flags & URL_FLAGS_HAS_PATH) !== 0) {
    ctx.pathname = pathname
    // ctx.flags |= URL_FLAGS_HAS_PATH;
  }

  // The C++ binding may set host to empty string.
  if ((flags & URL_FLAGS_HAS_HOST) !== 0) {
    ctx.host = host
  }
}

function onParseSearchComplete(obj, query) {
  obj[context].query = query
}

function onParseHashComplete(obj, fragment) {
  obj[context].fragment = fragment
}

function isURLThis(self) {
  return self !== undefined && self !== null && self[context] !== undefined
}

class URL {
  constructor(input, base = undefined) {
    // toUSVString is not needed.
    input = `${input}`
    let base_context
    if (base !== undefined) {
      base_context = new URL(base)[context]
    }
    this[context] = new URLContext()
    let ourl = url_parse(input)
    //
    onParseComplete(
      this,
      '',
      ourl.protocol,
      ourl.username,
      ourl.password,
      ourl.host,
      ourl.port,
      ourl.pathname,
      ourl.query,
      '',
      ourl.pathname,
      ourl.href
    )
  }

  get [special]() {
    return this[context].flags !== 0
  }

  get [cannotBeBase]() {
    return this[context].flags !== 0
  }

  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
  get [cannotHaveUsernamePasswordPort]() {
    const { host, scheme } = this[context]
    return host == null || host === '' || this[cannotBeBase] || scheme === 'file:'
  }

  [inspect.custom](depth, opts) {
    if (this == null || Object.getPrototypeOf(this[context]) !== URLContext.prototype) {
      throw new ERR_INVALID_THIS('URL')
    }

    if (typeof depth === 'number' && depth < 0) return this

    const constructor = getConstructorOf(this) || URL
    const obj = Object.create({ constructor })

    obj.href = this.href
    obj.origin = this.origin
    obj.protocol = this.protocol
    obj.username = this.username
    obj.password = this.password
    obj.host = this.host
    obj.hostname = this.hostname
    obj.port = this.port
    obj.pathname = this.pathname
    obj.search = this.search
    obj.searchParams = this.searchParams
    obj.hash = this.hash
    if (opts.showHidden) {
      obj.cannotBeBase = this[cannotBeBase]
      obj.special = this[special]
      obj[context] = this[context]
    }

    return `${constructor.name} ${inspect(obj, opts)}`
  }

  [kFormat](options) {
    if (options) validateObject(options, 'options')

    options = {
      fragment: true,
      unicode: false,
      search: true,
      auth: true,
      ...options,
    }
    const ctx = this[context]
    // https://url.spec.whatwg.org/#url-serializing
    let ret = ctx.scheme
    if (ctx.host !== null) {
      ret += '//'
      const has_username = ctx.username !== ''
      const has_password = ctx.password !== ''
      if (options.auth && (has_username || has_password)) {
        if (has_username) ret += ctx.username
        if (has_password) ret += `:${ctx.password}`
        ret += '@'
      }
      ret += options.unicode ? domainToUnicode(ctx.host) : ctx.host
      if (ctx.port !== '') ret += `:${ctx.port}`
    }
    if (this[cannotBeBase]) {
      ret += ctx.path
    }

    if (options.search && ctx.query !== null) ret += `?${ctx.query}`
    if (options.fragment && ctx.fragment !== null) ret += `#${ctx.fragment}`
    //
    return ret
  }

  // https://heycam.github.io/webidl/#es-stringifier
  toString() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[kFormat]({})
  }

  get href() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[kFormat]({})
  }

  set href(input) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // toUSVString is not needed.
    const ctx = this[context]
    // input = `${input}`;
    // let ourl = url_parse(input);
    onhrefComplete(this, ctx.href)
  }

  // readonly
  get origin() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // Refs: https://url.spec.whatwg.org/#concept-url-origin
    const ctx = this[context]
    switch (ctx.scheme) {
      case 'blob:':
        if (ctx.path.length > 0) {
          try {
            return new URL(ctx.path[0]).origin
          } catch {
            // Fall through... do nothing
          }
        }
        return kOpaqueOrigin
      case 'ftp:':
      case 'http:':
      case 'https:':
      case 'ws:':
      case 'wss:':
        return serializeTupleOrigin(ctx.scheme, ctx.host, ctx.port)
    }
    return kOpaqueOrigin
  }

  get protocol() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[context].scheme
  }

  set protocol(scheme) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // toUSVString is not needed.
    scheme = `${scheme}`
    if (scheme.length === 0) return
    const ctx = this[context]
    // let ourl = url_parse(scheme);
    onParseProtocolComplete(this, ctx.protocol, ctx.port)
  }

  get username() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[context].username
  }

  set username(username) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // toUSVString is not needed.
    username = `${username}`
    if (this[cannotHaveUsernamePasswordPort]) return
    const ctx = this[context]
    if (username === '') {
      ctx.username = ''
      ctx.flags &= ~URL_FLAGS_HAS_USERNAME
      return
    }
    ctx.username = encodeAuth(username)
    ctx.flags |= URL_FLAGS_HAS_USERNAME
  }

  get password() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[context].password
  }

  set password(password) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // toUSVString is not needed.
    password = `${password}`
    if (this[cannotHaveUsernamePasswordPort]) return
    const ctx = this[context]
    if (password === '') {
      ctx.password = ''
      ctx.flags &= ~URL_FLAGS_HAS_PASSWORD
      return
    }
    ctx.password = encodeAuth(password)
    ctx.flags |= URL_FLAGS_HAS_PASSWORD
  }

  get host() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const ctx = this[context]
    let ret = ctx.host || ''
    if (ctx.port !== null) ret += `:${ctx.port}`
    return ret
  }

  set host(host) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const ctx = this[context]
    // toUSVString is not needed.
    host = `${host}`
    if (this[cannotBeBase]) {
      // Cannot set the host if cannot-be-base is set
      return
    }
    // onParseHostComplete(this,"",ourl.protocol,ourl.port);
    parse(host, kHost, null, ctx, Function.prototype.bind(onParseHostComplete, this))
  }

  get hostname() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[context].host || ''
  }

  set hostname(host) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const ctx = this[context]
    // toUSVString is not needed.
    host = `${host}`
    if (this[cannotBeBase]) {
      // Cannot set the host if cannot-be-base is set
      return
    }
    onParseHostnameComplete(this, ctx.host)
  }

  get port() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const port = this[context].port
    return port === null ? '' : String(port)
  }

  set port(port) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // toUSVString is not needed.
    port = `${port}`
    if (this[cannotHaveUsernamePasswordPort]) return
    const ctx = this[context]
    if (port === '') {
      ctx.port = null
      return
    }
    onParsePortComplete(this, ctx.post)
  }

  get pathname() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const ctx = this[context]
    if (this[cannotBeBase]) return ctx.pathname
    // if (ctx.path.length === 0)
    //   return '';
    // return `/${ctx.path.join('/')}`;
  }

  set pathname(pathname) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    // toUSVString is not needed.
    pathname = `${pathname}`
    if (this[cannotBeBase]) return
    onParsePathComplete(this, ctx.host, ctx.path)
  }

  get search() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const { query } = this[context]
    if (query === null || query === '') return ''
    return `?${query}`
  }

  set search(search) {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    const ctx = this[context]
    search = toUSVString(search)
    if (search === '') {
      ctx.query = null
      // ctx.flags &= ~URL_FLAGS_HAS_QUERY;
    } else {
      if (search[0] === '?') search = StringPrototypeSlice(search, 1)
      ctx.query = ''
      // ctx.flags |= URL_FLAGS_HAS_QUERY;
      if (search) {
        onParseSearchComplete(this, ctx.query)
      }
    }

    initSearchParams(this[searchParams], search)
  }

  // // readonly
  get searchParams() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[searchParams]
  }

  // get hash() {
  //   if (!isURLThis(this))
  //     throw new ERR_INVALID_THIS('URL');
  //   const { fragment } = this[context];
  //   if (fragment === null || fragment === '')
  //     return '';
  //   return `#${fragment}`;
  // }

  // set hash(hash) {
  //   if (!isURLThis(this))
  //     throw new ERR_INVALID_THIS('URL');
  //   const ctx = this[context];
  //   // toUSVString is not needed.
  //   hash = `${hash}`;
  //   if (!hash) {
  //     ctx.fragment = null;
  //     ctx.flags &= ~URL_FLAGS_HAS_FRAGMENT;
  //     return;
  //   }
  //   if (hash[0] === '#') hash = StringPrototypeSlice(hash, 1);
  //   ctx.fragment = '';
  //   ctx.flags |= URL_FLAGS_HAS_FRAGMENT;
  //   parse(hash, kFragment, null, ctx,
  //         Function.prototype.bind(onParseHashComplete, this));
  // }

  toJSON() {
    if (!isURLThis(this)) throw new ERR_INVALID_THIS('URL')
    return this[kFormat]({})
  }

  static revokeObjectURL(url) {
    url = `${url}`
    try {
      const parsed = new URL(url)
      const split = StringPrototypeSplit(parsed.pathname, ':')
      if (split.length === 2) revokeObjectURL(split[1])
    } catch {
      // If there's an error, it's ignored.
    }
  }
}

Object.defineProperties(URL.prototype, {
  [kFormat]: { __proto__: null, configurable: false, writable: false },
  [Object.prototype.toString.call()]: { __proto__: null, configurable: true, value: 'URL' },
  toString: kEnumerableProperty,
  href: kEnumerableProperty,
  origin: kEnumerableProperty,
  protocol: kEnumerableProperty,
  username: kEnumerableProperty,
  password: kEnumerableProperty,
  host: kEnumerableProperty,
  hostname: kEnumerableProperty,
  port: kEnumerableProperty,
  pathname: kEnumerableProperty,
  search: kEnumerableProperty,
  searchParams: kEnumerableProperty,
  hash: kEnumerableProperty,
  toJSON: kEnumerableProperty,
})

function update(url, params) {
  if (!url) return

  const ctx = url[context]
  // let serializedParams = params[searchParams].toString();
  let serializedParams = params.toString()
  serializedParams = serializedParams
    .replace(/\+/g, '%2B')
    .replace(/\"/g, '%22')
    .replace(/\'/g, '%27')
    .replace(/\//g, '%2F')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\~/g, '%7E')
    .replace(/\,/g, '%2C')

  if (serializedParams) {
    ctx.query = serializedParams
    // ctx.flags |= URL_FLAGS_HAS_QUERY;
  } else {
    ctx.query = null
    // ctx.flags &= ~URL_FLAGS_HAS_QUERY;
  }
}

function initSearchParams(url, init) {
  if (!init) {
    url[searchParams] = []
    return
  }
  url[searchParams] = parseParams(init)
}

// application/x-www-form-urlencoded parser
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-parser
function parseParams(qs) {
  const out = []
  let pairStart = 0
  let lastPos = 0
  let seenSep = false
  let buf = ''
  let encoded = false
  let encodeCheck = 0
  let i
  for (i = 0; i < qs.length; ++i) {
    const code = StringPrototypeCharCodeAt(qs, i)

    // Try matching key/value pair separator
    if (code === CHAR_AMPERSAND) {
      if (pairStart === i) {
        // We saw an empty substring between pair separators
        lastPos = pairStart = i + 1
        continue
      }

      if (lastPos < i) buf += qs.slice(lastPos, i)
      if (encoded) buf = querystring.unescape(buf)
      out.push(buf)

      // If `buf` is the key, add an empty value.
      if (!seenSep) out.push('')

      seenSep = false
      buf = ''
      encoded = false
      encodeCheck = 0
      lastPos = pairStart = i + 1
      continue
    }

    // Try matching key/value separator (e.g. '=') if we haven't already
    if (!seenSep && code === CHAR_EQUAL) {
      // Key/value separator match!
      if (lastPos < i) buf += qs.slice(lastPos, i)
      if (encoded) buf = querystring.unescape(buf)
      out.push(buf)

      seenSep = true
      buf = ''
      encoded = false
      encodeCheck = 0
      lastPos = i + 1
      continue
    }

    // Handle + and percent decoding.
    if (code === CHAR_PLUS) {
      if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i)
      buf += ' '
      lastPos = i + 1
    } else if (!encoded) {
      // Try to match an (valid) encoded byte (once) to minimize unnecessary
      // calls to string decoding functions
      if (code === CHAR_PERCENT) {
        encodeCheck = 1
      } else if (encodeCheck > 0) {
        if (isHexTable[code] === 1) {
          if (++encodeCheck === 3) {
            encoded = true
          }
        } else {
          encodeCheck = 0
        }
      }
    }
  }

  // Deal with any leftover key or value data

  // There is a trailing &. No more processing is needed.
  if (pairStart === i) return out

  if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i)
  if (encoded) buf = querystring.unescape(buf)
  out.push(buf)

  // If `buf` is the key, add an empty value.
  if (!seenSep) out.push('')
  //
  return out
}

// Adapted from querystring's implementation.
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-byte-serializer
const noEscape = new Int8Array([
  /*
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F
*/
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 0x00 - 0x0F
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 0x10 - 0x1F
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  1,
  1,
  0, // 0x20 - 0x2F
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0, // 0x30 - 0x3F
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1, // 0x40 - 0x4F
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  1, // 0x50 - 0x5F
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1, // 0x60 - 0x6F
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0, // 0x70 - 0x7F
])

// Special version of hexTable that uses `+` for U+0020 SPACE.
const paramHexTable = hexTable.slice()
paramHexTable[0x20] = '+'

// application/x-www-form-urlencoded serializer
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-serializer
function serializeParams(array) {
  const len = array.length
  if (len === 0) return ''

  const firstEncodedParam = array[0]
  const firstEncodedValue = array[1]
  let output = `${firstEncodedParam}=${firstEncodedValue}`

  for (let i = 2; i < len; i += 2) {
    const encodedParam = array[i]
    const encodedValue = array[i + 1]
    output += `&${encodedParam}=${encodedValue}`
  }

  return output
}

// Mainly to mitigate func-name-matching ESLint rule
function defineIDLClass(proto, classStr, obj) {
  // https://heycam.github.io/webidl/#dfn-class-string
  Object.defineProperty(proto, Object.prototype.toString(), {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: classStr,
  })

  // https://heycam.github.io/webidl/#es-operations
  for (const key of Object.keys(obj)) {
    Object.defineProperty(proto, key, {
      __proto__: null,
      writable: true,
      enumerable: true,
      configurable: true,
      value: obj[key],
    })
  }
  for (const key of Object.getOwnPropertySymbols(obj)) {
    Object.defineProperty(proto, key, {
      __proto__: null,
      writable: true,
      enumerable: false,
      configurable: true,
      value: obj[key],
    })
  }
}

// for merge sort
function merge(out, start, mid, end, lBuffer, rBuffer) {
  const sizeLeft = mid - start
  const sizeRight = end - mid
  let l, r, o

  for (l = 0; l < sizeLeft; l++) lBuffer[l] = out[start + l]
  for (r = 0; r < sizeRight; r++) rBuffer[r] = out[mid + r]

  l = 0
  r = 0
  o = start
  while (l < sizeLeft && r < sizeRight) {
    if (lBuffer[l] <= rBuffer[r]) {
      out[o++] = lBuffer[l++]
      out[o++] = lBuffer[l++]
    } else {
      out[o++] = rBuffer[r++]
      out[o++] = rBuffer[r++]
    }
  }
  while (l < sizeLeft) out[o++] = lBuffer[l++]
  while (r < sizeRight) out[o++] = rBuffer[r++]
}

// https://heycam.github.io/webidl/#dfn-default-iterator-object
function createSearchParamsIterator(target, kind) {
  const iterator = Object.create(URLSearchParamsIteratorPrototype)
  iterator[context] = {
    target,
    kind,
    index: 0,
  }
  return iterator
}

// https://heycam.github.io/webidl/#dfn-iterator-prototype-object
const URLSearchParamsIteratorPrototype = Object.create(IteratorPrototype)

defineIDLClass(URLSearchParamsIteratorPrototype, 'URLSearchParams Iterator', {
  next() {
    if (!this || Object.getPrototypeOf(this) !== URLSearchParamsIteratorPrototype) {
      throw new ERR_INVALID_THIS('URLSearchParamsIterator')
    }

    const { target, kind, index } = this[context]
    const values = target[searchParams]
    const len = values.length
    if (index >= len) {
      return {
        value: undefined,
        done: true,
      }
    }

    const name = values[index]
    const value = values[index + 1]
    this[context].index = index + 2

    let result
    if (kind === 'key') {
      result = name
    } else if (kind === 'value') {
      result = value
    } else {
      result = [name, value]
    }

    return {
      value: result,
      done: false,
    }
  },
  [inspect.custom](recurseTimes, ctx) {
    if (this == null || this[context] == null || this[context].target == null)
      throw new ERR_INVALID_THIS('URLSearchParamsIterator')

    if (typeof recurseTimes === 'number' && recurseTimes < 0)
      return ctx.stylize('[Object]', 'special')

    const innerOpts = { ...ctx }
    if (recurseTimes !== null) {
      innerOpts.depth = recurseTimes - 1
    }
    const { target, kind, index } = this[context]
    const output = ArrayPrototypeReduce(
      ArrayPrototypeSlice(target[searchParams], index),
      (prev, cur, i) => {
        const key = i % 2 === 0
        if (kind === 'key' && key) {
          prev.push(cur)
        } else if (kind === 'value' && !key) {
          prev.push(cur)
        } else if (kind === 'key+value' && !key) {
          prev.push([target[searchParams][index + i - 1], cur])
        }
        return prev
      },
      []
    )
    const breakLn = inspect(output, innerOpts).includes('\n')
    const outputStrs = ArrayPrototypeMap(output, (p) => inspect(p, innerOpts))
    let outputStr
    if (breakLn) {
      outputStr = `\n  ${ArrayPrototypeJoin(outputStrs, ',\n  ')}`
    } else {
      outputStr = ` ${ArrayPrototypeJoin(outputStrs, ', ')}`
    }
    return `${this[Object.prototype.toString()]} {${outputStr} }`
  },
})

function domainToUnicode(domain) {
  if (arguments.length < 1) throw new ERR_MISSING_ARGS('domain')

  // toUSVString is not needed.
  return _domainToUnicode(`${domain}`)
}

// The following characters are percent-encoded when converting from file path
// to URL:
// - %: The percent character is the only character not encoded by the
//        `pathname` setter.
// - \: Backslash is encoded on non-windows platforms since it's a valid
//      character but the `pathname` setters replaces it by a forward slash.
// - LF: The newline character is stripped out by the `pathname` setter.
//       (See whatwg/url#419)
// - CR: The carriage return character is also stripped out by the `pathname`
//       setter.
// - TAB: The tab character is also stripped out by the `pathname` setter.
const percentRegEx = /%/g
const backslashRegEx = /\\/g
const newlineRegEx = /\n/g
const carriageReturnRegEx = /\r/g
const tabRegEx = /\t/g

function encodePathChars(filepath) {
  if (StringPrototypeIncludes(filepath, '%'))
    filepath = StringPrototypeReplace(filepath, percentRegEx, '%25')
  // In posix, backslash is a valid character in paths:
  if (!isWindows && StringPrototypeIncludes(filepath, '\\'))
    filepath = StringPrototypeReplace(filepath, backslashRegEx, '%5C')
  if (StringPrototypeIncludes(filepath, '\n'))
    filepath = StringPrototypeReplace(filepath, newlineRegEx, '%0A')
  if (StringPrototypeIncludes(filepath, '\r'))
    filepath = StringPrototypeReplace(filepath, carriageReturnRegEx, '%0D')
  if (StringPrototypeIncludes(filepath, '\t'))
    filepath = StringPrototypeReplace(filepath, tabRegEx, '%09')
  return filepath
}

function isURLInstance(fileURLOrPath) {
  return fileURLOrPath != null && fileURLOrPath.href && fileURLOrPath.origin
}

function constructUrl(flags, protocol, username, password, host, port, path, query, fragment) {
  const ctx = new URLContext()
  ctx.flags = flags
  ctx.scheme = protocol
  ctx.username = (flags & URL_FLAGS_HAS_USERNAME) !== 0 ? username : ''
  ctx.password = (flags & URL_FLAGS_HAS_PASSWORD) !== 0 ? password : ''
  ctx.port = port
  ctx.path = (flags & URL_FLAGS_HAS_PATH) !== 0 ? path : []
  ctx.query = query
  ctx.fragment = fragment
  ctx.host = host
  const url = Object.create(URL.prototype)
  url[context] = ctx
  const params = new URLSearchParams()
  url[searchParams] = params
  params[context] = url
  initSearchParams(params, query)
  return url
}
// Utility function that converts a URL object into an ordinary
// options object as expected by the http.request and https.request
// APIs.
function urlToHttpOptions(url) {
  const options = {
    protocol: url.protocol,
    hostname:
      typeof url.hostname === 'string' && url.hostname.startsWith('[')
        ? url.hostname.slice(1, -1)
        : url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname || ''}${url.search || ''}`,
    href: url.href,
  }
  if (url.port !== '') {
    options.port = Number(url.port)
  }
  if (url.username || url.password) {
    options.auth = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
  }
  return options
}
// setURLConstructor(constructUrl);

module.exports = {
  URL,
  URLSearchParams,
  urlToHttpOptions,
}
