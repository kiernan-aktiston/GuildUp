import { useState, useEffect, useCallback, useRef } from "react";


// ══ STORAGE HELPER (localStorage for production) ══
const storage = {
  async get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return null; }
  },
  async delete(key) {
    try { localStorage.removeItem(key); return true; } catch { return null; }
  },
};

/* ═══════════════════════════════════════════════════════════════
   GUILDUP MVP v2 — Complete Flow
   Landing → Welcome → Auth → Interview → Reveal → Pay → Game
   ═══════════════════════════════════════════════════════════════ */

// ══ DATA ══
const CLS={
  warrior:{id:"warrior",name:"Warrior",icon:"⚔️",color:"#DC2626",motto:"Iron body. Iron will.",primary:"strength",eName:"Titan",eIcon:"🗡️"},
  ranger:{id:"ranger",name:"Ranger",icon:"🏹",color:"#16A34A",motto:"Always moving. Never caught.",primary:"agility",eName:"Phantom",eIcon:"🌪️"},
  sage:{id:"sage",name:"Sage",icon:"📖",color:"#7C3AED",motto:"Knowledge compounds.",primary:"intelligence",eName:"Archon",eIcon:"⚡"},
  monk:{id:"monk",name:"Monk",icon:"🕯️",color:"#0EA5E9",motto:"Still water runs deepest.",primary:"spirit",eName:"Ascendant",eIcon:"☀️"},
  rogue:{id:"rogue",name:"Rogue",icon:"🗡️",color:"#D97706",motto:"The room changes when you walk in.",primary:"charisma",eName:"Sovereign",eIcon:"👁️"},
  paladin:{id:"paladin",name:"Paladin",icon:"🛡️",color:"#E11D48",motto:"Holy warrior.",dual:["strength","spirit"],eName:"Crusader",eIcon:"⚜️"},
  warlord:{id:"warlord",name:"Warlord",icon:"👑",color:"#F59E0B",motto:"Lead from the front.",dual:["strength","charisma"],eName:"Conqueror",eIcon:"🦁"},
  assassin:{id:"assassin",name:"Assassin",icon:"🎯",color:"#10B981",motto:"Three steps ahead.",dual:["agility","intelligence"],eName:"Specter",eIcon:"💀"},
  merchant:{id:"merchant",name:"Merchant",icon:"💎",color:"#F97316",motto:"Every interaction is a transaction.",dual:["intelligence","charisma"],eName:"Mogul",eIcon:"🏛️"},
  oracle:{id:"oracle",name:"Oracle",icon:"🔮",color:"#8B5CF6",motto:"Sees what others cannot.",dual:["intelligence","spirit"],eName:"Prophet",eIcon:"🌌"},
  templar:{id:"templar",name:"Templar",icon:"⛪",color:"#0284C7",motto:"Faith that moves rooms.",dual:["spirit","charisma"],eName:"Hierarch",eIcon:"✝️"},
};
const STATS=["strength","agility","intelligence","spirit","charisma"];
const SM={strength:{icon:"💪",label:"STR",name:"Strength",color:"#DC2626"},agility:{icon:"🏃",label:"AGI",name:"Agility",color:"#16A34A"},intelligence:{icon:"🧠",label:"INT",name:"Intelligence",color:"#7C3AED"},spirit:{icon:"🕯️",label:"SPI",name:"Spirit",color:"#0EA5E9"},charisma:{icon:"✨",label:"CHA",name:"Charisma",color:"#D97706"}};
const TITLES=[{l:1,t:"Peasant"},{l:3,t:"Initiate"},{l:5,t:"Apprentice"},{l:8,t:"Journeyman"},{l:12,t:"Adept"},{l:16,t:"Veteran"},{l:20,t:"Elite"},{l:25,t:"Champion"},{l:30,t:"Master"},{l:40,t:"Grandmaster"},{l:50,t:"Legend"},{l:65,t:"Mythic"},{l:80,t:"Transcendent"},{l:100,t:"Apex"}];
function getTitle(l){let t=TITLES[0];for(const x of TITLES)if(l>=x.l)t=x;return t.t;}
function xpFor(l){return Math.floor(60+40*l+5*Math.pow(l,1.5));}
function seeded(s){let x=Math.sin(s)*10000;return x-Math.floor(x);}
function todayKey(){const d=new Date();return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function weekKey(){const d=new Date();const day=d.getDay();const diff=d.getDate()-day+(day===0?-6:1);const m=new Date(d);m.setDate(diff);return`${m.getFullYear()}-${m.getMonth()+1}-${m.getDate()}`;}
function isElite(g){const c=CLS[g.classId];if(!c)return false;if(c.dual)return c.dual.every(s=>(g.stats[s]||0)>=30);if(c.primary)return(g.stats[c.primary]||0)>=30;return false;}
function detClass(stats){const sorted=[...STATS].sort((a,b)=>(stats[b]||0)-(stats[a]||0));const t=sorted[0],s=sorted[1],tv=stats[t]||0,sv=stats[s]||0;if(tv>=8&&sv>=8&&(tv-sv)<=4){const p=[t,s].sort().join(",");const m={"spirit,strength":"paladin","charisma,strength":"warlord","agility,intelligence":"assassin","charisma,intelligence":"merchant","intelligence,spirit":"oracle","charisma,spirit":"templar"};if(m[p])return m[p];}return{strength:"warrior",agility:"ranger",intelligence:"sage",spirit:"monk",charisma:"rogue"}[t];}
function getCD(g){const c=CLS[g.classId];const e=isElite(g);return{name:e?c.eName:c.name,icon:e?c.eIcon:c.icon,color:c.color,motto:c.motto,isH:!!c.dual,isE:e};}

// ══ RITUALS ══
const FIVE=[
  {id:"r-str",label:"50 Pushups",desc:"Throughout the day",icon:"💪",stat:"strength",xp:10,timer:0,
    scene:{bg:"linear-gradient(180deg,#1a0808 0%,#2a1010 40%,#1a0505 100%)",emoji:"🪨",emojiSize:80,title:"The Boulder",subtitle:"Like Sisyphus, you push. Unlike Sisyphus, you grow.",doneEmoji:"⚔️",doneTitle:"Quest Complete",doneSubtitle:"The boulder yields to your will."},
  },
  {id:"r-agi",label:"Walk or Jog 20 Min",desc:"Any pace counts",icon:"🏃",stat:"agility",xp:10,timer:1200,
    scene:{bg:"linear-gradient(180deg,#051a0a 0%,#0a2a12 40%,#051a08 100%)",emoji:"🌲",emojiSize:80,title:"The Forest Path",subtitle:"The Ranger moves unseen through ancient woods.",doneEmoji:"🎯",doneTitle:"Three Arrows. Three Bullseyes.",doneSubtitle:"The forest bends to your stride."},
  },
  {id:"r-int",label:"Read 20 Minutes",desc:"Real book, no screens",icon:"🧠",stat:"intelligence",xp:10,timer:1200,
    scene:{bg:"linear-gradient(180deg,#0a0520 0%,#150a30 40%,#0a0518 100%)",emoji:"📜",emojiSize:80,title:"The Ancient Text",subtitle:"The Sage deciphers what lesser minds cannot.",doneEmoji:"🏔️",doneTitle:"The Tower Overlooking Mountains",doneSubtitle:"Knowledge reveals what was always there."},
  },
  {id:"r-spi",label:"Pray or Meditate 10 Min",desc:"Full presence",icon:"🕯️",stat:"spirit",xp:10,timer:600,
    scene:{bg:"linear-gradient(180deg,#0a0a1a 0%,#0f0f2a 40%,#080818 100%)",emoji:"🕯️",emojiSize:80,title:"The Monastery",subtitle:"In candlelight, the Monk finds what noise conceals.",doneEmoji:"✨",doneTitle:"Divine Light",doneSubtitle:"A ray of light touches your shoulders."},
  },
  {id:"r-cha",label:"Reach Out to 1 Person",desc:"Text, call, or in person",icon:"✨",stat:"charisma",xp:10,timer:0,
    scene:{bg:"linear-gradient(180deg,#1a0f05 0%,#2a1a08 40%,#1a0f05 100%)",emoji:"🏪",emojiSize:80,title:"The Marketplace",subtitle:"Fortune favors the one who speaks first.",doneEmoji:"🪙",doneTitle:"Gold Earned",doneSubtitle:"Connections are the true currency."},
  },
];

// ══ DAILY QUESTS (3 per day, hidden stats, +15 XP each) ══
const DQ_POOL=[
  {text:"Complete a full weight lifting session (45+ min)",xp:15,hs:{strength:2},gold:15},
  {text:"Attend a martial arts class",xp:15,hs:{strength:1,agility:1},gold:15},
  {text:"Run 2+ miles at any pace",xp:15,hs:{agility:2},gold:15},
  {text:"Sprint intervals — 8 rounds of 30s on/off",xp:15,hs:{agility:1,strength:1},gold:15},
  {text:"Read for 30 minutes — real book, no screens",xp:15,hs:{intelligence:2},gold:15},
  {text:"Write 500+ words — journal, notes, anything",xp:15,hs:{intelligence:1,spirit:1},gold:15},
  {text:"Meditate for 20+ minutes",xp:15,hs:{spirit:2},gold:15},
  {text:"Attend a church service or spiritual gathering",xp:15,hs:{spirit:2},gold:15},
  {text:"Go on an intentional date",xp:15,hs:{charisma:2},gold:15},
  {text:"Host something — dinner, drinks, game night",xp:15,hs:{charisma:2},gold:15},
  {text:"Start conversations with 3 strangers",xp:15,hs:{charisma:1,spirit:1},gold:15},
  {text:"Cook every meal from scratch today",xp:15,hs:{intelligence:1,spirit:1},gold:15},
  {text:"Complete a bodyweight circuit",xp:15,hs:{strength:1,agility:1},gold:15},
  {text:"No social media for 24 hours",xp:15,hs:{spirit:1,intelligence:1},gold:15},
  {text:"Play a sport — basketball, tennis, anything",xp:15,hs:{agility:1,charisma:1},gold:15},
  {text:"Study a financial statement or investment",xp:15,hs:{intelligence:1,charisma:1},gold:15},
  {text:"Walk 10,000 steps today",xp:15,hs:{agility:2},gold:15},
  {text:"Do one thing that genuinely scares you",xp:15,hs:{spirit:1,charisma:1},gold:15},
  {text:"Groom with care — skincare, hair, the works",xp:15,hs:{charisma:2},gold:15},
  {text:"Full mobility routine — hips, shoulders, ankles",xp:15,hs:{agility:2},gold:15},
];

function genDailyQuests(stats){
  const seed=todayKey().split("-").reduce((a,b)=>a*31+parseInt(b),0);
  const pool=[...DQ_POOL];const picked=[];
  for(let i=0;i<3;i++){const idx=Math.floor(seeded(seed+i*17+i*i*3)*pool.length);picked.push({...pool[idx],id:`dq-${i}`});pool.splice(idx,1);}
  return picked;
}

// ══ WEEKLY QUESTS (auto-complete based on tracked completions) ══
const WEEKLY_TARGETS=[
  {text:"Complete 20 rituals this week",target:"rituals",need:20,xp:50,hs:{strength:1,agility:1,intelligence:1,spirit:1,charisma:1},gold:50},
  {text:"Complete 10 daily quests this week",target:"dailies",need:10,xp:50,hs:{strength:2,agility:2},gold:50},
  {text:"Maintain a 5-day streak",target:"streak",need:5,xp:50,hs:{spirit:2,charisma:1},gold:50},
];

// ══ GUILD CRESTS ══
const CREST_EMBLEMS=["⚔️","☠️","🔥","👙","🏈","⚽","🤖","🔮","✝️","👁️","💲"];
const CREST_EMBLEM_COLORS=["#DC2626","#16A34A","#7C3AED","#0EA5E9","#D97706","#E11D48","#F59E0B","#10B981","#F97316","#8B5CF6","#FFFFFF","#000000"];
const CREST_BG_COLORS=["#000000","#FFFFFF","#DC2626","#F59E0B","#2563EB"];
const CREST_PATTERNS=["solid","stripes","checkers"];

// ══ WELCOME SLIDES ══
const WELCOME=[
  {icon:"⚔️",title:"Your Life Is An RPG",body:"GuildUp turns real life into a game. Complete daily quests. Earn XP. Level up. Evolve your class. This isn't a habit tracker — it's a progression system for your entire life.",accent:"#c9a84c"},
  {icon:"🛡️",title:"You Are Assigned a Class",body:"Answer 6 questions honestly. Based on your real habits, you'll be assigned one of 11 classes — from Warrior to Sage to Paladin. Your class evolves as you grow. Push far enough and you unlock your Elite form.",accent:"#E11D48"},
  {icon:"💪",title:"The Five — Daily Rituals",body:"Every day, complete five science-backed rituals: pushups, walking, reading, prayer/meditation, and reaching out to someone. These are your foundation. 10 XP each. Backed by Harvard, Stanford, and decades of research.",accent:"#DC2626"},
  {icon:"📜",title:"Daily & Weekly Quests",body:"Three daily quests push you further — +15 XP each. Weekly quests auto-complete as you hit milestones. Every quest grants hidden stat points that shape who you become.",accent:"#7C3AED"},
  {icon:"🏰",title:"Build Your Guild",body:"Invite your friends. Track their class, level, and streak. Complete group quests together for bonus XP. Design a custom guild crest. The guild keeps you accountable when motivation fades.",accent:"#16A34A"},
  {icon:"🔮",title:"Coming Soon",body:"Abilities — unique powers per class. Duels — challenge guild members in Pokemon-style stat battles. Item Shop — temporary stat boosts with durability. The game is just beginning.",accent:"#8B5CF6"},
];

// ══ INTERVIEW ══
const IQ=[
  {stat:"strength",icon:"💪",q:"How often do you train — lifting, martial arts, intense exercise?",opts:[{label:"Never",val:0},{label:"Sometimes — a few times a month",val:1},{label:"Frequently — 3-4x per week",val:3},{label:"Daily — non-negotiable",val:4}]},
  {stat:"agility",icon:"🏃",q:"How much do you move — walking, running, sports?",opts:[{label:"Never — mostly sedentary",val:0},{label:"Sometimes — occasional walks",val:1},{label:"Frequently — active most days",val:3},{label:"Daily — always moving",val:4}]},
  {stat:"intelligence",icon:"🧠",q:"How often do you deliberately learn — reading, studying?",opts:[{label:"Never",val:0},{label:"Sometimes",val:1},{label:"Frequently — most weeks",val:3},{label:"Daily — every single day",val:4}]},
  {stat:"spirit",icon:"🕯️",q:"How often do you practice spiritually — prayer, meditation?",opts:[{label:"Never",val:0},{label:"Sometimes",val:1},{label:"Frequently — regular practice",val:3},{label:"Daily — my foundation",val:4}]},
  {stat:"charisma",icon:"✨",q:"How much effort into social life — dating, style, networking?",opts:[{label:"Never",val:0},{label:"Sometimes",val:1},{label:"Frequently — intentional",val:3},{label:"Daily — always connecting",val:4}]},
  {stat:null,icon:"⚡",q:"If you could master ONE area starting tomorrow?",opts:[{label:"My body",bonus:"strength",val:2},{label:"My endurance",bonus:"agility",val:2},{label:"My mind",bonus:"intelligence",val:2},{label:"My soul",bonus:"spirit",val:2},{label:"My presence",bonus:"charisma",val:2}]},
];

// ══ STORE ══
const STORE=[
  {id:"reroll",name:"Reroll Daily Quests",desc:"Get 3 new daily quests",icon:"🎲",cost:50},
  {id:"xp24",name:"XP Boost (24hr)",desc:"1.5x XP for 24 hours",icon:"⚡",cost:150},
  {id:"xp3d",name:"XP Boost (3 days)",desc:"1.5x XP for 3 days",icon:"🔥",cost:350},
  {id:"shield",name:"Streak Shield",desc:"Protect streak for 1 missed day",icon:"🛡️",cost:200},
];

const SAVE="guildup-mvp2";
const gold="#c9a84c";

// ═══════════════════ COMPONENT ═══════════════════
export default function GuildUp(){
  const[scr,setScr]=useState("loading");
  const[g,setG]=useState(null);
  const[slide,setSlide]=useState(0);
  const[qi,setQi]=useState(0);
  const[iS,setIS]=useState({strength:0,agility:0,intelligence:0,spirit:0,charisma:0});
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[uname,setUname]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[authMode,setAuthMode]=useState("signup");
  const[tab,setTab]=useState("quests");
  const[lvlUp,setLvlUp]=useState(false);
  const[activeRitual,setActiveRitual]=useState(null);
  const[timerLeft,setTimerLeft]=useState(0);
  const[timerRunning,setTimerRunning]=useState(false);
  const[ritualDone,setRitualDone]=useState(false);
  const[showReset,setShowReset]=useState(false);
  const[storeBuy,setStoreBuy]=useState(null);
  const[guildName,setGuildName]=useState("");
  const[joinCode,setJoinCode]=useState("");
  const[guildData,setGuildData]=useState(null);
  const[guildTab,setGuildTab]=useState("roster");
  // Crest
  const[crestEmb,setCrestEmb]=useState(0);
  const[crestEC,setCrestEC]=useState(0);
  const[crestBG,setCrestBG]=useState(0);
  const[crestPat,setCrestPat]=useState(0);
  const[showCrest,setShowCrest]=useState(false);

  useEffect(()=>{(async()=>{try{const r=await storage.get(SAVE);if(r?.value){setG(JSON.parse(r.value));setScr("dashboard");}else setScr("landing");}catch{setScr("landing");}})();},[]);

  // Timer
  useEffect(()=>{
    if(!timerRunning||timerLeft<=0)return;
    const t=setInterval(()=>setTimerLeft(p=>{if(p<=1){clearInterval(t);setTimerRunning(false);setRitualDone(true);return 0;}return p-1;}),1000);
    return()=>clearInterval(t);
  },[timerRunning,timerLeft]);

  const save=useCallback(async(gs)=>{setG(gs);try{await storage.set(SAVE,JSON.stringify(gs));}catch{}},[]);
  const reset=useCallback(async()=>{try{await storage.delete(SAVE);}catch{}setG(null);setScr("landing");setQi(0);setIS({strength:0,agility:0,intelligence:0,spirit:0,charisma:0});setTab("quests");setShowReset(false);setEmail("");setPass("");setUname("");},[]);

  // Guild
  const loadGuild=useCallback(async(id)=>{try{const r=await storage.get("guild:"+id);if(r?.value)setGuildData(JSON.parse(r.value));}catch{}},[]);
  const createGuild=useCallback(async()=>{
    if(!guildName.trim()||!g)return;
    const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const crest={emblem:crestEmb,emblemColor:crestEC,bgColor:crestBG,pattern:crestPat};
    const gd={id,name:guildName.trim(),crest,members:[{name:g.username,classId:g.classId,level:g.level,streak:g.streak||0,isElite:isElite(g)}]};
    try{await storage.set("guild:"+id,JSON.stringify(gd));}catch{}
    save({...g,guildId:id,crest});setGuildData(gd);setGuildName("");setShowCrest(false);
  },[g,guildName,crestEmb,crestEC,crestBG,crestPat,save]);
  const joinGuild=useCallback(async()=>{
    if(!joinCode.trim()||!g)return;
    try{const r=await storage.get("guild:"+joinCode.trim());if(!r?.value)return;
    const gd=JSON.parse(r.value);const ex=gd.members.findIndex(m=>m.name===g.username);
    const mem={name:g.username,classId:g.classId,level:g.level,streak:g.streak||0,isElite:isElite(g)};
    if(ex>=0)gd.members[ex]=mem;else gd.members.push(mem);
    await storage.set("guild:"+joinCode.trim(),JSON.stringify(gd));
    save({...g,guildId:joinCode.trim(),crest:gd.crest});setGuildData(gd);setJoinCode("");}catch{}
  },[g,joinCode,save]);
  const syncGuild=useCallback(async()=>{if(!g?.guildId)return;try{const r=await storage.get("guild:"+g.guildId);if(!r?.value)return;const gd=JSON.parse(r.value);const idx=gd.members.findIndex(m=>m.name===g.username);const mem={name:g.username,classId:g.classId,level:g.level,streak:g.streak||0,isElite:isElite(g)};if(idx>=0)gd.members[idx]=mem;else gd.members.push(mem);await storage.set("guild:"+g.guildId,JSON.stringify(gd));setGuildData(gd);}catch{}},[g]);

  // Auth
  const doAuth=()=>{
    if(authMode==="signup"){
      if(!email.includes("@")){setAuthErr("Enter a valid email");return;}
      if(pass.length<6){setAuthErr("Password must be 6+ characters");return;}
      if(uname.length<2){setAuthErr("Username required");return;}
      setAuthErr("");setScr("interview");
    } else {
      if(!email||!pass){setAuthErr("Enter email and password");return;}
      setAuthErr("Demo: use Sign Up to create account");
    }
  };

  // Interview
  const ans=useCallback((opt)=>{
    const q=IQ[qi];const ns={...iS};
    if(q.stat)ns[q.stat]=(ns[q.stat]||0)+opt.val;
    else if(opt.bonus)ns[opt.bonus]=(ns[opt.bonus]||0)+opt.val;
    setIS(ns);
    if(qi<IQ.length-1){setQi(qi+1);return;}
    const total=Object.values(ns).reduce((a,b)=>a+b,0);
    const startLvl=Math.min(25,Math.max(1,Math.round(total/1.5)));
    const gs={email,username:uname,classId:detClass(ns),stats:{...ns},level:startLvl,xp:0,totalXp:0,gold:startLvl*10+100,streak:0,bestStreak:0,ritualsDone:[],dailyDone:[],weeklyProgress:{rituals:0,dailies:0},lastDay:null,lastWeek:null,qc:0,weekRituals:0,weekDailies:0,earnedTitles:[],guildId:null,crest:null,xpBoostUntil:null,streakShields:0,dailyRerolls:0,createdAt:Date.now(),paid:false};
    save(gs);setScr("reveal");
  },[qi,iS,email,uname,save]);

  // XP helper
  const addXp=useCallback((gs,amount,hiddenStats)=>{
    const mult=(gs.xpBoostUntil&&Date.now()<gs.xpBoostUntil)?1.5:1;
    const earned=Math.floor(amount*mult);
    let xp=gs.xp+earned,lvl=gs.level,leveled=false;
    while(xp>=xpFor(lvl)){xp-=xpFor(lvl);lvl++;leveled=true;}
    gs.xp=xp;gs.level=lvl;gs.totalXp=(gs.totalXp||0)+earned;
    if(hiddenStats)for(const[s,v]of Object.entries(hiddenStats))gs.stats[s]=(gs.stats[s]||0)+v;
    gs.classId=detClass(gs.stats);
    if(leveled){setLvlUp(true);setTimeout(()=>setLvlUp(false),2500);}
    return gs;
  },[]);

  // Complete ritual
  const finishRitual=useCallback((ritual)=>{
    if(!g)return;
    const today=todayKey(),wk=weekKey();
    let gs={...g,stats:{...g.stats}};
    if(gs.lastDay!==today){gs.ritualsDone=[];gs.dailyDone=[];gs.dailyRerolls=0;}
    if(gs.lastWeek!==wk){gs.weekRituals=0;gs.weekDailies=0;}
    if((gs.ritualsDone||[]).includes(ritual.id))return;
    gs.ritualsDone=[...(gs.ritualsDone||[]),ritual.id];
    gs.gold=(gs.gold||0)+5;gs.qc=(gs.qc||0)+1;gs.lastDay=today;gs.lastWeek=wk;
    gs.weekRituals=(gs.weekRituals||0)+1;
    // Streak
    const yd=new Date();yd.setDate(yd.getDate()-1);const yk=`${yd.getFullYear()}-${yd.getMonth()+1}-${yd.getDate()}`;
    if(!gs.streak)gs.streak=1;else if(g.lastDay===yk||g.lastDay===today){if(g.lastDay!==today)gs.streak=(gs.streak||0)+1;}else gs.streak=1;
    gs.bestStreak=Math.max(gs.bestStreak||0,gs.streak);
    gs=addXp(gs,ritual.xp,{[ritual.stat]:1});
    save(gs);setActiveRitual(null);setTimerRunning(false);setRitualDone(false);
    if(gs.guildId)setTimeout(syncGuild,300);
  },[g,save,addXp,syncGuild]);

  // Complete daily quest
  const completeDQ=useCallback((quest,idx)=>{
    if(!g)return;
    const today=todayKey(),wk=weekKey();
    let gs={...g,stats:{...g.stats}};
    if(gs.lastDay!==today){gs.ritualsDone=[];gs.dailyDone=[];gs.dailyRerolls=0;}
    if(gs.lastWeek!==wk){gs.weekRituals=0;gs.weekDailies=0;}
    if((gs.dailyDone||[]).includes(idx))return;
    gs.dailyDone=[...(gs.dailyDone||[]),idx];
    gs.gold=(gs.gold||0)+(quest.gold||15);gs.qc=(gs.qc||0)+1;gs.lastDay=today;gs.lastWeek=wk;
    gs.weekDailies=(gs.weekDailies||0)+1;
    gs=addXp(gs,quest.xp,quest.hs);
    save(gs);if(gs.guildId)setTimeout(syncGuild,300);
  },[g,save,addXp,syncGuild]);

  // Weekly auto-check
  const checkWeekly=useCallback((gs)=>{
    const completed=[];
    for(const wq of WEEKLY_TARGETS){
      if(wq.target==="rituals"&&(gs.weekRituals||0)>=wq.need)completed.push(wq);
      else if(wq.target==="dailies"&&(gs.weekDailies||0)>=wq.need)completed.push(wq);
      else if(wq.target==="streak"&&(gs.streak||0)>=wq.need)completed.push(wq);
    }
    return completed;
  },[]);

  // Store
  const buyItem=useCallback((item)=>{
    if(!g||(g.gold||0)<item.cost)return;
    let gs={...g,gold:g.gold-item.cost};
    if(item.id==="reroll"){gs.dailyDone=[];gs.dailyRerolls=(gs.dailyRerolls||0)+1;}
    else if(item.id==="xp24")gs.xpBoostUntil=Date.now()+86400000;
    else if(item.id==="xp3d")gs.xpBoostUntil=Date.now()+86400000*3;
    else if(item.id==="shield")gs.streakShields=(gs.streakShields||0)+1;
    save(gs);setStoreBuy(item);setTimeout(()=>setStoreBuy(null),1500);
  },[g,save]);

  // ── Render ──
  const F=`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');`;
  const BG="linear-gradient(160deg,#07060e 0%,#0c0a16 30%,#08070d 100%)";
  const cd=g?getCD(g):{name:"",icon:"",color:"#888"};

  // ═══ LOADING ═══
  if(scr==="loading")return(<div style={{background:"#08070d",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{F}</style><p style={{color:"#222",fontFamily:"Rajdhani",letterSpacing:6}}>LOADING...</p></div>);

  // ═══ LANDING ═══
  if(scr==="landing")return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <style>{F}{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .gt{background:linear-gradient(90deg,#c9a84c,#fff8dc,#c9a84c,#fff8dc,#c9a84c);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
        .lb{cursor:pointer;padding:18px;font-family:Cinzel;font-size:14px;font-weight:700;letter-spacing:5px;text-transform:uppercase;transition:all 0.3s;width:100%;max-width:320px;text-align:center}
      `}</style>
      <div style={{animation:"fadeUp 0.8s ease-out"}}>
        <div style={{fontSize:72,marginBottom:8,animation:"float 3s ease-in-out infinite"}}>⚔️</div>
        <h1 className="gt" style={{fontFamily:"Cinzel",fontSize:"clamp(40px,10vw,64px)",fontWeight:900,margin:0,letterSpacing:8}}>GUILDUP</h1>
        <p style={{fontFamily:"Rajdhani",fontSize:13,color:"#5a4a2a",letterSpacing:8,marginTop:4,marginBottom:48}}>YOUR LIFE IS THE GAME</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
          <button className="lb" onClick={()=>{setAuthMode("signup");setScr("welcome");}} style={{background:gold,border:"none",color:"#08070d"}}>Sign Up</button>
          <button className="lb" onClick={()=>{setAuthMode("signin");setScr("auth");}} style={{background:"transparent",border:`2px solid #333`,color:"#777"}}>Sign In</button>
        </div>
      </div>
    </div>
  );

  // ═══ WELCOME SLIDES ═══
  if(scr==="welcome"){
    const s=WELCOME[slide];
    return(
      <div style={{background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",padding:0}}>
        <style>{F}{`
          @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
          .sdot{width:8px;height:8px;borderRadius:50%;cursor:pointer;transition:all 0.3s}
          .snav{cursor:pointer;background:none;border:1px solid #1a1a2a;color:#555;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all 0.2s;border-radius:4px}
          .snav:hover{border-color:${s.accent};color:${s.accent}}
          .scta{cursor:pointer;background:${gold};border:none;color:#08070d;padding:18px 48px;font-family:Cinzel;font-size:14px;font-weight:700;letter-spacing:4px;transition:all 0.3s}
          .scta:hover{box-shadow:0 0 40px ${gold}30}
          .skip{cursor:pointer;background:none;border:none;color:#333;font-family:Rajdhani;font-size:12px;letter-spacing:3px;padding:8px}
          .skip:hover{color:#666}
        `}</style>
        <div key={slide} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",maxWidth:440,margin:"0 auto",width:"100%",animation:"fadeIn 0.4s ease-out"}}>
          <div style={{fontSize:56,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>{s.icon}</div>
          <h2 style={{fontFamily:"Cinzel",fontSize:"clamp(22px,5vw,30px)",color:s.accent,margin:"0 0 8px",letterSpacing:3,fontWeight:700}}>{s.title}</h2>
          <p style={{fontFamily:"Rajdhani",fontSize:15,color:"#999",lineHeight:1.8,maxWidth:380,margin:"16px 0 0"}}>{s.body}</p>
          {slide===WELCOME.length-1&&(
            <button className="scta" onClick={()=>setScr("auth")} style={{marginTop:32}}>CREATE ACCOUNT</button>
          )}
        </div>
        <div style={{padding:"0 24px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:440,margin:"0 auto",width:"100%"}}>
          <button className="snav" onClick={()=>setSlide(Math.max(0,slide-1))} style={{opacity:slide===0?0.2:1}}>←</button>
          <div style={{display:"flex",gap:8}}>{WELCOME.map((_,i)=>(<div key={i} className="sdot" onClick={()=>setSlide(i)} style={{background:i===slide?s.accent:"#1a1a2a",width:i===slide?10:8,height:i===slide?10:8}}/>))}</div>
          {slide<WELCOME.length-1?<button className="snav" onClick={()=>setSlide(slide+1)}>→</button>:<button className="snav" onClick={()=>setScr("auth")} style={{borderColor:gold,color:gold}}>→</button>}
        </div>
        {slide<WELCOME.length-1&&<div style={{textAlign:"center",paddingBottom:16}}><button className="skip" onClick={()=>setScr("auth")}>SKIP →</button></div>}
      </div>
    );
  }

  // ═══ AUTH ═══
  if(scr==="auth")return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{F}</style>
      <div style={{maxWidth:380,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:8}}>⚔️</div>
        <h2 style={{fontFamily:"Cinzel",fontSize:28,color:"#eee",margin:"0 0 4px",letterSpacing:4}}>{authMode==="signup"?"Create Account":"Sign In"}</h2>
        <p style={{fontFamily:"Rajdhani",fontSize:12,color:"#555",letterSpacing:4,marginBottom:28}}>{authMode==="signup"?"BEGIN YOUR JOURNEY":"WELCOME BACK"}</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,textAlign:"left"}}>
          <div>
            <label style={{fontFamily:"Rajdhani",fontSize:12,color:"#888",letterSpacing:3,display:"block",marginBottom:6}}>EMAIL</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={{background:"#0b0a14",border:"1px solid #222",color:"#ddd",padding:"14px 18px",fontFamily:"Rajdhani",fontSize:15,width:"100%",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div>
            <label style={{fontFamily:"Rajdhani",fontSize:12,color:"#888",letterSpacing:3,display:"block",marginBottom:6}}>PASSWORD</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="6+ characters" style={{background:"#0b0a14",border:"1px solid #222",color:"#ddd",padding:"14px 18px",fontFamily:"Rajdhani",fontSize:15,width:"100%",outline:"none",boxSizing:"border-box"}}/>
          </div>
          {authMode==="signup"&&<div>
            <label style={{fontFamily:"Rajdhani",fontSize:12,color:"#888",letterSpacing:3,display:"block",marginBottom:6}}>USERNAME</label>
            <input type="text" value={uname} onChange={e=>setUname(e.target.value)} placeholder="Display name" style={{background:"#0b0a14",border:"1px solid #222",color:"#ddd",padding:"14px 18px",fontFamily:"Rajdhani",fontSize:15,width:"100%",outline:"none",boxSizing:"border-box"}}/>
          </div>}
          {authErr&&<p style={{fontFamily:"Rajdhani",fontSize:13,color:"#DC2626",margin:0}}>{authErr}</p>}
          <button onClick={doAuth} style={{cursor:"pointer",background:gold,border:"none",color:"#08070d",padding:"16px",fontFamily:"Cinzel",fontSize:14,fontWeight:700,letterSpacing:4,width:"100%",marginTop:4}}>{authMode==="signup"?"CREATE ACCOUNT":"SIGN IN"}</button>
          <button onClick={()=>{setAuthMode(authMode==="signup"?"signin":"signup");setAuthErr("");}} style={{cursor:"pointer",background:"none",border:"none",color:"#555",fontFamily:"Rajdhani",fontSize:13,letterSpacing:2,padding:8}}>
            {authMode==="signup"?"Already have an account? Sign In":"Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );

  // ═══ INTERVIEW ═══
  if(scr==="interview"){const q=IQ[qi];return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px"}}>
      <style>{F}{`@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.qo{cursor:pointer;background:#0b0a14;border:1px solid #1a1a2a;padding:16px 20px;font-family:Rajdhani;font-size:15px;color:#aaa;text-align:left;width:100%;transition:all 0.2s;line-height:1.4;box-sizing:border-box}.qo:hover{border-color:${gold};color:${gold};background:#0f0e0a;transform:translateX(4px)}`}</style>
      <div key={qi} style={{animation:"fadeIn 0.3s ease-out",maxWidth:460,width:"100%"}}>
        <div style={{height:2,background:"#15142a",borderRadius:1,marginBottom:8}}><div style={{height:"100%",width:`${(qi/IQ.length)*100}%`,background:`linear-gradient(90deg,${gold},#e8d48b)`,transition:"width 0.4s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:28}}><span style={{fontFamily:"Rajdhani",fontSize:11,color:"#444",letterSpacing:4}}>{q.stat?SM[q.stat].name.toUpperCase():"TIEBREAKER"}</span><span style={{fontFamily:"Rajdhani",fontSize:11,color:"#444"}}>{qi+1}/{IQ.length}</span></div>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36,marginBottom:10}}>{q.icon}</div><h3 style={{fontFamily:"Cinzel",fontSize:18,color:"#ddd",margin:0,lineHeight:1.5,fontWeight:400}}>{q.q}</h3></div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{q.opts.map((o,i)=>(<button key={i} className="qo" onClick={()=>ans(o)}>{o.label}</button>))}</div>
      </div>
    </div>
  );}

  // ═══ REVEAL ═══
  if(scr==="reveal"&&g){const d=getCD(g);return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <style>{F}{`@keyframes pop{0%{transform:scale(0.4);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes glow{0%,100%{box-shadow:0 0 20px ${d.color}15}50%{box-shadow:0 0 50px ${d.color}30}}`}</style>
      <div style={{animation:"fadeUp 0.5s ease-out"}}>
        <div style={{animation:"glow 2.5s ease-in-out infinite",background:"#0c0b16",border:`1px solid ${d.color}33`,padding:"40px 36px",maxWidth:380,margin:"0 auto"}}>
          <div style={{animation:"pop 0.6s ease-out",fontSize:72,marginBottom:12}}>{d.icon}</div>
          <h2 style={{fontFamily:"Cinzel",fontSize:28,color:d.color,margin:"0 0 8px",letterSpacing:4}}>{d.name}</h2>
          <p style={{fontFamily:"Rajdhani",fontSize:13,color:"#666",fontStyle:"italic"}}>"{d.motto}"</p>
          <div style={{borderTop:"1px solid #15142a",paddingTop:16,marginTop:20}}>
            <p style={{fontFamily:"Cinzel",fontSize:44,color:gold,margin:0,fontWeight:900}}>{g.level}</p>
            <p style={{fontFamily:"Rajdhani",fontSize:12,color:"#666",letterSpacing:3}}>{getTitle(g.level)}</p>
          </div>
        </div>
        <button onClick={()=>setScr("payment")} style={{cursor:"pointer",background:`${d.color}22`,border:`2px solid ${d.color}`,color:d.color,padding:"16px 48px",fontFamily:"Cinzel",fontSize:14,fontWeight:700,letterSpacing:4,marginTop:28,transition:"all 0.3s"}}>Continue</button>
      </div>
    </div>
  );}

  // ═══ PAYMENT ═══
  if(scr==="payment"&&g){const d=getCD(g);return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{F}</style>
      <div style={{maxWidth:380,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>{d.icon}</div>
        <h2 style={{fontFamily:"Cinzel",fontSize:22,color:"#eee",letterSpacing:3,margin:"0 0 24px"}}>Unlock Your Journey</h2>
        <div style={{background:"#0c0b16",border:`1px solid ${gold}33`,padding:24,marginBottom:16,textAlign:"left"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <p style={{fontFamily:"Cinzel",fontSize:16,color:gold,letterSpacing:3,margin:0}}>HERO MODE</p>
            <p style={{fontFamily:"Space Mono",fontSize:28,color:"#eee",margin:"8px 0 2px",fontWeight:700}}>$9.99</p>
            <p style={{fontFamily:"Rajdhani",fontSize:12,color:"#555"}}>one-time · optional monthly later</p>
          </div>
          {["5 Daily Rituals with timers","3 Daily Quests","Weekly auto-quests","Guild system + crest creator","Class evolution + Elite forms","XP boosts & streak shields"].map(f=>(<div key={f} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0"}}><span style={{color:gold,fontSize:12}}>✓</span><span style={{fontFamily:"Rajdhani",fontSize:14,color:"#aaa"}}>{f}</span></div>))}
        </div>
        <button onClick={()=>{save({...g,paid:true});setScr("dashboard");}} style={{cursor:"pointer",background:gold,border:"none",color:"#08070d",padding:"16px",fontFamily:"Cinzel",fontWeight:700,letterSpacing:4,width:"100%",fontSize:14}}>ACTIVATE — $9.99</button>
        <button onClick={()=>{save({...g,paid:false});setScr("dashboard");}} style={{cursor:"pointer",background:"none",border:"1px solid #222",color:"#555",padding:"12px",width:"100%",marginTop:8,fontFamily:"Rajdhani",fontSize:12,letterSpacing:3}}>SKIP — FREE ACCESS</button>
      </div>
    </div>
  );}

  // ═══ RITUAL PAGE ═══
  if(scr==="ritual"&&activeRitual){
    const r=activeRitual;const s=r.scene;
    const done=ritualDone||(r.timer===0);
    return(
      <div style={{background:s.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",position:"relative"}}>
        <style>{F}{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes doneReveal{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
        {/* Back button */}
        <button onClick={()=>{setScr("dashboard");setActiveRitual(null);setTimerRunning(false);setRitualDone(false);}} style={{position:"absolute",top:20,left:20,cursor:"pointer",background:"none",border:"1px solid #333",color:"#666",padding:"6px 14px",fontFamily:"Rajdhani",fontSize:12,letterSpacing:2}}>← QUIT</button>

        {!done&&!ritualDone?(
          <div style={{animation:"fadeIn 0.6s ease-out"}}>
            <div style={{fontSize:s.emojiSize,marginBottom:20,animation:"float 4s ease-in-out infinite"}}>{s.emoji}</div>
            <h2 style={{fontFamily:"Cinzel",fontSize:24,color:"#eee",margin:"0 0 8px",letterSpacing:3}}>{s.title}</h2>
            <p style={{fontFamily:"Rajdhani",fontSize:14,color:"#888",maxWidth:300,lineHeight:1.7,marginBottom:32}}>{s.subtitle}</p>
            {r.timer>0&&timerRunning&&timerLeft>0&&(
              <div style={{marginBottom:24}}>
                <p style={{fontFamily:"Space Mono",fontSize:48,color:"#eee",margin:0}}>{Math.floor(timerLeft/60)}:{String(timerLeft%60).padStart(2,"0")}</p>
                <p style={{fontFamily:"Rajdhani",fontSize:11,color:"#555",letterSpacing:3,marginTop:4}}>REMAIN PRESENT</p>
              </div>
            )}
            {r.timer>0&&!timerRunning&&!ritualDone&&(
              <button onClick={()=>{setTimerLeft(r.timer);setTimerRunning(true);}} style={{cursor:"pointer",background:"#ffffff11",border:"2px solid #ffffff33",color:"#eee",padding:"16px 48px",fontFamily:"Cinzel",fontSize:14,fontWeight:700,letterSpacing:4}}>START</button>
            )}
            {r.timer===0&&(
              <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
                <button onClick={()=>finishRitual(r)} style={{cursor:"pointer",background:"#ffffff11",border:"2px solid #ffffff33",color:"#eee",padding:"16px 48px",fontFamily:"Cinzel",fontSize:14,fontWeight:700,letterSpacing:4,minWidth:200}}>COMPLETE</button>
              </div>
            )}
          </div>
        ):(
          <div style={{animation:"doneReveal 0.6s ease-out"}}>
            <div style={{fontSize:80,marginBottom:16}}>{s.doneEmoji}</div>
            <h2 style={{fontFamily:"Cinzel",fontSize:24,color:gold,margin:"0 0 8px",letterSpacing:3}}>{s.doneTitle}</h2>
            <p style={{fontFamily:"Rajdhani",fontSize:14,color:"#888",marginBottom:8}}>{s.doneSubtitle}</p>
            <p style={{fontFamily:"Cinzel",fontSize:32,color:gold,margin:"16px 0",fontWeight:900}}>+{r.xp} XP</p>
            <button onClick={()=>finishRitual(r)} style={{cursor:"pointer",background:gold,border:"none",color:"#08070d",padding:"16px 48px",fontFamily:"Cinzel",fontSize:14,fontWeight:700,letterSpacing:4}}>CLAIM REWARD</button>
          </div>
        )}
      </div>
    );
  }

  // ═══ DASHBOARD ═══
  if(scr==="dashboard"&&g){
    const today=todayKey(),wk=weekKey();
    const rits=g.lastDay===today?(g.ritualsDone||[]):[];
    const dDone=g.lastDay===today?(g.dailyDone||[]):[];
    const dqs=genDailyQuests(g.stats);
    const xpN=xpFor(g.level),xpP=Math.min((g.xp/xpN)*100,100);
    const boosted=g.xpBoostUntil&&Date.now()<g.xpBoostUntil;
    const weeklyCompleted=checkWeekly(g);

    // Crest renderer
    const renderCrest=(crest,size=48)=>{
      if(!crest)return null;
      const bgCol=CREST_BG_COLORS[crest.bgColor]||"#000";
      const pat=CREST_PATTERNS[crest.pattern];
      let bgStyle=bgCol;
      if(pat==="stripes")bgStyle=`repeating-linear-gradient(45deg,${bgCol},${bgCol} 4px,${bgCol}88 4px,${bgCol}88 8px)`;
      if(pat==="checkers")bgStyle=`repeating-conic-gradient(${bgCol} 0% 25%, ${bgCol}66 0% 50%) 0 0 / ${size/3}px ${size/3}px`;
      return(<div style={{width:size,height:size,background:bgStyle,border:"2px solid #333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0}}><span style={{filter:`drop-shadow(0 0 2px ${CREST_EMBLEM_COLORS[crest.emblemColor]})`}}>{CREST_EMBLEMS[crest.emblem]}</span></div>);
    };

    return(
      <div style={{background:BG,minHeight:"100vh",maxWidth:500,margin:"0 auto",paddingBottom:100,fontFamily:"Rajdhani,sans-serif"}}>
        <style>{F}{`
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes levelBoom{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
          @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
          .sec{animation:fadeUp 0.4s ease-out both;padding:0 16px}
          .qi{cursor:pointer;background:#0b0a14;border:1px solid #1a1a2a;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;transition:all 0.2s}
          .qi:hover:not(.qd){border-color:${cd.color}33;background:#0e0d18}
          .qd{opacity:0.4;cursor:default}
          .tb{cursor:pointer;background:none;border:none;font-family:Rajdhani;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:10px 0;color:#555;border-bottom:2px solid transparent;transition:all 0.2s;flex:1;text-align:center}
          .tb.a{color:${cd.color};border-bottom-color:${cd.color}}
          .ov{position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:200;cursor:pointer}
          .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:14px 24px;z-index:150;text-align:center;animation:slideUp 0.4s ease-out;max-width:320}
          .rbtn{cursor:pointer;background:none;border:1px solid #222;color:#555;padding:8px 16px;font-family:Rajdhani;font-size:11px;letter-spacing:2px;transition:all 0.2s}
          .rbtn:hover{border-color:#DC2626;color:#DC2626}
          .rit-btn{cursor:pointer;background:#0b0a14;border:1px solid #1a1a2a;padding:12px 14px;display:flex;gap:10px;align-items:center;transition:all 0.2s;width:100%;text-align:left}
          .rit-btn:hover:not(:disabled){border-color:${cd.color}44;background:#0e0d18}
          .rit-btn:disabled{opacity:0.35;cursor:default}
          .store-card{background:#0b0a14;border:1px solid #1a1a2a;padding:16px;display:flex;gap:12px;align-items:center;transition:all 0.2s;cursor:pointer}
          .store-card:hover{border-color:${gold}33}
        `}</style>

        {lvlUp&&(<div className="ov" onClick={()=>setLvlUp(false)}><div style={{animation:"levelBoom 0.5s ease-out",textAlign:"center"}}><div style={{fontSize:56}}>⚡</div><h2 style={{fontFamily:"Cinzel",fontSize:32,color:gold,margin:"8px 0",letterSpacing:6}}>LEVEL UP</h2><p style={{fontFamily:"Cinzel",fontSize:52,color:"#fff",margin:0,fontWeight:900}}>{g.level}</p><p style={{fontSize:14,color:"#666",marginTop:8}}>{getTitle(g.level)}</p></div></div>)}
        {storeBuy&&(<div className="toast" style={{background:"#0f0e08",border:`1px solid ${gold}33`}}><p style={{fontSize:13,color:gold,margin:0}}>{storeBuy.icon} {storeBuy.name} acquired!</p></div>)}

        {/* HEADER */}
        <div style={{padding:"16px 16px 0",position:"sticky",top:0,background:"#07060ef0",backdropFilter:"blur(12px)",zIndex:50,borderBottom:"1px solid #111"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {g.crest?renderCrest(g.crest,32):<span style={{fontSize:24}}>{cd.icon}</span>}
              <div>
                <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                  <span style={{fontFamily:"Cinzel",fontSize:15,color:"#eee"}}>Lvl {g.level}</span>
                  <span style={{fontSize:10,color:cd.color,letterSpacing:1}}>{cd.name}</span>
                  {boosted&&<span style={{fontSize:8,color:"#16A34A",background:"#16A34A15",padding:"1px 5px"}}>1.5x</span>}
                </div>
                <p style={{fontSize:10,color:"#555",margin:0}}>{getTitle(g.level)} · {g.username}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <span style={{fontFamily:"Space Mono",fontSize:12,color:gold}}>🪙{g.gold||0}</span>
              <span style={{fontFamily:"Space Mono",fontSize:11,color:"#DC2626"}}>🔥{g.streak||0}</span>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:9,color:"#333",letterSpacing:3}}>XP</span>
              <span style={{fontSize:9,color:"#333",fontFamily:"Space Mono"}}>{g.xp}/{xpN}</span>
            </div>
            <div style={{height:6,background:"#0f0e1a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${xpP}%`,background:`linear-gradient(90deg,${cd.color}aa,${cd.color})`,borderRadius:3,transition:"width 0.5s"}}/></div>
          </div>
          <div style={{display:"flex"}}>{["quests","profile","store","guild"].map(t=>(<button key={t} className={`tb ${tab===t?"a":""}`} onClick={()=>{setTab(t);if(t==="guild"&&g.guildId)loadGuild(g.guildId);}}>{t}</button>))}</div>
        </div>

        {/* ═══ QUESTS ═══ */}
        {tab==="quests"&&(<div style={{paddingTop:16}}>
          {/* THE FIVE */}
          <div className="sec">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:11,color:"#666",letterSpacing:4}}>THE FIVE — DAILY RITUALS</span>
              <span style={{fontSize:11,color:rits.length>=5?gold:"#444"}}>{rits.length}/5</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {FIVE.map(r=>{const done=rits.includes(r.id);return(
                <button key={r.id} className="rit-btn" disabled={done} onClick={()=>{if(!done){setActiveRitual(r);setRitualDone(false);setTimerRunning(false);setTimerLeft(0);setScr("ritual");}}}>
                  <div style={{width:22,height:22,border:`2px solid ${done?cd.color:"#222"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:done?`${cd.color}18`:"transparent"}}>{done&&<span style={{color:cd.color,fontSize:11}}>✓</span>}</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,color:done?"#555":"#ccc",margin:0,textDecoration:done?"line-through":"none"}}>{r.label}</p>
                    <p style={{fontSize:11,color:done?"#333":"#666",margin:0}}>{r.desc}</p>
                  </div>
                  <span style={{fontSize:11,color:done?"#333":gold,fontFamily:"Space Mono"}}>+{r.xp}</span>
                </button>
              );})}
            </div>
          </div>

          {/* DAILY QUESTS */}
          <div className="sec" style={{marginTop:22}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:11,color:"#666",letterSpacing:4}}>DAILY QUESTS</span>
              <span style={{fontSize:11,color:dDone.length>=3?gold:"#444"}}>{dDone.length}/3</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {dqs.map((q,i)=>{const done=dDone.includes(i);return(
                <div key={i} className={`qi ${done?"qd":""}`} onClick={()=>!done&&completeDQ(q,i)}>
                  <div style={{width:20,height:20,border:`2px solid ${done?cd.color:"#222"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:done?`${cd.color}18`:"transparent"}}>{done&&<span style={{color:cd.color,fontSize:11}}>✓</span>}</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,color:done?"#555":"#ccc",margin:0,lineHeight:1.4,textDecoration:done?"line-through":"none"}}>{q.text}</p>
                    <span style={{fontSize:11,color:done?"#333":cd.color}}>+{q.xp} XP · +{q.gold} 🪙</span>
                  </div>
                </div>
              );})}
            </div>
          </div>

          {/* WEEKLY QUESTS (auto-complete) */}
          <div className="sec" style={{marginTop:22}}>
            <span style={{fontSize:11,color:"#666",letterSpacing:4}}>WEEKLY QUESTS — AUTO-COMPLETE</span>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
              {WEEKLY_TARGETS.map((wq,i)=>{
                let current=0;
                if(wq.target==="rituals")current=g.weekRituals||0;
                else if(wq.target==="dailies")current=g.weekDailies||0;
                else if(wq.target==="streak")current=g.streak||0;
                const done=current>=wq.need;const pct=Math.min((current/wq.need)*100,100);
                return(
                  <div key={i} style={{background:done?"#0f0e08":"#0b0a14",border:`1px solid ${done?"#c9a84c22":"#1a1a2a"}`,padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <p style={{fontSize:13,color:done?gold:"#ccc",margin:0,textDecoration:done?"line-through":"none"}}>{wq.text}</p>
                      <span style={{fontSize:11,color:done?gold:"#555",fontFamily:"Space Mono",flexShrink:0,marginLeft:8}}>+{wq.xp}</span>
                    </div>
                    <div style={{height:4,background:"#0f0e1a",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:done?gold:"#7C3AED",borderRadius:2,transition:"width 0.5s"}}/>
                    </div>
                    <p style={{fontSize:10,color:"#444",margin:"4px 0 0"}}>{Math.min(current,wq.need)}/{wq.need}{done?" — COMPLETE":""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>)}

        {/* ═══ PROFILE ═══ */}
        {tab==="profile"&&(<div style={{paddingTop:16}}>
          <div className="sec" style={{textAlign:"center"}}>
            <div style={{width:80,height:80,borderRadius:"50%",border:`3px solid ${cd.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,background:"#0b0a14",margin:"0 auto 10px"}}>{cd.icon}</div>
            <h3 style={{fontFamily:"Cinzel",fontSize:20,color:"#eee",margin:"0 0 2px"}}>{g.username}</h3>
            <p style={{fontSize:12,color:cd.color,letterSpacing:2}}>{cd.name}</p>
            <p style={{fontSize:11,color:"#555",letterSpacing:2}}>{getTitle(g.level)} · Level {g.level}</p>
          </div>
          <div className="sec" style={{marginTop:16}}>
            <p style={{fontSize:11,color:"#666",letterSpacing:4,margin:"0 0 14px"}}>STATS</p>
            {[...STATS].sort((a,b)=>(g.stats[b]||0)-(g.stats[a]||0)).map(s=>{const v=g.stats[s]||0;const mx=Math.max(...STATS.map(st=>g.stats[st]||0),1);return(<div key={s} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#888"}}>{SM[s].icon} {SM[s].name}</span><span style={{fontSize:14,color:SM[s].color,fontWeight:700,fontFamily:"Space Mono"}}>{v}</span></div><div style={{height:4,background:"#0f0e1a",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(v/Math.max(mx*1.3,20))*100}%`,background:SM[s].color,borderRadius:2}}/></div></div>);})}
          </div>
          <div className="sec" style={{marginTop:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{l:"Quests",v:g.qc||0},{l:"Streak",v:`${g.streak||0}d`},{l:"Best",v:`${g.bestStreak||0}d`},{l:"XP",v:g.totalXp||0},{l:"Gold",v:g.gold||0},{l:"Days",v:Math.max(1,Math.ceil((Date.now()-(g.createdAt||Date.now()))/86400000))}].map(i=>(<div key={i.l} style={{background:"#0b0a14",border:"1px solid #1a1a2a",padding:"10px 8px",textAlign:"center"}}><p style={{fontFamily:"Space Mono",fontSize:15,color:"#ddd",margin:0,fontWeight:700}}>{i.v}</p><p style={{fontSize:9,color:"#555",margin:"3px 0 0"}}>{i.l}</p></div>))}
            </div>
          </div>
          <div className="sec" style={{marginTop:24,textAlign:"center"}}>
            {!showReset?<button className="rbtn" onClick={()=>setShowReset(true)}>RESET ACCOUNT</button>:(
              <div style={{background:"#140808",border:"1px solid #DC262618",padding:14}}><p style={{fontSize:12,color:"#DC2626",margin:"0 0 10px"}}>Erase everything?</p><div style={{display:"flex",gap:8,justifyContent:"center"}}><button className="rbtn" onClick={reset} style={{borderColor:"#DC2626",color:"#DC2626"}}>CONFIRM</button><button className="rbtn" onClick={()=>setShowReset(false)}>CANCEL</button></div></div>
            )}
          </div>
        </div>)}

        {/* ═══ STORE ═══ */}
        {tab==="store"&&(<div style={{paddingTop:16}}>
          <div className="sec">
            <p style={{fontSize:11,color:"#666",letterSpacing:4,margin:"0 0 16px"}}>SPEND GOLD</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {STORE.map(item=>{const ok=(g.gold||0)>=item.cost;return(
                <div key={item.id} className="store-card" onClick={()=>ok&&buyItem(item)} style={{opacity:ok?1:0.35,cursor:ok?"pointer":"default"}}>
                  <span style={{fontSize:28}}>{item.icon}</span>
                  <div style={{flex:1}}><p style={{fontSize:14,color:"#ccc",margin:0}}>{item.name}</p><p style={{fontSize:11,color:"#666",margin:0}}>{item.desc}</p></div>
                  <span style={{fontFamily:"Space Mono",fontSize:13,color:gold,fontWeight:700}}>🪙{item.cost}</span>
                </div>
              );})}
            </div>
          </div>
        </div>)}

        {/* ═══ GUILD ═══ */}
        {tab==="guild"&&(<div style={{paddingTop:16}}>
          {!g.guildId?(
            <div className="sec">
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:44,marginBottom:8}}>🏰</div>
                <h3 style={{fontFamily:"Cinzel",fontSize:18,color:"#eee",margin:"0 0 8px"}}>Join or Create a Guild</h3>
                <p style={{fontSize:13,color:"#666",lineHeight:1.6}}>Track friends, compete on leaderboards, design your crest.</p>
              </div>
              {!showCrest?(
                <div>
                  <div style={{background:"#0b0a14",border:"1px solid #1a1a2a",padding:20,marginBottom:12}}>
                    <p style={{fontSize:11,color:"#888",letterSpacing:3,margin:"0 0 12px"}}>CREATE NEW GUILD</p>
                    <input placeholder="Guild name" value={guildName} onChange={e=>setGuildName(e.target.value)} style={{background:"#08070d",border:"1px solid #222",color:"#ddd",padding:"12px 16px",fontFamily:"Rajdhani",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                    <button disabled={!guildName.trim()} onClick={()=>setShowCrest(true)} style={{cursor:guildName.trim()?"pointer":"default",background:`${cd.color}22`,border:`1px solid ${cd.color}44`,color:cd.color,padding:"10px",width:"100%",fontFamily:"Rajdhani",fontSize:13,letterSpacing:2,opacity:guildName.trim()?1:0.4}}>Design Crest →</button>
                  </div>
                  <div style={{background:"#0b0a14",border:"1px solid #1a1a2a",padding:20}}>
                    <p style={{fontSize:11,color:"#888",letterSpacing:3,margin:"0 0 12px"}}>JOIN EXISTING</p>
                    <input placeholder="Invite code" value={joinCode} onChange={e=>setJoinCode(e.target.value)} style={{background:"#08070d",border:"1px solid #222",color:"#ddd",padding:"12px 16px",fontFamily:"Rajdhani",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                    <button disabled={!joinCode.trim()} onClick={joinGuild} style={{cursor:joinCode.trim()?"pointer":"default",background:`${cd.color}22`,border:`1px solid ${cd.color}44`,color:cd.color,padding:"10px",width:"100%",fontFamily:"Rajdhani",fontSize:13,letterSpacing:2,opacity:joinCode.trim()?1:0.4}}>Join Guild</button>
                  </div>
                </div>
              ):(
                /* CREST CREATOR */
                <div style={{background:"#0b0a14",border:"1px solid #1a1a2a",padding:20}}>
                  <p style={{fontSize:11,color:"#888",letterSpacing:4,margin:"0 0 16px",textAlign:"center"}}>DESIGN YOUR CREST</p>
                  {/* Preview */}
                  <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
                    <div style={{width:100,height:100,background:(()=>{const bgCol=CREST_BG_COLORS[crestBG];const pat=CREST_PATTERNS[crestPat];if(pat==="stripes")return`repeating-linear-gradient(45deg,${bgCol},${bgCol} 6px,${bgCol}88 6px,${bgCol}88 12px)`;if(pat==="checkers")return`repeating-conic-gradient(${bgCol} 0% 25%,${bgCol}66 0% 50%) 0 0 / 20px 20px`;return bgCol;})(),border:"3px solid #444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44}}>
                      <span style={{filter:`drop-shadow(0 0 4px ${CREST_EMBLEM_COLORS[crestEC]})`}}>{CREST_EMBLEMS[crestEmb]}</span>
                    </div>
                  </div>
                  {/* Emblem */}
                  <p style={{fontSize:10,color:"#666",letterSpacing:2,margin:"0 0 8px"}}>EMBLEM</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:16}}>
                    {CREST_EMBLEMS.map((e,i)=>(<button key={i} onClick={()=>setCrestEmb(i)} style={{cursor:"pointer",width:36,height:36,background:crestEmb===i?"#222":"#111",border:`1px solid ${crestEmb===i?gold:"#1a1a2a"}`,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>))}
                  </div>
                  {/* Emblem color */}
                  <p style={{fontSize:10,color:"#666",letterSpacing:2,margin:"0 0 8px"}}>EMBLEM COLOR</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:16}}>
                    {CREST_EMBLEM_COLORS.map((c,i)=>(<button key={i} onClick={()=>setCrestEC(i)} style={{cursor:"pointer",width:28,height:28,background:c,border:`2px solid ${crestEC===i?"#fff":"#333"}`,borderRadius:2}}/>))}
                  </div>
                  {/* BG color */}
                  <p style={{fontSize:10,color:"#666",letterSpacing:2,margin:"0 0 8px"}}>BACKGROUND</p>
                  <div style={{display:"flex",gap:4,marginBottom:16}}>
                    {CREST_BG_COLORS.map((c,i)=>(<button key={i} onClick={()=>setCrestBG(i)} style={{cursor:"pointer",width:28,height:28,background:c,border:`2px solid ${crestBG===i?"#fff":"#333"}`,borderRadius:2}}/>))}
                  </div>
                  {/* Pattern */}
                  <p style={{fontSize:10,color:"#666",letterSpacing:2,margin:"0 0 8px"}}>PATTERN</p>
                  <div style={{display:"flex",gap:6,marginBottom:20}}>
                    {CREST_PATTERNS.map((p,i)=>(<button key={i} onClick={()=>setCrestPat(i)} style={{cursor:"pointer",background:crestPat===i?"#222":"#111",border:`1px solid ${crestPat===i?gold:"#1a1a2a"}`,color:crestPat===i?gold:"#666",padding:"6px 14px",fontFamily:"Rajdhani",fontSize:12,letterSpacing:1,textTransform:"capitalize"}}>{p}</button>))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setShowCrest(false)} style={{cursor:"pointer",background:"none",border:"1px solid #333",color:"#666",padding:"10px",flex:1,fontFamily:"Rajdhani",fontSize:12,letterSpacing:2}}>← BACK</button>
                    <button onClick={createGuild} style={{cursor:"pointer",background:gold,border:"none",color:"#08070d",padding:"10px",flex:2,fontFamily:"Cinzel",fontSize:13,fontWeight:700,letterSpacing:3}}>CREATE GUILD</button>
                  </div>
                </div>
              )}
            </div>
          ):(
            <div>
              <div className="sec">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {g.crest&&renderCrest(g.crest,36)}
                    <h3 style={{fontFamily:"Cinzel",fontSize:16,color:"#eee",margin:0}}>{guildData?.name||"Guild"}</h3>
                  </div>
                  <button onClick={()=>loadGuild(g.guildId)} style={{cursor:"pointer",background:"none",border:"1px solid #222",color:"#555",padding:"4px 10px",fontFamily:"Rajdhani",fontSize:10,letterSpacing:2}}>↻</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <span style={{fontSize:10,color:"#555",letterSpacing:2}}>CODE:</span>
                  <span style={{fontFamily:"Space Mono",fontSize:11,color:gold,background:`${gold}11`,padding:"2px 8px"}}>{g.guildId}</span>
                </div>
                <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a1a2a",marginBottom:12}}>
                  {["roster","leaderboard"].map(t=>(<button key={t} onClick={()=>setGuildTab(t)} style={{cursor:"pointer",background:"none",border:"none",borderBottom:guildTab===t?"2px solid #16A34A":"2px solid transparent",fontFamily:"Rajdhani",fontSize:11,letterSpacing:2,padding:"8px 0",color:guildTab===t?"#16A34A":"#555",flex:1,textAlign:"center",textTransform:"uppercase"}}>{t}</button>))}
                </div>
              </div>
              {guildData&&(<div className="sec">
                {[...guildData.members].sort((a,b)=>b.level-a.level).map((m,i)=>{const mc=CLS[m.classId];return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#0b0a14",border:"1px solid #1a1a2a",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {guildTab==="leaderboard"&&<span style={{fontFamily:"Space Mono",fontSize:13,color:i===0?gold:i===1?"#aaa":"#555",fontWeight:700}}>#{i+1}</span>}
                      <span style={{fontSize:18}}>{m.isElite?mc?.eIcon:mc?.icon}</span>
                      <div><span style={{fontSize:13,color:m.name===g.username?gold:"#ccc"}}>{m.name}</span><br/><span style={{fontSize:10,color:mc?.color}}>{m.isElite?mc?.eName:mc?.name}</span></div>
                    </div>
                    <div style={{textAlign:"right"}}><span style={{fontFamily:"Space Mono",fontSize:13,color:"#ccc"}}>Lvl {m.level}</span><br/><span style={{fontSize:10,color:"#DC2626"}}>🔥{m.streak||0}</span></div>
                  </div>
                );})}
              </div>)}
            </div>
          )}
        </div>)}
      </div>
    );
  }
  return null;
}
