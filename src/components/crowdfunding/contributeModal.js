import React, { Component } from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';
// import { toWei } from '../api/web3Api';
import { getBalance, getBalFromAddr, callFunctions, makeContrib } from '../../utils/web3Utils'

const cfjson = require('../../utils/abis/CrowdFund.json')

const initialState = {
    amountInEth: 0
}

class ContributeModal extends Component {

    constructor(props) {
        super(props);

        this.state = initialState;
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    handleClose = () => {
        this.props.onCloseModal();
        this.setState(initialState);
    }

    handleContribute = async () => {
        console.log(this.state.amountInEth);
        this.props.onHandleContribute(this.state.amountInEth);
        // localStorage.setItem('senderAddress|contractAddress', this.state.amountInEth)
        this.setState(initialState);


        // save the state in local storage 
        localStorage.setItem('self', this.state.amountInEth)
        console.log(localStorage.getItem('self'))

        // the geneate the crowd fund
        console.log(getBalance(window.web3))
        // contractFuncitonCall()

        const addr = await getBalance(window.web3)
        console.log(await window.web3.eth.getBalance(addr, (err, bal) => console.log(bal)))

        console.log(await window.web3.eth.getBlockNumber())

        // should be dynamically generated 
        const contractAddress = '0x31ee7ff75889d1d4de242ca18265af6c6fd488ab'

        const Accountaddress = addr

        const contractAbi = cfjson.abi

        await makeContrib(contractAbi, contractAddress, Accountaddress, this.state.amountInEth, window.web3)
    }
    
    render() {
        const { isDisplayed } = this.props;
        console.log(isDisplayed)
        return (
            <div>
                <Modal 
                    open={isDisplayed}
                    closeOnDocumentClick={true}
                    onClose={this.handleClose}>
                    <Modal.Header>Contribute to this project</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form>
                                <Form.Input 
                                    label='Enter an amount in Ether to contribute'
                                    placeholder='ex. 5'
                                    name={'amountInEth'}
                                    onChange={this.handleChange}
                                    value={this.state.amountInEth}  />
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.handleClose}>Cancel</Button>
                        <Button primary onClick={this.handleContribute}>Contribute</Button>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }
}

export default ContributeModal;