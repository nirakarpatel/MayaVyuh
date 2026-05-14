const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add useSharedState
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
`;
code = code.replace('const GlobalStyles = () => (', useSharedStateCode + '\nconst GlobalStyles = () => (');

// 2. Replace AdminDashboard button
code = code.replace('onClick={onGoToPlayer}>→ PLAYER VIEW', 'onClick={() => window.open("#player", "_blank")}>→ PLAYER VIEW');

// 3. Update ArsenalView timers and add button
const arsenalTimersRegex = /<div className="grid-3">[\s\S]*?(?=<div style={{display:"flex",gap:12}}>)/m;
const newTimersCode = `<div className="grid-3">
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
        `;
code = code.replace(arsenalTimersRegex, newTimersCode);

const arsenalTagInputRegex = /<input className="tag-input".*?\/>/m;
const newTagInput = `<div style={{display:'flex', gap:8}}><input className="tag-input" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type word + Enter..."/><button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={()=>{if(tagInput.trim()){addForbiddenWord(tagInput.trim().toLowerCase());setTagInput("");}}}>➕ ADD</button></div>`;
code = code.replace(arsenalTagInputRegex, newTagInput);

// 4. Extract and replace everything from ObserverTrial to the end
const splitIndex = code.indexOf('const ObserverTrial = ');
if (splitIndex !== -1) {
  let firstPart = code.substring(0, splitIndex);
  
  const restOfCode = `
// Game Components for the 11-step flow

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

const JudgmentView = ({score=78, originalImage, finalImage}) => {
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

const PlayerSection = ({onGoToAdmin,addAlert, globalTags, timers, allTeams}) => {
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
        {phase==="waiting"&&<WaitingLobby teamName={playerInfo?.teamName} otherTeams={allTeams} onSkipWait={()=>setPhase("round2")} />}
        
        {phase==="round1"&&<GeminiUI forbiddenWords={globalTags} timerDuration={timers.round1} onSelect={img=>{setR1Image(img); setPhase("interval1");}} />}
        {phase==="interval1"&&<DiscussionInterval onComplete={()=>setPhase("round2")} />}
        
        {phase==="round2"&&<GeminiUI forbiddenWords={globalTags} timerDuration={timers.round2} isRefining={true} imagesToRefine={[r1Image || "https://picsum.photos/seed/r1/400/400"]} onSelect={img=>{setR2Image(img); setPhase("interval2");}} />}
        {phase==="interval2"&&<SwapInterval onComplete={()=>setPhase("r3select")} />}
        
        {phase==="r3select"&&<RefinementSelection img1={r1Image || "https://picsum.photos/seed/r1/400/400"} img2={r2Image || "https://picsum.photos/seed/r2/400/400"} onSelect={img=>{setR3BaseImage(img); setPhase("round3");}} />}
        
        {phase==="round3"&&<GeminiUI forbiddenWords={globalTags} timerDuration={timers.round3} isRefining={true} imagesToRefine={[r3BaseImage]} onSelect={img=>{setR3Image(img); setPhase("submission");}} />}
        
        {phase==="submission"&&<SubmissionFlow images={[r1Image || "https://picsum.photos/seed/r1/400/400", r2Image || "https://picsum.photos/seed/r2/400/400", r3Image || "https://picsum.photos/seed/r3/400/400"]} onSelect={img=>{setFinalImage(img); setPhase("judgment");}} />}

        {phase==="judgment"&&<JudgmentView score={Math.floor(Math.random()*40 + 60)} originalImage="https://picsum.photos/seed/target/400/400" finalImage={finalImage} />}
      </div>
      {isGameActive&&phase!=="lobby"&&(
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
          />
        </div>
      ):(
        <PlayerSection 
          onGoToAdmin={()=>window.location.hash = ''} 
          addAlert={addAlert}
          globalTags={forbiddenWords}
          timers={timers}
          allTeams={teams}
        />
      )}
    </>
  );
}
`;

  code = firstPart + restOfCode;
}

fs.writeFileSync('src/App.jsx', code);
