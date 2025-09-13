import { useEffect, useRef, useState } from 'react'
const row = Math.floor(y / cardSize)
return cards.find(c => c.row===row && c.col===col)



function handleCanvasClick(e){
if (!running) return
const rect = canvasRef.current.getBoundingClientRect()
const x = e.clientX - rect.left
const y = e.clientY - rect.top
const card = getCardAt(x,y)
if (!card || card.flipped || card.matched) return
// flip
const copy = cards.slice()
const idx = copy.indexOf(card)
copy[idx] = {...card, flipped:true}
setCards(copy)
const newFlipped = [...flipped, copy[idx]]
setFlipped(newFlipped)
if (newFlipped.length === 2){
setMoves(prev=>prev+1)
setTimeout(()=> checkMatch(newFlipped), 700)
}
}


function checkMatch(pair){
const [a,b] = pair
const copy = cards.slice()
if (a.value === b.value){
// set matched
copy.forEach(c=>{ if (c.row===a.row && c.col===a.col) c.matched = true; if (c.row===b.row && c.col===b.col) c.matched = true })
setCards(copy)
setMatchedCount(prev=>prev+2)
if (matchedCount + 2 === rows*cols){
// finished
stopTimer(); setRunning(false)
setTimeout(()=> alert(`Finished! Time: ${elapsed}s Moves: ${moves+1}`), 100)
}
} else {
// flip back
copy.forEach(c=>{ if (c.row===a.row && c.col===a.col) c.flipped = false; if (c.row===b.row && c.col===b.col) c.flipped = false })
setCards(copy)
}
setFlipped([])
}


return (
<div className="canvas-wrap">
<canvas ref={canvasRef} width={cols*cardSize} height={rows*cardSize} onClick={handleCanvasClick} style={{borderRadius:12, border:'2px solid #ddd'}} />
<div className="mobile-controls">
<button className="btn" onClick={startGame}>Start</button>
<button className="btn ghost" onClick={resetGame}>Reset</button>
</div>
<style jsx>{`
.canvas-wrap { display:flex; flex-direction:column; gap:12px; align-items:center }
.mobile-controls{ display:none }
@media(max-width:900px){ .mobile-controls{ display:flex; gap:8px } }
`}</style>
</div>
)
