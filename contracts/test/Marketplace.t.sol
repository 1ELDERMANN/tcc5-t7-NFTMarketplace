// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "forge-std/Test.sol";
import "../src/Marketplace.sol";
import "../src/ProductNFT.sol";

contract MarketplaceTest is Test {

    ProductNFT internal nft;
    Marketplace internal market;

    address internal admin = makeAddr("admin");
    address internal sellerA = makeAddr("sellerA");
    address internal sellerB = makeAddr("sellerB");
    address internal buyer = makeAddr("buyer");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant PRICE   = 0.1 ether;
    uint256 internal constant PLATFORM_FEE = 0.001 ether;
    uint256 internal constant QTY =10;

     function setUp() public {
        vm.startPrank(admin);
        nft    = new ProductNFT();
        market = new Marketplace(address(nft));
        nft.setMarketplaceAddress(address(market));
        nft.approveSeller(sellerA);
        nft.approveSeller(sellerB);
        vm.stopPrank();

        vm.deal(buyer,   10 ether);
        vm.deal(sellerA, 5 ether);
        vm.deal(sellerB, 5 ether);
    }

    function _mintProduct() internal returns (uint256 tokenId) {
        vm.prank(sellerA);
        tokenId = nft.mintProduct("Widget Pro", "Electronics", "ipfs://QmProduct");
    }

    function _mintAndList() internal returns (uint256 tokenId, uint256 listingId) {
        tokenId = _mintProduct();
        vm.prank(sellerA);
        listingId = market.listProduct(tokenId, PRICE, QTY);
    }

    function _buildReceiptHash(
        uint256 orderId,
        address _buyer,
        uint256 tokenId,
        uint256 listingId,
        uint256 totalPrice,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            orderId, _buyer, tokenId, listingId, totalPrice, timestamp
        ));
    }

    function testApproveSeller_SetsFlag() public {
        address newSeller = makeAddr("new");
        vm.prank(admin);
        nft.approveSeller(newSeller);
        assertTrue(nft.approvedSellers(newSeller));
    }

    function testRevokeSeller_ClearsFlag() public {
        vm.prank(admin);
        nft.revokeSeller(sellerA);
        assertFalse(nft.approvedSellers(sellerA));
    }

    function testApproveSeller_RevertsNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert();
        nft.approveSeller(stranger);
    }

    function testMint_AssignsOwner() public {
        uint256 id = _mintProduct();
        assertEq(nft.ownerOf(id), sellerA);
    }

    function testMint_StoresTokenURI() public {
        uint256 id = _mintProduct();
        assertEq(nft.tokenURI(id), "ipfs://QmProduct");
    }

    function testMint_IncrementsTotalSupply() public {
        _mintProduct();
        vm.prank(sellerA);
        nft.mintProduct("Widget Lite", "Electronics", "ipfs://QmLite");
        assertEq(nft.totalProducts(), 2);
    }

    function testMint_ApprovesMarketplace() public {
        _mintProduct();
        assertTrue(nft.isApprovedForAll(sellerA, address(market)));
    }

    function testMint_RevertsStranger() public {
        vm.prank(stranger);
        vm.expectRevert("ProductNFT: not admin or approved seller");
        nft.mintProduct("X", "Y", "ipfs://Z");
    }

    function testMint_RevertsEmptyName() public {
        vm.prank(sellerA);
        vm.expectRevert("ProductNFT: empty name");
        nft.mintProduct("", "Electronics", "ipfs://QmX");
    }

    function testMint_AdminCanAlsoMint() public {
        vm.prank(admin);
        uint256 id = nft.mintProduct("Admin Item", "Tools", "ipfs://QmAdmin");
        assertEq(nft.getProduct(id).seller, admin);
    }

    function testDeactivateProduct_OnlyAdmin() public {
        uint256 id = _mintProduct();
        vm.prank(admin);
        nft.deactivateProduct(id);
        assertFalse(nft.getProduct(id).active);
    }

    function testDeactivateProduct_RevertsNonAdmin() public {
        uint256 id = _mintProduct();
        vm.prank(sellerA);
        vm.expectRevert();
        nft.deactivateProduct(id);
    }

    function testListProduct_CreatesListing() public {
        (, uint256 listingId) = _mintAndList();
        Marketplace.Listing memory l = market.getListing(listingId);
        assertEq(l.tokenId, 1);
        assertEq(l.seller,  sellerA);
        assertEq(l.price,   PRICE);
        assertEq(l.quantity, QTY);
        assertTrue(l.active);
    }

    function testListProduct_RevertsInactiveProduct() public {
        uint256 id = _mintProduct();
        vm.prank(admin);
        nft.deactivateProduct(id);
        vm.prank(sellerA);
        vm.expectRevert("Marketplace: product is not active");
        market.listProduct(id, PRICE, QTY);
    }

    function testListProduct_RevertsStranger() public {
        uint256 id = _mintProduct();
        vm.prank(stranger);
        vm.expectRevert("Marketplace: not admin or approved seller");
        market.listProduct(id, PRICE, QTY);
    }

    function testListProduct_RevertsZeroPrice() public {
        uint256 id = _mintProduct();
        vm.prank(sellerA);
        vm.expectRevert("Marketplace: price must be > 0");
        market.listProduct(id, 0, QTY);
    }

    function testUpdateListing_ChangesValues() public {
        (, uint256 listingId) = _mintAndList();
        vm.prank(sellerA);
        market.updateListing(listingId, 0.2 ether, 5);
        Marketplace.Listing memory l = market.getListing(listingId);
        assertEq(l.price,    0.2 ether);
        assertEq(l.quantity, 5);
    }

    function testCompareListings_ReturnsSortedByPrice() public {
        uint256 tokenId = _mintProduct();

        vm.prank(sellerA);
        market.listProduct(tokenId, 0.3 ether, 5);

        vm.prank(sellerB);
        market.listProduct(tokenId, 0.1 ether, 5);

        vm.prank(admin);
        market.listProduct(tokenId, 0.2 ether, 5);

        Marketplace.Listing[] memory sorted = market.compareListings(tokenId);
        assertEq(sorted.length,   3);
        assertEq(sorted[0].price, 0.1 ether);
        assertEq(sorted[1].price, 0.2 ether);
        assertEq(sorted[2].price, 0.3 ether);
    }

    function testCompareListings_ExcludesInactive() public {
        uint256 tokenId = _mintProduct();
        vm.prank(sellerA);
        uint256 l1 = market.listProduct(tokenId, 0.1 ether, 5);
        vm.prank(sellerB);
        market.listProduct(tokenId, 0.2 ether, 5);
        vm.prank(sellerA);
        market.deactivateListing(l1);
        Marketplace.Listing[] memory active = market.compareListings(tokenId);
        assertEq(active.length, 1);
        assertEq(active[0].price, 0.2 ether);
    }

    function testPlaceOrder_Succeeds() public {
        (uint256 tokenId, uint256 listingId) = _mintAndList();
        uint256 totalPrice = PRICE;
        bytes32 hash = _buildReceiptHash(
            1, buyer, tokenId, listingId, totalPrice, block.timestamp
        );
        vm.prank(buyer);
        market.placeOrder{value: totalPrice + PLATFORM_FEE}(
            listingId, 1, hash, "ipfs://QmReceipt1"
        );
        Marketplace.Order memory o = market.getOrder(1);
        assertEq(o.buyer,       buyer);
        assertEq(o.seller,      sellerA);
        assertEq(o.receiptURI,  "ipfs://QmReceipt1");
        assertEq(o.receiptHash, hash);
    }

    function testPlaceOrder_RevertsWrongValue() public {
        (, uint256 listingId) = _mintAndList();
        bytes32 hash = bytes32(uint256(1));
        vm.prank(buyer);
        vm.expectRevert("Marketplace: wrong ETH (price * qty + platformFee)");
        market.placeOrder{value: PRICE}(listingId, 1, hash, "ipfs://QmR");
    }

    function testPlaceOrder_RevertsSellerSelfOrder() public {
        (, uint256 listingId) = _mintAndList();
        bytes32 hash = bytes32(uint256(1));
        vm.prank(sellerA);
        vm.expectRevert("Marketplace: seller cannot self-order");
        market.placeOrder{value: PRICE + PLATFORM_FEE}(listingId, 1, hash, "ipfs://QmR");
    }

    function testPlaceOrder_RevertsExceedsStock() public {
        (, uint256 listingId) = _mintAndList();
        bytes32 hash = bytes32(uint256(1));
        vm.prank(buyer);
        vm.expectRevert("Marketplace: insufficient stock");
        market.placeOrder{value: PRICE * (QTY + 1) + PLATFORM_FEE}(
            listingId, QTY + 1, hash, "ipfs://QmR"
        );
    }

    function testVerifyReceipt_ValidHash() public {
        (uint256 tokenId, uint256 listingId) = _mintAndList();
        bytes32 hash = _buildReceiptHash(
            1, buyer, tokenId, listingId, PRICE, block.timestamp
        );
        vm.prank(buyer);
        market.placeOrder{value: PRICE + PLATFORM_FEE}(
            listingId, 1, hash, "ipfs://QmR"
        );
        (bool valid, uint256 orderId) = market.verifyReceipt(hash);
        assertTrue(valid);
        assertEq(orderId, 1);
    }

    function testVerifyReceipt_InvalidHash() public {
        (bool valid, uint256 orderId) = market.verifyReceipt(bytes32(uint256(999)));
        assertFalse(valid);
        assertEq(orderId, 0);
    }

    function testWithdrawFees_CollectsPlatformFees() public {
        (, uint256 listingId) = _mintAndList();
        bytes32 hash = _buildReceiptHash(
            1, buyer, 1, listingId, PRICE, block.timestamp
        );
        vm.prank(buyer);
        market.placeOrder{value: PRICE + PLATFORM_FEE}(
            listingId, 1, hash, "ipfs://QmR"
        );
        vm.prank(admin);
        uint256 adminBefore = admin.balance;
        market.withdrawFees();
        assertGt(admin.balance, adminBefore);
    }

    function testWithdrawFees_RevertsNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert();
        market.withdrawFees();
    }

    function testFuzz_ListAnyValidPrice(uint256 price) public {
        vm.assume(price > 0 && price < 100 ether);
        uint256 tokenId = _mintProduct();
        vm.prank(sellerA);
        uint256 listingId = market.listProduct(tokenId, price, 1);
        Marketplace.Listing memory l = market.getListing(listingId);
        assertEq(l.price, price);
    }
}