// const { compose } = require('react-app-rewired')
// const rewireEslint = require('react-app-rewire-eslint')
// const rewireReactHotLoader = require('react-app-rewire-hot-loader')

// module.exports = compose(
//   rewireEslint,
//   rewireReactHotLoader
// )

const { useBabelRc, override } = require('customize-cra')

module.exports = override(useBabelRc())
