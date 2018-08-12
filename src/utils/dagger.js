import debug from 'debug'
import Dagger from 'eth-dagger'
import * as _ from 'underscore'

import config from '../../config'

import * as Email from '../../libraries/email'
import * as Slack from '../../libraries/slack'
import Advertisements from '../../models/advertisement'
import ContractEventLogs from '../../models/contractEventLogs'
import Users from '../../models/users'


const logger = debug('app:library:ethereum:dagger')


const _normalizeETHAddress = (address: string) => address.replace(/^0x0+/, '0x').toLowerCase()


// Different events from the smart contract
const DEPOSIT_EVENT = '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15'
const PAYOUT_TO_PUBLISHER_EVENT = '0x9f98bf92b1da5cdd776d581160717fdc0a0a19755d6714436812677c7291c2f1'

const tokenContract = '0x977e731ab3e52f9a3ab2e889323d7f01273731f9'
const crowdFundFactory = '0x31ee7ff75889d1d4de242ca18265af6c6fd488ab'



interface IEvent {
  topics: string[]
  address: string
  transactionHash: string
  data: any
}


/**
 * To add log about any contract events
 *
 * @param eventType name of the event
 * @param event contains the event data
 */
const addContractEventLog = async (eventType: string, event: IEvent, amount?: number) => {
  const newContractEventLog = new ContractEventLogs({
    walletAddress: _normalizeETHAddress(event.topics[1]),
    eventAddress: event.topics[0],
    eventTopics: event.topics,
    data: event.data,
    amount,
    eventType,
    transactionAddress: _normalizeETHAddress(event.address),
    transactionHash: event.transactionHash
  })

  newContractEventLog.save()
}


/**
 * Helper function to properly credit an advertiser
 *
 * @param event The smart contract event
 */
const creditAdvertiser = async (event: IEvent) => {
  const targetAddress = _normalizeETHAddress(event.topics[1])

  const rawAmount = event.data.substr(2, 64)
  const rawNewBalance = event.data.substr(66, 130)

  const amount = parseInt(rawAmount, 16) / Math.pow(10, 18)
  const newBalance = parseInt(rawNewBalance, 16) / Math.pow(10, 18)

  // Find the advertiser
  const advertiser = await Users.findOne({ walletAddress: targetAddress })
  if (!advertiser) {
    // If the advertiser could not be found, then that'a problem
    Slack.informAdmin(`A new desposit of ${amount}E has been made but no advertiser was found for it`)
    return
  }

  const etherscanLink = `https://etherscan.io/tx/${event.transactionHash}`
  
}


/**
 * When a publisher receives a payout, we notify the publisher via email and update his revenue.
 *
 * @param event The smart contract event
 */
const payoutToPublisher = async (event: IEvent) => {
  const targetAddress = _normalizeETHAddress(event.topics[1])
  const revenue = parseInt(event.data.toString(16), 16) / Math.pow(10, 18)

  // Find the publisher
  const publisher = await Users.findOne({ walletAddress: targetAddress })

  // If the publisher could not be found, then that'a problem
  if (!publisher)
    return Slack.informAdmin(`A new payout of ${revenue}E has been made but no publisher was found for it`)

  const etherscanLink = `https://etherscan.io/tx/${event.transactionHash}`
}


/**
 * This function is called when an advertiser makes a refund request
 *
 * @param event The smart contract event.
 */
const refundAdvertiserRequested =  async (event: IEvent) => {
  const targetAddress = _normalizeETHAddress(event.topics[1])
  const amount = parseInt(event.data.toString(16), 16) / Math.pow(10, 18)

  // Find the advertiser
  const advertiser = await Users.findOne({ walletAddress: targetAddress })

  const etherscanLink = `https://etherscan.io/tx/${event.transactionHash}`
}


/**
 * This function is called when an advertiser's refund request is processed. This causes
 * the advertiser's balance to get updated and his ads to stop running if his balance is low
 */
const refundAdvertiserProcessed = async (event: IEvent) => {
  const targetAddress = _normalizeETHAddress(event.topics[1])

  const rawAmount = event.data.substr(2, 64)
  const rawNewBalance = event.data.substr(66, 130)

  const amount = parseInt(rawAmount, 16) / Math.pow(10, 18)
  const newBalance = parseInt(rawNewBalance, 16) / Math.pow(10, 18)

  // Find the advertiser
  const advertiser = await Users.findOne({ walletAddress: targetAddress })

  const etherscanLink = `https://etherscan.io/tx/${event.transactionHash}`
}


const deductAdvertiser = async (event: IEvent) => {
  const targetAddress = _normalizeETHAddress(event.topics[1])

  const rawAmount = event.data.substr(2, 64)
  const rawNewBalance = event.data.substr(66, 130)

  const amount = parseInt(rawAmount, 16) / Math.pow(10, 18)
  const newBalance = parseInt(rawNewBalance, 16) / Math.pow(10, 18)
}


const transferPublisherCreditsToAdvertiserBalance = async (event: IEvent) => {
  const targetAddress = _normalizeETHAddress(event.topics[1])
  const revenue = parseInt(event.data.toString(16), 16) / Math.pow(10, 18)

  const etherscanLink = `https://etherscan.io/tx/${event.transactionHash}`
}

export const init = () => {
  // create dagger server
  const dagger = new Dagger('wss://kovan.dagger.matic.network')

  // Get details of the smart contract
  const smartContractAddress = `${config('BITWORDS_CONTRACT_ADDRESS')}`

  dagger.on(`latest:log/${smartContractAddress}`, (events: IEvent[]) => {
    // events should not be repeated
    events.map(event => {
      if (event.topics.includes(DEPOSIT_EVENT)) {
        const rawAmount = event.data.substr(2, 64)
        const amount = parseInt(rawAmount, 16) / Math.pow(10, 18)
        // do something
      }

      if (event.topics.includes(PAYOUT_TO_PUBLISHER_EVENT)) {
        const rawAmount = event.data.substr(2, 64)
        const amount = parseInt(rawAmount, 16) / Math.pow(10, 18)
        // do something
      }
    })
  })
}
