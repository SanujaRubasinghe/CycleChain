// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BikeOwnershipNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("BikeOwnershipNFT", "BIKE") Ownable(msg.sender) {
        nextTokenId = 0;
    }

    function issueBikeNFT(address to, string memory tokenURI) external onlyOwner {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        nextTokenId++;
    }
}
