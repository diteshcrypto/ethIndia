const CrowdFundFactory = artifacts.require('./CrowdFundFactory.sol')
const Token = artifacts.require('./Token.sol')

let BigNumber = require('bignumber.js');
const Web3 = require('web3')

module.exports = function (deployer, network, accounts) {
  let web3
  if (network === 'development') {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  } else if (network === 'ropsten') {
    web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/g5xfoQ0jFSE9S5LwM1Ei'))
  } else if (network === 'kovan') {
    web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/g5xfoQ0jFSE9S5LwM1Ei'))
  } else if (network === 'mainnet') {
    web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/g5xfoQ0jFSE9S5LwM1Ei'))
  }if (network === 'coverage') {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }

  return deployer.deploy(Token, "ETHIndia", "ETHI", 18).then(() => {
      return deployer.deploy(CrowdFundFactory).then(() => {
          console.log(`
          **** Token contract address: ${Token.address} ****
          **** CrowdFundFactory contract address: ${CrowdFundFactory.address} ****
          `)
      })
  })
 
}
