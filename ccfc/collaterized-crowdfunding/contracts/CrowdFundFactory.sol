pragma solidity ^0.4.24;

import './CrowdFund.sol';

contract CrowdFundFactory {

    event LogGenerateNewCrowdfund(uint256 _startTime, uint256 _endTime, address indexed _creator, address _crowdfundAddress);

    constructor() public {

    }

    /**
     * @notice use to launch a new crowdfund
     * @param _startTime Start date of the crowdund
     * @param _endTime End date of the crowdfund 
     * @param _cap Hard cap of the crowdfund (In terms of ETH)
     * @param _rate Rate of token i.e Tokens per ETH
     * @param _tokenAddress Address of the utility token that needs to distribute to the investors    
     */
     function generateNewCrowdfund(uint256 _startTime, uint256 _endTime, uint256 _cap, uint256 _rate, address _tokenAddress) public {
         require(_startTime >= block.timestamp, "Start time should not be in past");
         require(_endTime > _startTime, "End time should be greater than the startdate");
         require(_cap > 0 && _rate > 0, "Parameters should be greater than the 0");
         require(_tokenAddress != address(0),"0x address is not allowed");
         address _crowdfundAddress = new CrowdFund(_startTime, _endTime, _rate, _cap, _tokenAddress, msg.sender);
         emit LogGenerateNewCrowdfund(_startTime, _endTime, msg.sender, _crowdfundAddress);
     }

}


