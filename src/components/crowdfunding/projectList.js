import React, { Component } from 'react';
import { Item, Label, Loader, Progress } from 'semantic-ui-react';
// import {getFormattedProgressPercentage, getProjectStatus} from '../utils/projectUtils';

const projects = [
    {
    title: 'Test 1',
    goal: 20,
    deadline: 'deadline',
    creator: 'test',
    totalFunding: 10,
    contributionsCount: 20,
    contributorsCount: 20,
    fundingHub: 'test',
    address: 'test'
}, 
{
    title: 'Test 2',
    goal: 20,
    deadline: 'deadline',
    creator: 'test',
    totalFunding: 10,
    contributionsCount: 10,
    contributorsCount: 10,
    fundingHub: 'test',
    address: 'test'
}
]

const getFormattedProgressPercentage = (
    fundingRaised, fundingGoal) => Number(
        ((Number(fundingRaised) / Number(fundingGoal)) * 100).toFixed(2))

const currentBlock = 10

class ProjectList extends Component {

    render() {
        const { isLoading } = this.props;
        return (
            <div>
            <Loader active={isLoading} inline='centered' />
            <Item.Group link divided>
                {projects.map((project, index) => 
                    <Item key={index} onClick={() => this.props.onProjectClicked(project.address)}>
                        <Item.Content>
                            <Item.Header>
                                {project.title}
                            </Item.Header>
                            <Item.Meta>{project.totalFunding + " / " + project.goal + " ETH"}</Item.Meta>
                            <Item.Description>
                            </Item.Description>
                            <Progress percent={getFormattedProgressPercentage(project.totalFunding, project.goal)} color='green'>
                                {/* {getFormattedProgressPercentage(project.totalFunding, project.goal) + "%"} */}
                            </Progress>
                            <Item.Extra>
                                {/* <Label color={'green'}>{getProjectStatus(currentBlock, project.deadline, project.totalFunding, project.goal)}</Label> */}
                                <Label icon='file text outline' content={project.address} />
                                <Label icon='user' content={project.creator} />
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                )}
            </Item.Group>
            </div>
        )
    }
}

export default ProjectList;