pragma solidity 0.5.1;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


interface IKODAV2KyberBridge {
  function mint(address _to, uint256 _editionNumber) external returns (uint256);

  function totalRemaining(uint256 _editionNumber) external view returns (uint256);

  function purchaseTo(address _to, uint256 _editionNumber) external view returns (uint256);
}

contract KyberNetworkBridge is Ownable, Pausable {
  using SafeMath for uint256;

  // Interface into the KODA world
  IKODAV2KyberBridge public kodaAddress;

  /////////////////
  // Constructor //
  /////////////////

  // Set the caller as the default KO account
  constructor(IKODAV2KyberBridge _kodaAddress) public {
    kodaAddress = _kodaAddress;
  }

  //////////////////
  // Core Methods //
  //////////////////

  // TODO public purchase method
  // check valid
  // convert
  // mint as normal 


}
