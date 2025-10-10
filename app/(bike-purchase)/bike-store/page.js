import MintButton from "@/components/nft/MintButton";

export default function BikeStorePage() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const metadataCID = "QmPZbxMa9WjsXQmueGpUb4eodHJWv3jy8j6e1Qi1ecPA5Q";

  return (
    <div>
      <h1>Bike Store Page</h1>
      <MintButton contractAddress={contractAddress} metadataCID={metadataCID} />
    </div>
  );
}
