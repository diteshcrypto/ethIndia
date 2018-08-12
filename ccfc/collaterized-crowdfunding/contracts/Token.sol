pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";

contract Token is StandardToken, Ownable, DetailedERC20 {

  
  mapping(address => bool) public allowedMiners;
  event LogWhitelistMiner(address indexed _miner, bool _isAllowed);
  event Mint(address indexed to, uint256 amount);
  event MintFinished();
 
  bool public mintingFinished = false;


  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  modifier hasMintPermission() {
    require(msg.sender == owner || allowedMiners[msg.sender]);
    _;
  }

   constructor(string name, string symbol, uint8 decimals) public DetailedERC20(name, symbol, decimals) {

   }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address _to,
    uint256 _amount
  )
    hasMintPermission
    canMint
    public
    returns (bool)
  {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner canMint public returns (bool) {
    mintingFinished = true;
    emit MintFinished();
    return true;
  }

  /**
   * @dev Add the miner in the allowed miner list
   * @param _miner Address of the new miner
   */
   function whitelistMiner(address _miner) public onlyOwner {
       require(_miner !=address(0));
       bool isAllowed = true;
       if (!allowedMiners[_miner]) {
           allowedMiners[_miner] = isAllowed;
       } else {
           isAllowed = false;
           allowedMiners[_miner] = isAllowed;
       }
       emit LogWhitelistMiner(_miner, isAllowed);
       
   }

}