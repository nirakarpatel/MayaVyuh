const fs = require('fs');
const { execSync } = require('child_process');

let code = execSync('git show HEAD:src/App.jsx').toString();

// 1. Font size fix
code = code.replace(/font-size:\s*(\d+)px/g, (match, p1) => {
  let size = parseInt(p1);
  return size < 20 ? `font-size: ${size + 3}px` : match;
});
code = code.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
  let size = parseInt(p1);
  return size < 20 ? `fontSize: ${size + 3}` : match;
});

// 2. Add useSharedState
const useSharedStateCode = `
function useSharedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }, [key, value]);
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key && e.newValue) {
        setValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);
  return [value, setValue];
}
\`;
code = code.replace('const GlobalStyles = () => (', useSharedStateCode + '\\nconst GlobalStyles = () => (');

// 3. Replace AdminDashboard button and signature
code = code.replace('onClick={onGoToPlayer}>→ PLAYER VIEW', 'onClick={() => window.open("#player", "_blank")}>→ PLAYER VIEW');
code = code.replace(
  \`const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers})\`,
  \`const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers,winners,setWinners,addAlert})\`
);

// Add winners to AdminDashboard and PlayerSection calls
// We will replace the entire App function later so we don't need this.

// 4. Update ArsenalView timers and add button
const arsenalTimersRegex = /<div className="grid-3">[\\s\\S]*?(?=<div style={{display:"flex",gap:12}}>)/m;
const newTimersCode = \`<div className="grid-3">
          {["round1", "round2", "round3"].map((round, idx) => {
            const totalSecs = timers[round];
            const m = Math.floor(totalSecs / 60);
            const s = totalSecs % 60;
            return (
              <div className="form-group" key={round}>
                <label className="form-label">Round {idx+1} Duration</label>
                <div style={{display:'flex', gap: 8, alignItems: 'center'}}>
                  <input className="form-input" type="number" min="0" value={m} onChange={e=>handleTimerChange(round, 'min', e.target.value)} title="Minutes"/>
                  <span style={{color:'var(--parchment-dim)'}}>Min</span>
                  <input className="form-input" type="number" min="0" max="59" value={s} onChange={e=>handleTimerChange(round, 'sec', e.target.value)} title="Seconds"/>
                  <span style={{color:'var(--parchment-dim)'}}>Sec</span>
                </div>
                <div style={{display:'flex', gap: 8, marginTop: 8}}>
                   <button className="btn btn-ghost" style={{padding:'4px 8px', fontSize: 10}} onClick={()=>updateTimers(round, 3600)}>60 MIN</button>
                   <button className="btn btn-ghost" style={{padding:'4px 8px', fontSize: 10}} onClick={()=>updateTimers(round, 60)}>60 SEC</button>
                </div>
              </div>
            );
          })}
        </div>
        \`;
code = code.replace(arsenalTimersRegex, newTimersCode);

const arsenalTagInputRegex = /<input className="tag-input".*?\\/>/m;
const newTagInput = \`<div style={{display:'flex', gap:8}}><input className="tag-input" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type word + Enter..."/><button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={()=>{if(tagInput.trim()){addForbiddenWord(tagInput.trim().toLowerCase());setTagInput("");}}}>➕ ADD</button></div>\`;
code = code.replace(arsenalTagInputRegex, newTagInput);

// 5. AdminDashboard Leaderboard Update
const leaderboardRegex = /<div className="card-title">LIVE RANKINGS<\\/div>[\\s\\S]*?<\\/div>\\n              <\\/div>\\n            <\\/div>\\n          \\)}/m;
const newLeaderboard = \`<div className="card-title">LIVE RANKINGS</div>
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
          )}\`;
code = code.replace(leaderboardRegex, newLeaderboard);

// 6. Cut off EVERYTHING from RuneCatcherGame downwards and replace
const splitIndex = code.indexOf('const RuneCatcherGame = ');
let firstPart = code.substring(0, splitIndex);

const newEndPart = `
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
}

