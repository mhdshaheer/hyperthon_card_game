import { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/ethers'


export default function Leaderboard(){
const [rows, setRows] = useState([])


useEffect(()=>{
async function load(){
try{
const data = await getLeaderboard(20)
setRows(data)
}catch(e){
console.error(e)
}
}
load()
},[])


return (
<div className="leaderboard card">
<h2>🏆 Leaderboard</h2>
<table>
<thead><tr><th>#</th><th>Player</th><th>Time</th><th>Moves</th></tr></thead>
<tbody>
{rows.length===0 ? (<tr><td colSpan="4">No scores yet</td></tr>) : (
rows.map((r,i)=> (
<tr key={i}><td>{i+1}</td><td>{r.player.slice(0,6)+ '...' + r.player.slice(-4)}</td><td>{(r.time/1000).toFixed(2)}s</td><td>{r.moves}</td></tr>
))
)}
</tbody>
</table>
</div>
)
}