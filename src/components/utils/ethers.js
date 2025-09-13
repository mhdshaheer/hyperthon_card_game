import { ethers } from 'ethers'
"function getRecentScores(uint256 limit) view public returns (tuple(address player, uint256 timeTaken, uint256 moves, uint256 timestamp)[])",
]


export async function connectWallet(){
if (!window.ethereum) throw new Error('MetaMask not found')
const provider = new ethers.BrowserProvider(window.ethereum)
await provider.send('eth_requestAccounts', [])
const signer = await provider.getSigner()
return await signer.getAddress()
}


export async function submitScore(timeMs, moves){
if (!window.ethereum) throw new Error('MetaMask not found')
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
const contract = new ethers.Contract(CONTRACT_ADDRESS, MemoryGameABI, signer)
const tx = await contract.submitScore(timeMs, moves)
await tx.wait()
return tx
}


export async function getLeaderboard(limit=20){
if (!window.ethereum) return []
const provider = new ethers.BrowserProvider(window.ethereum)
const contract = new ethers.Contract(CONTRACT_ADDRESS, MemoryGameABI, provider)
try{
const raw = await contract.getRecentScores(limit)
// raw is array of tuples: [player, timeTaken, moves, timestamp]
return raw.map(r=>({ player: String(r.player), time: Number(r.timeTaken), moves: Number(r.moves), timestamp: Number(r.timestamp) }))
}catch(e){
console.error('getLeaderboard error', e)
return []
}
}