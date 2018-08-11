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
const DEDUCT_ADVERTISER_EVENT = '0x832012aa4afd438c31fdd0a220b514ff77bc54b73c1c4a987afd52b543726d53'
const REFUND_ADVERTISER_REQUESTED_EVENT = '0xc872e13a8b2e0d70e4ee914385820e09b4358f993a39a1287c81137e641ccc1c'
const REFUND_ADVERTISER_PROCESSED_EVENT = '0x383f6e20406bf666765e9837bb9ba854f571d5d2acf86226dba2ad4499f5d546'
const CREDIT_PUBLISHER_EVENT = '0xd4fb8de99fe8dc3b92ac9b1832245aaf9859013b2e907ee75580df13f2c88e21'
const SUICIDE_CONTRACT_EVENT = '0x7a8276bc004cf8a93056b08608c09d78a2bc250df01a1f8b826834538fe74fed'
const MIGRATE_FUNDS_REQUEST_EVENT = '0x64414e04b69d9dd645ae4169204bc856ffa81c132869a0b26317d7726d49e7e9'
const OWNERSHIP_TRANSFERRED_EVENT = '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0'


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
