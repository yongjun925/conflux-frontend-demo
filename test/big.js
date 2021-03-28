const Big = require('big.js');

const big = new Big('98812499999955462600')

const a = big.times(1e18).toFixed()
console.log(a)

const b = big.div(1e18).toFixed(4)
console.log(b)