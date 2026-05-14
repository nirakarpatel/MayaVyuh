import { useState, useEffect, useRef, useCallback } from "react";


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

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Share+Tech+Mono&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --void: #04050a; --abyss: #080c14; --stone: #0e1420; --slate: #141c2e; --fog: #1e2a40;
      --rune-gold: #c8920a; --rune-gold-glow: #f5b800; --rune-amber: #d4780a;
      --oracle-blue: #00d4ff; --oracle-glow: #0099cc;
      --spirit-purple: #8b5cf6; --spirit-glow: #a78bfa;
      --blood-red: #cc2200; --blood-glow: #ff3300;
      --parchment: #c4a46b; --parchment-dim: #7a6340;
      --text-bright: #e8dcc8; --text-dim: #6b5e4a;
      --border-rune: rgba(200,146,10,0.3); --border-oracle: rgba(0,212,255,0.3);
    }
    html, body { background: var(--void); color: var(--text-bright); font-family: 'Cinzel', serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--abyss); } ::-webkit-scrollbar-thumb { background: var(--rune-gold); border-radius: 2px; }
    .particle-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; opacity: 0.35; }
    .grid-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background-image: linear-gradient(rgba(200,146,10,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,146,10,0.025) 1px, transparent 1px); background-size: 60px 60px; }
    .bg-runes { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; opacity: 0.04; }
    .bg-rune { position: absolute; font-size: 80px; color: var(--rune-gold); animation: runeFloat 6s ease-in-out infinite; }
    @keyframes goldPulse { 0%,100%{text-shadow:0 0 8px var(--rune-gold),0 0 20px var(--rune-gold-glow)} 50%{text-shadow:0 0 15px var(--rune-gold),0 0 40px var(--rune-gold-glow),0 0 60px var(--rune-amber)} }
    @keyframes oraclePulse { 0%,100%{box-shadow:0 0 15px var(--oracle-glow)} 50%{box-shadow:0 0 30px var(--oracle-glow),0 0 60px rgba(0,212,255,0.3)} }
    @keyframes screenShake { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-8px,4px)} 20%{transform:translate(8px,-4px)} 30%{transform:translate(-6px,6px)} 40%{transform:translate(6px,-2px)} 50%{transform:translate(-4px,8px)} 60%{transform:translate(4px,-6px)} 70%{transform:translate(-2px,4px)} 80%{transform:translate(2px,-2px)} 90%{transform:translate(-1px,1px)} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
    @keyframes runeFloat { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.6} 50%{transform:translateY(-20px) rotate(5deg);opacity:1} }
    @keyframes labyLoading { 0%{stroke-dashoffset:300} 100%{stroke-dashoffset:0} }
    @keyframes banPulse { 0%,100%{box-shadow:0 0 15px var(--blood-red),0 0 30px var(--blood-red)} 50%{box-shadow:0 0 30px var(--blood-glow),0 0 60px var(--blood-glow),0 0 100px rgba(255,51,0,0.5)} }
    @keyframes toastSlide { 0%{transform:translateY(-120px);opacity:0} 15%{transform:translateY(0);opacity:1} 85%{transform:translateY(0);opacity:1} 100%{transform:translateY(-120px);opacity:0} }
    @keyframes disqualFlash { 0%,100%{opacity:1} 50%{opacity:0.7} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes glitchPulse { 0%,100%{clip-path:inset(0)} 20%{clip-path:inset(10% 0 80% 0);transform:translateX(-5px)} 40%{clip-path:inset(60% 0 30% 0);transform:translateX(5px)} 60%{clip-path:inset(30% 0 50% 0);transform:translateX(-3px)} 80%{clip-path:inset(50% 0 10% 0);transform:translateX(3px)} }
    @keyframes panBg { 0% { transform: scale(1.05) translate(0, 0); } 25% { transform: scale(1.1) translate(-1%, 1%); } 50% { transform: scale(1.05) translate(1%, -1%); } 75% { transform: scale(1.1) translate(1%, 1%); } 100% { transform: scale(1.05) translate(0, 0); } }
    @keyframes panBgSlow { 0% { transform: scale(1.1) translate(1%, 1%); } 50% { transform: scale(1.05) translate(-1%, -1%); } 100% { transform: scale(1.1) translate(1%, 1%); } }
    .immersive-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
    .bg-layer { position: absolute; inset: -5%; background-size: cover; background-position: center; opacity: 0; transition: opacity 2s ease-in-out; mix-blend-mode: overlay; filter: contrast(1.2) sepia(0.3) hue-rotate(-10deg); }
    .bg-layer.active { opacity: 0.15; }
    .bg-layer.bg-1 { background-image: url('/src/assets/bg-1.jpg'); animation: panBg 40s linear infinite; }
    .bg-layer.bg-2 { background-image: url('/src/assets/bg-2.jpg'); animation: panBgSlow 50s linear infinite; }
    .bg-layer.bg-3 { background-image: url('/src/assets/bg-3.jpg'); animation: panBg 45s linear infinite reverse; }
    .bg-layer.bg-4 { background-image: url('/src/assets/bg-4.jpg'); animation: panBgSlow 55s linear infinite reverse; }
    .bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, var(--void) 80%); }
    .app-shell { min-height: 100vh; position: relative; z-index: 1; }
    .admin-nav { position:fixed;left:0;top:0;height:100vh;width:260px;background:linear-gradient(180deg,var(--abyss) 0%,var(--stone) 100%);border-right:1px solid var(--border-rune);display:flex;flex-direction:column;z-index:100;overflow:hidden; }
    .admin-nav::before { content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--rune-gold),transparent); }
    .nav-logo { padding:28px 20px 20px;border-bottom:1px solid var(--border-rune); }
    .nav-logo h1 { font-family:'Cinzel Decorative',serif;font-size: 18px;font-weight:900;color:var(--rune-gold);animation:goldPulse 3s infinite;letter-spacing:2px;line-height:1.3; }
    .nav-logo p { font-family:'IM Fell English',serif;font-size: 13px;color:var(--parchment-dim);margin-top:4px;letter-spacing:3px;font-style:italic; }
    .nav-items { flex:1;padding:20px 0;overflow-y:auto; }
    .nav-section-title { font-family:'Share Tech Mono',monospace;font-size: 12px;color:var(--parchment-dim);letter-spacing:3px;padding:16px 20px 8px;text-transform:uppercase; }
    .nav-item { display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;border-left:3px solid transparent;transition:all 0.3s;font-size: 15px;letter-spacing:1px;color:var(--parchment-dim); }
    .nav-item:hover,.nav-item.active { background:rgba(200,146,10,0.08);border-left-color:var(--rune-gold);color:var(--rune-gold); }
    .nav-footer { padding:16px 20px;border-top:1px solid var(--border-rune); }
    .system-status { display:flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace;font-size: 13px;color:var(--parchment-dim); }
    .status-dot { width:6px;height:6px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px #00ff88;animation:oraclePulse 2s infinite; }
    .admin-main { margin-left:260px;min-height:100vh;padding:0 30px 30px; }
    .page-header { margin-bottom:32px; }
    .page-header h2 { font-family:'Cinzel Decorative',serif;font-size:22px;color:var(--rune-gold);animation:goldPulse 3s infinite;letter-spacing:3px; }
    .page-header p { font-family:'IM Fell English',serif;color:var(--parchment-dim);font-size: 16px;margin-top:6px;font-style:italic; }
    .breadcrumb { font-family:'Share Tech Mono',monospace;font-size: 13px;color:var(--parchment-dim);letter-spacing:2px;margin-bottom:8px; }
    .card { background:linear-gradient(135deg,var(--abyss),var(--stone));border:1px solid var(--border-rune);border-radius:4px;padding:24px;position:relative;overflow:hidden; }
    .card::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,146,10,0.03) 0%,transparent 60%);pointer-events:none; }
    .card-title { font-family:'Cinzel',serif;font-size: 14px;color:var(--rune-gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border-rune); }
    .grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
    .grid-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px; }
    .stat-card { background:linear-gradient(135deg,var(--abyss),var(--stone));border:1px solid var(--border-rune);border-radius:4px;padding:20px 24px;position:relative;overflow:hidden; }
    .stat-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--rune-gold); }
    .stat-value { font-family:'Cinzel Decorative',serif;font-size:32px;color:var(--rune-gold);line-height:1; }
    .stat-label { font-family:'Share Tech Mono',monospace;font-size: 13px;color:var(--parchment-dim);letter-spacing:2px;margin-top:6px; }
    .stat-icon { position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:28px;opacity:0.2; }
    .drop-zone { border:2px dashed var(--border-rune);border-radius:4px;padding:48px 24px;text-align:center;transition:all 0.3s;cursor:pointer;background:rgba(200,146,10,0.02);position:relative;overflow:hidden; }
    .drop-zone:hover,.drop-zone.dragging { border-color:var(--rune-gold);background:rgba(200,146,10,0.06);box-shadow:0 0 30px rgba(200,146,10,0.1) inset; }
    .tag-input-wrap { background:var(--abyss);border:1px solid var(--border-rune);border-radius:4px;padding:10px 14px;min-height:50px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;transition:border-color 0.3s; }
    .tag-input-wrap:focus-within { border-color:var(--rune-gold); }
    .tag { background:rgba(200,146,10,0.15);border:1px solid rgba(200,146,10,0.4);color:var(--rune-gold);border-radius:2px;padding:3px 8px;font-family:'Share Tech Mono',monospace;font-size: 14px;display:flex;align-items:center;gap:6px; }
    .tag-remove { cursor:pointer;opacity:0.6;transition:opacity 0.2s; }
    .tag-remove:hover { opacity:1;color:var(--blood-red); }
    .tag-input { background:none;border:none;outline:none;color:var(--text-bright);font-family:'Share Tech Mono',monospace;font-size: 15px;min-width:120px; }
    .btn { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border:none;cursor:pointer;font-family:'Cinzel',serif;font-size: 14px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;transition:all 0.3s;position:relative;overflow:hidden; }
    .btn-gold { background:linear-gradient(135deg,var(--rune-amber),var(--rune-gold));color:var(--void);font-weight:700;box-shadow:0 0 20px rgba(200,146,10,0.3); }
    .btn-gold:hover { box-shadow:0 0 30px rgba(200,146,10,0.6),0 0 60px rgba(200,146,10,0.2); }
    .btn-ghost { background:transparent;color:var(--rune-gold);border:1px solid var(--border-rune); }
    .btn-ghost:hover { border-color:var(--rune-gold);background:rgba(200,146,10,0.08); }
    .btn-danger { background:linear-gradient(135deg,#8b0000,var(--blood-red));color:#fff;box-shadow:0 0 20px rgba(204,34,0,0.5); }
    .btn-danger:hover { transform:scale(1.02);cursor:crosshair; }
    .btn-oracle { background:linear-gradient(135deg,rgba(0,153,204,0.2),rgba(0,212,255,0.15));color:var(--oracle-blue);border:1px solid rgba(0,212,255,0.4); }
    .btn-oracle:hover { box-shadow:0 0 20px rgba(0,212,255,0.3);border-color:var(--oracle-blue); }
    .data-table { width:100%;border-collapse:collapse; }
    .data-table th { font-family:'Share Tech Mono',monospace;font-size: 13px;letter-spacing:2px;color:var(--parchment-dim);text-align:left;padding:10px 16px;border-bottom:1px solid var(--border-rune);text-transform:uppercase; }
    .data-table tr.team-row { cursor:pointer;transition:all 0.3s;border-bottom:1px solid rgba(200,146,10,0.08); }
    .data-table tr.team-row:hover { background:rgba(200,146,10,0.05); }
    .data-table tr.team-row.expanded { background:rgba(200,146,10,0.08); }
    .data-table td { padding:14px 16px;font-size: 15px;color:var(--text-bright);font-family:'Share Tech Mono',monospace;vertical-align:middle; }
    .status-badge { display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:2px;font-size: 13px;letter-spacing:1px;font-weight:600; }
    .badge-active { background:rgba(0,255,136,0.12);color:#00ff88;border:1px solid rgba(0,255,136,0.3); }
    .badge-penalized { background:rgba(255,200,0,0.12);color:#ffc800;border:1px solid rgba(255,200,0,0.3); }
    .badge-banned { background:rgba(204,34,0,0.12);color:var(--blood-glow);border:1px solid rgba(204,34,0,0.3); }
    .expand-row { background:var(--abyss);border-bottom:1px solid var(--border-rune); }
    .spectator-feed { padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px; }
    .feed-panel { background:var(--stone);border:1px solid var(--border-oracle);border-radius:4px;padding:14px; }
    .feed-title { font-family:'Share Tech Mono',monospace;font-size: 13px;color:var(--oracle-blue);letter-spacing:2px;margin-bottom:10px; }
    .feed-text { font-family:'IM Fell English',serif;font-size: 15px;color:var(--parchment-dim);font-style:italic;line-height:1.6; }
    .live-dot { display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff4444;box-shadow:0 0 6px #ff4444;animation:oraclePulse 1s infinite;margin-right:6px; }
    .modal-overlay { position:fixed;inset:0;z-index:1000;background:rgba(4,5,10,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center; }
    .modal-glass { background:rgba(14,20,32,0.97);border:1px solid var(--rune-gold);box-shadow:0 0 60px rgba(200,146,10,0.2),0 0 120px rgba(200,146,10,0.1);border-radius:6px;padding:36px;max-width:500px;width:90%;position:relative;overflow:hidden; }
    .modal-glass::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--rune-gold),transparent); }
    .modal-title { font-family:'Cinzel Decorative',serif;font-size: 21px;color:var(--rune-gold);margin-bottom:6px;animation:goldPulse 3s infinite; }
    .modal-subtitle { font-family:'IM Fell English',serif;font-size: 16px;color:var(--parchment-dim);font-style:italic;margin-bottom:24px; }
    .modal-danger { border-color:var(--blood-red);box-shadow:0 0 60px rgba(204,34,0,0.3); }
    .modal-danger::before { background:linear-gradient(90deg,transparent,var(--blood-red),transparent); }
    .form-group { margin-bottom:20px; }
    .form-label { font-family:'Share Tech Mono',monospace;font-size: 13px;color:var(--rune-gold);letter-spacing:2px;text-transform:uppercase;display:block;margin-bottom:8px; }
    .form-input,.form-select,.form-textarea { width:100%;background:var(--abyss);border:1px solid var(--border-rune);color:var(--text-bright);padding:10px 14px;border-radius:3px;font-family:'Share Tech Mono',monospace;font-size: 15px;outline:none;transition:border-color 0.3s; }
    .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--rune-gold); }
    .form-select option { background:var(--stone); }
    .form-textarea { resize:vertical;min-height:100px;font-family:'IM Fell English',serif;font-size: 16px; }
    .top-bar { height:50px;background:var(--abyss);border-bottom:1px solid var(--border-rune);display:flex;align-items:center;padding:0 30px;justify-content:space-between;position:sticky;top:0;z-index:50; }
    .player-shell { min-height:100vh;position:relative;background:var(--void);overflow:hidden; }
    .lobby-wrap { min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;padding:40px; }
    .lobby-title { font-family:'Cinzel Decorative',serif;font-size:52px;font-weight:900;background:linear-gradient(135deg,var(--rune-gold),var(--rune-gold-glow),var(--rune-amber));background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;line-height:1.1;margin-bottom:8px; }
    .role-cards { display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:40px; }
    .role-card { border:1px solid rgba(200,146,10,0.2);border-radius:6px;padding:36px 28px;cursor:pointer;position:relative;overflow:hidden;transition:all 0.4s;background:rgba(8,12,20,0.8);text-align:left; }
    .role-card::before { content:'';position:absolute;inset:0;opacity:0;transition:opacity 0.4s; }
    .role-card.observer::before { background:radial-gradient(circle at 50% 100%,rgba(0,212,255,0.15),transparent 70%); }
    .role-card.creator::before { background:radial-gradient(circle at 50% 100%,rgba(139,92,246,0.15),transparent 70%); }
    .role-card:hover::before { opacity:1; }
    .role-card.observer:hover,.role-card.selected.observer { border-color:var(--oracle-blue);box-shadow:0 0 40px rgba(0,212,255,0.2);transform:translateY(-4px); }
    .role-card.creator:hover,.role-card.selected.creator { border-color:var(--spirit-purple);box-shadow:0 0 40px rgba(139,92,246,0.2);transform:translateY(-4px); }
    .waiting-screen { min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:2; }
    .observer-wrap { min-height:calc(100vh - 44px);display:grid;grid-template-columns:1fr 1fr;gap:0;position:relative;z-index:2; }
    .observer-image-pane { padding:40px;display:flex;flex-direction:column;border-right:1px solid var(--border-rune);background:rgba(8,12,20,0.6); }
    .observer-input-pane { padding:40px;display:flex;flex-direction:column; }
    .phase-label { font-family:'Share Tech Mono',monospace;font-size: 13px;color:var(--oracle-blue);letter-spacing:4px;margin-bottom:8px; }
    .phase-title { font-family:'Cinzel Decorative',serif;font-size:22px;color:var(--text-bright);margin-bottom:20px; }
    .target-image-frame { position:relative;border:1px solid var(--border-rune);border-radius:4px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.8),0 0 30px rgba(200,146,10,0.05);flex:1;min-height:280px;display:flex;align-items:center;justify-content:center; }
    .spell-textarea { flex:1;background:rgba(8,12,20,0.9);border:1px solid var(--border-rune);border-radius:4px;color:var(--text-bright);padding:20px;font-family:'Share Tech Mono',monospace;font-size: 16px;line-height:1.7;resize:none;outline:none;transition:border-color 0.3s, box-shadow 0.3s;min-height:280px; }
    .spell-textarea:focus { border-color:var(--rune-gold); }
    .spell-textarea.forbidden { border-color:var(--blood-red)!important;animation:screenShake 0.5s ease-out;box-shadow:0 0 20px rgba(204,34,0,0.3)!important; }
    .word-rejected-tooltip { position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--blood-red);color:#fff;font-family:'Share Tech Mono',monospace;font-size: 15px;padding:10px 24px;border-radius:3px;box-shadow:0 0 30px rgba(204,34,0,0.6);animation:toastSlide 2s ease-out forwards;z-index:9999;letter-spacing:2px; }
    .timer-bar { height:3px;background:var(--stone);border-radius:2px;overflow:hidden;margin:8px 0; }
    .timer-fill { height:100%;background:linear-gradient(90deg,var(--rune-gold),var(--rune-gold-glow));transition:width 1s linear;box-shadow:0 0 8px var(--rune-gold); }
    .timer-fill.danger { background:linear-gradient(90deg,var(--blood-red),var(--blood-glow));box-shadow:0 0 8px var(--blood-red); }
    .timer-display { font-family:'Cinzel Decorative',serif;font-size:36px;color:var(--rune-gold);letter-spacing:4px;text-align:center; }
    .timer-display.danger { color:var(--blood-glow);animation:goldPulse 0.5s infinite; }
    .transfer-screen { position:fixed;inset:0;z-index:500;background:var(--void);display:flex;flex-direction:column;align-items:center;justify-content:center; }
    .transfer-text { font-family:'Cinzel Decorative',serif;font-size:20px;color:var(--rune-gold);animation:goldPulse 2s infinite;margin-top:32px;letter-spacing:4px; }
    .creator-wrap { min-height:calc(100vh - 44px);display:grid;grid-template-columns:280px 1fr;grid-template-rows:1fr auto;position:relative;z-index:2; }
    .transmission-pane { grid-row:1/3;padding:30px 20px;border-right:1px solid var(--border-rune);background:rgba(8,12,20,0.7);overflow-y:auto; }
    .prompt-box { background:var(--abyss);border:1px solid var(--border-oracle);border-radius:4px;padding:20px;resize:none;color:var(--text-bright);font-family:'Share Tech Mono',monospace;font-size: 16px;line-height:1.6;outline:none;width:100%;min-height:160px;transition:border-color 0.3s; }
    .prompt-box:focus { border-color:var(--oracle-blue);box-shadow:0 0 20px rgba(0,212,255,0.1); }
    .generate-btn { width:100%;padding:20px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(0,153,204,0.3),rgba(0,212,255,0.2));border:1px solid var(--oracle-blue);border-radius:4px;cursor:pointer;color:var(--oracle-blue);font-family:'Cinzel Decorative',serif;font-size: 21px;letter-spacing:3px;transition:all 0.3s;box-shadow:0 0 30px rgba(0,212,255,0.2); }
    .generate-btn:hover { box-shadow:0 0 50px rgba(0,212,255,0.4);transform:scale(1.01); }
    .submit-btn { width:100%;padding:18px;position:relative;overflow:hidden;background:rgba(8,12,20,0.9);border:1px solid var(--spirit-purple);border-radius:4px;cursor:pointer;color:var(--spirit-purple);font-family:'Cinzel Decorative',serif;font-size: 18px;letter-spacing:3px;transition:all 0.3s; }
    .gallery-bar { padding:16px 20px;border-top:1px solid var(--border-rune);display:flex;gap:12px;overflow-x:auto; }
    .gallery-item { flex-shrink:0;width:100px;height:76px;background:var(--stone);border:1px solid var(--border-rune);border-radius:3px;overflow:hidden;cursor:pointer;transition:border-color 0.3s;display:flex;align-items:center;justify-content:center;font-size:24px;opacity:0.6; }
    .gallery-item:hover { border-color:var(--rune-gold);opacity:1; }
    .penalty-overlay { position:fixed;inset:0;z-index:800;mix-blend-mode:overlay;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,0,0,0.03) 0px,rgba(255,0,0,0.03) 2px,transparent 2px,transparent 4px);animation:screenShake 0.6s ease-out; }
    .penalty-toast { position:fixed;top:0;left:0;right:0;z-index:9000;background:linear-gradient(90deg,var(--blood-red),#ff0000);padding:16px 24px;text-align:center;font-family:'Cinzel',serif;font-size: 17px;letter-spacing:3px;color:#fff;animation:toastSlide 4s ease-out forwards;box-shadow:0 4px 40px rgba(255,0,0,0.5); }
    .disqual-screen { position:fixed;inset:0;z-index:9999;background:#0d0000;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:disqualFlash 0.3s ease-out 4; }
    .disqual-title { font-family:'Cinzel Decorative',serif;font-size:64px;font-weight:900;color:var(--blood-glow);text-shadow:0 0 40px var(--blood-red),0 0 80px var(--blood-red);margin-bottom:16px;animation:goldPulse 1s infinite; }
    .results-wrap { min-height:calc(100vh - 44px);display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch;position:relative;z-index:2; }
    .result-panel { display:flex;flex-direction:column;padding:40px; }
    .result-label { font-family:'Share Tech Mono',monospace;font-size: 13px;letter-spacing:3px;margin-bottom:16px;text-transform:uppercase; }
    .tab-warning { position:fixed;top:44px;left:0;right:0;z-index:9998;background:var(--blood-red);color:#fff;text-align:center;padding:12px;font-family:'Cinzel',serif;font-size: 16px;letter-spacing:2px;animation:toastSlide 5s ease-out forwards; }
    .alert-panel { background:rgba(204,34,0,0.08);border:1px solid rgba(204,34,0,0.3);border-radius:4px;padding:16px;margin-bottom:12px; }
    .activity-item { display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid rgba(200,146,10,0.06); }
    .leaderboard-row { display:flex;align-items:center;gap:16px;padding:12px 16px;border-bottom:1px solid rgba(200,146,10,0.06);transition:background 0.2s; }
    .leaderboard-row:hover { background:rgba(200,146,10,0.04); }
    .difficulty-pills { display:flex;gap:8px;flex-wrap:wrap; }
    .diff-pill { padding:5px 14px;border-radius:20px;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size: 13px;letter-spacing:1px;border:1px solid;transition:all 0.3s; }
    .diff-novice { border-color:rgba(0,255,136,0.3);color:#00ff88; } .diff-novice.active { background:rgba(0,255,136,0.15); }
    .diff-adept { border-color:rgba(255,200,0,0.3);color:#ffc800; } .diff-adept.active { background:rgba(255,200,0,0.15); }
    .diff-arcane { border-color:rgba(204,34,0,0.3);color:var(--blood-glow); } .diff-arcane.active { background:rgba(204,34,0,0.15); }
    .disciplinary-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
    .team-list { display: flex; flex-direction: column; gap: 12px; max-height: 600px; overflow-y: auto; padding-right: 12px; }
    .team-card { background: var(--abyss); border: 1px solid var(--border-rune); border-radius: 4px; padding: 16px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
    .team-card:hover, .team-card.selected { border-color: var(--rune-gold); background: rgba(200,146,10,0.05); transform: translateX(4px); }
    .team-card.selected::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--rune-gold); box-shadow: 0 0 10px var(--rune-gold); }
    .live-screen-modal { width: 90%; max-width: 800px; height: 80vh; max-height: 600px; padding: 0; display: flex; flex-direction: column; }
    .minigame-container { width: 100%; max-width: 400px; margin: 0 auto; aspect-ratio: 1; background: rgba(8,12,20,0.8); border: 1px solid var(--border-oracle); border-radius: 8px; position: relative; overflow: hidden; }
    .rune-falling { position: absolute; font-size: 24px; color: var(--oracle-blue); text-shadow: 0 0 10px var(--oracle-glow); cursor: pointer; user-select: none; transition: transform 0.1s; }
    .rune-falling:hover { transform: scale(1.2); }
    .rune-catcher-score { position: absolute; top: 12px; left: 16px; font-family: 'Share Tech Mono', monospace; font-size: 17px; color: var(--oracle-blue); z-index: 10; }
  `}</style>
);

const BackgroundWrapper = () => {
  const [activeBg, setActiveBg] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setActiveBg(a => (a % 4) + 1), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="immersive-bg">
      <div className={`bg-layer bg-1 ${activeBg === 1 ? 'active' : ''}`} />
      <div className={`bg-layer bg-2 ${activeBg === 2 ? 'active' : ''}`} />
      <div className={`bg-layer bg-3 ${activeBg === 3 ? 'active' : ''}`} />
      <div className={`bg-layer bg-4 ${activeBg === 4 ? 'active' : ''}`} />
      <div className="bg-overlay" />
    </div>
  );
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.4 - 0.1, opacity: Math.random() * 0.6 + 0.2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,146,10,${p.opacity})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5 || p.x > canvas.width + 5) p.dx *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
};

const LabyrinthSVG = ({ size = 200, color = "var(--rune-gold)", animated = false }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
    <circle cx="50" cy="50" r="48" opacity="0.3" />
    <circle cx="50" cy="50" r="40" opacity="0.2" strokeDasharray="4 4" />
    <rect x="20" y="20" width="60" height="60" rx="4" opacity="0.4"
      style={animated ? { strokeDasharray: 240, strokeDashoffset: 240, animation: "labyLoading 2s ease-out forwards" } : {}} />
    <rect x="30" y="30" width="40" height="40" rx="2" opacity="0.3" />
    <path d="M50 20 L50 80 M20 50 L80 50" opacity="0.4" />
    <path d="M30 30 L70 70 M70 30 L30 70" opacity="0.2" />
    <circle cx="50" cy="50" r="6" fill={color} opacity="0.8" />
    <circle cx="50" cy="50" r="3" fill={color} />
    {[0,60,120,180,240,300].map((angle, i) => (
      <circle key={i} cx={50 + 40*Math.cos(angle*Math.PI/180)} cy={50 + 40*Math.sin(angle*Math.PI/180)} r="2" fill={color} opacity="0.5" />
    ))}
  </svg>
);

const EyeSVG = () => (
  <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
    <ellipse cx="40" cy="40" rx="35" ry="20" stroke="var(--rune-gold)" strokeWidth="1.5" opacity="0.6" />
    <circle cx="40" cy="40" r="12" stroke="var(--oracle-blue)" strokeWidth="1.5" />
    <circle cx="40" cy="40" r="6" fill="var(--oracle-blue)" opacity="0.8" />
    <circle cx="40" cy="40" r="3" fill="var(--void)" />
    {[0,45,90,135,180,225,270,315].map((a,i)=>(
      <line key={i} x1={40+14*Math.cos(a*Math.PI/180)} y1={40+14*Math.sin(a*Math.PI/180)} x2={40+20*Math.cos(a*Math.PI/180)} y2={40+20*Math.sin(a*Math.PI/180)} stroke="var(--rune-gold)" strokeWidth="1" opacity="0.5"/>
    ))}
  </svg>
);

const AdminNav = ({ activeView, setActiveView }) => {
  const navItems = [
    {id:"arsenal",icon:"⚗️",label:"Arsenal & Spell Book",section:"command"},
    {id:"roster",icon:"📜",label:"The Roster",section:"command"},
    {id:"disciplinary",icon:"⚖️",label:"Disciplinary Suite",section:"command"},
    {id:"leaderboard",icon:"🏆",label:"Hall of Champions",section:"intel"},
    {id:"activity",icon:"🔮",label:"Activity Oracle",section:"intel"},
    {id:"alerts",icon:"🚨",label:"Security Alerts",section:"system"},
    {id:"settings",icon:"⚙️",label:"Oracle Config",section:"system"},
  ];
  return (
    <nav className="admin-nav">
      <div className="nav-logo">
        <h1>MAYA<br/>VYUH</h1>
        <p>⬡ Admin Sanctum ⬡</p>
      </div>
      <div className="nav-items">
        {["command","intel","system"].map(sec => (
          <div key={sec}>
            <div className="nav-section-title">{{command:"Command",intel:"Intelligence",system:"System"}[sec]}</div>
            {navItems.filter(n=>n.section===sec).map(item=>(
              <div key={item.id} className={`nav-item ${activeView===item.id?"active":""}`} onClick={()=>setActiveView(item.id)}>
                <span style={{fontSize: 19,width:20,textAlign:"center"}}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="nav-footer">
        <div className="system-status"><span className="status-dot"/><span>ORACLE NETWORK LIVE</span></div>
      </div>
    </nav>
  );
};

const ArsenalView = ({ globalTags, addForbiddenWord, removeForbiddenWord, timers, updateTimers }) => {
  const [tagInput,setTagInput]=useState("");
  const [dragging,setDragging]=useState(false);
  const [difficulty,setDifficulty]=useState("adept");
  const [uploadedImage,setUploadedImage]=useState(null);

  const handleAddTag=(e)=>{
    if(e.key==="Enter"&&tagInput.trim()){
      addForbiddenWord(tagInput.trim().toLowerCase());
      setTagInput("");
    }
  };

  const handleTimerChange = (round, type, value) => {
    const currentTotal = timers[round];
    let mins = Math.floor(currentTotal / 60);
    let secs = currentTotal % 60;
    
    let val = parseInt(value) || 0;
    val = Math.max(0, val);

    if (type === 'min') mins = val;
    if (type === 'sec') secs = Math.min(59, val);
    
    updateTimers(round, mins * 60 + secs);
  };

  return (
    <div style={{animation:"fadeInUp 0.5s ease-out"}}>
      <div className="page-header">
        <div className="breadcrumb">ADMIN › ARSENAL</div>
        <h2>The Arsenal & Spell Book</h2>
        <p>"Configure the ancient trial — set the vision and seal the forbidden lexicon"</p>
      </div>
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-title">⚡ Target Vision</div>
          <div className={`drop-zone ${dragging?"dragging":""}`}
            onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/"))setUploadedImage(URL.createObjectURL(f));}}
            onClick={()=>document.getElementById("fInput").click()}>
            <input id="fInput" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setUploadedImage(URL.createObjectURL(f));}}/>
            {uploadedImage?<img src={uploadedImage} alt="target" style={{maxWidth:"100%",maxHeight:200,objectFit:"contain",borderRadius:4}}/>:<>
              <div style={{fontSize:40,marginBottom:12,opacity:0.6}}>🗺️</div>
              <p style={{fontFamily:"'IM Fell English',serif",color:"var(--parchment-dim)",fontSize: 17,fontStyle:"italic"}}>Cast your vision here</p>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--rune-gold)",letterSpacing:2,display:"block",marginTop:8}}>DROP IMAGE OR CLICK TO INVOKE</span>
            </>}
          </div>
        </div>
        <div className="card">
          <div className="card-title">🚫 Forbidden Lexicon</div>
          <p style={{fontFamily:"'IM Fell English',serif",color:"var(--parchment-dim)",fontSize: 16,fontStyle:"italic",marginBottom:16}}>"Words that must never pass the Observer's lips..."</p>
          <div className="tag-input-wrap">
            {globalTags.map((t,i)=><span key={i} className="tag">{t}<span className="tag-remove" onClick={()=>removeForbiddenWord(t)}>✕</span></span>)}
            <div style={{display:'flex', gap:8}}><input className="tag-input" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type word + Enter..."/><button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={()=>{if(tagInput.trim()){addForbiddenWord(tagInput.trim().toLowerCase());setTagInput("");}}}>➕ ADD</button></div>
          </div>
          <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)",marginTop:10}}>{globalTags.length} FORBIDDEN WORDS SEALED</p>
          <div style={{marginTop:16}}>
            <div className="form-label">DIFFICULTY TIER</div>
            <div className="difficulty-pills">
              {["novice","adept","arcane"].map(d=><span key={d} className={`diff-pill diff-${d} ${difficulty===d?"active":""}`} onClick={()=>setDifficulty(d)}>{d.toUpperCase()}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">⚙️ Round Configuration</div>
        <div className="grid-3">
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
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-gold">⚡ Deploy Configuration</button>
        </div>
      </div>
    </div>
  );
};

const RosterView = ({ teams, onLiveScreen }) => {
  const [expanded,setExpanded]=useState(null);
  
  const formatTime = (secs) => {
    if (secs === undefined) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{animation:"fadeInUp 0.5s ease-out"}}>
      <div className="page-header">
        <div className="breadcrumb">ADMIN › ROSTER</div>
        <h2>The Roster</h2>
        <p>"All who enter the labyrinth are watched by the eternal eye"</p>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>⬡ Team</th>
              <th>Roles (Obs · Cre)</th>
              <th>Round</th>
              <th>Time Left</th>
              <th>Score</th>
              <th>Status</th>
              <th>Live</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team=>(
              <>
                <tr key={team.id} className={`team-row ${expanded===team.id?"expanded":""}`} onClick={()=>setExpanded(expanded===team.id?null:team.id)}>
                  <td><span style={{color:"var(--rune-gold)"}}>{team.name}</span></td>
                  <td><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 15,color:"var(--parchment-dim)"}}>{team.observer || "—"} · {team.creator || "—"}</span></td>
                  <td><span style={{color:"var(--oracle-blue)",fontFamily:"'Share Tech Mono',monospace",fontSize: 15}}>Round {team.round}</span></td>
                  <td><span style={{color:"#ffc800",fontFamily:"'Share Tech Mono',monospace",fontSize: 15}}>{formatTime(team.timeLeft)}</span></td>
                  <td><span style={{color:"var(--spirit-purple)",fontFamily:"'Cinzel',serif"}}>{team.score}%</span></td>
                  <td><span className={`status-badge badge-${team.status}`}><span style={{fontSize: 11}}>●</span>{team.status.toUpperCase()}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-oracle" style={{padding:"6px 12px",fontSize: 12}} onClick={()=>onLiveScreen(team)}>VIEW SCREEN</button>
                  </td>
                </tr>
                {expanded===team.id&&(
                  <tr className="expand-row" key={`${team.id}-ex`}>
                    <td colSpan={7}>
                      <div className="spectator-feed">
                        <div className="feed-panel"><div className="feed-title"><span className="live-dot"/>OBSERVER TRANSMISSION</div><p className="feed-text">{team.observerText}</p></div>
                        <div className="feed-panel"><div className="feed-title"><span className="live-dot"/>CREATOR ACTIVITY</div><p className="feed-text">{team.creatorText}</p></div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LiveScreenModal = ({ team, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-glass live-screen-modal" onClick={e=>e.stopPropagation()}>
        <div style={{padding: "24px 30px", borderBottom: "1px solid var(--border-rune)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <div className="modal-title" style={{margin:0}}>👁️ Oracle View</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 14, color:"var(--oracle-blue)", marginTop:4}}>Live feed: {team.name} ({team.creator})</div>
          </div>
          <button className="btn btn-ghost" style={{padding: "6px 12px"}} onClick={onClose}>CLOSE</button>
        </div>
        <div style={{flex: 1, padding: 30, background: "rgba(0,0,0,0.4)", overflowY: "auto"}}>
          <div className="phase-label">CURRENT PROMPT IN PROGRESS</div>
          <textarea readOnly className="prompt-box" style={{height: "80%", opacity: 0.8}} value={team.creatorText} />
        </div>
      </div>
    </div>
  );
};

const DisciplinarySuite = ({ teams, onPenalize, onBan }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [penaltyType, setPenaltyType] = useState("time_reduction");

  return (
    <div style={{animation:"fadeInUp 0.5s ease-out"}}>
      <div className="page-header">
        <div className="breadcrumb">ADMIN › DISCIPLINARY</div>
        <h2>Disciplinary Suite</h2>
        <p>"The law of the labyrinth is absolute"</p>
      </div>
      <div className="disciplinary-layout">
        <div className="team-list card" style={{padding: 16}}>
          <div className="card-title" style={{marginBottom: 12}}>SELECT TEAM</div>
          {teams.map(t => (
            <div key={t.id} className={`team-card ${selectedTeam?.id === t.id ? 'selected' : ''}`} onClick={() => setSelectedTeam(t)}>
              <div style={{fontFamily: "'Cinzel', serif", fontSize: 16, color: "var(--rune-gold)"}}>{t.name}</div>
              <div style={{fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "var(--parchment-dim)", marginTop: 4}}>{t.observer} & {t.creator}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{opacity: selectedTeam ? 1 : 0.5, pointerEvents: selectedTeam ? 'auto' : 'none', transition: 'opacity 0.3s'}}>
          {selectedTeam ? (
            <>
              <div className="card-title" style={{color: "var(--blood-red)", borderColor: "rgba(204,34,0,0.3)"}}>⚖️ Cast Judgment on {selectedTeam.name}</div>
              <div className="form-group"><label className="form-label">Penalty Type</label>
                <select className="form-select" value={penaltyType} onChange={e=>setPenaltyType(e.target.value)}>
                  <option value="time_reduction">Time Reduction</option><option value="score_deduction">Score Deduction</option>
                  <option value="round_skip">Round Skip</option><option value="warning">Official Warning</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Duration / Severity</label><input className="form-input" defaultValue="30" placeholder="30 seconds / 10 points..."/></div>
              <div className="form-group"><label className="form-label">Reason</label><textarea className="form-textarea" placeholder="Describe the transgression..."/></div>
              <div style={{display:"flex",gap:12,justifyContent:"flex-end", marginTop: 32}}>
                <button className="btn btn-ghost" onClick={() => onPenalize(selectedTeam)}>⚡ CAST PENALTY</button>
                <button className="btn btn-danger" style={{animation:"banPulse 2s infinite"}} onClick={() => onBan(selectedTeam)}>☠️ UNLEASH BAN HAMMER</button>
              </div>
            </>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5}}>
              <span style={{fontSize: 48, marginBottom: 16}}>⚖️</span>
              <p style={{fontFamily:"'IM Fell English',serif", color:"var(--parchment-dim)", fontStyle:"italic"}}>Select a team from the roster to cast judgment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BanModal = ({team,onClose,onConfirm})=>(
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-glass modal-danger" onClick={e=>e.stopPropagation()}>
      <div className="modal-title" style={{color:"var(--blood-glow)",animation:"none"}}>☠️ THE BAN HAMMER</div>
      <div className="modal-subtitle" style={{color:"rgba(255,100,80,0.6)"}}>"This action cannot be undone. {team?.name} shall be cast from the labyrinth."</div>
      <div style={{background:"rgba(204,34,0,0.1)",border:"1px solid rgba(204,34,0,0.3)",borderRadius:4,padding:20,marginBottom:24,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>🔴</div>
        <div style={{fontFamily:"'Cinzel',serif",color:"var(--blood-glow)",fontSize: 17,letterSpacing:2}}>PERMANENTLY DISQUALIFY {team?.name?.toUpperCase()}?</div>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
        <button className="btn btn-ghost" onClick={onClose}>SPARE THEM</button>
        <button className="btn btn-danger" style={{cursor:"crosshair"}} onClick={()=>{onConfirm(team);onClose();}}>☠️ UNLEASH THE HAMMER</button>
      </div>
    </div>
  </div>
);

const AdminDashboard = ({onGoToPlayer,alerts,teams,setTeams,forbiddenWords,addForbiddenWord,removeForbiddenWord,timers,updateTimers}) => {
  const [activeView,setActiveView]=useState("arsenal");
  const [banTarget,setBanTarget]=useState(null);
  const [liveScreenTarget, setLiveScreenTarget] = useState(null);

  const handleBanConfirm=(team)=>setTeams(prev=>prev.map(t=>t.id===team.id?{...t,status:"banned"}:t));
  const handlePenalize=(team)=>setTeams(prev=>prev.map(t=>t.id===team.id?{...t,status:"penalized", timeLeft: Math.max(0, t.timeLeft - 30)}:t));

  return (
    <div className="app-shell">
      <AdminNav activeView={activeView} setActiveView={setActiveView}/>
      <div className="admin-main">
        <div className="top-bar">
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)"}}>⬡ MAYAVYUH COMMAND CENTER · {new Date().toLocaleTimeString()}</div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            {alerts.length>0&&<span style={{background:"rgba(204,34,0,0.2)",border:"1px solid rgba(204,34,0,0.4)",color:"var(--blood-glow)",padding:"4px 10px",borderRadius:2,fontFamily:"'Share Tech Mono',monospace",fontSize: 13,animation:"banPulse 2s infinite"}}>🚨 {alerts.length} ALERTS</span>}
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"#00ff88"}}>■ {teams.filter(t=>t.status==="active").length} ACTIVE</span>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"#ffc800"}}>■ {teams.filter(t=>t.status==="penalized").length} PENALIZED</span>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--blood-glow)"}}>■ {teams.filter(t=>t.status==="banned").length} BANNED</span>
            <button className="btn btn-oracle" style={{padding:"7px 16px",fontSize: 13}} onClick={() => window.open("#player", "_blank")}>→ PLAYER VIEW</button>
          </div>
        </div>
        <div style={{paddingTop:20}}>
          <div className="grid-3" style={{marginBottom:24}}>
            <div className="stat-card"><div className="stat-value">{teams.length}</div><div className="stat-label">Teams in Labyrinth</div><div className="stat-icon">👥</div></div>
            <div className="stat-card"><div className="stat-value">{Math.max(...teams.map(t=>t.score),0)}%</div><div className="stat-label">Peak Similarity</div><div className="stat-icon">🎯</div></div>
            <div className="stat-card"><div className="stat-value">{alerts.length}</div><div className="stat-label">Security Alerts</div><div className="stat-icon">🚨</div></div>
          </div>
          {activeView==="arsenal"&&<ArsenalView globalTags={forbiddenWords} addForbiddenWord={addForbiddenWord} removeForbiddenWord={removeForbiddenWord} timers={timers} updateTimers={updateTimers}/>}
          {activeView==="roster"&&<RosterView teams={teams} onLiveScreen={setLiveScreenTarget} />}
          {activeView==="disciplinary"&&<DisciplinarySuite teams={teams} onPenalize={handlePenalize} onBan={setBanTarget} />}
          {activeView==="leaderboard"&&(
            <div style={{animation:"fadeInUp 0.5s ease-out"}}>
              <div className="page-header"><div className="breadcrumb">ADMIN › LEADERBOARD</div><h2>Hall of Champions</h2><p>"Only the most precise vision shall be crowned"</p></div>
              <div className="card">
                <div className="card-title">LIVE RANKINGS</div>
                {[...teams].sort((a,b)=>b.score-a.score).map((team,i)=>(
                  <div key={team.id} className="leaderboard-row">
                    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:["var(--rune-gold)","#a8a8a8","#8b6533","var(--parchment-dim)"][i]??`var(--parchment-dim)`,width:32,textAlign:"center"}}>{i+1}</div>
                    <div><div style={{color:"var(--text-bright)",fontFamily:"'Cinzel',serif",fontSize: 16}}>{team.name}</div><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)",marginTop:4}}>{team.observer} & {team.creator} · Round {team.round}</div></div>
                    <div style={{marginLeft:"auto",fontFamily:"'Cinzel Decorative',serif",fontSize: 21,color:"var(--oracle-blue)"}}>{team.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeView==="alerts"&&(
            <div style={{animation:"fadeInUp 0.5s ease-out"}}>
              <div className="page-header"><div className="breadcrumb">ADMIN › ALERTS</div><h2>Security Alerts</h2><p>"No transgression goes unseen by the Oracle"</p></div>
              {alerts.length===0?<div className="card" style={{textAlign:"center",padding:60}}><div style={{fontSize:40,marginBottom:16}}>🔮</div><p style={{fontFamily:"'IM Fell English',serif",color:"var(--parchment-dim)",fontStyle:"italic"}}>All is calm in the labyrinth...</p></div>:alerts.map((alert,i)=>(
                <div key={i} className="alert-panel">
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 14,color:"var(--blood-glow)",letterSpacing:2,marginBottom:6}}>🚨 {alert.type} — {alert.team}</div>
                  <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 14,color:"rgba(255,100,80,0.8)"}}>{alert.message}</p>
                  <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 13,color:"var(--parchment-dim)",marginTop:4}}>{alert.time}</p>
                </div>
              ))}
            </div>
          )}
          {activeView==="activity"&&(
            <div style={{animation:"fadeInUp 0.5s ease-out"}}>
              <div className="page-header"><div className="breadcrumb">ADMIN › ACTIVITY</div><h2>Activity Oracle</h2></div>
              <div className="card">
                {[{icon:"🚨",team:"Void Serpent",msg:"Tab switch detected — auto-disqualified",time:"2 min ago"},{icon:"⚖️",team:"Obsidian Scroll",msg:"Penalty applied: 30s time reduction",time:"5 min ago"},{icon:"✅",team:"Crimson Cipher",msg:"Round 2 submission received — 78% similarity",time:"7 min ago"},{icon:"🎮",team:"Ember Wraith",msg:"Round 3 started — Player swap complete",time:"10 min ago"},{icon:"🚪",team:"Ember Wraith",msg:"Window blur detected — warning #1 issued",time:"11 min ago"}].map((a,i)=>(
                  <div key={i} className="activity-item">
                    <span style={{fontSize: 17,flexShrink:0,marginTop:2}}>{a.icon}</span>
                    <div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 14,color:"var(--text-dim)"}}><span style={{color:"var(--rune-gold)"}}>{a.team}</span> — {a.msg}</div>
                      <div style={{fontSize: 13,color:"var(--text-dim)",marginTop:2}}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeView==="settings"&&(
            <div style={{animation:"fadeInUp 0.5s ease-out"}}>
              <div className="page-header"><div className="breadcrumb">ADMIN › SETTINGS</div><h2>Oracle Configuration</h2></div>
              <div className="card">
                <div className="card-title">ANTI-CHEAT PROTOCOL</div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Auto-Disqualify on Tab Switch</label><select className="form-select"><option>Yes — Immediate</option><option>Yes — After 1 Warning</option><option>No — Alert Only</option></select></div>
                  <div className="form-group"><label className="form-label">Similarity Model</label><select className="form-select"><option>CLIP ViT-B/32</option><option>SSIM Algorithm</option><option>Gemini Vision API</option></select></div>
                </div>
                <button className="btn btn-gold">💾 Save Oracle Config</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {banTarget&&<BanModal team={banTarget} onClose={()=>setBanTarget(null)} onConfirm={handleBanConfirm}/>}
      {liveScreenTarget&&<LiveScreenModal team={liveScreenTarget} onClose={()=>setLiveScreenTarget(null)}/>}
    </div>
  );
};

const useAntiCheat = (enabled, onViolation) => {
  const violationCount = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    const handleVisChange = () => { if (document.hidden) { violationCount.current++; onViolation("TAB_SWITCH", `Player switched tabs (violation #${violationCount.current})`); } };
    const handleBlur = () => onViolation("WINDOW_BLUR", "Player switched windows or minimized browser");
    const handleBeforeUnload = (e) => { onViolation("PAGE_LEAVE","Player attempted to leave the page"); e.preventDefault(); e.returnValue="The Oracle is watching."; return e.returnValue; };
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key==="t"||e.key==="n"||e.key==="w")) { e.preventDefault(); onViolation("NEW_TAB_ATTEMPT","Keyboard shortcut for new tab detected"); }
      if (e.key==="F12"||(e.ctrlKey&&e.shiftKey&&e.key==="I")) { e.preventDefault(); onViolation("DEVTOOLS_ATTEMPT","DevTools open attempt detected"); }
    };
    document.addEventListener("visibilitychange",handleVisChange);
    window.addEventListener("blur",handleBlur);
    window.addEventListener("beforeunload",handleBeforeUnload);
    document.addEventListener("contextmenu",handleContextMenu);
    document.addEventListener("keydown",handleKeyDown);
    return () => { document.removeEventListener("visibilitychange",handleVisChange); window.removeEventListener("blur",handleBlur); window.removeEventListener("beforeunload",handleBeforeUnload); document.removeEventListener("contextmenu",handleContextMenu); document.removeEventListener("keydown",handleKeyDown); };
  }, [enabled, onViolation]);
};

