pragma solidity ^0.4.24;

// File: contracts/Strings.sol

library Strings {
  // via https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol
  function strConcat(string _a, string _b, string _c, string _d, string _e) internal pure returns (string) {
    bytes memory _ba = bytes(_a);
    bytes memory _bb = bytes(_b);
    bytes memory _bc = bytes(_c);
    bytes memory _bd = bytes(_d);
    bytes memory _be = bytes(_e);
    string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
    bytes memory babcde = bytes(abcde);
    uint k = 0;
    for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
    for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
    for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
    for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
    for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
    return string(babcde);
  }

  function strConcat(string _a, string _b, string _c, string _d) internal pure returns (string) {
    return strConcat(_a, _b, _c, _d, "");
  }

  function strConcat(string _a, string _b, string _c) internal pure returns (string) {
    return strConcat(_a, _b, _c, "", "");
  }

  function strConcat(string _a, string _b) internal pure returns (string) {
    return strConcat(_a, _b, "", "", "");
  }

  function bytes16ToStr(bytes16 _bytes16, uint8 _start, uint8 _end) internal pure returns (string) {
    bytes memory bytesArray = new bytes(_end - _start);
    uint8 pos = 0;
    for (uint8 i = _start; i < _end; i++) {
      bytesArray[pos] = _bytes16[i];
      pos++;
    }
    return string(bytesArray);
  }

  function compare(string memory _a, string memory _b) pure internal returns (bool) {
    bytes memory a = bytes(_a);
    bytes memory b = bytes(_b);

    // Compare two strings quickly by length to try to avoid detailed loop comparison
    if (a.length != b.length)
      return false;

    // Compare two strings in detail Bit-by-Bit
    for (uint i = 0; i < a.length; i++)
      if (a[i] != b[i])
        return false;

    // Byte values of string are the same
    return true;
  }
}

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

  function getTypeFromEdition(bytes16 _edition) public pure returns (string);
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

  // Stage 1 : user approves all for token swap contract - KODA V1 - setApprovalForAll() (form user)
  // Stage 2 : KO setups up edition which needs to be migrated - setupNewEdition()
  // Stage 3 : KO takes ownership of asset, assigns new one to old owner - takeOwnershipAndSwap()

  // Stage 2
  function setupNewEdition(uint256 _tokenId) public onlyOwner {
    require(kodaV1.exists(_tokenId));

    uint256 _tokenId1;
    address _owner;
    IKnownOriginDigitalAssetV1.PurchaseState _purchaseState;
    uint256 _priceInWei;
    uint32 _purchaseFromTime;

    (_tokenId1, _owner, _purchaseState, _priceInWei, _purchaseFromTime) = kodaV1.assetInfo(_tokenId);

    bytes16 _edition;
    uint256 _editionNumber;
    string memory _tokenURI;
    address _artistAccount;

    (_tokenId1, _edition, _editionNumber, _tokenURI, _artistAccount) = kodaV1.editionInfo(_tokenId);

    // Stage 2:

    // build up new properties for minting?
    // TODO what to set this to?
    uint256 _assetNumber = 0;

    uint32 _auctionStartDate = _purchaseFromTime;
    uint32 _auctionEndDate = 0;
    uint8 _available = convert(_editionNumber);
    bytes32 _editionNew = _editionNew;
    uint8 _editionType = convertOldToNewType(_edition);

    // TODO check not already created set for old edition
    // TODO expose mint and transfer method on V2
  }

  // Stage 3
  function takeOwnershipAndSwap(uint256 _tokenId) public {
    // check valid
    require(kodaV1.exists(_tokenId));

    // Check this contract can move asset
    require(kodaV1.getApproved(_tokenId) == address(this));

    // Transfer to achieve address
    kodaV1.transferFrom(kodaV1.ownerOf(_tokenId), knownOriginArchiveAddress, _tokenId);
  }

  function convertOldToNewType(bytes16 _edition) internal returns (uint8) {
    string memory typeForEdition = kodaV1.getTypeFromEdition(_edition);

    uint8 _editionType;

    // Match old types to new ones
    if (Strings.compare(typeForEdition, "DIG") || Strings.compare(typeForEdition, "001") || Strings.compare(typeForEdition, "D01")) {
      _editionType = 1;
    } else if (Strings.compare(typeForEdition, "PHY")) {
      _editionType = 2;
    }

    // Fail on miss match?
    require(_editionType != 0);

    return _editionType;
  }

  function convert(uint256 _a) returns (uint8)
  {
    return uint8(_a);
  }

}
