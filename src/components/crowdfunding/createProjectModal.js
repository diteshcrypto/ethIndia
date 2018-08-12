import React, { Component } from 'react';
import { Modal, Form, Button, Select } from 'semantic-ui-react';
import { getBalance, getBalFromAddr, callFunctions } from '../../utils/web3Utils'
const cfjson = require('../../utils/abis/CrowdFundFactory.json')

const BLOCKS_PER_DAY = 5082;
const BLOCKS_PER_WEEK = 38117;
const BLOCKS_PER_MONTH = 157553;

const initialState = {
    projectName: "",
    projectGoalInEth: 0,
    projectDeadline: BLOCKS_PER_DAY
}

class CreateProjectModal extends Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    handleClose = () => {
        this.props.onCloseModal();
        this.setState(initialState);
    }

    handleCreate = async () => {
        // this.props.onHandleProjectCreate(this.state);
        // this.setState(initialState);
        const { projectName, projectGoalInEth, projectDeadline } = this.state
        const ca = { projectName, projectGoalInEth, projectDeadline }

        await localStorage.setItem('projectName', projectName)
        await localStorage.setItem('projectGoalInEth', projectGoalInEth)
        await localStorage.setItem('projectDeadline', projectDeadline)

        const addr = await getBalance(window.web3)
        console.log(await window.web3.eth.getBalance(addr, (err, bal) => console.log(bal)))

        console.log(await window.web3.eth.getBlockNumber())

        const _startTime = new Date() / 1000

        const _endTime = await localStorage.getItem('projectDeadline', projectDeadline)
 
        const _tokenAddress = '0xa06b30582a0c6b0b1fc4572bcbcb692fdd05da82' 
 
        const _goal = projectGoalInEth

        const  _cap = 10
        
        const _rate = 2
 
        const contractAddress = '0xe3556605b46d958bec89af9b7c7f275f8b5b6d44'
 
        const owneraddress = addr
 
        const contractAbi = cfjson.abi

        await callFunctions(contractAbi, contractAddress, owneraddress, { _startTime, _endTime, _cap, _rate, _tokenAddress }, window.web3)
    }

    render () {
        const {isDisplayed, gasCost} = this.props;

        return (
            <div>
                <Modal 
                    open={isDisplayed}
                    closeOnDocumentClick={true}
                    onClose={this.handleClose}>
                    <Modal.Header>Create a new crowdfunding project</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form>
                                <Form.Input 
                                    label='Enter a name for the project'
                                    placeholder='Name'
                                    name={'projectName'}
                                    onChange={this.handleChange}
                                    value={this.state.projectName}  />
                                <Form.Input 
                                    label='Enter a goal in Ether'
                                    placeholder='ex 100'
                                    name={'projectGoalInEth'}
                                    onChange={this.handleChange}
                                    value={this.state.projectGoalInEth}  />
                                <Form.Field control={Select}
                                    label={'Select a deadline for funding'}
                                    name={'projectDeadline'}
                                    value={this.state.projectDeadline}
                                    options={[
                                        { key: '0', text: '1 Day (5082 blocks)', 
                                          value: Math.round((new Date() + (24 * 60 * 60 * 1000)) / 1000)},
                                        { key: '1', text: '1 Week (38117 blocks)',
                                           value: Math.round((new Date() + (7 * 24 * 60 * 60 * 1000)) / 1000)},
                                        { key: '2', text: '1 Month (157553 blocks)', 
                                           value: Math.round((new Date() + (24 * 60 * 60 * 1000)) / 1000)},
                                    ]}
                                    onChange={this.handleChange}/>
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.handleClose}>Cancel</Button>
                        <Button primary onClick={this.handleCreate}>Create</Button>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }
}

// CreateProjectModal.PropTypes = {
//     isDisplayed: React.PropTypes.bool.isRequired,
//     gasCost: React.PropTypes.number.isRequired,
//     currentBlock: React.PropTypes.number.isRequired,
//     onCloseModal: React.PropTypes.func.isRequired,
//     onHandleProjectCreate: React.PropTypes.func.isRequired,
// }

export default CreateProjectModal;