const Lobby = ({onSubmit}) => {
  const [step, setStep] = useState(1);
  const [teamName,setTeamName]=useState("");
  const [player1,setPlayer1]=useState("");
  const [player2,setPlayer2]=useState("");
  const [role,setRole]=useState(null);
  
  const handleIdentitySubmit = () => { if(teamName && player1 && player2) setStep(2); };
  const handleRoleSubmit = () => { if(role) onSubmit({ teamName, player1, player2, role }); };

  return (
    <div className="lobby-wrap">
      <div style={{textAlign:"center",maxWidth:800,width:"100%",animation:"fadeInUp 0.8s ease-out"}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 14,color:"var(--oracle-blue)",letterSpacing:4,marginBottom:12}}>⬡ ENTER THE LABYRINTH ⬡</div>
        <div className="lobby-title">MayaVyuh</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontSize: 21,color:"var(--parchment-dim)",fontStyle:"italic",marginBottom:48,letterSpacing:2}}>The Prompt War</div>
        
        {step === 1 ? (
          <>
            <div className="card" style={{maxWidth:500,margin:"0 auto 24px",textAlign:"left"}}>
              <div className="card-title">YOUR IDENTITY</div>
              <div className="form-group"><label className="form-label">Team Name</label><input className="form-input" value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Enter your team's name..."/></div>
              <div className="form-group"><label className="form-label">Player 1 Name (Observer for Round 1)</label><input className="form-input" value={player1} onChange={e=>setPlayer1(e.target.value)} placeholder="First player..."/></div>
              <div className="form-group"><label className="form-label">Player 2 Name (Creator for Round 1)</label><input className="form-input" value={player2} onChange={e=>setPlayer2(e.target.value)} placeholder="Second player..."/></div>
            </div>
            <button className="btn btn-gold" style={{fontSize: 17,padding:"14px 48px",letterSpacing:4}} onClick={handleIdentitySubmit} disabled={!teamName||!player1||!player2}>
              REGISTER TEAM →
            </button>
          </>
        ) : (
          <>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize: 15,color:"var(--rune-gold)",marginBottom:24}}>TEAM: {teamName.toUpperCase()}</div>
            <div className="role-cards">
              <div className={`role-card observer ${role==="observer"?"selected":""}`} onClick={()=>setRole("observer")}>
                <span style={{position:"absolute",top:12,right:12,background:"rgba(0,212,255,0.15)",color:"var(--oracle-blue)",border:"1px solid rgba(0,212,255,0.3)",padding:"3px 8px",borderRadius:2,fontFamily:"'Share Tech Mono',monospace",fontSize: 12,letterSpacing:1}}>{player1}</span>
                <span style={{fontSize:48,marginBottom:16,display:"block"}}>👁️</span>
                <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize: 21,color:"var(--oracle-blue)",marginBottom:8}}>The Observer</div>
                <p style={{fontFamily:"'IM Fell English',serif",fontSize: 16,color:"var(--parchment-dim)",fontStyle:"italic",lineHeight:1.5}}>"You shall study the sacred image and transmit its essence through words alone. Your tongue is your weapon."</p>
              </div>
              <div className={`role-card creator ${role==="creator"?"selected":""}`} onClick={()=>setRole("creator")}>
                <span style={{position:"absolute",top:12,right:12,background:"rgba(139,92,246,0.15)",color:"var(--spirit-purple)",border:"1px solid rgba(139,92,246,0.3)",padding:"3px 8px",borderRadius:2,fontFamily:"'Share Tech Mono',monospace",fontSize: 12,letterSpacing:1}}>{player2}</span>
                <span style={{fontSize:48,marginBottom:16,display:"block"}}>✨</span>
                <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize: 21,color:"var(--spirit-purple)",marginBottom:8}}>The Creator</div>
                <p style={{fontFamily:"'IM Fell English',serif",fontSize: 16,color:"var(--parchment-dim)",fontStyle:"italic",lineHeight:1.5}}>"You shall wait in the lobby until the transmission arrives, then manifest the vision through generation."</p>
              </div>
            </div>
            <button className="btn btn-gold" style={{fontSize: 17,padding:"14px 48px",letterSpacing:4}} onClick={handleRoleSubmit} disabled={!role}>
              ⚡ ENTER THE LABYRINTH
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const RuneCatcherGame = () => {
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
        <div key={r.id} className="rune-falling" style={{left: `${r.x}%`, top: `${r.y || -10}%`}} onClick={() => catchRune(r.id)}>
          {r.symbol}
        </div>
      ))}
      <div style={{position:'absolute', bottom:20, width:'100%', textAlign:'center', fontFamily:"'IM Fell English',serif", color:'var(--parchment-dim)', fontSize: 15, pointerEvents:'none'}}>
        "Catch the falling runes to prepare your mind..."
      </div>
    </div>
  );
};

