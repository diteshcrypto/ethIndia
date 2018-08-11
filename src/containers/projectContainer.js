import React, { Component } from 'react';
// import {connect} from 'react-redux';
// import { Card, Grid } from 'semantic-ui-react';
import ProjectCard from '../components/crowdfunding/projectCard';
// import { 
//     fetchProject,
//     contribute,
//     fetchProjectBalance,
//     fetchContributions
// } from '../actions/projectActions';
// import { fetchAccountsAndBalances } from '../actions/userActions';
// import ContributionList from '../components/crowdfunding/contributionList';
import ProjectDetails from '../components/crowdfunding/projectDetails';
// import ContributeModal from '../components/crowdfunding/contributeModal';
import { Card, CardHeader, CardText } from 'material-ui/Card'

var _this;

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
                
                     <div style={{ marginBottom: 8 }}>
                     <Card>
                     <CardHeader title="Balance" />
                     <CardText style={{ paddingTop: 0, paddingBottom: 8 }}>
                         <div>
                         <b>Total Balance</b>: {10} Ether 
                         </div>
                         <div>
                         <b>Total Revenue</b>: {100} Ether 
                         </div>
                         <div>
                         <b>Smart Contract Balance</b>:&nbsp;
                             {100} Ether 
                         </div>
                         <div>
                         <b>Credits</b>: {100} Ether 
                         </div>
                     </CardText>
                     </Card>
                  </div>
        )
    }
}

// function mapStateToProps(state) {
//     return {
//         user: state.user,
//         project: state.project,
//         network: state.network,
//     }
// }

// export default connect(mapStateToProps)(ProjectContainer);
export default ProjectContainer