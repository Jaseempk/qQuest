import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

const DOMAIN_NAME = "QQuest";
const DOMAIN_VERSION = "1.11";
const CHAIN_ID = 84532; // Replace with your chain ID
const CONTRACT_ADDRESS = "0x54CDf5787f7b5B585687Fe83cD1A460fe5b94c7f"; // Replace with your contract address
const ALLY_TOKEN_ID = "65108108121";

export async function POST(request: NextRequest) {
  const { userAddress } = await request.json();

  if (!userAddress || typeof userAddress !== "string") {
    return NextResponse.json({ error: "Invalid userAddress" }, { status: 400 });
  }

  // Create a wallet instance (replace with your actual private key management)
  const privateKey = process.env.SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { error: "Signer private key not configured" },
      { status: 500 }
    );
  }
  const wallet = new ethers.Wallet(privateKey);

  // Define the domain separator
  const domain = {
    name: DOMAIN_NAME,
    version: DOMAIN_VERSION,
    chainId: CHAIN_ID,
    verifyingContract: CONTRACT_ADDRESS,
  };

  // Define the types
  const types = {
    MintRequest: [
      { name: "userAddress", type: "address" },
      { name: "newTokenId", type: "uint256" },
    ],
  };

  // Create the data object
  const data = {
    userAddress: userAddress,
    newTokenId: ALLY_TOKEN_ID, // Assuming ALLY_TOKEN_ID is 1
  };

  try {
    // Sign the typed data
    const signature = await wallet.signTypedData(domain, types, data);

    // Return the signature
    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error signing data:", error);
    return NextResponse.json(
      { error: "Failed to create signature" },
      { status: 500 }
    );
  }
}
