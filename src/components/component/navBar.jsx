import { useEffect, useState } from 'react'
import { connectWallet } from '../utils/ethers'


export default function Navbar({ address, setAddress }) {
const [short, setShort] = useState('')


useEffect(() => {
if (address) setShort(address.slice(0,6) + '...' + address.slice(-4))
}, [address])


async function handleConnect(){
try{
const addr = await connectWallet()
setAddress(addr)
}catch(e){
alert('Wallet connection failed: ' + (e?.message || e))
}
}


return (
<header className="nav">
<div className="nav-left">
<div className="logo">Memory</div>
</div>
<div className="nav-right">
{address ? (
<div className="addr">{short}</div>
) : (
<button className="btn" onClick={handleConnect}>Connect Wallet</button>
)}
</div>
</header>
)
}