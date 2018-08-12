import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';
// import { getEtherscanLink } from '../utils/web3Utils';

const contributions = [{ contributor: 'test', amount: 10 }, { contributor: 'test2', amount: 15 }, { contributor: 'test3', amount: 20 }]

class ContributionList extends Component {
    render() {
        const { isLoading } = this.props;
        
        return (
            <Table celled padded >
                
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Contributor</Table.HeaderCell>
                        <Table.HeaderCell>Amount</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {contributions.map((contribution, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                {/* <a href={getEtherscanLink(contribution.contributor)}>{contribution.contributor}</a> */}
                                {contribution.contributor}
                            </Table.Cell>
                            <Table.Cell>
                                {contribution.amount} ETH
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        );
    }
}

export default ContributionList;