import React, { Component } from 'react';
// import {connect} from 'react-redux';
import { Card, Grid, Message } from 'semantic-ui-react';
import style from 'semantic-ui-css/semantic.min.css';
import ProjectCard from '../components/crowdfunding/projectCard';
// import { 
//     fetchProject,
//     contribute,
//     fetchProjectBalance,
//     fetchContributions
// } from '../actions/projectActions';
// import { fetchAccountsAndBalances } from '../actions/userActions';
import ContributionList from '../components/crowdfunding/contributionList';
import ProjectDetails from '../components/crowdfunding/projectDetails';
import ContributeModal from '../components/crowdfunding/contributeModal';
// import { Card, CardHeader, CardText } from 'material-ui/Card'

var _this;
const networkDisplayName = 'testrpc'
const networkId = '8045'
const currentBlock = '4505'


const project = {
                    title: 'test',
                    goal: 20,
                    deadline: 450,
                    creator: 'test',
                    totalFunding: 10,
                    contributionsCount: 5,
                    contributorsCount: 10 ,
                    fundingHub: 'test',
                    address: '0xkdadkj'
                }

class ProjectContainer extends Component {

    constructor(props) {
        super(props);
        _this = this;

        this.state = {
            showContributeModal: false
        }

    }

    componentDidMount() {
        // const { dispatch, params } = _this.props;
        // dispatch(fetchProject(params.address));
        // dispatch(fetchContributions(params.address));
        // dispatch(fetchProjectBalance(params.address));
    }


    toggleModalDisplayed() {
        _this.setState({
            showContributeModal: !_this.state.showContributeModal
        });
    }

    handleContributeClicked() {
        _this.toggleModalDisplayed();
    }

    handleContribute(amount) {
        const {dispatch, user, project} = _this.props;

        _this.toggleModalDisplayed();

        let selectedUserAddress = user.accounts[user.selectedAccount].address;

        // if (!!selectedUserAddress) {
        //     dispatch(contribute(project.project.address, amount, selectedUserAddress))
        //     .then(() => {
        //         dispatch(fetchProject(project.project.address));
        //         dispatch(fetchContributions(project.project.address))
        //         dispatch(fetchAccountsAndBalances());
        //         dispatch(fetchProjectBalance(project.project.address));
        //     });
        // }
    }

    render() {
        // const { 
        //     project, 
        //     network: {
        //         network,
        //         currentBlock
        //     }
        // } = this.props;

        // let projectDetails = project.project;
        // let contributions = project.contributions;

        return (
            <div>
                <Message info content={`Currently on ${networkDisplayName} (${networkId}), the current block is ${currentBlock}.`}/>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            <ProjectCard
                                // project={projectDetails}
                                // isLoading={project.isFetching}
                                isLoading={false}
                                onContributeClicked={_this.handleContributeClicked}/>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <ProjectDetails 
                                // project={projectDetails}
                                // balance={project.balance}
                                // currentBlock={currentBlock}
                                />
                        </Grid.Column>
                        <ContributeModal 
                            isDisplayed={_this.state.showContributeModal}
                            // isDisplayed={false}
                            gasCost={3000000}
                            onCloseModal={_this.toggleModalDisplayed}
                            onHandleContribute={_this.handleContribute}/>
                    </Grid.Row>
                    <Grid.Row>
                        <ContributionList 
                            // contributions={contributions}
                            />
                    </Grid.Row>
                    </Grid>   
                </div>
        )
    }
}

export default ProjectContainer