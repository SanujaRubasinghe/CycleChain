async function main() {
  const Contract = await ethers.getContractFactory("BikeOwnershipNFT");
  const nft = await Contract.deploy();
  await nft.deployed();
  console.log("BikeOwnershipNFT deployed to:", nft.address);
}
main().catch(err => { console.error(err); process.exit(1); });
