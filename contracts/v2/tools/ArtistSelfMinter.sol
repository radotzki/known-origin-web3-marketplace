pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* Minimal interface definition for KODA V2 contract calls
*
* https://www.knownorigin.io/
*/
interface IKODAV2 {
  function mint(address _to, uint256 _editionNumber) external returns (uint256);

  function editionActive(uint256 _editionNumber) public view returns (bool);

  function artistCommission(uint256 _editionNumber) external view returns (address _artistAccount, uint256 _artistCommission);
}

/**
* @title Artists self minting for KnownOrigin (KODA)
*
* Allows for the edition artists to mint there own assets.
*
* Rules:
* 1) Reverts if the msg.sender isn't the artists defined on the edition
* 2) Reverts if they are minting assets which dont exists
* 3) Reverts if the edition is sold out
* 4) Reverts if the edition is set as inactive in KO base layer
*
* https://www.knownorigin.io/
*
* BE ORIGINAL. BUY ORIGINAL.
*/
contract ArtistSelfMinter is Ownable, Pausable {
  using SafeMath for uint256;

  // Interface into the KODA world
  IKODAV2 public kodaAddress;

  constructor(IKODAV2 _kodaAddress) public {
    kodaAddress = _kodaAddress;
  }

  function mint(address _to, uint256 _editionNumber)
  external
  whenNotPaused
  returns (uint256)
  {
    require(_to == address(0), "Unable to send to zero address");

    address artistAccount;
    uint256 artistCommission;
    (artistAccount, artistCommission) = kodaAddress.artistCommission(_editionNumber);
    require(msg.sender == artistAccount, "Only from the edition artist account");

    bool isActive = kodaAddress.editionActive(_editionNumber);
    require(isActive, "Only when edition is active");

    return kodaAddress.mint(_to, _editionNumber);
  }

  /**
   * @dev Sets the KODA address
   * @dev Only callable from owner
   */
  function setKodavV2(IKODAV2 _kodaAddress) onlyOwner public {
    kodaAddress = _kodaAddress;
  }
}
