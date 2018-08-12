import React, { Component } from 'react';
// import {connect} from 'react-redux';
import { Container, Header, Divider, Button, Message } from 'semantic-ui-react';
// import { push } from 'react-router-redux';

import CreateProjectModal from '../components/crowdfunding/createProjectModal';
import ProjectList from '../components/crowdfunding/projectList';
// import {createProject, fetchProjects} from '../actions/fundingHubActions';


var _this;


const networkDisplayName = 'testrpc'
const networkId = '8045'
const currentBlock = '4505'


class HomeContainer extends Component {

    constructor(props) {
        super(props);
        _this = this;

        this.state = {
            showCreateProjectModal: false
        }
    }

    componentDidMount() {
        // const {dispatch} = _this.props;
        // dispatch(fetchProjects());
    }

    toggleModalDisplayed() {
        _this.setState({
            showCreateProjectModal: !_this.state.showCreateProjectModal
        });
    }

    

    handleCreateProjectClicked() {
        _this.toggleModalDisplayed();
    }


    getProjectsMessage(fundingHub) {
        if (fundingHub.fetchComplete && fundingHub.projects.length === 0) {
            return (
                <Message warning>
                    <Message.Header>No projects found</Message.Header>
                    <p>Start a crowdfunding project by clicking the button above</p>
                </Message> 
            );
        } else {
            return null;
        }
    }
    
    render() {
        console.log(this.state.showCreateProjectModal)
        return (
            <div>
            <Message info content={`Currently on ${networkDisplayName} (${networkId}), the current block is ${currentBlock}.`}/>
            <Container>
                <Header as='h1'>Explore projects</Header>
                <p>Crowdfund Dapp is a decentralized crowdfunding platform built on Ethereum. This site is intended to demonstrate a full featured dapp using the latest Ethereum and web development frameworks including Webpack, React, Redux, Semantic-ui, Solidity, Web3, and Truffle. Feel free to create projects and interact with it. All source code is available <a href="https://github.com/tyndallm/crowdfund-dapp">here</a> and is based off truffle-box</p>
                <Button 
                    primary
                    onClick={this.handleCreateProjectClicked}>
                    Create a project
                </Button>
                <Divider/>
                <ProjectList 
                    // projects={this.props.fundingHub.projects}
                    isLoading={false}
                    // blockNumber={this.props.network.currentBlock}
                    onProjectClicked={this.handleProjectClicked}/>
                {/* {this.getProjectsMessage(this.props.fundingHub)} */}
                <CreateProjectModal
                    isDisplayed={this.state.showCreateProjectModal}
                    gasCost={300000}
                    blockNumber={5}
                    onCloseModal={this.toggleModalDisplayed}
                    onHandleProjectCreate={this.handleCreateProject}/>
            </Container>
            </div>
        );
    }
}

export default HomeContainer