const GeminiUI = ({ forbiddenWords, onSelect, timerDuration, isRefining, imagesToRefine }) => {
  const [prompt,setPrompt]=useState("");
  const [gallery,setGallery]=useState([]);
  const [generating,setGenerating]=useState(false);
  const [timeLeft,setTimeLeft]=useState(timerDuration || 300);
  const [selectedImage,setSelectedImage]=useState(null);
  const [forbidden,setForbidden]=useState(false);
  const [showTooltip,setShowTooltip]=useState(false);
  const [rejectedWord,setRejectedWord]=useState("");
  
  useEffect(()=>{const t=setInterval(()=>setTimeLeft(tl=>{if(tl<=1){clearInterval(t);if(selectedImage) onSelect(selectedImage); else if(gallery.length) onSelect(gallery[0]); else onSelect(null); return 0;}return tl-1;}),1000);return()=>clearInterval(t);},[selectedImage,gallery,onSelect]);
  
  const handleKeyUp=(e)=>{
    const words=e.target.value.split(/\\s+/);
    const lastWord=words[words.length-1]?.toLowerCase().replace(/[^a-z]/g,"");
    if(lastWord&&forbiddenWords.some(fw=>fw.toLowerCase()===lastWord)){
      setRejectedWord(lastWord.toUpperCase()); setForbidden(true); setShowTooltip(true);
      setPrompt(e.target.value.slice(0,e.target.value.lastIndexOf(words[words.length-1])));
      setTimeout(()=>{setForbidden(false);setShowTooltip(false);},2000);
    } else { setPrompt(e.target.value); }
  };

  const handleGenerate=()=>{
    if(!prompt)return;
    setGenerating(true);
    setTimeout(()=>{
      const newImages = [
        \`https://picsum.photos/seed/\${Date.now()}1/400/400\`,
        \`https://picsum.photos/seed/\${Date.now()}2/400/400\`,
        \`https://picsum.photos/seed/\${Date.now()}3/400/400\`
      ];
      setGallery(newImages);
      setSelectedImage(newImages[0]);
      setGenerating(false);
    }, 2000);
  };
  
  const pct=(timeLeft/(timerDuration||300))*100; const mins=Math.floor(timeLeft/60); const secs=timeLeft%60;
  
  return (
    <div className="creator-wrap" style={{animation:"fadeInUp 0.5s ease-out"}}>
      {showTooltip&&<div className="word-rejected-tooltip">🚫 FORBIDDEN: "{rejectedWord}" — REJECTED BY THE ORACLE</div>}
      <div className="transmission-pane">
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 12,color:"var(--oracle-blue)",letterSpacing:3,marginBottom:16}}>📡 TARGET VISION</div>
        
        {isRefining ? (
          <div style={{display:'flex', gap: 10, flexDirection: 'column'}}>
             {imagesToRefine.map((img, i) => (
                <div key={i} style={{border: "1px solid var(--border-oracle)", padding: 4}}>
                   <img src={img} alt="refine target" style={{width: '100%', borderRadius: 4}} />
                </div>
             ))}
          </div>
        ) : (
          <div style={{border:"1px solid var(--border-oracle)",padding:4,marginTop:16}}>
            <img src="https://picsum.photos/seed/target/400/400" alt="target" style={{width:"100%",borderRadius:4}}/>
          </div>
        )}
        
        <div style={{marginTop:24,padding:12,background:"rgba(0,212,255,0.05)",border:"1px solid var(--border-oracle)",borderRadius:4}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 12,color:"var(--oracle-blue)",letterSpacing:2,marginBottom:8}}>INSTRUCTIONS</div>
          <p style={{fontFamily:"'IM Fell English',serif",fontSize: 15,color:"var(--parchment-dim)",fontStyle:"italic",lineHeight:1.6}}>"Generate an image matching the target. Avoid forbidden words."</p>
        </div>
        <div style={{marginTop:20}}>
          <div className={\`timer-display \${timeLeft<60?"danger":""}\`}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
          <div className="timer-bar"><div className={\`timer-fill \${timeLeft<60?"danger":""}\`} style={{width:\`\${pct}%\`}}/></div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column"}}>
        <div style={{padding:"30px 30px 0",display:"flex",flexDirection:"column",gap:16,flex:1}}>
          <div><div className="phase-label">⬡ YOUR SPELL</div>
            <textarea className={\`prompt-box \${forbidden?"forbidden":""}\`} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyUp={handleKeyUp} placeholder="Craft your prompt..."/>
          </div>
          <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
            {generating?"⚗️ Conjuring...":"✨ GENERATE VISION"}
          </button>
          
          {gallery.length > 0 && (
             <div style={{display: 'flex', gap: 16, marginTop: 20}}>
                {gallery.map((img, idx) => (
                   <div key={idx} onClick={()=>setSelectedImage(img)} style={{flex: 1, border: selectedImage === img ? "2px solid var(--rune-gold)" : "2px solid transparent", cursor: 'pointer', borderRadius: 4, overflow: 'hidden'}}>
                      <img src={img} alt="gen" style={{width: '100%', display: 'block'}} />
                   </div>
                ))}
             </div>
          )}

          <button className="submit-btn" onClick={()=>onSelect(selectedImage)} disabled={!selectedImage}>
             ⚡ SUBMIT FINAL SPELL
          </button>
        </div>
      </div>
    </div>
  );
};

const DiscussionInterval = ({onComplete}) => {
  const [timeLeft,setTimeLeft]=useState(120);
  useEffect(()=>{const t=setInterval(()=>setTimeLeft(tl=>{if(tl<=1){clearInterval(t);onComplete();return 0;}return tl-1;}),1000);return()=>clearInterval(t);},[onComplete]);
  const mins=Math.floor(timeLeft/60); const secs=timeLeft%60;
  return (
    <div className="transfer-screen">
      <div style={{fontSize: 60, animation:"oraclePulse 2s infinite", borderRadius: '50%'}}>🎙️</div>
      <div className="transfer-text" style={{animation:"fadeInUp 0.5s ease-out"}}>Verbal Transfer Active</div>
      <div style={{fontFamily:"'IM Fell English',serif",color:"var(--parchment-dim)",fontStyle:"italic",marginTop:8,fontSize: 16}}>Explain the vision to Player 2. The original image is now hidden.</div>
      <div className="timer-display" style={{marginTop: 30}}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
      <button className="btn btn-ghost" style={{marginTop: 40}} onClick={onComplete}>[DEV] SKIP TIMER</button>
    </div>
  );
};

const SwapInterval = ({onComplete}) => {
  const [timeLeft,setTimeLeft]=useState(60);
  useEffect(()=>{const t=setInterval(()=>setTimeLeft(tl=>{if(tl<=1){clearInterval(t);onComplete();return 0;}return tl-1;}),1000);return()=>clearInterval(t);},[onComplete]);
  const mins=Math.floor(timeLeft/60); const secs=timeLeft%60;
  return (
    <div className="transfer-screen">
      <div style={{fontSize: 60}}>🔀</div>
      <div className="transfer-text" style={{animation:"fadeInUp 0.5s ease-out"}}>Player Swap</div>
      <div style={{fontFamily:"'IM Fell English',serif",color:"var(--parchment-dim)",fontStyle:"italic",marginTop:8,fontSize: 16}}>Player 1 must return. No communication allowed.</div>
      <div className="timer-display" style={{marginTop: 30}}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
      <button className="btn btn-ghost" style={{marginTop: 40}} onClick={onComplete}>[DEV] SKIP TIMER</button>
    </div>
  );
};

const RefinementSelection = ({img1, img2, onSelect}) => {
   return (
      <div className="lobby-wrap" style={{flexDirection: 'column'}}>
         <div className="phase-title" style={{color:"var(--oracle-blue)", marginBottom: 40}}>Select Base Vision</div>
         <div className="grid-2" style={{gap: 40, maxWidth: 900}}>
            <div className="card" style={{cursor:'pointer', padding: 10}} onClick={()=>onSelect(img1)}>
               <div className="card-title">Round 1 Image</div>
               <img src={img1} style={{width: '100%', borderRadius: 4}} alt="R1"/>
            </div>
            <div className="card" style={{cursor:'pointer', padding: 10}} onClick={()=>onSelect(img2)}>
               <div className="card-title">Round 2 Image</div>
               <img src={img2} style={{width: '100%', borderRadius: 4}} alt="R2"/>
            </div>
         </div>
      </div>
   );
};

const SubmissionFlow = ({images, onSelect}) => {
   return (
      <div className="lobby-wrap" style={{flexDirection: 'column'}}>
         <div className="phase-title" style={{color:"var(--rune-gold)", marginBottom: 40}}>Final Submission Selection</div>
         <div className="grid-3" style={{gap: 30, maxWidth: 1000}}>
            {images.map((img, i) => (
               <div key={i} className="card" style={{cursor:'pointer', padding: 10}} onClick={()=>onSelect(img)}>
                  <div className="card-title">Round {i+1} Output</div>
                  <img src={img} style={{width: '100%', borderRadius: 4}} alt={\`R\${i+1}\`}/>
               </div>
            ))}
         </div>
      </div>
   );
};

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

const PenaltyOverlay = ({onDismiss}) => {
  useEffect(()=>{const t=setTimeout(onDismiss,4000);return()=>clearTimeout(t);},[onDismiss]);
  return(
    <>
      <div className="penalty-overlay"/>
      <div className="penalty-toast">⚡ PENALTY INVOKED BY THE ORACLE — TIME REDUCED BY 30 SECONDS</div>
    </>
  );
};

const DisqualificationScreen = () => {
  const runes=["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ"];
  return(
    <div className="disqual-screen">
      <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        {runes.map((r,i)=><span key={i} style={{position:"absolute",fontSize:24,color:"rgba(255,0,0,0.15)",animation:\`runeFloat 3s ease-in-out infinite\`,animationDelay:\`\${i*0.3}s\`,left:\`\${Math.random()*90+5}%\`,top:\`\${Math.random()*90+5}%\`}}>{r}</span>)}
      </div>
      <div style={{textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:80,marginBottom:24}}>☠️</div>
        <div className="disqual-title">DISQUALIFIED</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontSize:20,color:"rgba(255,100,100,0.7)",fontStyle:"italic"}}>"The Oracle has cast you from the labyrinth"</div>
      </div>
    </div>
  );
};

const PlayerSection = ({onGoToAdmin,addAlert, globalTags, timers, allTeams, winners, setTeams}) => {
  const [phase,setPhase]=useState("lobby");
  const [playerInfo,setPlayerInfo]=useState(null);
  
  // Game State
  const [r1Image, setR1Image] = useState(null);
  const [r2Image, setR2Image] = useState(null);
  const [r3Image, setR3Image] = useState(null);
  const [r3BaseImage, setR3BaseImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);

  const [showPenalty,setShowPenalty]=useState(false);
  const [disqualified,setDisqualified]=useState(false);
  const [showTabWarning,setShowTabWarning]=useState(false);
  const [isGameActive,setIsGameActive]=useState(false);
  const vc=useRef(0);
  
  const handleViolation=useCallback((type,message)=>{
    vc.current++;
    addAlert({type,team:playerInfo?.teamName||"Unknown",message,time:new Date().toLocaleTimeString()});
    if(vc.current>=2||type==="TAB_SWITCH"){ setDisqualified(true); } else { setShowTabWarning(true); }
  },[playerInfo,addAlert]);
  
  useAntiCheat(isGameActive&&!disqualified,handleViolation);
  
  const handleLobbySubmit=(info)=>{ 
    setPlayerInfo(info); 
    setTimeout(()=>{ 
      setIsGameActive(true); 
      if(info.role === "observer") {
        setPhase("round1"); 
      } else {
        setPhase("waiting");
      }
    }, 1000); 
  };

  if(disqualified) return <DisqualificationScreen/>;
  return(
    <div className="player-shell">
      <BackgroundWrapper />
      <ParticleCanvas/>
      <div className="grid-bg"/>
      <div className="bg-runes">
        {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ"].map((r,i)=><span key={i} className="bg-rune" style={{left:\`\${[5,15,30,50,65,75,85,95][i]}%\`,top:\`\${[10,60,20,80,30,70,15,50][i]}%\`,animationDelay:\`\${i*0.8}s\`,animationDuration:\`\${5+i}s\`}}>{r}</span>)}
      </div>
      {showTabWarning&&(
        <div className="tab-warning" style={{animation:"toastSlide 5s ease-out forwards"}} onAnimationEnd={()=>setShowTabWarning(false)}>
          🚨 WARNING: Leaving the page detected and reported to the Oracle. Next violation = DISQUALIFICATION.
        </div>
      )}
      {showPenalty&&<PenaltyOverlay onDismiss={()=>setShowPenalty(false)}/>}
      <div style={{position:"fixed",top:0,left:0,right:0,height:44,background:"rgba(4,5,10,0.97)",borderBottom:"1px solid var(--border-rune)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",zIndex:200}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize: 17,color:"var(--rune-gold)",animation:"goldPulse 3s infinite"}}>MAYAVYUH</div>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          {playerInfo&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)"}}>⬡ {playerInfo.teamName} · {playerInfo.role === 'observer' ? playerInfo.player1 : playerInfo.player2} · {playerInfo.role?.toUpperCase()}</span>}
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:phase==="lobby"||phase==="waiting"?"var(--text-dim)":"var(--rune-gold)"}}>
            PHASE: {phase.toUpperCase()}
          </span>
          <button className="btn btn-ghost" style={{padding:"5px 12px",fontSize: 12}} onClick={()=>{window.location.hash=''; window.location.reload()}}>ADMIN →</button>
        </div>
      </div>
      <div style={{paddingTop:44,minHeight:"100vh"}}>
        {phase==="lobby"&&<Lobby onSubmit={handleLobbySubmit}/>}
        {phase==="waiting"&&<WaitingLobby teamName={playerInfo?.teamName} otherTeams={allTeams} winners={winners} />}
        
        {phase==="round1"&&<GeminiUI forbiddenWords={globalTags} timerDuration={timers.round1} onSelect={img=>{setR1Image(img); setPhase("interval1");}} />}
        {phase==="interval1"&&<DiscussionInterval onComplete={()=>setPhase("round2")} />}
        
        {phase==="round2"&&<GeminiUI forbiddenWords={globalTags} timerDuration={timers.round2} isRefining={true} imagesToRefine={[r1Image || "https://picsum.photos/seed/r1/400/400"]} onSelect={img=>{setR2Image(img); setPhase("interval2");}} />}
        {phase==="interval2"&&<SwapInterval onComplete={()=>setPhase("r3select")} />}
        
        {phase==="r3select"&&<RefinementSelection img1={r1Image || "https://picsum.photos/seed/r1/400/400"} img2={r2Image || "https://picsum.photos/seed/r2/400/400"} onSelect={img=>{setR3BaseImage(img); setPhase("round3");}} />}
        
        {phase==="round3"&&<GeminiUI forbiddenWords={globalTags} timerDuration={timers.round3} isRefining={true} imagesToRefine={[r3BaseImage]} onSelect={img=>{setR3Image(img); setPhase("submission");}} />}
        
        {phase==="submission"&&<SubmissionFlow images={[r1Image || "https://picsum.photos/seed/r1/400/400", r2Image || "https://picsum.photos/seed/r2/400/400", r3Image || "https://picsum.photos/seed/r3/400/400"]} onSelect={img=>{
          setFinalImage(img); 
          const mockScore = Math.floor(Math.random()*40 + 60);
          if (playerInfo) {
            setTeams(prev => prev.map(t => t.name === playerInfo.teamName ? {...t, finalImage: img, originalImage: "https://picsum.photos/seed/target/400/400", score: mockScore} : t));
          }
          setPhase("judgment");
        }} />}

        {phase==="judgment"&&<JudgmentView score={Math.floor(Math.random()*40 + 60)} originalImage="https://picsum.photos/seed/target/400/400" finalImage={finalImage} onReturn={()=>{setPhase("waiting");}} />}
      </div>
      {isGameActive&&phase!=="lobby"&&phase!=="waiting"&&phase!=="judgment"&&(
        <div style={{position:"fixed",bottom:20,right:20,zIndex:300,display:"flex",gap:8}}>
          <button className="btn btn-ghost" style={{fontSize: 12,padding:"6px 12px", borderColor:'var(--oracle-blue)'}} onClick={()=>setPhase(p=>p==='round1'?'interval1':p==='interval1'?'round2':p==='round2'?'interval2':p==='interval2'?'r3select':p==='r3select'?'round3':p==='round3'?'submission':p==='submission'?'judgment':'round1')}>NEXT PHASE</button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view,setView]=useState(() => window.location.hash === '#player' ? 'player' : 'admin');
  
  useEffect(() => {
    const handleHash = () => setView(window.location.hash === '#player' ? 'player' : 'admin');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [winners, setWinners] = useSharedState('maya_winners', []);
  const [teams, setTeams] = useSharedState('maya_teams', [
    {id:1, name:"Crimson Cipher", observer:"Arjun", creator:"Priya", round:2, score:78, status:"active", timeLeft:145, observerText:"...", creatorText:"..."},
  ]);
  const [forbiddenWords, setForbiddenWords] = useSharedState('maya_words', ["dragon", "ancient", "fire"]);
  const [timers, setTimers] = useSharedState('maya_timers', { round1: 300, round2: 300, round3: 300 });
  const [alerts, setAlerts] = useSharedState('maya_alerts', []);

  const addAlert=useCallback(alert=>setAlerts(prev=>[alert,...prev]),[setAlerts]);
  const addForbiddenWord = (word) => setForbiddenWords(prev => [...prev, word]);
  const removeForbiddenWord = (word) => setForbiddenWords(prev => prev.filter(w => w !== word));
  const updateTimers = (round, secs) => setTimers(prev => ({ ...prev, [round]: secs }));

  return(
    <>
      <GlobalStyles/>
      {view==="admin"?(
        <div className="app-shell">
          <BackgroundWrapper />
          <ParticleCanvas/>
          <div className="grid-bg"/>
          <div className="bg-runes">
            {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ"].map((r,i)=><span key={i} className="bg-rune" style={{left:\`\${[5,15,30,50,65,75,85,95][i]}%\`,top:\`\${[10,60,20,80,30,70,15,50][i]}%\`,animationDelay:\`\${i*0.8}s\`,animationDuration:\`\${5+i}s\`}}>{r}</span>)}
          </div>
          <AdminDashboard 
            onGoToPlayer={()=>window.open('#player', '_blank')} 
            alerts={alerts} 
            teams={teams}
            setTeams={setTeams}
            forbiddenWords={forbiddenWords}
            addForbiddenWord={addForbiddenWord}
            removeForbiddenWord={removeForbiddenWord}
            timers={timers}
            updateTimers={updateTimers}
            addAlert={addAlert}
            winners={winners}
            setWinners={setWinners}
          />
        </div>
      ):(
        <PlayerSection 
          onGoToAdmin={()=>window.location.hash = ''} 
          addAlert={addAlert}
          globalTags={forbiddenWords}
          timers={timers}
          allTeams={teams}
          winners={winners}
          setTeams={setTeams}
        />
      )}
    </>
  );
}
`

code = firstPart + newEndPart;

fs.writeFileSync('src/App.jsx', code);
