pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract DAO is Ownable {
    using SafeMath for uint256;
    // Contract Variables and events
    uint public minimumQuorum;
    uint public debatingPeriodInMinutes;
    uint256 public majorityMarginWeight;
    Proposal[] public proposals;
    uint public numProposals;
    mapping (address => uint) public memberId;
    Member[] public members;
    address public factoryAddress;
    address public token;
    uint256 public requiredDebt;
    uint256 public fundsRaised;
    uint256 public collateralAmount;

    event LogProposalAdded(uint proposalID, address recipient, uint amount, string description);
    event Voted(uint proposalID, bool position, address voter, string justification);
    event LogProposalTallied(uint proposalID, uint256 result, uint quorum, bool active);
    event LogMembershipChanged(address member, bool isMember);
    event LogChangeOfRules(uint newMinimumQuorum, uint newDebatingPeriodInMinutes, uint256 newmajorityMarginWeight);
    event LogReceivedEther(address sender, uint amount);
    event LogReceivedTokens(address _from, uint256 _value, address _token, bytes _extraData);

    struct Proposal {
        address recipient;
        uint amount;
        string description;
        uint minExecutionDate;
        bool executed;
        bool proposalPassed;
        uint numberOfVotes;
        uint256 currentResultWeight;
        bytes32 proposalHash;
        Vote[] votes;
        mapping (address => bool) voted;
    }

    struct Member {
        address member;
        string memberName;
        uint memberSince;
    }

    struct Vote {
        bool inSupport;
        address voter;
        string justification;
    }

    modifier onlyFactory() {
        require(msg.sender == factoryAddress);
        _;
    }

    // Modifier that allows only shareholders to vote and create new proposals
    modifier onlyMembers() {
        require(memberId[msg.sender] != 0);
        _;
    }

    /**
     * Constructor function
     */
    constructor(address _tokenAddress, address _daoOwner, uint256 _amtEthNeeded) public {
        require(_tokenAddress != address(0));
        token = _tokenAddress;
        factoryAddress == msg.sender;
        owner = _daoOwner;
        requiredDebt = _amtEthNeeded;
        // It’s necessary to add an empty first member
        addMember(0, "");
        // and let's add the founder, to save a step later
        addMember(owner, 'founder');
    }

    /**
     * Add member
     *
     * Make `targetMember` a member named `memberName`
     *
     * @param targetMember ethereum address to be added
     * @param memberName public name for that member
     */
    function addMember(address targetMember, string memberName) public onlyOwner {
        uint id = memberId[targetMember];
        if (id == 0) {
            memberId[targetMember] = members.length;
            id = members.length++;
        }

        members[id] = Member(targetMember, memberName, now);
        emit LogMembershipChanged(targetMember, true);
    }

    /**
     * Remove member
     *
     * @notice Remove membership from `targetMember`
     *
     * @param targetMember ethereum address to be removed
     */
    function removeMember(address targetMember) public onlyOwner {
        require(memberId[targetMember] != 0);

        for (uint i = memberId[targetMember]; i<members.length-1; i++){
            members[i] = members[i+1];
        }
        delete members[members.length-1];
        members.length--;
        emit LogMembershipChanged(targetMember, false);
    }

    /**
     * Change voting rules
     *
     * Make so that proposals need to be discussed for at least `minutesForDebate/60` hours,
     * have at least `minimumQuorumForProposals` votes, and have 50% + `marginOfVotesForMajority` votes to be executed
     *
     * @param minimumQuorumForProposals how many members must vote on a proposal for it to be executed
     * @param minutesForDebate the minimum amount of delay between when a proposal is made and when it can be executed
     * @param marginOfVotesForMajority the proposal needs to have 50% plus this number
     */
    function changeVotingRules(
        uint minimumQuorumForProposals,
        uint minutesForDebate,
        uint marginOfVotesForMajority
    ) onlyOwner public {
        minimumQuorum = minimumQuorumForProposals;
        debatingPeriodInMinutes = minutesForDebate;
        majorityMarginWeight = marginOfVotesForMajority;

        emit LogChangeOfRules(minimumQuorum, debatingPeriodInMinutes, majorityMarginWeight);
    }

    /**
     * Add Proposal
     *
     * Propose to send `weiAmount / 1e18` ether to `beneficiary` for `jobDescription`. `transactionBytecode ? Contains : Does not contain` code.
     *
     * @param beneficiary who to send the ether to
     * @param weiAmount amount of ether to send, in wei
     * @param jobDescription Description of job
     * @param transactionBytecode bytecode of transaction
     */
    function newProposal(
        address beneficiary,
        uint weiAmount,
        string jobDescription,
        bytes transactionBytecode
    )
        onlyMembers public
        returns (uint proposalID)
    {
        proposalID = proposals.length++;
        Proposal storage p = proposals[proposalID];
        p.recipient = beneficiary;
        p.amount = weiAmount;
        p.description  = jobDescription;
        p.minExecutionDate = now + debatingPeriodInMinutes * 1 minutes;
        p.executed = false;
        p.proposalPassed = false;
        p.numberOfVotes = 0;
        p.currentResultWeight = 0;
        p.proposalHash = keccak256(abi.encodePacked(beneficiary, weiAmount, transactionBytecode));
        emit LogProposalAdded(proposalID, beneficiary, weiAmount, jobDescription);
        numProposals = proposalID+1;
        return proposalID;
    }

    /**
     * Add proposal in Ether
     *
     * Propose to send `etherAmount` ether to `beneficiary` for `jobDescription`. `transactionBytecode ? Contains : Does not contain` code.
     * This is a convenience function to use if the amount to be given is in round number of ether units.
     *
     * @param beneficiary who to send the ether to
     * @param etherAmount amount of ether to send
     * @param jobDescription Description of job
     * @param transactionBytecode bytecode of transaction
     */
    function newProposalInEther(
        address beneficiary,
        uint etherAmount,
        string jobDescription,
        bytes transactionBytecode
    )
        onlyMembers public
        returns (uint proposalID)
    {
        return newProposal(beneficiary, etherAmount * 1 ether, jobDescription, transactionBytecode);
    }

    /**
     * Check if a proposal code matches
     *
     * @param proposalNumber ID number of the proposal to query
     * @param beneficiary who to send the ether to
     * @param weiAmount amount of ether to send
     * @param transactionBytecode bytecode of transaction
     */
    function checkProposalCode(
        uint proposalNumber,
        address beneficiary,
        uint weiAmount,
        bytes transactionBytecode
    )
        constant public
        returns (bool codeChecksOut)
    {
        Proposal storage p = proposals[proposalNumber];
        return p.proposalHash == keccak256(abi.encodePacked(beneficiary, weiAmount, transactionBytecode));
    }

    /**
     * Log a vote for a proposal
     *
     * Vote `supportsProposal? in support of : against` proposal #`proposalNumber`
     *
     * @param proposalNumber number of proposal
     * @param supportsProposal either in favor or against it
     * @param justificationText optional justification text
     */
    function vote(
        uint proposalNumber,
        bool supportsProposal,
        string justificationText
    )
        public
        returns (uint voteID)
    {   
        require(ERC20(token).balanceOf(msg.sender) >= 1 ether);
        Proposal storage p = proposals[proposalNumber]; // Get the proposal
        require(!p.voted[msg.sender]);                  // If has already voted, cancel
        p.voted[msg.sender] = true;                     // Set this voter as having voted
        p.numberOfVotes++;                              // Increase the number of votes
        if (supportsProposal) {                         // If they support the proposal
            // Increase score
            p.currentResultWeight = p.currentResultWeight.add((ERC20(token).balanceOf(msg.sender)* 1 ether).div(ERC20(token).totalSupply()));  
        } else {  
            // If they don't Decrease the score                                      
            p.currentResultWeight = p.currentResultWeight.sub((ERC20(token).balanceOf(msg.sender)* 1 ether).div(ERC20(token).totalSupply()));                    
        }

        // Create a log of this event
        emit Voted(proposalNumber,  supportsProposal, msg.sender, justificationText);
        return p.numberOfVotes;
        
    }

    /**
     * Finish vote
     *
     * Count the votes proposal #`proposalNumber` and execute it if approved
     *
     * @param proposalNumber proposal number
     * @param transactionBytecode optional: if the transaction contained a bytecode, you need to send it
     */
    function executeProposal(uint proposalNumber, bytes transactionBytecode) public {
        Proposal storage p = proposals[proposalNumber];

        require(now > p.minExecutionDate                                            // If it is past the voting deadline
            && !p.executed                                                         // and it has not already been executed
            && p.proposalHash == keccak256(abi.encodePacked(p.recipient, p.amount, transactionBytecode))  // and the supplied code matches the proposal
            && p.numberOfVotes >= minimumQuorum);                                  // and a minimum quorum has been reached...

        // ...then execute result

        if (p.currentResultWeight > (majorityMarginWeight * 1 ether)) {
            // Proposal passed; execute the transaction

            p.executed = true; // Avoid recursive calling
            require(p.recipient.call.value(p.amount)(transactionBytecode));

            p.proposalPassed = true;
        } else {
            // Proposal failed
            p.proposalPassed = false;
        }

        // Fire Events
        emit LogProposalTallied(proposalNumber, p.currentResultWeight, p.numberOfVotes, p.proposalPassed);
    }

    /**
     * @notice Provide the total funds in the contract
     */
    function getTotalfunds() public view returns(uint256) {
        return address(this).balance;
    } 

    /// TODO: need to implement the logic after reading the Dharma protocol
    function _executeDebtOrder(uint256 _value) internal {
        fundsRaised = fundsRaised.add(_value);
    }

    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public {
        require(ERC20(token).transferFrom(_from, this, _value));
        emit LogReceivedTokens(_from, _value, _token, _extraData);
    }

    /// fallback function
    function () payable public {
        if (collateralAmount == 0) {
            collateralAmount = collateralAmount.add(msg.value);
        } else {
            // TODO: add more logic to work around on the ether recieving 
            _executeDebtOrder(msg.value);
        }
        emit LogReceivedEther(msg.sender, msg.value);
    }

}
