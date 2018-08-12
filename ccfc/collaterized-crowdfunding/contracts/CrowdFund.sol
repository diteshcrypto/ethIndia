pragma solidity ^0.4.24;

import "./DAO.sol";
import "./interfaces/IERC20.sol";
import "openzeppelin-solidity/contracts/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title STO module for standard capped crowdsale
 */
contract CrowdFund is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Strart time of the crowdfund
    uint256 public startTime;
    // End time of the crowdfund
    uint256 public endTime;

    //variable that hold the token address
    address public token;

    // Address where funds are collected and tokens are issued to
    address public wallet;

    // How many token units a buyer gets per wei / base unit of POLY
    uint256 public rate;

    // Amount of funds raised
    uint256 public fundsRaised;

    uint256 public investorCount;

    // Amount of tokens sold
    uint256 public tokensSold;

    //How many tokens this STO will be allowed to sell to investors
    uint256 public cap;

    mapping (address => uint256) public investors;

    /**
    * Event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    event LogNewDAOCreated(address _daoAddress, uint256 _timestamp, address _crowdfund);


    /**
     * @notice Function used to intialize the contract variables
     * @param _startTime Unix timestamp at which offering get started
     * @param _endTime Unix timestamp at which offering get ended
     * @param _cap Maximum No. of tokens for sale
     * @param _rate Token units a buyer gets per wei / base unit of POLY
     * @param _tokenAddress Address of the token that need to be delieverd as ROI
     * @param _owner Owner of the issuance
     */
    
    constructor(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _cap,
        uint256 _rate,
        address _tokenAddress,
        address _owner
    )
    public
    {   
        require(_rate > 0, "Rate of token should be greater than 0");
        require(_startTime >= now && _endTime > _startTime, "Date parameters are not valid");
        require(_cap > 0, "Cap should be greater than 0");
        require(_owner != address(0), "Zero address is not permitted");
        require(_tokenAddress != address(0),"0x address is not allowed");
        startTime = _startTime;
        endTime = _endTime;
        cap = _cap;
        rate = _rate;
        token = _tokenAddress;
        owner = _owner;
    }

    //////////////////////////////////
    /**
    * @notice fallback function ***DO NOT OVERRIDE***
    */
    function () external payable {
        buyTokens(msg.sender);
    }

    /**
      * @notice low level token purchase ***DO NOT OVERRIDE***
      * @param _beneficiary Address performing the token purchase
      */
    function buyTokens(address _beneficiary) public payable nonReentrant {
        uint256 weiAmount = msg.value;
        _processTx(_beneficiary, weiAmount);
        _postValidatePurchase(_beneficiary, weiAmount);
    }

    /**
    * @notice Checks whether the cap has been reached.
    * @return bool Whether the cap was reached
    */
    function capReached() public view returns (bool) {
        return fundsRaised >= cap;
    }

    /**
     * @notice Return the total no. of investors
     */
    function getNumberInvestors() public view returns (uint256) {
        return investorCount;
    }

    /**
     * @notice Return the STO details
     */
    function getCrowdFundDetails() public view returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        return (
            startTime,
            endTime,
            cap,
            rate,
            fundsRaised,
            investorCount,
            tokensSold
        );
    }

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------
    /**
      * Processing the purchase as well as verify the required validations
      * @param _beneficiary Address performing the token purchase
      * @param _investedAmount Value in wei involved in the purchase
    */
    function _processTx(address _beneficiary, uint256 _investedAmount) internal {

        _preValidatePurchase(_beneficiary, _investedAmount);
        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(_investedAmount);

        // update state
        fundsRaised = fundsRaised.add(_investedAmount);
        tokensSold = tokensSold.add(tokens);

        _processPurchase(_beneficiary, tokens);
        emit TokenPurchase(msg.sender, _beneficiary, _investedAmount, tokens);
    }

    /**
    * @notice Validation of an incoming purchase.
      Use require statements to revert state when conditions are not met. Use super to concatenate validations.
    * @param _beneficiary Address performing the token purchase
    * @param _investedAmount Value in wei involved in the purchase
    */
    function _preValidatePurchase(address _beneficiary, uint256 _investedAmount) internal view {
        require(_beneficiary != address(0), "Beneficiary address should not be 0x");
        require(_investedAmount != 0, "Amount invested should not be equal to 0");
        require(tokensSold.add(_getTokenAmount(_investedAmount)) <= cap, "Investment more than cap is not allowed");
        require(now >= startTime && now <= endTime, "Offering is closed/Not yet started");
    }

    /**
    * @notice Validation of an executed purchase.
      Observe state and use revert statements to undo rollback when valid conditions are not met.
    */
    function _postValidatePurchase(address /*_beneficiary*/, uint256 /*_investedAmount*/) internal pure {
      // optional override
    }

    /**
    * @notice Source of tokens.
      Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
    * @param _beneficiary Address performing the token purchase
    * @param _tokenAmount Number of tokens to be emitted
    */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        require(IERC20(token).mint(_beneficiary, _tokenAmount), "Error in minting the tokens");
    }

    /**
    * @notice Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
    * @param _beneficiary Address receiving the tokens
    * @param _tokenAmount Number of tokens to be purchased
    */
    function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
        if (investors[_beneficiary] == 0) {
            investorCount = investorCount + 1;
        }
        investors[_beneficiary] = investors[_beneficiary].add(_tokenAmount);

        _deliverTokens(_beneficiary, _tokenAmount);
    }

    /**
    * @notice Override to extend the way in which ether is converted to tokens.
    * @param _investedAmount Value in wei to be converted into tokens
    * @return Number of tokens that can be purchased with the specified _investedAmount
    */
    function _getTokenAmount(uint256 _investedAmount) internal view returns (uint256) {
        return _investedAmount.mul(rate);
    }

    /**
    * @notice Determines how ETH is stored/forwarded on purchases.
    * @param _permit It is the flag used to create the DAO when it true
    */
    function forwardFunds(bool _permit) onlyOwner public {
        if (capReached() && !_permit) {
            wallet.transfer(address(this).balance);
        } else {
            _createDAO(token, owner);
        }
        
    }

    function _createDAO(address _tokenAddress, address _owner) internal {
        address _daoAddress = new DAO(_tokenAddress, _owner, cap.sub(fundsRaised));
        address(this).transfer(address(this).balance);
        emit LogNewDAOCreated(_daoAddress, block.timestamp, address(this));
    }


}
