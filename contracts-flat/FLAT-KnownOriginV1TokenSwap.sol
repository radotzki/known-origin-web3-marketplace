pragma solidity ^0.4.24;

// File: contracts/v2/IKnownOriginDigitalAssetV1.sol

// Copied over so does not clash with other ERC721Basic contracts
contract ERC721BasicOld {
  function balanceOf(address _owner) public view returns (uint256 _balance);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function exists(uint256 _tokenId) public view returns (bool _exists);

  function approve(address _to, uint256 _tokenId) public;
  function getApproved(uint256 _tokenId) public view returns (address _operator);

  function setApprovalForAll(address _operator, bool _approved) public;
  function isApprovedForAll(address _owner, address _operator) public view returns (bool);

  function transferFrom(address _from, address _to, uint256 _tokenId) public;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public;
}

/*
 * Defines what functions are needed from the KODA V1 contract to allow for the migration of tokens from V1 to V2
 */
contract IKnownOriginDigitalAssetV1 is ERC721BasicOld {

  enum PurchaseState {Unsold, EtherPurchase, FiatPurchase}

  function assetInfo(uint _tokenId) public view returns (
    uint256 _tokId,
    address _owner,
    PurchaseState _purchaseState,
    uint256 _priceInWei,
    uint32 _purchaseFromTime
  );

  function editionInfo(uint256 _tokenId) public view returns (
    uint256 _tokId,
    bytes16 _edition,
    uint256 _editionNumber,
    string _tokenURI,
    address _artistAccount
  );
}

// File: openzeppelin-solidity/contracts/introspection/ERC165.sol

/**
 * @title ERC165
 * @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
 */
interface ERC165 {

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceId The interface identifier, as specified in ERC-165
   * @dev Interface identification is specified in ERC-165. This function
   * uses less than 30,000 gas.
   */
  function supportsInterface(bytes4 _interfaceId)
    external
    view
    returns (bool);
}

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol

/**
 * @title ERC721 Non-Fungible Token Standard basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Basic is ERC165 {
  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 indexed _tokenId
  );
  event Approval(
    address indexed _owner,
    address indexed _approved,
    uint256 indexed _tokenId
  );
  event ApprovalForAll(
    address indexed _owner,
    address indexed _operator,
    bool _approved
  );

  function balanceOf(address _owner) public view returns (uint256 _balance);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function exists(uint256 _tokenId) public view returns (bool _exists);

  function approve(address _to, uint256 _tokenId) public;
  function getApproved(uint256 _tokenId)
    public view returns (address _operator);

  function setApprovalForAll(address _operator, bool _approved) public;
  function isApprovedForAll(address _owner, address _operator)
    public view returns (bool);

  function transferFrom(address _from, address _to, uint256 _tokenId) public;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId)
    public;

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    public;
}

// File: contracts/v2/IKnownOriginDigitalAssetV2.sol

/*
 * Defines what functions are needed from the KODA V1 contract to allow for the migration of tokens from V1 to V2
 */
contract IKnownOriginDigitalAssetV2
is
ERC721Basic {

}

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
      return 0;
    }

    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

// File: contracts/v2/KnownOriginV1TokenSwap.sol

// Allows this contract to receive erc721 tokens from KODA V1 0 FIXME is this needed?
//import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

// V1 migration interface


// V2 interface


contract KnownOriginV1TokenSwap is Ownable {
  using SafeMath for uint;

  IKnownOriginDigitalAssetV1 public kodaV1;

  IKnownOriginDigitalAssetV2 public kodaV2;

  address public knownOriginArchiveAddress;

  /*
   * Constructor
   */
  constructor (
    IKnownOriginDigitalAssetV1 _kodaV1,
    IKnownOriginDigitalAssetV2 _kodaV2,
    address _knownOriginArchiveAddress
  ) public {
    require(_kodaV1 != address(0));
    require(_kodaV2 != address(0));
    require(knownOriginArchiveAddress != address(0));
    kodaV1 = _kodaV1;
    kodaV2 = _kodaV2;
    knownOriginArchiveAddress = _knownOriginArchiveAddress;
  }

  // Stage 1 : user approves all for this contract
  // Stage 2 : KO setups up edition which needs to be migrated
  // Stage 3 : KO invokes this method for the given token which takes ownership of asset, mints new one to the old owner
  function tokenSwap(uint256 _tokenId) public onlyOwner {
    // check valid
    require(kodaV1.exists(_tokenId));

    // Stage 1 : check this contract can take ownership
    require(kodaV1.getApproved(_tokenId) == this);

    uint256 _tokenId1;
    address _owner;
    IKnownOriginDigitalAssetV1.PurchaseState _purchaseState;
    uint256 _priceInWei;
    uint32 _purchaseFromTime;

    (_tokenId1, _owner, _purchaseState, _priceInWei, _purchaseFromTime) = kodaV1.assetInfo(_tokenId);

    uint256 _tokenId2;
    bytes16 _edition;
    uint256 _editionNumber;
    string memory _tokenURI;
    address _artistAccount;

    (_tokenId2, _edition, _editionNumber, _tokenURI, _artistAccount) = kodaV1.editionInfo(_tokenId);

    // Stage 2:
    // TODO mint new one - how?


    // Stage 3 : take ownership of asset
    kodaV1.transferFrom(kodaV1.ownerOf(_tokenId), knownOriginArchiveAddress, _tokenId);

  }

}
