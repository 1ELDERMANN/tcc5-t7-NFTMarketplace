// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProductNFT.sol";

contract Marketplace is ReentrancyGuard, Ownable {

    enum OrderStatus {Confirmed, Refunded, Disputed}

    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        uint256 quantity;
        bool active;
    }

    struct Order {
        uint256 orderId;
        uint256 listingId;
        uint256 tokenId;
        address buyer;
        address seller;
        uint256 price;
        uint256 quantity;
        uint256 timestamp;
        bytes32 receiptHash;
        string receiptURI;
        OrderStatus status;
    }

    ProductNFT public productNFT;

    uint256 public platformFee = 0.001 ether;
    bool public paused;

    uint256 private _listingIdCounter;
    uint256 private _orderIdCounter;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => uint256[]) private _productListings;
    mapping(address => uint256[]) private _buyerOrders;
    mapping(address => uint256[]) private _sellerListings;
    mapping(bytes32 => uint256) public receiptHashToOrder;

    event ProductListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 quantity
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice,
        uint256 newQuantity
    );

    event ListingDeactivated(uint256 indexed listingId);

    event OrderPlaced(
        uint256 indexed orderId,
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 price,
        uint256 quantity,
        bytes32 receiptHash,
        string  receiptURI
    );

    event OrderRefunded(uint256 indexed orderId, address buyer, uint256 amount);
    event OrderDisputed(uint256 indexed orderId, address buyer);
    event Paused(bool isPaused);
    event PlatformFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address owner, uint256 amount);

    modifier whenNotPaused() {
        require(!paused, "Marketplace: paused");
        _;
    }

    modifier onlyAuthorizedSeller() {
        require(
            msg.sender == owner() || productNFT.approvedSellers(msg.sender),
            "Marketplace: not admin or approved seller"
        );
        _;
    }

    constructor(address _productNFT) Ownable(msg.sender) {
        require(_productNFT != address(0), "Marketplace: zero address");
        productNFT = ProductNFT(_productNFT);
    }

    function listProduct(
        uint256 tokenId,
        uint256 price,
        uint256 quantity
    ) external onlyAuthorizedSeller whenNotPaused returns (uint256) {
        require(price    > 0, "Marketplace: price must be > 0");
        require(quantity > 0, "Marketplace: quantity must be > 0");

        ProductNFT.Product memory product = productNFT.getProduct(tokenId);
        require(product.active, "Marketplace: product is not active");

        _listingIdCounter += 1;
        uint256 listingId = _listingIdCounter;

        listings[listingId] = Listing({
            listingId: listingId,
            tokenId:   tokenId,
            seller:    payable(msg.sender),
            price:     price,
            quantity:  quantity,
            active:    true
        });

        _productListings[tokenId].push(listingId);
        _sellerListings[msg.sender].push(listingId);

        emit ProductListed(listingId, tokenId, msg.sender, price, quantity);
        return listingId;
    }

    function updateListing(
        uint256 listingId,
        uint256 newPrice,
        uint256 newQuantity
    ) external whenNotPaused {
        Listing storage l = listings[listingId];
        require(l.seller == msg.sender, "Marketplace: not listing seller");
        require(l.active,               "Marketplace: listing not active");
        require(newPrice    > 0,        "Marketplace: price must be > 0");
        require(newQuantity > 0,        "Marketplace: quantity must be > 0");

        l.price    = newPrice;
        l.quantity = newQuantity;

        emit ListingUpdated(listingId, newPrice, newQuantity);
    }

    function deactivateListing(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(
            l.seller == msg.sender || msg.sender == owner(),
            "Marketplace: not seller or admin"
        );
        l.active = false;
        emit ListingDeactivated(listingId);
    }
    
    function placeOrder(
        uint256 listingId,
        uint256 quantity,
        bytes32 receiptHash,
        string  calldata receiptURI
    ) external payable nonReentrant whenNotPaused {
        Listing storage l = listings[listingId];

        require(l.active,                     "Marketplace: listing not active");
        require(quantity > 0,                 "Marketplace: quantity must be > 0");
        require(quantity <= l.quantity,       "Marketplace: insufficient stock");
        require(msg.sender != l.seller,       "Marketplace: seller cannot self-order");
        require(receiptHash != bytes32(0),    "Marketplace: empty receipt hash");
        require(bytes(receiptURI).length > 0, "Marketplace: empty receipt URI");
        require(
            receiptHashToOrder[receiptHash] == 0,
            "Marketplace: duplicate receipt hash"
        );

        uint256 totalPrice = l.price * quantity;
        require(
            msg.value == totalPrice + platformFee,
            "Marketplace: wrong ETH (price * qty + platformFee)"
        );

        l.quantity -= quantity;
        if (l.quantity == 0) l.active = false;

        _orderIdCounter += 1;
        uint256 orderId = _orderIdCounter;

        orders[orderId] = Order({
            orderId:     orderId,
            listingId:   listingId,
            tokenId:     l.tokenId,
            buyer:       msg.sender,
            seller:      l.seller,
            price:       totalPrice,
            quantity:    quantity,
            timestamp:   block.timestamp,
            receiptHash: receiptHash,
            receiptURI:  receiptURI,
            status:      OrderStatus.Confirmed
        });

        _buyerOrders[msg.sender].push(orderId);
        receiptHashToOrder[receiptHash] = orderId;


        emit OrderPlaced(
            orderId,
            listingId,
            l.tokenId,
            msg.sender,
            l.seller,
            totalPrice,
            quantity,
            receiptHash,
            receiptURI
        );
    }

    function refundOrder(uint256 orderId) external onlyOwner nonReentrant {
        Order storage o = orders[orderId];
        require(o.orderId == orderId,              "Marketplace: unknown order");
        require(o.status == OrderStatus.Confirmed, "Marketplace: not refundable");

        o.status = OrderStatus.Refunded;
        (bool sent, ) = payable(o.buyer).call{value: o.price}("");
        require(sent, "Marketplace: ETH transfer failed");
        emit OrderRefunded(orderId, o.buyer, o.price);
    }

    function disputeOrder(uint256 orderId) external onlyOwner {
        Order storage o = orders[orderId];
        require(o.orderId == orderId,              "Marketplace: unknown order");
        require(o.status == OrderStatus.Confirmed, "Marketplace: not disputable");
        o.status = OrderStatus.Disputed;
        emit OrderDisputed(orderId, o.buyer);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "Marketplace: nothing to withdraw");
        (bool sent, ) = payable(owner()).call{value: bal}("");
        require(sent, "Marketplace: ETH transfer failed");
        emit FeesWithdrawn(owner(), bal);
    }

    function compareListings(uint256 tokenId)
        external
        view
        returns (Listing[] memory activeListings)
    {
        uint256[] storage ids = _productListings[tokenId];
        uint256 count;
        for (uint256 i; i < ids.length; i++) {
            if (listings[ids[i]].active) count++;
        }

        activeListings = new Listing[](count);
        uint256 idx;
        for (uint256 i; i < ids.length; i++) {
            if (listings[ids[i]].active) {
                activeListings[idx] = listings[ids[i]];
                idx++;
            }
        }

        for (uint256 i; i < count; i++) {
            for (uint256 j; j < count - 1 - i; j++) {
                if (activeListings[j].price > activeListings[j + 1].price) {
                    Listing memory tmp        = activeListings[j];
                    activeListings[j]         = activeListings[j + 1];
                    activeListings[j + 1]     = tmp;
                }
            }
        }
    }

    function verifyReceipt(bytes32 receiptHash)
        external
        view
        returns (bool valid, uint256 orderId)
    {
        orderId = receiptHashToOrder[receiptHash];
        valid   = orderId != 0 && orders[orderId].status == OrderStatus.Confirmed;
    }

    function getReceiptURI(uint256 orderId) external view returns (string memory) {
        require(orders[orderId].orderId == orderId, "Marketplace: unknown order");
        return orders[orderId].receiptURI;
    }

    function getBuyerOrders(address buyer) external view returns (Order[] memory) {
        uint256[] storage ids = _buyerOrders[buyer];
        Order[] memory result = new Order[](ids.length);
        for (uint256 i; i < ids.length; i++) {
            result[i] = orders[ids[i]];
        }
        return result;
    }

    function getSellerListings(address seller) external view returns (Listing[] memory) {
        uint256[] storage ids = _sellerListings[seller];
        Listing[] memory result = new Listing[](ids.length);
        for (uint256 i; i < ids.length; i++) {
            result[i] = listings[ids[i]];
        }
        return result;
    }

    function getAllActiveListings() external view returns (Listing[] memory) {
        uint256 total = _listingIdCounter;
        uint256 count;
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active) count++;
        }
        Listing[] memory result = new Listing[](count);
        uint256 idx;
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active) {
                result[idx] = listings[i];
                idx++;
            }
        }
        return result;
    }

    function totalOrders() external view returns (uint256) {
        return _orderIdCounter;
    }

    function totalListings() external view returns (uint256) {
        return _listingIdCounter;
    }
}