const WaitingLobby = ({ teamName, otherTeams, onSkipWait }) => {
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
}


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
    const words=e.target.value.split(/\s+/);
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
        `https://picsum.photos/seed/${Date.now()}1/400/400`,
        `https://picsum.photos/seed/${Date.now()}2/400/400`,
        `https://picsum.photos/seed/${Date.now()}3/400/400`
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
          <div className={`timer-display ${timeLeft<60?"danger":""}`}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
          <div className="timer-bar"><div className={`timer-fill ${timeLeft<60?"danger":""}`} style={{width:`${pct}%`}}/></div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column"}}>
        <div style={{padding:"30px 30px 0",display:"flex",flexDirection:"column",gap:16,flex:1}}>
          <div><div className="phase-label">⬡ YOUR SPELL</div>
            <textarea className={`prompt-box ${forbidden?"forbidden":""}`} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyUp={handleKeyUp} placeholder="Craft your prompt..."/>
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
                  <img src={img} style={{width: '100%', borderRadius: 4}} alt={`R${i+1}`}/>
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
        {runes.map((r,i)=><span key={i} style={{position:"absolute",fontSize:24,color:"rgba(255,0,0,0.15)",animation:`runeFloat 3s ease-in-out infinite`,animationDelay:`${i*0.3}s`,left:`${Math.random()*90+5}%`,top:`${Math.random()*90+5}%`}}>{r}</span>)}
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
        {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ"].map((r,i)=><span key={i} className="bg-rune" style={{left:`${[5,15,30,50,65,75,85,95][i]}%`,top:`${[10,60,20,80,30,70,15,50][i]}%`,animationDelay:`${i*0.8}s`,animationDuration:`${5+i}s`}}>{r}</span>)}
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
            {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ"].map((r,i)=><span key={i} className="bg-rune" style={{left:`${[5,15,30,50,65,75,85,95][i]}%`,top:`${[10,60,20,80,30,70,15,50][i]}%`,animationDelay:`${i*0.8}s`,animationDuration:`${5+i}s`}}>{r}</span>)}
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
