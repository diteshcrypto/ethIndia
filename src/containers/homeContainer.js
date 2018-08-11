import React, { Component } from 'react';
// import {connect} from 'react-redux';
import { Container, Header, Divider, Button, Message } from 'semantic-ui-react';
// import { push } from 'react-router-redux';

import CreateProjectModal from '../components/crowdfunding/createProjectModal';
import ProjectList from '../components/crowdfunding/projectList';
// import {createProject, fetchProjects} from '../actions/fundingHubActions';


var _this;

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
            <Container>
                <Header as='h1'>Explore projects</Header>
                <p>Crowdfund Dapp is a decentralized crowdfunding platform built on Ethereum. This site is intended to demonstrate a full featured dapp using the latest Ethereum and web development frameworks including Webpack, React, Redux, Semantic-ui, Solidity, Web3, and Truffle. Feel free to create projects and interact with it. All source code is available <a href="https://github.com/tyndallm/crowdfund-dapp">here</a> and is based off truffle-box</p>
                {/* <Button 
                    primary
                    onClick={this.handleCreateProjectClicked}>
                    Create a project
                </Button> */}
                <Divider/>
                
                    <div>
                        <form onSubmit={this.handleSubmit}>
                        <div>
                            <label>
                            Enter a name for the project :<span>&nbsp;&nbsp;</span>
                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                            </label>
                        </div>
                        <div>
                            <label>
                            Enter a goal in Ether :<span>&nbsp;&nbsp;</span>
                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                            </label>
                        </div>
                        <div>
                            <label>
                            Select a deadline for funding:<span>&nbsp;&nbsp;</span>
                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                            </label>
                        </div>
                        <br />
                        <div>
                            <select>
                                <option value="grapefruit">Grapefruit</option>
                                <option value="lime">Lime</option>
                                <option selected value="coconut">Coconut</option>
                                <option value="mango">Mango</option>
                            </select>
                        </div>
                        <br />
                        <div>
                            <input type="submit" value="Create a project" />
                        </div>
                    </form>
                    </div>
            </Container>
        );
    }
}

// function mapStateToProps(state) {
//     return {
//         user: state.user,
//         network: state.network,
//         fundingHub: state.fundingHub,
//     }
// }

// export default connect(mapStateToProps)(HomeContainer);
export default HomeContainer