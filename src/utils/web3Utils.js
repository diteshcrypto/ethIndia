import * as Web3 from 'web3'
import * as EthereumTX from 'ethereumjs-tx'

// import config from './config'
// import * as Abi from './abi'


/**
 * Helper function to generate the function ABI
 *
 * @param contractFunction  reference to contract function
 * @param from              Owner Address
 * @param data              params for contract
 */
export const _generateFunctionAbi = (contractFunction, from, data) => contractFunction.getData(...data, { from })


/**
 * Generate a signed transaction.
 *
 * @param data    object with transaction params
 */
export const _generateSignedTransaciton = (data) => {
  const { contractAddress, ownerAddress, nonce, functionAbi } = data
  // const privateKey = new Buffer(`${config('BITWORDS_WALLET_PRIVATE_KEY')}`, 'hex')
  // get private keys or signed tarnsaction from metamask

  const txParams = {
    gasPrice: 11 * 1000000000, // 11 gwei
    gasLimit: 300000,
    to: contractAddress,
    data: functionAbi,
    from: ownerAddress,
    nonce: nonce
  }

  const tx = new EthereumTX(txParams)
  // tx.sign(privateKey)

  return tx.serialize()
}


/**
 * Helper function to send the signed transaction to the ETH blockchain
 *
 * @param web3          web3js client
 * @param serializedTx  signed transaction
 */
export const _executeSignedTransaction = async (web3, serializedTx) => {
  await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), async (err, hash) => {
    if (!err) console.log(hash)
    else console.log(err)
  })
}

/** 
 * Helper to get balace
 *
 * @param address adress to get balance of
 */
export const getBalance = async (web3) => web3.eth.accounts[0]

// export const getBalFromAddr = (address) => window.web3.eth.getBalance(address)

/**
 * Makes a call to the chargeAdvertisers fn in the smart contract.
 *
 * @param advertisers         The array of addresses of the advertisers to debit
 * @param amountsInEther      The array of amounts that need to be charged to advertiser (in Ether, not in wei)
 * @param publishers          The array of addresses of the publishers to payout
 * @param publishersToCredit  A special array of indexes from the publishers array, used to point out publishers
 *                            who want to credit their payouts back into bitwords, so that they can use it for ads.
 */
export const contractFuncitonCall = async (amountsInEther, contractAddress, ownerAddress) => {
  try {
    // Convert the amounts into wei first
    const amountsEthToWei = Math.floor(Math.pow(10, 18) * amountsInEther) || web3.toWei(amountsInEther, 'ether')

    // create a web3js client
    const web3 = window.web3;

    if (!web3 || !web3.isConnected() 
    || !web3.currentProvider.isMetaMask) console.log('erorr')

    const account = web3.eth.accounts[0];

    if (!account) console.log('No account!')

    // create contract instance from the contract abi 
    // create abi
    const ABI = ''
    const Contract = new web3.eth.Contract(ABI, contractAddress)

    // Get the function's ABI
    const functionAbi = Contract.methods
    // add params 
      .funcitonMethod(amountsEthToWei)
      .encodeABI({ from: ownerAddress })
      // .call({ from: ownerAddress })

    // Create the raw transaction
    const nonce = await web3.eth.getTransactionCount(ownerAddress)
    const serializedTx = _generateSignedTransaciton({ contractAddress, ownerAddress, nonce, functionAbi })

    // Execute it!
    await _executeSignedTransaction(web3, serializedTx)
  } catch (e) {
    console.log(e)
  }
}


// invoking metamask for making transaction 
export const depositToPool = (pool, ethAmount) => {
  return new Promise((resolve, reject) => {
    const web3 = window.web3; 
    const poolAddress = pool;
    const amountWei = web3.toWei(ethAmount, 'ether');

    if (!web3 || !web3.isConnected() || !web3.currentProvider.isMetaMask) {
      reject('No web3!');
    }
    const account = web3.eth.accounts[0];

    if (!account) {
      reject('No account!');
    }

    web3.eth.getTransactionCount(account, (error, txCount) => {
      if (error) reject(error)

      web3.eth.sendTransaction({
        nonce: txCount,
        from: account,
        to: poolAddress,
        value: amountWei
      }, (err, transactionId) => {
        if (err) reject(error)
        console.log(transactionId)
      })
    });
  });
};




export const sendETH = (amount, to, data, web3) => {
  return new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      to: to,
      value: web3.toWei(amount, 'ether'),
      data
    }, (error, hash) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(hash);
    })
  });
}

export const signTx = (data, address, web3) => web3.eth.sign(data, address)

export const sendTxWeb3 = (data, address, web3) => web3.sendTransaction

export const callFunctions = async (abi, contractAddress, Accountaddress, data, web3) => {
  const contractAbi = web3.eth.contract(abi);
  const myContract = contractAbi.at(contractAddress);

  // suppose you want to call a function named myFunction of myContract
  const getData = myContract.generateNewCrowdfund.getData(...data);
  //finally paas this data parameter to send Transaction
  await web3.eth.sendTransaction({to:contractAddress, from:Accountaddress, data: getData});
}


export const makeContrib = async (Abi, contractAddress, Accountaddress, value, web3) => {
  const contractAbi = web3.eth.contract(Abi);
  const myContract = contractAbi.at(contractAddress);

  // suppose you want to call a function named myFunction of myContract
  const getData = myContract.buyTokens.getData(Accountaddress);
  //finally paas this data parameter to send Transaction
  await web3.eth.buyTokens({to:contractAddress, from:Accountaddress, value});
}
