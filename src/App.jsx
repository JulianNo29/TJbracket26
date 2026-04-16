import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- ICONS ---
const IconTrophy = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IconLock = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconEdit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const IconUsers = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconSettings = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEye = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconChevronLeft = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>;

// 🔥 JOUW UNIEKE FIREBASE CONFIG (Automatisch ingevuld) 🔥
const firebaseConfig = {
  apiKey: "AIzaSyD4w4VeXtG5bheWjLTFkYBPXRNAyvWsnlc",
  authDomain: "tj-bracket-2026.firebaseapp.com",
  projectId: "tj-bracket-2026",
  storageBucket: "tj-bracket-2026.firebasestorage.app",
  messagingSenderId: "1094251746807",
  appId: "1:1094251746807:web:c3acefbf558862645f4af2",
  measurementId: "G-GP0CXLQK0C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DATA STRUCTURES ---
const initialMatchups = {
  e1: { id: 'e1', round: 1, conf: 'East', seed1: 1, seed2: 8, team1: 'Seed 1', team2: 'Seed 8', nextMatch: 'e5', nextSlot: 'team1' },
  e2: { id: 'e2', round: 1, conf: 'East', seed1: 4, seed2: 5, team1: 'Seed 4', team2: 'Seed 5', nextMatch: 'e5', nextSlot: 'team2' },
  e3: { id: 'e3', round: 1, conf: 'East', seed1: 3, seed2: 6, team1: 'Seed 3', team2: 'Seed 6', nextMatch: 'e6', nextSlot: 'team1' },
  e4: { id: 'e4', round: 1, conf: 'East', seed1: 2, seed2: 7, team1: 'Seed 2', team2: 'Seed 7', nextMatch: 'e6', nextSlot: 'team2' },
  e5: { id: 'e5', round: 2, conf: 'East', team1: 'TBD', team2: 'TBD', nextMatch: 'e7', nextSlot: 'team1' },
  e6: { id: 'e6', round: 2, conf: 'East', team1: 'TBD', team2: 'TBD', nextMatch: 'e7', nextSlot: 'team2' },
  e7: { id: 'e7', round: 3, conf: 'East', team1: 'TBD', team2: 'TBD', nextMatch: 'f1', nextSlot: 'team1' },
  w1: { id: 'w1', round: 1, conf: 'West', seed1: 1, seed2: 8, team1: 'Seed 1', team2: 'Seed 8', nextMatch: 'w5', nextSlot: 'team1' },
  w2: { id: 'w2', round: 1, conf: 'West', seed1: 4, seed2: 5, team1: 'Seed 4', team2: 'Seed 5', nextMatch: 'w5', nextSlot: 'team2' },
  w3: { id: 'w3', round: 1, conf: 'West', seed1: 3, seed2: 6, team1: 'Seed 3', team2: 'Seed 6', nextMatch: 'w6', nextSlot: 'team1' },
  w4: { id: 'w4', round: 1, conf: 'West', seed1: 2, seed2: 7, team1: 'Seed 2', team2: 'Seed 7', nextMatch: 'w6', nextSlot: 'team2' },
  w5: { id: 'w5', round: 2, conf: 'West', team1: 'TBD', team2: 'TBD', nextMatch: 'w7', nextSlot: 'team1' },
  w6: { id: 'w6', round: 2, conf: 'West', team1: 'TBD', team2: 'TBD', nextMatch: 'w7', nextSlot: 'team2' },
  w7: { id: 'w7', round: 3, conf: 'West', team1: 'TBD', team2: 'TBD', nextMatch: 'f1', nextSlot: 'team2' },
  f1: { id: 'f1', round: 4, conf: 'Finals', team1: 'East Champ', team2: 'West Champ', nextMatch: null }
};

const initialBonus = {
  mvp: '', dpy: '', roy: '', sixthMan: '', mip: '', coach: '',
  finalsMvp: '', allNba: '', cinderella: '',
  mostPointsPlayer: '', mostPointsAmount: '',
  mostDoublesPlayer: '', mostDoublesAmount: ''
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('bracket');
  const [viewingUser, setViewingUser] = useState(null); // State voor het bekijken van andermans bracket
  
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const CORRECT_PIN = 'TJBracket26!';

  const [appSettings, setAppSettings] = useState({ isLocked: false, baseTeams: initialMatchups });
  const [realResults, setRealResults] = useState({ picks: {}, bonus: initialBonus, manualPoints: {} });
  const [allUsers, setAllUsers] = useState([]);

  const [myPicks, setMyPicks] = useState({});
  const [myBonus, setMyBonus] = useState(initialBonus);
  
  const [adminTeams, setAdminTeams] = useState(initialMatchups);
  const [adminMessage, setAdminMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const settingsUnsub = onSnapshot(doc(db, 'config', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAppSettings({
          isLocked: data.isLocked || false,
          baseTeams: data.baseTeams || initialMatchups
        });
        setAdminTeams(data.baseTeams || initialMatchups);
      }
    });

    const resultsUnsub = onSnapshot(doc(db, 'config', 'realResults'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRealResults({ 
          picks: data.picks || {}, 
          bonus: data.bonus || initialBonus,
          manualPoints: data.manualPoints || {}
        });
      }
    });

    const usersUnsub = onSnapshot(collection(db, 'brackets'), (snapshot) => {
      const usersData = [];
      snapshot.forEach(doc => {
        usersData.push({ id: doc.id, ...doc.data() });
        if (doc.id === user.uid) {
          setUserName(doc.data().name || '');
          if (doc.data().picks) setMyPicks(doc.data().picks);
          if (doc.data().bonus) setMyBonus(doc.data().bonus);
        }
      });
      setAllUsers(usersData);
    });

    return () => {
      settingsUnsub();
      resultsUnsub();
      usersUnsub();
    };
  }, [user]);

  const handlePick = (matchId, winnerStr, wins1, wins2, isRealResult = false) => {
    const currentPicks = isRealResult ? { ...realResults.picks } : { ...myPicks };
    currentPicks[matchId] = {
      winner: winnerStr,
      score: `${Math.max(wins1, wins2)}-${Math.min(wins1, wins2)}`,
      wins1, 
      wins2
    };

    if (isRealResult) {
      setRealResults(prev => ({ ...prev, picks: currentPicks }));
      saveRealResults(currentPicks, realResults.bonus, realResults.manualPoints);
    } else {
      setMyPicks(currentPicks);
      saveMyBracket(userName, currentPicks, myBonus);
    }
  };

  const saveMyBracket = async (name, picks, bonus) => {
    if (!user || appSettings.isLocked) return;
    try {
      await setDoc(doc(db, 'brackets', user.uid), {
        name: name,
        picks: picks,
        bonus: bonus,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const handleSubmitBracket = async () => {
    if (!userName.trim()) {
      setSubmitStatus('error_name');
      setTimeout(() => setSubmitStatus(''), 4000);
      return;
    }
    setSubmitStatus('saving');
    await saveMyBracket(userName, myPicks, myBonus);
    setSubmitStatus('success');
    setTimeout(() => setSubmitStatus(''), 4000);
  };

  const saveRealResults = async (picks, bonus, manualPoints = realResults.manualPoints || {}) => {
    try {
      await setDoc(doc(db, 'config', 'realResults'), { picks, bonus, manualPoints });
    } catch (e) {
      console.error("Save real results error:", e);
    }
  };

  const toggleLock = async () => {
    try {
      await setDoc(doc(db, 'config', 'settings'), {
        ...appSettings,
        isLocked: !appSettings.isLocked
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminTeamChange = (matchId, teamSlot, value) => {
    setAdminTeams(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [teamSlot]: value }
    }));
  };

  const saveAdminTeams = async () => {
    setAdminMessage("Teams opslaan...");
    try {
      await setDoc(doc(db, 'config', 'settings'), {
        ...appSettings,
        baseTeams: adminTeams
      });
      setAdminMessage("Playoff Teams succesvol opgeslagen!");
      setTimeout(() => setAdminMessage(""), 4000);
    } catch (e) {
      setAdminMessage("Fout bij het opslaan van de teams.");
    }
  };

  const getDisplayTeams = (matchups, picksObj) => {
    let display = JSON.parse(JSON.stringify(matchups)); 
    const rounds = [[ 'e1','e2','e3','e4','w1','w2','w3','w4' ], [ 'e5','e6','w5','w6' ], [ 'e7','w7' ], [ 'f1' ]];
    
    for (let round of rounds) {
      for (let matchId of round) {
        if (picksObj[matchId] && picksObj[matchId].winner) {
          const m = display[matchId];
          const isTeam1 = picksObj[matchId].winner === 'team1';
          const winnerName = isTeam1 ? m.team1 : m.team2;
          const winnerSeed = isTeam1 ? m.seed1 : m.seed2;
          
          if (m.nextMatch) {
            display[m.nextMatch][m.nextSlot] = winnerName;
            const nextSeedSlot = m.nextSlot === 'team1' ? 'seed1' : 'seed2';
            display[m.nextMatch][nextSeedSlot] = winnerSeed;
          }
        }
      }
    }
    return display;
  };

  const calculatePoints = (userBracket) => {
    let pts = 0;
    const uPicks = userBracket.picks || {};
    const rPicks = realResults.picks || {};
    const uBonus = userBracket.bonus || {};
    const rBonus = realResults.bonus || {};
    const manualPts = realResults.manualPoints?.[userBracket.id] || 0;

    Object.keys(rPicks).forEach(matchId => {
      const real = rPicks[matchId];
      const guess = uPicks[matchId];
      if (real && guess) {
        if (real.winner === guess.winner) {
          pts += 2;
          if (real.score === guess.score) pts += 2;
          if (real.score === '4-0' && guess.score === '4-0') pts += 2;
        }
      }
    });

    const checkAward = (awardKey, points) => {
      if (rBonus[awardKey] && uBonus[awardKey] && rBonus[awardKey].trim().toLowerCase() === uBonus[awardKey].trim().toLowerCase()) {
        pts += points;
      }
    };

    checkAward('mvp', 2); checkAward('dpy', 2); checkAward('roy', 2);
    checkAward('sixthMan', 2); checkAward('mip', 2); checkAward('coach', 2);
    checkAward('finalsMvp', 2);

    return pts + manualPts;
  };

  const renderMatchup = (match, picksObj, isRealResultView, isReadOnly = false) => {
    const pick = picksObj[match.id] || { wins1: 0, wins2: 0 };
    const isLockedUI = appSettings.isLocked && !isRealResultView;
    const disabled = isLockedUI || isReadOnly;
    const realPick = realResults.picks[match.id];
    let containerClass = "bg-gray-800 rounded-lg p-3 mb-4 shadow-md border transition-all duration-300 ";
    let statusFeedback = null;

    if (!isRealResultView && appSettings.isLocked && realPick && realPick.winner) {
      if (pick.winner === realPick.winner) {
        if (pick.score === realPick.score) {
          containerClass += "border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.3)] bg-green-900/10";
          statusFeedback = <div className="text-center mt-2 text-xs text-green-400 font-bold bg-green-900/40 rounded py-1">🎯 Exact Goed! (+4 ptn)</div>;
        } else {
          containerClass += "border-green-600/60 shadow-[0_0_8px_rgba(34,197,94,0.15)]";
          statusFeedback = <div className="text-center mt-2 text-xs text-green-500 font-bold bg-green-900/30 rounded py-1">✅ Winnaar Goed (+2 ptn)</div>;
        }
      } else if (pick.winner) {
        containerClass += "border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.15)] bg-red-900/10";
        statusFeedback = <div className="text-center mt-2 text-xs text-red-400 font-bold bg-red-900/30 rounded py-1">❌ Verkeerd (0 ptn)</div>;
      } else {
         containerClass += "border-gray-700 opacity-60";
         statusFeedback = <div className="text-center mt-2 text-xs text-gray-500 font-bold">Niet ingevuld</div>;
      }
    } else {
      containerClass += "border-gray-700";
    }

    const setScore = (w1, w2) => {
      if (disabled) return;
      let winner = '';
      if (w1 === 4) winner = 'team1';
      if (w2 === 4) winner = 'team2';
      if (w1 > 4 || w2 > 4 || (w1 === 4 && w2 === 4)) return;
      handlePick(match.id, winner, w1, w2, isRealResultView);
    };

    const isTbd = match.team1 === 'TBD' || match.team2 === 'TBD';

    return (
      <div key={match.id} className={containerClass}>
        <div className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider flex justify-between items-center">
          <span>{match.conf} - Ronde {match.round}</span>
          {isRealResultView && realPick && realPick.winner && <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full">FINAL</span>}
        </div>
        
        <div className={`flex justify-between items-center p-2 rounded mb-1 ${pick.winner === 'team1' ? 'bg-orange-900/40 border border-orange-500' : 'bg-gray-900'}`}>
          <span className={`font-semibold ${pick.winner === 'team1' ? 'text-orange-400' : 'text-gray-200'}`}>
            {match.seed1 && <span className="text-gray-500 text-xs mr-2">{match.seed1}</span>}
            {match.team1}
          </span>
          <div className="flex space-x-1">
            {[0,1,2,3,4].map(num => (
              <button key={num} disabled={disabled || isTbd} onClick={() => setScore(num, pick.wins2 === 4 && num === 4 ? 3 : pick.wins2)}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${pick.wins1 === num ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'} ${(!disabled && !isTbd && pick.wins1 !== num) ? 'hover:bg-gray-600 cursor-pointer' : ''} ${(disabled || isTbd) ? 'cursor-not-allowed' : ''}`}>
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex justify-between items-center p-2 rounded ${pick.winner === 'team2' ? 'bg-orange-900/40 border border-orange-500' : 'bg-gray-900'}`}>
          <span className={`font-semibold ${pick.winner === 'team2' ? 'text-orange-400' : 'text-gray-200'}`}>
             {match.seed2 && <span className="text-gray-500 text-xs mr-2">{match.seed2}</span>}
             {match.team2}
          </span>
          <div className="flex space-x-1">
             {[0,1,2,3,4].map(num => (
              <button key={num} disabled={disabled || isTbd} onClick={() => setScore(pick.wins1 === 4 && num === 4 ? 3 : pick.wins1, num)}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${pick.wins2 === num ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'} ${(!disabled && !isTbd && pick.wins2 !== num) ? 'hover:bg-gray-600 cursor-pointer' : ''} ${(disabled || isTbd) ? 'cursor-not-allowed' : ''}`}>
                {num}
              </button>
            ))}
          </div>
        </div>
        
        {statusFeedback ? statusFeedback : (pick.winner && <div className="text-center mt-2 text-xs text-orange-400 font-bold">{pick.winner === 'team1' ? match.team1 : match.team2} in {pick.wins1 + pick.wins2}</div>)}
      </div>
    );
  };

  const renderBracketView = (picksObj, bonusObj, isRealResultView = false, isReadOnly = false) => {
    const displayTeams = getDisplayTeams(appSettings.baseTeams, picksObj);
    const isLockedUI = appSettings.isLocked && !isRealResultView;

    const handleBonusChange = (field, val) => {
      if (isLockedUI || isReadOnly) return;
      if (isRealResultView) {
        const newBonus = { ...realResults.bonus, [field]: val };
        setRealResults(prev => ({...prev, bonus: newBonus}));
        saveRealResults(realResults.picks, newBonus, realResults.manualPoints);
      } else {
        const newBonus = { ...myBonus, [field]: val };
        setMyBonus(newBonus);
        saveMyBracket(userName, myPicks, newBonus);
      }
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        {isLockedUI && !isReadOnly && (
          <div className="bg-green-900/30 border border-green-500 text-green-300 p-4 rounded-lg flex flex-col mb-6 shadow-lg">
            <div className="flex items-center font-bold mb-1"><IconLock className="w-5 h-5 mr-3" />Jouw bracket is succesvol ingediend!</div>
            <span className="text-xs text-green-400/80 ml-8">Je kunt nu zien hoe je presteert. Jouw foute keuzes lichten rood op, juiste keuzes groen.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-blue-800 pb-2">EASTERN CONFERENCE</h2>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400 font-semibold mt-4">Ronde 1</h3>
              {['e1','e2','e3','e4'].map(id => renderMatchup(displayTeams[id], picksObj, isRealResultView, isReadOnly))}
              <h3 className="text-sm text-gray-400 font-semibold mt-6">Ronde 2 (Semis)</h3>
              {['e5','e6'].map(id => renderMatchup(displayTeams[id], picksObj, isRealResultView, isReadOnly))}
              <h3 className="text-sm text-gray-400 font-semibold mt-6">Conference Finals</h3>
              {renderMatchup(displayTeams['e7'], picksObj, isRealResultView, isReadOnly)}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-4 border-b border-red-800 pb-2">WESTERN CONFERENCE</h2>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400 font-semibold mt-4">Ronde 1</h3>
              {['w1','w2','w3','w4'].map(id => renderMatchup(displayTeams[id], picksObj, isRealResultView, isReadOnly))}
              <h3 className="text-sm text-gray-400 font-semibold mt-6">Ronde 2 (Semis)</h3>
              {['w5','w6'].map(id => renderMatchup(displayTeams[id], picksObj, isRealResultView, isReadOnly))}
              <h3 className="text-sm text-gray-400 font-semibold mt-6">Conference Finals</h3>
              {renderMatchup(displayTeams['w7'], picksObj, isRealResultView, isReadOnly)}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-8 border-2 border-yellow-600 rounded-xl p-4 bg-yellow-900/10">
          <h2 className="text-2xl font-black text-center text-yellow-500 mb-6 flex justify-center items-center">
            <IconTrophy className="w-6 h-6 mr-2" /> NBA FINALS <IconTrophy className="w-6 h-6 ml-2" />
          </h2>
          {renderMatchup(displayTeams['f1'], picksObj, isRealResultView, isReadOnly)}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mt-12 border border-gray-700">
          <h2 className="text-xl font-bold text-orange-400 mb-6">Bonus Punten {isReadOnly && "(Officieel)"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ id: 'mvp', label: 'MVP (Regular Season)', pts: 2 }, { id: 'dpy', label: 'DPY (Regular Season)', pts: 2 }, { id: 'roy', label: 'ROY (Regular Season)', pts: 2 }, { id: 'sixthMan', label: '6th Man (Regular Season)', pts: 2 }, { id: 'mip', label: 'MIP (Regular Season)', pts: 2 }, { id: 'coach', label: 'Coach of the Year', pts: 2 }, { id: 'finalsMvp', label: 'Finals MVP', pts: 2 }, { id: 'cinderella', label: 'Cinderella Story (7th/8th seed in Semis)', pts: 3 }].map(award => {
              const realVal = realResults.bonus[award.id]?.trim().toLowerCase();
              const myVal = bonusObj[award.id]?.trim().toLowerCase();
              let borderClass = "border-gray-700 focus:border-orange-500";
              if (!isRealResultView && appSettings.isLocked && realVal) {
                if (myVal === realVal) borderClass = "border-green-500 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
                else if (myVal) borderClass = "border-red-500 text-red-400 line-through opacity-70";
              }
              return (
                <div key={award.id} className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">{award.label} <span className="text-green-400">({award.pts}ptn)</span></label>
                  <input type="text" value={bonusObj[award.id] || ''} onChange={(e) => handleBonusChange(award.id, e.target.value)} disabled={isLockedUI || isReadOnly} className={`bg-gray-900 border rounded p-2 text-white outline-none disabled:opacity-50 transition-colors ${borderClass}`} placeholder="Naam speler/team..." />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-orange-500 font-bold animate-pulse">Laden van court...</div>;

  const standings = allUsers.map(u => ({ ...u, score: calculatePoints(u) })).sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-orange-500 selection:text-white">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-600/20"><IconTrophy className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Autistische Bracket <span className="text-orange-500">TJ 2026</span></h1>
          </div>
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <button onClick={() => { setActiveTab('bracket'); setViewingUser(null); }} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center ${activeTab === 'bracket' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><IconEdit className="w-4 h-4 mr-2" /> Mijn Bracket</button>
            <button onClick={() => { setActiveTab('standings'); setViewingUser(null); }} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center ${activeTab === 'standings' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><IconUsers className="w-4 h-4 mr-2" /> Standings</button>
            <button onClick={() => { setActiveTab('admin'); setViewingUser(null); }} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center ${activeTab === 'admin' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-white'}`}><IconSettings className="w-4 h-4 mr-2" /> Admin</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'bracket' && (
          <div className="pb-12">
            <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 shadow-xl flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Jouw gegevens</h2>
                <p className="text-sm text-gray-400">Vul je naam in zodat je vrienden weten wie je bent.</p>
              </div>
              <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                <input type="text" value={userName} onChange={(e) => { setUserName(e.target.value); saveMyBracket(e.target.value, myPicks, myBonus); }} placeholder="Jouw Voornaam" className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none" />
              </div>
            </div>
            {renderBracketView(myPicks, myBonus, false)}
            
            {!appSettings.isLocked && (
              <div className="mt-12 flex flex-col items-center bg-gray-900/50 p-8 rounded-xl border border-gray-800 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">Bracket Compleet?</h3>
                <p className="text-gray-400 mb-6 text-center max-w-md">Controleer je bracket goed. Je kunt wijzigingen blijven maken totdat de Admin de brackets definitief op slot zet.</p>
                
                <button 
                  onClick={handleSubmitBracket}
                  disabled={submitStatus === 'saving'}
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-1 flex items-center disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <IconTrophy className="w-6 h-6 mr-3" /> 
                  {submitStatus === 'saving' ? 'Bezig met opslaan...' : 'Verzend Bracket'}
                </button>

                {submitStatus === 'success' && (
                  <div className="mt-4 px-4 py-2 bg-green-900/40 border border-green-500 text-green-400 font-bold rounded-lg animate-fadeIn">
                    ✅ Je bracket is succesvol verzonden!
                  </div>
                )}
                {submitStatus === 'error_name' && (
                  <div className="mt-4 px-4 py-2 bg-red-900/40 border border-red-500 text-red-400 font-bold rounded-lg animate-fadeIn">
                    ❌ Vul eerst bovenaan je naam in!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="max-w-5xl mx-auto animate-fadeIn space-y-12">
            
            {viewingUser ? (
              // DETAILS SCHERM: ANDERMANS BRACKET BEKIJKEN
              <div className="space-y-6">
                <button 
                  onClick={() => setViewingUser(null)} 
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors border border-gray-700"
                >
                  <IconChevronLeft className="w-5 h-5 mr-2" /> Terug naar klassement
                </button>
                
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl flex flex-col sm:flex-row items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">Bracket van <span className="text-orange-500">{viewingUser.name || 'Anonieme Speler'}</span></h2>
                    <p className="text-gray-400">Bekijk de voorspellingen en behaalde punten.</p>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="text-3xl font-black text-orange-500">{viewingUser.score} <span className="text-sm font-normal text-gray-500">ptn</span></div>
                  </div>
                </div>

                {/* Render de Read-Only weergave van de geselecteerde speler */}
                {renderBracketView(viewingUser.picks || {}, viewingUser.bonus || {}, false, true)}
              </div>
            ) : (
              // STANDAARD SCHERM: LEADERBOARD & MASTER BRACKET
              <>
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl max-w-3xl mx-auto">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center"><IconTrophy className="w-5 h-5 mr-2" /> Live Klassement</h2>
                    <span className="text-orange-200 text-sm font-semibold">{standings.length} deelnemers</span>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {standings.length === 0 ? <div className="p-8 text-center text-gray-500">Nog geen brackets ingevuld.</div> : standings.map((u, index) => (
                      <div key={u.id} className={`flex items-center px-6 py-4 hover:bg-gray-800/50 transition-colors ${u.id === user.uid ? 'bg-orange-900/10' : ''}`}>
                        <div className="w-8 font-black text-gray-500 text-lg">{index === 0 ? <span className="text-yellow-500">1</span> : index === 1 ? <span className="text-gray-400">2</span> : index === 2 ? <span className="text-amber-600">3</span> : index + 1}</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg flex items-center">{u.name || 'Anonieme Speler'} {u.id === user.uid && <span className="ml-2 text-[10px] bg-orange-600 px-2 py-0.5 rounded-full text-white uppercase tracking-wider">Jij</span>}</div>
                          <div className="text-xs text-gray-500">{Object.keys(u.picks || {}).length} picks ingevuld</div>
                        </div>
                        <div className="text-3xl font-black text-orange-500">{u.score} <span className="text-sm font-normal text-gray-500">ptn</span></div>
                        <button 
                          onClick={() => setViewingUser(u)} 
                          className="ml-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"
                          title="Bekijk Bracket"
                        >
                          <IconEye className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {appSettings.isLocked && (
                  <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">De Echte NBA Play-offs</h2>
                      <p className="text-gray-400">Deze bracket wordt door de Admin bijgewerkt met de daadwerkelijke uitslagen.</p>
                    </div>
                    {renderBracketView(realResults.picks, realResults.bonus, true, true)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {!isAdminAuthed ? (
              <div className="max-w-md mx-auto mt-12 bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-2xl">
                <IconLock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Admin Toegang</h2>
                <p className="text-gray-400 text-sm mb-6">Voer het wachtwoord in om de bracket uitslagen te beheren en brackets te locken.</p>
                <input type="password" value={adminPinInput} onChange={(e) => { setAdminPinInput(e.target.value); setAdminPinError(false); }} placeholder="Wachtwoord" className={`w-full bg-gray-800 border ${adminPinError ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white text-lg focus:border-orange-500 outline-none mb-4`} onKeyDown={(e) => { if (e.key === 'Enter') { if (adminPinInput === CORRECT_PIN) setIsAdminAuthed(true); else setAdminPinError(true); } }} />
                {adminPinError && <p className="text-red-500 text-sm mb-4 font-bold animate-pulse">Onjuist wachtwoord</p>}
                <button onClick={() => { if (adminPinInput === CORRECT_PIN) setIsAdminAuthed(true); else setAdminPinError(true); }} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors">Inloggen</button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center"><IconEdit className="w-5 h-5 mr-2" /> Configureer Playoff Teams</h2>
                  <p className="text-sm text-gray-400 mb-6">Vul handmatig de afkortingen in. Klik op opslaan om de wijzigingen voor iedereen live te zetten.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-blue-300 border-b border-blue-800/50 pb-2">Eastern Conference</h3>
                      {['e1','e2','e3','e4'].map(matchId => (
                        <div key={matchId} className="flex space-x-3 bg-gray-900 p-3 rounded-lg border border-gray-800">
                          <div className="flex-1"><label className="text-xs text-gray-500 block mb-1">Seed {adminTeams[matchId].seed1}</label><input type="text" value={adminTeams[matchId].team1} onChange={(e) => handleAdminTeamChange(matchId, 'team1', e.target.value.toUpperCase())} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none" /></div>
                          <div className="flex items-end pb-1 text-gray-600 font-bold text-sm">vs</div>
                          <div className="flex-1"><label className="text-xs text-gray-500 block mb-1">Seed {adminTeams[matchId].seed2}</label><input type="text" value={adminTeams[matchId].team2} onChange={(e) => handleAdminTeamChange(matchId, 'team2', e.target.value.toUpperCase())} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none" /></div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-red-300 border-b border-red-800/50 pb-2">Western Conference</h3>
                      {['w1','w2','w3','w4'].map(matchId => (
                        <div key={matchId} className="flex space-x-3 bg-gray-900 p-3 rounded-lg border border-gray-800">
                          <div className="flex-1"><label className="text-xs text-gray-500 block mb-1">Seed {adminTeams[matchId].seed1}</label><input type="text" value={adminTeams[matchId].team1} onChange={(e) => handleAdminTeamChange(matchId, 'team1', e.target.value.toUpperCase())} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-red-500 outline-none" /></div>
                          <div className="flex items-end pb-1 text-gray-600 font-bold text-sm">vs</div>
                          <div className="flex-1"><label className="text-xs text-gray-500 block mb-1">Seed {adminTeams[matchId].seed2}</label><input type="text" value={adminTeams[matchId].team2} onChange={(e) => handleAdminTeamChange(matchId, 'team2', e.target.value.toUpperCase())} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-red-500 outline-none" /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center space-x-4 pt-4 border-t border-blue-800/50">
                    <button onClick={saveAdminTeams} className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg">Teams Opslaan & Publiceren</button>
                    {adminMessage && <span className="text-blue-300 font-semibold">{adminMessage}</span>}
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center"><IconLock className="w-5 h-5 mr-2" /> Bracket Status</h2>
                  <p className="text-sm text-gray-400 mb-4">Zet de brackets op slot zodra de eerste play-off wedstrijd begint. Niemand (ook jij niet) kan zijn voorspelling daarna nog aanpassen.</p>
                  <button onClick={toggleLock} className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${appSettings.isLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>{appSettings.isLocked ? 'Brackets Ontgrendelen' : 'Brackets Definitief Locken'}</button>
                </div>

                <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-purple-400 mb-2 flex items-center"><IconTrophy className="w-5 h-5 mr-2" /> Handmatige Extra Punten</h2>
                  <p className="text-sm text-gray-400 mb-6">Voeg hier extra punten toe voor de complexe regels.</p>
                  <div className="space-y-3">
                    {allUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-800">
                        <div>
                          <span className="font-bold text-gray-200">{u.name || 'Anonieme Speler'}</span>
                          <div className="text-xs text-gray-500">Automatische score: {calculatePoints(u) - (realResults.manualPoints?.[u.id] || 0)} ptn</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Extra ptn:</span>
                          <input type="number" value={realResults.manualPoints?.[u.id] || 0} onChange={(e) => { const val = parseInt(e.target.value) || 0; const newManualPoints = { ...realResults.manualPoints, [u.id]: val }; setRealResults(prev => ({ ...prev, manualPoints: newManualPoints })); }} className="w-20 bg-gray-800 border border-purple-800/50 rounded px-3 py-1 text-white font-bold text-center focus:border-purple-500 outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => saveRealResults(realResults.picks, realResults.bonus, realResults.manualPoints)} className="mt-6 px-6 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg">Sla Handmatige Punten Op</button>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                   <h2 className="text-xl font-bold text-orange-400 mb-2">De Echte Resultaten (Master Bracket Invullen)</h2>
                   <p className="text-sm text-gray-400 mb-6">Vul hier gedurende de play-offs de werkelijke resultaten in.</p>
                   {renderBracketView(realResults.picks, realResults.bonus, true, false)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
