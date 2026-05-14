const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. App component signature change to pass winners and setTeams
code = code.replace(
  `const [teams, setTeams] = useSharedState('maya_teams', [`,
  `const [winners, setWinners] = useSharedState('maya_winners', []);\n  const [teams, setTeams] = useSharedState('maya_teams', [`
);

// Add winners to AdminDashboard and PlayerSection
code = code.replace(
  `addAlert={addAlert}\n          />`,
  `addAlert={addAlert}\n            winners={winners}\n            setWinners={setWinners}\n          />`
);

code = code.replace(
  `allTeams={teams}\n        />`,
  `allTeams={teams}\n          winners={winners}\n          setTeams={setTeams}\n        />`
);

// 2. AdminDashboard leaderboard view
const leaderboardRegex = /<div className="card-title">LIVE RANKINGS<\/div>[\s\S]*?<\/div>\n              <\/div>\n            <\/div>\n          \)}/m;
const newLeaderboard = `<div className="card-title">LIVE RANKINGS</div>
                {[...teams].sort((a,b)=>b.score-a.score).map((team,i)=>(
                  <div key={team.id} className="leaderboard-row">
                    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:["var(--rune-gold)","#a8a8a8","#8b6533","var(--parchment-dim)"][i]??"var(--parchment-dim)",width:32,textAlign:"center"}}>{i+1}</div>
                    <div><div style={{color:"var(--text-bright)",fontFamily:"'Cinzel',serif",fontSize:16}}>{team.name}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:13,color:"var(--parchment-dim)",marginTop:4}}>{team.observer} & {team.creator} · Round {team.round}</div></div>
                    <div style={{marginLeft:"auto",fontFamily:"'Cinzel Decorative',serif",fontSize:21,color:"var(--oracle-blue)"}}>{team.score}%</div>
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
          )}`;
code = code.replace(leaderboardRegex, newLeaderboard);

// 3. AdminDashboard signature
code = code.replace(
  `const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers})`,
  `const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers,winners,setWinners,addAlert})`
);

// 4. PlayerSection signature
code = code.replace(
  `const PlayerSection = ({onGoToAdmin,addAlert, globalTags, timers, allTeams}) => {`,
  `const PlayerSection = ({onGoToAdmin,addAlert, globalTags, timers, allTeams, winners, setTeams}) => {`
);

// 5. Replace WaitingLobby and RuneCatcherGame
const runeCatcherRegex = /const RuneCatcherGame = \(\) => \{[\s\S]*?\}\;\n\n/;
const oraclesLockGame = `
const OraclesLockGame = () => {
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
            transform: \`translate(-50%, -50%) rotate(\${rings[idx]}deg)\`, transition: 'transform 0.4s ease',
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
};
`;
code = code.replace(runeCatcherRegex, oraclesLockGame);

// Remove the old WaitingLobby (which is the one not replaced by rewrite.cjs, wait, I replaced the one inside the second part? No, WaitingLobby was in the first part!)
const waitingLobbyRegex = /const WaitingLobby = \(\{ teamName, otherTeams, onSkipWait \}\) => \{[\s\S]*?return \([\s\S]*?\);\n\}/;
const newWaitingLobby = `
const WaitingLobby = ({ teamName, otherTeams, winners }) => {
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
}`;
code = code.replace(waitingLobbyRegex, newWaitingLobby);

