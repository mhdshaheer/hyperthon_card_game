import Head from 'next/head'
import Navbar from '../components/Navbar'
import GameCanvas from '../components/GameCanvas'
import Leaderboard from '../components/Leaderboard'
import { useState } from 'react'


export default function Home() {
const [providerAddress, setProviderAddress] = useState(null)


return (
<div>
<Head>
<title>Memory Card Game — Web3</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>


<Navbar address={providerAddress} setAddress={setProviderAddress} />


<main className="container">
<section className="controls">
<h1>🎴 Memory Card Game (Web3)</h1>
<p className="lead">Flip & match pairs. Connect your wallet to submit scores on-chain.</p>
</section>


<section className="game-area">
<GameCanvas />
<aside className="side-panel">
<div className="stat"><strong>Time:</strong> <span id="time">0.0s</span></div>
<div className="stat"><strong>Moves:</strong> <span id="moves">0</span></div>
<div className="buttons">
<button id="startBtn" className="btn">Start Game</button>
<button id="resetBtn" className="btn ghost">Reset</button>
<button id="finishBtn" className="btn">Finish & Submit</button>
</div>
</aside>
</section>


<section className="leaderboard-section">
<Leaderboard />
</section>


</main>
</div>
)
}