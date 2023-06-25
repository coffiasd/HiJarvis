// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

/**
 * @title SwapERC20 Contract
 * @notice Swap any supported ERC20 for another
 * @author HorizenLabs
 */
contract SwapERC20 is Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    /// @notice Allowed state of a swap instance
    enum State {
        BEGUN,
        FINISHED,
        CANCELLED
    }

    /// @notice A swap instance
    struct Instance {
        uint256 id;
        address initiator;
        address initiatorERC20;
        uint256 initiatorAmount;
        address counterPartyERC20;
        uint256 counterPartyAmount;
        uint256 raito;
        State state; //order state enum.
    }

    /// @notice Raito information about swap tokens.
    struct Raito {
        uint256 maxRaito;
        uint256 minRaito;
    }

    /// @notice Global counter used to id each swap instance
    Counters.Counter private instanceId;

    /// @dev The mapping that makes up the core orderbook of the exchange
    Instance[] public instances;

    /// @dev Mapping makes up exchange raito.
    mapping(address => mapping(address => Raito)) RaitoIndex;

    /// @dev Mapping makes up current user orderBook.
    mapping(address => Instance[]) private userOrder;

    /// @notice Map of all supported ERC20 tokens
    mapping(IERC20 => bool) public supportedErc20s;
    IERC20[] public erc20s;

    /// @notice Addresses of ERC20 tokens that won't need the owner fee
    mapping(IERC20 => bool) public noOwnerFeeERC20s;
    /// @notice Address that will receive the owner fee
    address public ownerFeeAddress;
    /// @notice Amount in permille (i.e. 12 -> 12/1000 -> 1.2%) of the owner fee
    uint256 public ownerFeePermille = 12;

    uint256 immutable baseRaito = 1_000_000;

    // event Begun(uint256 indexed id, address indexed initiator, address indexed counterParty);
    // event Offer(uint256 indexed id, address indexed initiator,uint256 initiatorAmount,address indexed );
    event Cancelled(uint256 indexed id);
    event Finished(uint256 indexed id);
    event NoOwnerFeeERC20Changed(IERC20 indexed _token, bool indexed _newValue);
    event OwnerFeeAddressChanged(address indexed _address);
    event OwnerFeePermilleChanged(uint256 indexed _feePermille);
    event Pop(uint256 id);

    //offer event.
    event OfferEvent(
        uint256 indexed id,
        address indexed initiator, //msg.sender
        address initiatorERC20, //from token
        uint256 initiatorAmount, //from amount
        address counterParty, //to token
        uint256 counterPartyAmount //to amount
    );

    //buy event.
    event BuyEvent(
        uint256 indexed id,
        address indexed buyer,
        address indexed initiator, //msg.sender
        address initiatorERC20, //from token
        uint256 initiatorAmount, //from amount
        address counterParty, //to token
        uint256 counterPartyAmount //to amount
    );

    error InvalidAddress();
    error InvalidAmount();
    error InsufficientFee();
    error InvalidState();
    error Unauthorized();
    error UnsupportedERC20();
    error TransferError();

    /**
     * @notice Construct a new Swap contract
     * @param _usdcAddr The default supported ERC20 is usdc
     * @param _ownerFeeAddress Address that will receive owner fee
     * @param _ownerFeePermille Fee permille millis that will be received by owner. i.e. 12 -> 12/1000 -> 1.2%
     */
    constructor(
        address _usdcAddr,
        address _wethAddr,
        address _ownerFeeAddress,
        uint256 _ownerFeePermille
    ) {
        if (_ownerFeeAddress == address(0)) revert InvalidAddress();

        erc20s.push(IERC20(_usdcAddr));
        erc20s.push(IERC20(_wethAddr));
        supportedErc20s[IERC20(_usdcAddr)] = true;
        supportedErc20s[IERC20(_wethAddr)] = true;
        ownerFeeAddress = _ownerFeeAddress;
        ownerFeePermille = _ownerFeePermille;
    }

    /**
     * @notice Begin an ERC20 swap between two parties
     * @param initiatorERC20 ERC20 contract address for the initiator
     * @param initiatorAmount Amount of ERC20 tokens the initiator is depositing
     * @param counterPartyERC20 ERC20 contract address for the counterParty
     * @param counterPartyAmount Amount of ERC20 tokens the counterParty is depositing
     */
    function offer(
        address initiatorERC20,
        uint256 initiatorAmount,
        address counterPartyERC20,
        uint256 counterPartyAmount
    ) external payable whenNotPaused {
        if (initiatorAmount == 0 || counterPartyAmount == 0)
            revert InvalidAmount();
        if (!supportedErc20s[IERC20(initiatorERC20)]) revert UnsupportedERC20();
        if (!supportedErc20s[IERC20(counterPartyERC20)])
            revert UnsupportedERC20();

        // Transfer initiator's ERC20 tokens to contract.
        IERC20 erc20 = IERC20(initiatorERC20);
        if (!erc20.transferFrom(msg.sender, address(this), initiatorAmount)) {
            revert TransferError();
        }

        //caculate current offer raito
        uint256 raito = initiatorAmount.mul(baseRaito).div(counterPartyAmount);

        //instanceId++
        instanceId.increment();

        //Instance struct.
        Instance memory instance = Instance({
            id: instanceId.current(),
            initiator: msg.sender,
            initiatorERC20: initiatorERC20,
            initiatorAmount: initiatorAmount,
            counterPartyERC20: counterPartyERC20,
            counterPartyAmount: counterPartyAmount,
            raito: raito,
            state: State.BEGUN
        });

        //update orderBook list.
        instances.push(instance);

        //update user order list.
        userOrder[msg.sender].push(instance);

        //update RaitoIndex info.
        Raito storage raitoIndex = RaitoIndex[initiatorERC20][
            counterPartyERC20
        ];
        if (raitoIndex.minRaito == 0 || raitoIndex.minRaito > raito) {
            raitoIndex.minRaito = raito;
        }

        if (raitoIndex.maxRaito == 0 || raitoIndex.maxRaito < raito) {
            raitoIndex.maxRaito = raito;
        }

        //offer emit.
        emit OfferEvent(
            instanceId.current(),
            msg.sender,
            initiatorERC20,
            initiatorAmount,
            counterPartyERC20,
            counterPartyAmount
        );
    }

    /**
     * @notice user by some tokens using a max pay amount.
     * @param counterPartyERC20 counterPartyERC20
     * @param counterPartyMaxAmount counterPartyMaxAmount
     * @param initiatorERC20 initiatorERC20
     * @param expectRaito expectRaito
     */
    function buy(
        address counterPartyERC20, //token user pays.
        uint256 counterPartyMaxAmount, //max token user want to pay.
        address initiatorERC20, //token user want to buy
        uint256 expectRaito
    ) external payable whenNotPaused {
        if (counterPartyMaxAmount == 0) revert InvalidAmount();
        if (!supportedErc20s[IERC20(initiatorERC20)]) revert UnsupportedERC20();
        if (!supportedErc20s[IERC20(counterPartyERC20)])
            revert UnsupportedERC20();

        //begin pay token in contract.
        uint256 beginAmount = IERC20(counterPartyERC20).balanceOf(
            address(this)
        );

        // Transfer initiator's ERC20 tokens to contract.
        IERC20 erc20 = IERC20(counterPartyERC20);
        if (
            !erc20.transferFrom(
                msg.sender,
                address(this),
                counterPartyMaxAmount
            )
        ) {
            revert TransferError();
        }

        uint256[] memory idsToDelete = new uint256[](instances.length);
        uint256 index;

        //loop the whole initiatorInstances to get a suitable order.
        for (uint256 i = 0; i < instances.length; ) {
            Instance storage instance = instances[i];

            //if raito is suitable then make a deal.
            if (
                counterPartyMaxAmount > 0 &&
                instance.raito >= expectRaito &&
                counterPartyMaxAmount > instance.counterPartyAmount
            ) {
                //transfer token to initiatorERC20 user , the amount he expect.
                IERC20(counterPartyERC20).safeTransfer(
                    instance.initiator,
                    instance.counterPartyAmount
                );

                //reduce
                counterPartyMaxAmount -= instance.counterPartyAmount;

                //delete instances list.
                idsToDelete[index] = instance.id;

                //update instance state.
                userOrder[instance.initiator][i].state = State.FINISHED;

                unchecked {
                    ++index;
                }
                //emit transfer info.

                emit BuyEvent(
                    instance.id,
                    msg.sender,
                    instance.initiator,
                    instance.initiatorERC20,
                    instance.initiatorAmount,
                    instance.counterPartyERC20,
                    instance.counterPartyAmount
                );
            }

            //save more gas.
            unchecked {
                ++i;
            }
        }

        //delete deal orders.
        for (uint256 i = 0; i < idsToDelete.length; ) {
            removeInstace(idsToDelete[i]);
            unchecked {
                ++i;
            }
        }

        //after buy action maybe left some pay token
        //then we need to refund it to user.
        uint256 afterAmount = IERC20(counterPartyERC20).balanceOf(
            address(this)
        );

        //refund user pay token.
        if (afterAmount > beginAmount) {
            uint256 leftAmount = afterAmount - beginAmount;
            if (!IERC20(counterPartyERC20).transfer(msg.sender, leftAmount)) {
                revert TransferError();
            }
        }
    }

    /**
     * @notice user cancel his order and refund back his token.
     * @param id instance id from Instances
     */
    function cancel(uint256 id) external whenNotPaused {
        Instance memory i_instance;

        for (uint256 i = 0; i < instances.length; ) {
            Instance storage instance = instances[i];
            if (instance.id == id) {
                //check msg.sender.
                if (i_instance.initiator != msg.sender) revert Unauthorized();

                i_instance = instance;

                //delete instance by index.
                removeInstace(id);

                //update state.
                cancelUserOrder(msg.sender, id);

                break;
            }
            unchecked {
                ++i;
            }
        }

        // Return tokens to initiator
        IERC20 initiatorERC20 = IERC20(i_instance.initiatorERC20);

        require(
            initiatorERC20.transfer(
                i_instance.initiator,
                i_instance.initiatorAmount
            )
        );

        emit Cancelled(i_instance.id);
    }

    /**
     * @notice user cancel his order and refund back his token.
     * @param id id from Instances.id
     */
    function removeInstace(uint256 id) internal {
        for (uint256 i = 0; i < instances.length; ) {
            Instance storage instance = instances[i];
            if (instance.id == id) {
                if (instances.length > 0) {
                    instances[i] = instances[instances.length - 1];
                    instances.pop();
                }

                emit Pop(id);
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice change user order state.
     * @param user user
     * @param id id
     */
    function cancelUserOrder(address user, uint256 id) internal {
        uint256 userOrderLength = userOrder[user].length;

        for (uint256 i = 0; i < userOrderLength; i++) {
            Instance storage order = userOrder[user][i];
            if (
                order.id == id &&
                order.state == State.BEGUN &&
                order.initiator == user
            ) {
                userOrder[user][i].state = State.CANCELLED;
            }
        }
    }

    /**
     * @notice user order list with BEGUN state.
     */
    function onSellOffers() external view returns (Instance[] memory) {
        uint256 length = userOrder[msg.sender].length;

        Instance[] memory ret;
        uint256 retIndex = 0;

        for (uint256 i = 0; i < length; ) {
            Instance storage order = userOrder[msg.sender][i];
            if (order.initiator == msg.sender && order.state == State.BEGUN) {
                // ret[retIndex] = order;

                unchecked {
                    ++retIndex;
                    ++i;
                }
            }
        }

        return ret;
    }

    /**
     * @notice get a token pair raito range.
     */
    function getSwapRange(
        address initiatorERC20,
        address counterPartyERC20
    ) external view returns (uint256 min, uint256 max) {
        min = RaitoIndex[initiatorERC20][counterPartyERC20].minRaito;
        max = RaitoIndex[initiatorERC20][counterPartyERC20].maxRaito;
    }

    /// @notice Pause all swaps
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice UnPause all swaps
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Add an ERC20 to supported list
     * @param _erc20 The contract address for a valid ERC20
     */
    function addERC20Support(IERC20 _erc20) external onlyOwner whenNotPaused {
        erc20s.push(_erc20);
        supportedErc20s[_erc20] = true;
    }

    function getSupportedErc20s() public view returns (IERC20[] memory) {
        return erc20s;
    }

    /**
     * @notice Change token that doesn't need to pay owner fee
     * @param _token token
     * @param _newValue boolean (true = don't pay, false = pay)
     */
    function changeNoOwnerFeeERC20(
        IERC20 _token,
        bool _newValue
    ) external onlyOwner {
        if (_token == IERC20(address(0))) {
            revert InvalidAddress();
        }

        noOwnerFeeERC20s[_token] = _newValue;
        emit NoOwnerFeeERC20Changed(_token, _newValue);
    }

    /**
     * @notice Set owner fee receiving address
     * @param _ownerFeeAddress address
     */
    function setOwnerFeeAddress(address _ownerFeeAddress) external onlyOwner {
        if (_ownerFeeAddress == address(0)) revert InvalidAddress();
        ownerFeeAddress = _ownerFeeAddress;

        emit OwnerFeeAddressChanged(ownerFeeAddress);
    }

    /**
     * @notice Set owner fee permille receiving address
     * @param _ownerFeePermille amount (i.e. 12 -> 12/1000 -> 1.2%)
     */
    function setOwnerFeePermille(uint256 _ownerFeePermille) external onlyOwner {
        ownerFeePermille = _ownerFeePermille;

        emit OwnerFeePermilleChanged(_ownerFeePermille);
    }
}