// 6. Replace JudgmentView logic
const judgmentViewRegex2 = /const JudgmentView = \(\{score=78, originalImage, finalImage\}\) => \{[\s\S]*?return\([\s\S]*?\);\n\};/;
const newJudgmentView2 = `
const JudgmentView = ({score=78, originalImage, finalImage, onReturn}) => {
  const [displayScore,setDisplayScore]=useState(0);
  const circ=2*Math.PI*100;
  useEffect(()=>{let c=0;const step=score/80;const t=setInterval(()=>{c+=step;if(c>=score){setDisplayScore(score);clearInterval(t);return;}setDisplayScore(Math.round(c));},25);return()=>clearInterval(t);},[score]);
  const offset=circ-(displayScore/100)*circ;
  return(
    <div className="results-wrap" style={{animation:"fadeInUp 0.8s ease-out"}}>
      <div className="result-panel">
        <div className="result-label" style={{color:"var(--rune-gold)"}}>⬡ THE ORIGINAL VISION</div>
        <div style={{flex:1,border:"1px solid var(--border-rune)",borderRadius:4,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,var(--stone),var(--abyss))"}}>
          {originalImage ? <img src={originalImage} style={{width:'100%', height:'100%', objectFit:'contain'}} alt="original" /> :
          <div style={{textAlign:"center",opacity:0.5}}><div style={{fontSize:60,marginBottom:12}}>🖼️</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 14,color:"var(--parchment-dim)"}}>ORIGINAL IMAGE</div></div>}
        </div>
      </div>
      <div style={{width:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
        <svg viewBox="0 0 220 220" width="180" height="180">
          <circle cx="110" cy="110" r="100" fill="none" stroke="var(--stone)" strokeWidth="8"/>
          <circle cx="110" cy="110" r="100" fill="none" stroke="var(--rune-gold)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 110 110)"
            style={{transition:"stroke-dashoffset 0.1s ease-out",filter:"drop-shadow(0 0 8px var(--rune-gold))"}}/>
          <text x="110" y="100" textAnchor="middle" fill="var(--rune-gold)" fontFamily="'Cinzel Decorative',serif" fontSize="36" fontWeight="900">{displayScore}%</text>
          <text x="110" y="130" textAnchor="middle" fill="var(--parchment-dim)" fontFamily="'Share Tech Mono',monospace" fontSize="10" letterSpacing="2">SIMILARITY</text>
          <text x="110" y="148" textAnchor="middle" fill="var(--parchment-dim)" fontFamily="'Share Tech Mono',monospace" fontSize="10" letterSpacing="2">SCORE</text>
        </svg>
        <button className="btn btn-gold" style={{marginTop: 30}} onClick={onReturn}>RETURN TO SANCTUARY →</button>
      </div>
      <div className="result-panel">
        <div className="result-label" style={{color:"var(--oracle-blue)"}}>⬡ THE GENERATED VISION</div>
        <div style={{flex:1,border:"1px solid var(--border-oracle)",borderRadius:4,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,rgba(0,153,204,0.1),var(--abyss))"}}>
          {finalImage ? <img src={finalImage} style={{width:'100%', height:'100%', objectFit:'contain'}} alt="generated" /> :
          <div style={{textAlign:"center",opacity:0.5}}><div style={{fontSize:60,marginBottom:12}}>✨</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 14,color:"var(--oracle-blue)"}}>GENERATED IMAGE</div></div>}
        </div>
      </div>
    </div>
  );
};
`;
code = code.replace(judgmentViewRegex2, newJudgmentView2);

// 7. Update usage of WaitingLobby and JudgmentView in PlayerSection
code = code.replace(
  `{phase==="waiting"&&<WaitingLobby teamName={playerInfo?.teamName} otherTeams={allTeams} onSkipWait={()=>setPhase("round2")} />}`,
  `{phase==="waiting"&&<WaitingLobby teamName={playerInfo?.teamName} otherTeams={allTeams} winners={winners} />}`
);

code = code.replace(
  `{phase==="judgment"&&<JudgmentView score={Math.floor(Math.random()*40 + 60)} originalImage="https://picsum.photos/seed/target/400/400" finalImage={finalImage} />}`,
  `{phase==="judgment"&&<JudgmentView score={Math.floor(Math.random()*40 + 60)} originalImage="https://picsum.photos/seed/target/400/400" finalImage={finalImage} onReturn={()=>{setPhase("waiting");}} />}`
);

// 8. Sync teams state in PlayerSection when submitting to judgment
code = code.replace(
  `{phase==="submission"&&<SubmissionFlow images={[r1Image || "https://picsum.photos/seed/r1/400/400", r2Image || "https://picsum.photos/seed/r2/400/400", r3Image || "https://picsum.photos/seed/r3/400/400"]} onSelect={img=>{setFinalImage(img); setPhase("judgment");}} />}`,
  `{phase==="submission"&&<SubmissionFlow images={[r1Image || "https://picsum.photos/seed/r1/400/400", r2Image || "https://picsum.photos/seed/r2/400/400", r3Image || "https://picsum.photos/seed/r3/400/400"]} onSelect={img=>{
          setFinalImage(img);
          const mockScore = Math.floor(Math.random()*40 + 60);
          if (playerInfo) {
            setTeams(prev => prev.map(t => t.name === playerInfo.teamName ? {...t, finalImage: img, originalImage: "https://picsum.photos/seed/target/400/400", score: mockScore} : t));
          }
          setPhase("judgment");
        }} />}`
);

// 9. Hide DEV button
code = code.replace(
  `{isGameActive&&phase!=="lobby"&&(`,
  `{isGameActive&&phase!=="lobby"&&phase!=="waiting"&&phase!=="judgment"&&(`
);

fs.writeFileSync('src/App.jsx', code);
