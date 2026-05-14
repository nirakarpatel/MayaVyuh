const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Update AdminDashboard signature
code = code.replace(
  'const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers}) => {',
  'const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers,winners,setWinners,addAlert}) => {'
);

// 2. Leaderboard
const lbSearch = \`<div className="card-title">LIVE RANKINGS</div>
                {[...teams].sort((a,b)=>b.score-a.score).map((team,i)=>(
                  <div key={team.id} className="leaderboard-row">
                    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:["var(--rune-gold)","#a8a8a8","#8b6533","var(--parchment-dim)"][i]??"var(--parchment-dim)",width:32,textAlign:"center"}}>{i+1}</div>
                    <div><div style={{color:"var(--text-bright)",fontFamily:"'Cinzel',serif",fontSize: 16}}>{team.name}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)",marginTop:4}}>{team.observer} & {team.creator} · Round {team.round}</div></div>
                    <div style={{marginLeft:"auto",fontFamily:"'Cinzel Decorative',serif",fontSize: 21,color:"var(--oracle-blue)"}}>{team.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}\`;
const lbReplace = \`<div className="card-title">LIVE RANKINGS</div>
                {[...teams].sort((a,b)=>b.score-a.score).map((team,i)=>(
                  <div key={team.id} className="leaderboard-row">
                    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:["var(--rune-gold)","#a8a8a8","#8b6533","var(--parchment-dim)"][i]??"var(--parchment-dim)",width:32,textAlign:"center"}}>{i+1}</div>
                    <div><div style={{color:"var(--text-bright)",fontFamily:"'Cinzel',serif",fontSize: 16}}>{team.name}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)",marginTop:4}}>{team.observer} & {team.creator} · Round {team.round}</div></div>
                    <div style={{marginLeft:"auto",fontFamily:"'Cinzel Decorative',serif",fontSize: 21,color:"var(--oracle-blue)"}}>{team.score}%</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{marginTop: 20}}>
                <div className="card-title">DECLARE WINNERS</div>
                <div style={{fontFamily: "'IM Fell English', serif", color: 'var(--parchment-dim)', fontStyle: 'italic', marginBottom: 16}}>
                  "Select the teams worthy of ultimate glory. Their vision will be broadcasted to all in the Sanctuary."
                </div>
                <button className="btn btn-gold" onClick={() => setWinners([...teams].sort((a,b)=>b.score-a.score).slice(0, 3))}>
                  🏆 DECLARE TOP 3 AS WINNERS
                </button>
                <button className="btn btn-ghost" style={{marginLeft: 12}} onClick={() => setWinners([])}>
                  RESET WINNERS
                </button>
              </div>
            </div>
          )}\`;
code = code.replace(lbSearch, lbReplace);

// 3. OraclesLockGame
const runeSearch = \`const RuneCatcherGame = () => {
  const [runes, setRunes] = useState([]);
  const [score, setScore] = useState(0);
  const symbols = ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ"];

  useEffect(() => {
    const spawner = setInterval(() => {
      setRunes(prev => {
        if(prev.length > 5) return prev;
        return [...prev, { id: Date.now(), x: Math.random() * 80 + 10, symbol: symbols[Math.floor(Math.random()*symbols.length)], speed: Math.random() * 2 + 1 }];
      });
    }, 1500);
    return () => clearInterval(spawner);
  }, []);

  useEffect(() => {
    let animationFrameId;
    const updatePositions = () => {
      setRunes(prev => prev.map(r => ({ ...r, y: (r.y || 0) + r.speed })).filter(r => r.y < 120));
      animationFrameId = requestAnimationFrame(updatePositions);
    };
    animationFrameId = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const catchRune = (id) => {
    setScore(s => s + 10);
    setRunes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="minigame-container">
      <div className="rune-catcher-score">Runes Gathered: {score}</div>
      <div style={{position:'absolute', inset:0, opacity:0.1, background:'linear-gradient(180deg, transparent, var(--oracle-blue))'}} />
      {runes.map(r => (
        <div key={r.id} className="rune-falling" style={{left: \`\${r.x}%\`, top: \`\${r.y || -10}%\`}} onClick={() => catchRune(r.id)}>
          {r.symbol}
        </div>
      ))}
      <div style={{position:'absolute', bottom:20, width:'100%', textAlign:'center', fontFamily:"'IM Fell English',serif", color:'var(--parchment-dim)', fontSize: 15, pointerEvents:'none'}}>
        "Catch the falling runes to prepare your mind..."
      </div>
    </div>
  );
};\`;

const oraclesGame = \`const OraclesLockGame = () => {
  const [rings, setRings] = useState([0, 0, 0]);
  const [solved, setSolved] = useState(false);

  const rotateRing = (idx) => {
    if(solved) return;
    setRings(prev => {
      const next = [...prev];
      next[idx] = (next[idx] + 45) % 360;
      if (idx === 2) next[1] = (next[1] + 45) % 360; 
      if (idx === 1) next[0] = (next[0] + 90) % 360; 
      return next;
    });
  };

  useEffect(() => {
    if (rings[0] === 0 && rings[1] === 0 && rings[2] === 0 && !solved && rings.some(r=>r!==0)) {
      setSolved(true);
      setTimeout(() => {
        setRings([Math.floor(Math.random()*7+1)*45, Math.floor(Math.random()*7+1)*45, Math.floor(Math.random()*7+1)*45]);
        setSolved(false);
      }, 2000);
    }
  }, [rings, solved]);

  useEffect(() => {
    setRings([90, 180, 270]);
  }, []);

  return (
    <div className="minigame-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle, transparent, var(--oracle-blue))'}} />
      <div style={{position: 'relative', width: 250, height: 250}}>
        {[0, 1, 2].map(idx => (
          <div key={idx} onClick={() => rotateRing(idx)} style={{
            position: 'absolute', top: '50%', left: '50%', width: 250 - idx*60, height: 250 - idx*60,
            transform: \\\`translate(-50%, -50%) rotate(\\\${rings[idx]}deg)\\\`, transition: 'transform 0.4s ease',
            border: '2px solid rgba(0, 212, 255, 0.4)', borderRadius: '50%', cursor: 'pointer',
            boxShadow: solved ? '0 0 30px var(--oracle-glow)' : 'none'
          }}>
             <div style={{position:'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: 'var(--oracle-blue)', borderRadius: '50%', boxShadow: '0 0 12px var(--oracle-glow)'}}/>
             <div style={{position:'absolute', bottom: -15, left: '50%', transform: 'translateX(-50%)', fontSize: 20, color: 'var(--rune-gold)'}}>{["ᚠ","ᚨ","ᚲ"][idx]}</div>
          </div>
        ))}
        <div style={{position:'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, background: solved ? 'var(--rune-gold)' : 'var(--oracle-blue)', borderRadius: '50%', boxShadow: solved ? '0 0 30px var(--rune-gold)' : 'none', transition: 'all 0.4s'}} />
      </div>
      <div style={{position:'absolute', bottom:20, width:'100%', textAlign:'center', fontFamily:"'IM Fell English',serif", color:'var(--parchment-dim)', fontSize:14, pointerEvents:'none'}}>
        "Align the runes at the apex to unlock the mechanism..."
      </div>
    </div>
  );
};\`;
code = code.replace(runeSearch, oraclesGame);

// 4. Waiting Lobby
const waitSearch = \`const WaitingLobby = ({ teamName, otherTeams, onSkipWait }) => {
  return (
    <div className="lobby-wrap" style={{flexDirection: 'column'}}>
      <div style={{textAlign:"center",maxWidth:800,width:"100%",animation:"fadeInUp 0.8s ease-out", marginBottom: 40}}>
        <div style={{fontSize:48,marginBottom:16,display:"block", animation:"oraclePulse 2s infinite", width:80, margin:'0 auto', borderRadius:'50%'}}>⏳</div>
        <div className="phase-title" style={{color:"var(--oracle-blue)"}}>The Creator's Sanctum</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontSize: 19,color:"var(--parchment-dim)",fontStyle:"italic",marginBottom:24,letterSpacing:2}}>
          "Your teammate is currently studying the sacred vision. The transmission will arrive soon."
        </div>
      </div>
      
      <div className="grid-2" style={{maxWidth: 900, width: '100%', gap: 40}}>
        <div className="card">
          <div className="card-title">MENTAL PREPARATION</div>
          <RuneCatcherGame />
        </div>
        <div className="card">
          <div className="card-title">OTHER TEAMS IN LABYRINTH</div>
          <div style={{maxHeight: 350, overflowY: 'auto'}}>
            {otherTeams.map((t, i) => (
              <div key={i} style={{padding: '12px 0', borderBottom: '1px solid rgba(200,146,10,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontFamily:"'Cinzel',serif", color: t.name === teamName ? "var(--rune-gold)" : "var(--text-bright)", fontSize: 16}}>
                  {t.name} {t.name === teamName && "(You)"}
                </span>
                <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 13, color: t.status === 'active' ? "#00ff88" : "var(--parchment-dim)"}}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <div style={{marginTop: 30, textAlign: 'center'}}>
            <button className="btn btn-ghost" style={{fontSize: 12, padding:"6px 12px"}} onClick={onSkipWait}>
              [DEV] SIMULATE TRANSMISSION RECEIVED
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};\`;

const waitReplace = \`const WaitingLobby = ({ teamName, otherTeams, winners }) => {
  if (winners && winners.length > 0) {
    return (
      <div className="lobby-wrap" style={{flexDirection: 'column', animation: 'fadeInUp 0.8s ease-out'}}>
        <div style={{fontSize:60,marginBottom:16,display:"block", animation:"goldPulse 2s infinite", textAlign:'center'}}>🏆</div>
        <div className="phase-title" style={{color:"var(--rune-gold)", textAlign: 'center'}}>The Oracle has Spoken</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontSize:18,color:"var(--parchment-dim)",fontStyle:"italic",marginBottom:40,letterSpacing:2}}>
          "The most masterful visions have been chosen."
        </div>
        <div className="grid-2" style={{maxWidth: 1000, width: '100%', gap: 40}}>
           {winners.map((w, idx) => (
             <div key={idx} className="card" style={{borderColor: idx === 0 ? 'var(--rune-gold)' : 'var(--border-rune)', boxShadow: idx === 0 ? '0 0 40px rgba(200,146,10,0.2)' : 'none'}}>
               <div style={{textAlign: 'center', marginBottom: 16}}>
                 <span style={{fontFamily: "'Cinzel Decorative', serif", fontSize: 24, color: idx === 0 ? 'var(--rune-gold)' : 'var(--text-bright)'}}>#{idx+1} {w.name}</span>
                 <div style={{fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: 'var(--oracle-blue)', marginTop: 8}}>SIMILARITY: {w.score}%</div>
               </div>
               <div style={{display: 'flex', gap: 16}}>
                 <div style={{flex: 1}}>
                    <div style={{fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: 'var(--parchment-dim)', marginBottom: 8}}>ORIGINAL VISION</div>
                    <img src={w.originalImage || "https://picsum.photos/seed/target/400/400"} alt="Original" style={{width: '100%', borderRadius: 4, border: '1px solid var(--stone)'}} />
                 </div>
                 <div style={{flex: 1}}>
                    <div style={{fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: 'var(--oracle-blue)', marginBottom: 8}}>GENERATED SPELL</div>
                    <img src={w.finalImage || "https://picsum.photos/seed/generated/400/400"} alt="Generated" style={{width: '100%', borderRadius: 4, border: '1px solid var(--border-oracle)'}} />
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-wrap" style={{flexDirection: 'column'}}>
      <div style={{textAlign:"center",maxWidth:800,width:"100%",animation:"fadeInUp 0.8s ease-out", marginBottom: 40}}>
        <div style={{fontSize:48,marginBottom:16,display:"block", animation:"oraclePulse 2s infinite", width:80, margin:'0 auto', borderRadius:'50%'}}>⏳</div>
        <div className="phase-title" style={{color:"var(--oracle-blue)"}}>The Sanctuary</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontSize:18,color:"var(--parchment-dim)",fontStyle:"italic",marginBottom:24,letterSpacing:2}}>
          "Rest your mind. The Oracle is judging the visions."
        </div>
      </div>
      
      <div className="grid-2" style={{maxWidth: 900, width: '100%', gap: 40}}>
        <div className="card">
          <div className="card-title">MENTAL PREPARATION</div>
          <OraclesLockGame />
        </div>
        <div className="card">
          <div className="card-title">OTHER TEAMS IN LABYRINTH</div>
          <div style={{maxHeight: 350, overflowY: 'auto'}}>
            {otherTeams.map((t, i) => (
              <div key={i} style={{padding: '12px 0', borderBottom: '1px solid rgba(200,146,10,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontFamily:"'Cinzel',serif", color: t.name === teamName ? "var(--rune-gold)" : "var(--text-bright)", fontSize: 16}}>
                  {t.name} {t.name === teamName && "(You)"}
                </span>
                <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 13, color: t.status === 'active' ? "#00ff88" : "var(--parchment-dim)"}}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}\`;
code = code.replace(waitSearch, waitReplace);

// 5. App phase components updates
const submitSearch = \`{phase==="submission"&&<SubmissionFlow images={[r1Image || "https://picsum.photos/seed/r1/400/400", r2Image || "https://picsum.photos/seed/r2/400/400", r3Image || "https://picsum.photos/seed/r3/400/400"]} onSelect={img=>{setFinalImage(img); setPhase("judgment");}} />}\`;
const submitReplace = \`{phase==="submission"&&<SubmissionFlow images={[r1Image || "https://picsum.photos/seed/r1/400/400", r2Image || "https://picsum.photos/seed/r2/400/400", r3Image || "https://picsum.photos/seed/r3/400/400"]} onSelect={img=>{
          setFinalImage(img); 
          const mockScore = Math.floor(Math.random()*40 + 60);
          if (playerInfo) {
            setTeams(prev => prev.map(t => t.name === playerInfo.teamName ? {...t, finalImage: img, originalImage: "https://picsum.photos/seed/target/400/400", score: mockScore} : t));
          }
          setPhase("judgment");
        }} />}\`;
code = code.replace(submitSearch, submitReplace);

const judgmentSearch = \`{phase==="judgment"&&<JudgmentView score={Math.floor(Math.random()*40 + 60)} originalImage="https://picsum.photos/seed/target/400/400" finalImage={finalImage} />}\`;
const judgmentReplace = \`{phase==="judgment"&&<JudgmentView score={Math.floor(Math.random()*40 + 60)} originalImage="https://picsum.photos/seed/target/400/400" finalImage={finalImage} onReturn={()=>{setPhase("waiting");}} />}\`;
code = code.replace(judgmentSearch, judgmentReplace);

code = code.replace('{isGameActive&&phase!=="lobby"&&(', '{isGameActive&&phase!=="lobby"&&phase!=="waiting"&&phase!=="judgment"&&(');

fs.writeFileSync('src/App.jsx', code);
console.log('Done!');
