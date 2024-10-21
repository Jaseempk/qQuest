// pages/api/generateSignature.js
import { ethers } from 'ethers';

const DOMAIN_NAME = 'QQuest';
const DOMAIN_VERSION = '1.11';
const CHAIN_ID = 84532; // Replace with your chain ID
const CONTRACT_ADDRESS = '0x54CDf5787f7b5B585687Fe83cD1A460fe5b94c7f'; // Replace with your contract address
const ALLY_TOKEN_ID = "65108108121"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userAddress } = req.body;

        // Create a wallet instance (replace with your actual private key management)
        const privateKey = process.env.SIGNER_PRIVATE_KEY;
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
                { name: 'userAddress', type: 'address' },
                { name: 'newTokenId', type: 'uint256' },
            ],
        };

        // Create the data object
        const data = {
            userAddress: userAddress,
            newTokenId: ALLY_TOKEN_ID,
        };

        try {
            // Sign the typed data
            const signature = await wallet._signTypedData(domain, types, data);

            // Return the signature
            res.status(200).json({ signature });
        } catch (error) {
            console.error('Error signing data:', error);
            res.status(500).json({ error: 'Failed to create signature' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}