// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductNFT is ERC721URIStorage, Ownable {

    struct Product {
        uint256 tokenId;
        string name;
        string category;
        address seller;
        bool active;
    }

    uint256 private _tokenIdCounter;
    address public marketplaceAddress;
    mapping(address => bool) public approvedSellers;
    mapping(uint256 => Product) public products;
    mapping(string => uint256[]) private _categoryProducts;

    event SellerApproved(address indexed seller);
    event SellerRevoked(address indexed seller);
    event ProductMinted(
        uint256 indexed tokenId,
        address indexed seller,
        string name,
        string category,
        string tokenURI
    );

    event ProductDeactivated(uint256 indexed tokenId);
    event productReactivated(uint256 indexed tokenId);

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || approvedSellers[msg.sender],
            "ProductNFT: not admin or approved seller"
        );
        _;
    }

    constructor() ERC721("Marketplace Product", "MPROD") Ownable(msg.sender) {}

    function approvedSeller(address seller) external onlyOwner {
        require(seller != address(0), "ProductNFT: invalid address");
        approvedSellers[seller] = true;
        emit SellerApproved(seller);
    }

    function revokeSeller(address seller) external onlyOwner {
        approvedSellers[seller] = false;
        emit SellerRevoked(seller);
    }

    function setMarketplaceAddress(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "ProductNFT: invalid address");
        marketplaceAddress = _marketplace;
    }

    function mintProduct(
        string calldata name_,
        string calldata category_,
        string calldata tokenURI_
    ) external onlyAuthorized returns (uint256) {
        require (bytes(name_).length > 0, "ProductNFT: empty name");
        require (bytes(category_).length > 0, "ProductNFT: empty category");
        require (bytes(tokenURI_).length > 0, "ProductNFT: empty token URI");

        _tokenIdCounter += 1;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        products[tokenId] = Product({
            tokenId: tokenId,
            name: name_,
            category: category_,
            seller: msg.sender,
            active: true
        });

        _categoryProducts[category_].push(tokenId);

        if (marketplaceAddress != address(0)) {
            setApprovalForAll(marketplaceAddress, true);
        }

        emit ProductMinted(tokenId, msg.sender, name_, category_, tokenURI_);
        return tokenId;
    }

    function deactivateProduct(uint256 tokenId) external onlyOwner {
        require(products[tokenId].tokenId == tokenId,"ProductNFT: unknown token");
        products[tokenId].active = false;
        emit ProductDeactivated(tokenId);
    }

    function reactivateProduct(uint256 tokenId) external onlyOwner {
        require(products[tokenId].tokenId == tokenId,"ProductNFT: unknown token");
        products[tokenId].active = true;
        emit productReactivated(tokenId);
    }

    function getProduct(uint256 tokenId) external view returns (Product memory) {
        require(products[tokenId].tokenId == tokenId, "ProductNFT: unknown token");
        return products[tokenId];
    }

    function getProductsByCategory(string calldata category_)
        external
        view
        returns (uint256[] memory)
    {
        return _categoryProducts[category_];
    }

    function totalProducts() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function getAllProducts() external view returns (Product[] memory) {
        uint256 total = _tokenIdCounter;
        Product[] memory all = new Product[](total);
        for (uint256 i = 1; i <= total; i++) {
            all[i - 1] = products[i];
        }
        return all;
    }

    function getActiveProducts() external view returns (Product[] memory) {
        uint256 total = _tokenIdCounter;
        uint256 count;
        for (uint256 i = 1; i <= total; i++) {
            if (products[i].active) count++;
        }
        Product[] memory active = new Product[](count);
        uint256 idx;
        for (uint256 i = 1; i <= total; i++) {
            if (products[i].active) {
                active[idx] = products[i];
                idx++;
            }
        }
        return active;
    }
}

