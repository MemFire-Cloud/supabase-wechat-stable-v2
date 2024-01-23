const colorRegExp = /\u001b\[\d\d?m/g // eslint-disable-line no-control-regex

function toUSVString(val) {
  return `${val}`
}
function removeColors(str) {
  return str.replace(colorRegExp, '')
}

const kEnumerableProperty = Object.create(null)
kEnumerableProperty.enumerable = true
Object.freeze(kEnumerableProperty)

const kEmptyObject = Object.freeze(Object.create(null))

module.exports = {
  toUSVString,
  removeColors,
  kEmptyObject,
  kEnumerableProperty,
}
