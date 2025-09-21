import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export async function payWithMetaMask(amountEth) {
  const { signer } = await connectWallet();

  const tx = await signer.sendTransaction({
    to: "0xYourReceiverWalletAddressHere", // your company/project wallet
    value: ethers.parseEther(amountEth.toString()),
  });

  const receipt = await tx.wait(); // wait for confirmation
  return receipt;
}
