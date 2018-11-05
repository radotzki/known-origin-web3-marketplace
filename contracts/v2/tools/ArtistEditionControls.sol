pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* Minimal interface definition for KODA V2 contract calls
*
* https://www.knownorigin.io/
*/
interface IKODAV2Controls {
  function mint(address _to, uint256 _editionNumber) external returns (uint256);

  function editionActive(uint256 _editionNumber) external view returns (bool);

  function artistCommission(uint256 _editionNumber) external view returns (address _artistAccount, uint256 _artistCommission);

  function totalAvailableEdition(uint256 _editionNumber) external view returns (uint256);

  function updatePriceInWei(uint256 _editionNumber, uint256 _priceInWei) external;

  function totalRemaining(uint256 _editionNumber) external view returns (uint256);
}

/**
* @title Artists self minting for KnownOrigin (KODA)
*
* Allows for the edition artists to mint there own assets and control the price of an edition
*
* https://www.knownorigin.io/
*
* BE ORIGINAL. BUY ORIGINAL.
*/
contract ArtistEditionControls is Ownable, Pausable {
  using SafeMath for uint256;

  // Interface into the KODA world
  IKODAV2Controls public kodaAddress;

  constructor(IKODAV2Controls _kodaAddress) public {
    kodaAddress = _kodaAddress;
  }

  /**
   * @dev Ability to mint new NFTs from an edition
   * @dev Only callable from edition artists defined in KODA NFT contract
   * @dev Only callable when contract is not paused
   * @dev Reverts if edition is invalid
   * @dev Reverts if edition is not active in KDOA NFT contract
   * @dev Reverts if remaining assets in an edition are great than 2
   */
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

    uint256 totalRemaining = kodaAddress.totalRemaining(_editionNumber);
    require(totalRemaining > 2, "Cannot mint any more from here");

    return kodaAddress.mint(_to, _editionNumber);
  }

  /**
   * @dev Sets the price of the provided edition in the WEI
   * @dev Only callable from edition artists defined in KODA NFT contract
   * @dev Only callable when contract is not paused
   * @dev Reverts if edition is invalid
   * @dev Reverts if edition is not active in KDOA NFT contract
   */
  function setPriceInWei(uint256 _editionNumber, uint256 _priceInWei)
  external
  whenNotPaused
  returns (bool)
  {
    address artistAccount;
    uint256 artistCommission;
    (artistAccount, artistCommission) = kodaAddress.artistCommission(_editionNumber);
    require(msg.sender == artistAccount, "Only from the edition artist account");

    bool isActive = kodaAddress.editionActive(_editionNumber);
    require(isActive, "Only when edition is active");

    kodaAddress.updatePriceInWei(_editionNumber, _priceInWei);

    return true;
  }

  /**
   * @dev Sets the KODA address
   * @dev Only callable from owner
   */
  function setKodavV2(IKODAV2Controls _kodaAddress) onlyOwner public {
    kodaAddress = _kodaAddress;
  }
}
