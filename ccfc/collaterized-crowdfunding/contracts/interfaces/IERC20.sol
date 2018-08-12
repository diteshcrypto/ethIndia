pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract IERC20 is ERC20 {
  function mint(
    address _to,
    uint256 _amount
  )
    public
    returns (bool);
}