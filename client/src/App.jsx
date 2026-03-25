import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { C, CLASSES, ACTIVITY_STAT_MAP, getLocalDate, getWeekStart } from "./constants";
import { xpForLevel, totalXpForLevel, statPointsForLevel, distributeStatPoints, evaluateClass, processLevelUp } from "./gameLogic";
import TabBar from "./components/TabBar";
import XPBar from "./components/XPBar";
import LandingScreen from "./components/LandingScreen";
import WelcomeSlides from "./components/WelcomeSlides";
import AuthScreen from "./components/AuthScreen";
import InterviewScreen from "./components/InterviewScreen";
import ClassRevealScreen from "./components/ClassRevealScreen";
import QuestsScreen from "./components/QuestsScreen";
import RitualDetailScreen from "./components/RitualDetailScreen";
import AvatarScreen from "./components/AvatarScreen";
import BattleScreen from "./components/BattleScreen";
import StoreScreen from "./components/StoreScreen";
import GuildScreen from "./components/GuildScreen";
import RallyAlliesFlow from "./components/RallyAlliesFlow";
import ForgeTheBodyFlow from "./components/ForgeTheBodyFlow";
import SharpenTheMindFlow from "./components/SharpenTheMindFlow";
import MeditationScreen, { getTodayMeditation } from "./components/MeditationScreen";
import StillTheSpiritFlow from "./components/StillTheSpiritFlow";
import ExploreTheLandFlow from "./components/ExploreTheLandFlow";
import LevelUpModal from "./components/LevelUpModal";
import ResetPasswordScreen from "./components/ResetPasswordScreen";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [tab, setTab] = useState("quests");
  const [showRitualDetail, setShowRitualDetail] = useState(null);
  const [authError, setAuthError] = useState("");

  // User ID from Supabase
  const [userId, setUserId] = useState(null);

  // Player state
  const [playerName, setPlayerName] = useState("Adventurer");
  const [playerClass, setPlayerClass] = useState("warrior");
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerStats, setPlayerStats] = useState({ str: 10, agi: 10, int: 10, spi: 10, cha: 10 });
  const [playerGold, setPlayerGold] = useState(100);

  // Hidden activity tally (resets on level up)
  const [activityTally, setActivityTally] = useState({ str: 0, agi: 0, int: 0, spi: 0, cha: 0 });

  // Completion tracking
  const [completedRituals, setCompletedRituals] = useState({});
  const [completedArticles, setCompletedArticles] = useState([]);

  // Inventory & equipment
  const [inventory, setInventory] = useState([]);    // array of item IDs owned
  const [equipment, setEquipment] = useState({ head: null, chest: null, gloves: null, pants: null, boots: null });

  // Daily Meditation
  const [meditationComplete, setMeditationComplete] = useState(false);
  const [meditationTitle, setMeditationTitle] = useState("");
  const [showMeditation, setShowMeditation] = useState(false);

  // Weekly ritual counts (summed from Supabase for Mon-Sun)
  const [weeklyRitualCounts, setWeeklyRitualCounts] = useState({
    "Bodyweight Workout": 0, "Walk/Jog 20min": 0, "Read 20min": 0,
    "Pray/Meditate 10min": 0, "Reach Out": 0,
  });

  // Ritual streaks (consecutive days per ritual — loaded from Supabase, defaults to 0)
  const [ritualStreaks, setRitualStreaks] = useState({
    "Bodyweight Workout": 0, "Walk/Jog 20min": 0, "Read 20min": 0,
    "Pray/Meditate 10min": 0, "Reach Out": 0,
  });

  // Level up modal
  const [levelUpData, setLevelUpData] = useState(null);

  // Guild state
  const [userGuild, setUserGuild] = useState(null);
  const [guildMembers, setGuildMembers] = useState([]);

  // Avatar photo
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Auth mode for directing to signup vs signin
  const [authMode, setAuthMode] = useState("signin");

  // Prevent double-tap on quest/ritual completion
  const processingRef = useRef(new Set());

  // Load profile from Supabase into local state
  const loadProfile = async (uid) => {
    try {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", uid).single();
      if (error || !data) return false;
      setPlayerName(data.display_name || "Adventurer");
      setPlayerClass(data.class || "warrior");

      // Recalculate correct level from total XP (fixes stale level data)
      let correctLevel = data.level || 1;
      const storedXP = data.xp || 0;
      while (storedXP >= totalXpForLevel(correctLevel + 1)) {
        correctLevel++;
      }
      if (correctLevel !== (data.level || 1)) {
        // Level was out of sync — fix it in Supabase
        console.log(`Level corrected: ${data.level} → ${correctLevel}`);
        supabase.from("profiles").update({ level: correctLevel }).eq("id", uid);
      }
      setPlayerLevel(correctLevel);
      setPlayerXP(storedXP);
      setPlayerGold(data.gold || 100);
      setPlayerStats({
        str: data.stat_str || 10, agi: data.stat_agi || 10,
        int: data.stat_int || 10, spi: data.stat_spi || 10,
        cha: data.stat_cha || 10,
      });
      setActivityTally({
        str: data.tally_str || 0, agi: data.tally_agi || 0,
        int: data.tally_int || 0, spi: data.tally_spi || 0,
        cha: data.tally_cha || 0,
      });
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      return data.onboarding_complete;
    } catch (e) {
      console.error("Failed to load profile:", e);
      return false;
    }
  };

  // Load today's completed rituals from Supabase
  const loadTodayRituals = async (uid) => {
    try {
      const today = getLocalDate();
      const { data } = await supabase
        .from("daily_rituals").select("*").eq("user_id", uid).eq("ritual_date", today).maybeSingle();
      if (data) {
        const completed = {};
        if (data.bodyweight_workout) completed["Bodyweight Workout"] = true;
        if (data.walk_jog) completed["Walk/Jog 20min"] = true;
        if (data.read_20) completed["Read 20min"] = true;
        if (data.pray_meditate) completed["Pray/Meditate 10min"] = true;
        if (data.reach_out) completed["Reach Out"] = true;
        setCompletedRituals(completed);
      }
    } catch (e) { console.error("Failed to load rituals:", e); }
  };

  // Load completed articles, inventory, equipment, and meditation status
  const loadPlayerData = async (uid) => {
    try {
      const { data } = await supabase
        .from("profiles").select("completed_articles, inventory, equipment, meditation_date, meditation_title").eq("id", uid).single();
      if (data?.completed_articles) setCompletedArticles(data.completed_articles);
      if (data?.inventory) setInventory(data.inventory);
      if (data?.equipment) setEquipment(prev => ({ ...prev, ...data.equipment }));
      // Check if today's meditation is complete
      const today = getLocalDate();
      if (data?.meditation_date === today) {
        setMeditationComplete(true);
        setMeditationTitle(data.meditation_title || "");
      }
    } catch (e) { console.error("Failed to load player data:", e); }
  };

  // Load weekly ritual counts from Supabase (Mon-Sun)
  const loadWeeklyRituals = async (uid) => {
    try {
      const weekStart = getWeekStart();
      const today = getLocalDate();
      const { data } = await supabase
        .from("daily_rituals").select("*")
        .eq("user_id", uid)
        .gte("ritual_date", weekStart)
        .lte("ritual_date", today);
      if (data && data.length > 0) {
        const counts = {
          "Bodyweight Workout": 0, "Walk/Jog 20min": 0, "Read 20min": 0,
          "Pray/Meditate 10min": 0, "Reach Out": 0,
        };
        data.forEach(row => {
          if (row.bodyweight_workout) counts["Bodyweight Workout"]++;
          if (row.walk_jog) counts["Walk/Jog 20min"]++;
          if (row.read_20) counts["Read 20min"]++;
          if (row.pray_meditate) counts["Pray/Meditate 10min"]++;
          if (row.reach_out) counts["Reach Out"]++;
        });
        setWeeklyRitualCounts(counts);
      }
    } catch (e) { console.error("Failed to load weekly rituals:", e); }
  };

  // Load guild
  const loadGuild = async (uid) => {
    try {
      const { data } = await supabase
        .from("guild_members").select("*, guilds(*)").eq("user_id", uid).maybeSingle();
      if (data) {
        setUserGuild(data);
        const { data: members } = await supabase
          .from("guild_members").select("*, profiles(display_name, class, level)")
          .eq("guild_id", data.guild_id);
        setGuildMembers(members || []);
      }
    } catch (e) { console.error("Failed to load guild:", e); }
  };

  // Streak mappings
  const STREAK_TYPE_MAP = {
    "workout": "Bodyweight Workout",
    "walk": "Walk/Jog 20min",
    "read": "Read 20min",
    "meditate": "Pray/Meditate 10min",
    "reach_out": "Reach Out",
  };
  const RITUAL_STREAK_MAP = {
    "Bodyweight Workout": "workout",
    "Walk/Jog 20min": "walk",
    "Read 20min": "read",
    "Pray/Meditate 10min": "meditate",
    "Reach Out": "reach_out",
  };

  // Load streaks from Supabase
  const loadStreaks = async (uid) => {
    try {
      const { data } = await supabase.from("streaks").select("*").eq("user_id", uid);
      if (data && data.length > 0) {
        const streaks = {};
        const today = getLocalDate();
        const yesterday = new Date(Date.now() - 86400000);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        data.forEach(row => {
          const ritualName = STREAK_TYPE_MAP[row.streak_type];
          if (ritualName) {
            if (row.last_completed_date === today || row.last_completed_date === yStr) {
              streaks[ritualName] = row.current_streak;
            } else {
              streaks[ritualName] = 0;
            }
          }
        });
        setRitualStreaks(prev => ({ ...prev, ...streaks }));
      }
    } catch (e) { console.error("Failed to load streaks:", e); }
  };

  // Update a single streak on ritual completion
  const updateStreak = async (uid, ritualName) => {
    const streakType = RITUAL_STREAK_MAP[ritualName];
    if (!streakType) return;
    const today = getLocalDate();
    const yesterday = new Date(Date.now() - 86400000);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    try {
      const { data: streak } = await supabase
        .from("streaks").select("*").eq("user_id", uid).eq("streak_type", streakType).maybeSingle();
      if (!streak) {
        await supabase.from("streaks").insert({
          user_id: uid, streak_type: streakType,
          current_streak: 1, longest_streak: 1, last_completed_date: today,
        });
        setRitualStreaks(prev => ({ ...prev, [ritualName]: 1 }));
        return;
      }
      if (streak.last_completed_date === today) return;
      let newCurrent = 1;
      if (streak.last_completed_date === yStr) {
        newCurrent = streak.current_streak + 1;
      }
      await supabase.from("streaks").update({
        current_streak: newCurrent,
        longest_streak: Math.max(newCurrent, streak.longest_streak),
        last_completed_date: today,
      }).eq("id", streak.id);
      setRitualStreaks(prev => ({ ...prev, [ritualName]: newCurrent }));
    } catch (e) { console.error("Failed to update streak:", e); }
  };

  // Track password recovery mode
  const recoveryMode = useRef(false);

  // Check for existing session on load
  useEffect(() => {
    // Check if URL contains recovery hash — DON'T clean it, Supabase needs it
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      recoveryMode.current = true;
    }

    // Subscribe to auth events FIRST — Supabase will process the hash tokens
    // and fire PASSWORD_RECOVERY when the recovery session is ready
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryMode.current = true;
        setScreen("resetPassword");
        // NOW clean the hash — session is established
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
      // Block redirects while in recovery mode
      if (recoveryMode.current) return;

      if (event === "SIGNED_IN" && session?.user) {
        // Normal sign-in — load profile
        setUserId(session.user.id);
      } else if (!session) {
        setScreen("landing");
        setUserId(null);
      }
    });

    const checkSession = async () => {
      // Wait a beat for Supabase to process hash tokens
      await new Promise(r => setTimeout(r, 300));

      // If recovery mode was set by hash detection or onAuthStateChange, skip
      if (recoveryMode.current) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const onboarded = await loadProfile(session.user.id);
        if (onboarded) {
          await loadTodayRituals(session.user.id);
          await loadWeeklyRituals(session.user.id);
          await loadGuild(session.user.id);
          await loadStreaks(session.user.id);
          await loadPlayerData(session.user.id);
          setScreen("dashboard");
        } else {
          setScreen("interviewIntro");
        }
      } else {
        setScreen("landing");
      }
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Auth handler — real Supabase
  const handleAuth = async ({ email, password, displayName, mode }) => {
    setAuthError("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName } }
        });
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
          setPlayerName(displayName || email.split("@")[0]);
          setScreen("interviewIntro");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
          const onboarded = await loadProfile(data.user.id);
          if (onboarded) {
            await loadTodayRituals(data.user.id);
            await loadWeeklyRituals(data.user.id);
            await loadGuild(data.user.id);
            await loadStreaks(data.user.id);
            await loadPlayerData(data.user.id);
            setScreen("dashboard");
          } else {
            setPlayerName(data.user.user_metadata?.display_name || email.split("@")[0]);
            setScreen("interviewIntro");
          }
        }
      }
    } catch (e) {
      setAuthError(e.message || "Authentication failed");
    }
  };

  // Sign out — real Supabase
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setScreen("landing");
    setUserId(null);
    setPlayerName("Adventurer");
    setPlayerClass("warrior");
    setPlayerLevel(1);
    setPlayerXP(0);
    setPlayerStats({ str: 10, agi: 10, int: 10, spi: 10, cha: 10 });
    setPlayerGold(100);
    setActivityTally({ str: 0, agi: 0, int: 0, spi: 0, cha: 0 });
    setCompletedRituals({});
    setMeditationComplete(false);
    setMeditationTitle("");
    setShowMeditation(false);
    setInventory([]);
    setEquipment({ head: null, chest: null, gloves: null, pants: null, boots: null });
    setWeeklyRitualCounts({ "Bodyweight Workout": 0, "Walk/Jog 20min": 0, "Read 20min": 0, "Pray/Meditate 10min": 0, "Reach Out": 0 });
    setUserGuild(null);
    setGuildMembers([]);
    setAvatarUrl(null);
    setRitualStreaks({ "Bodyweight Workout": 0, "Walk/Jog 20min": 0, "Read 20min": 0, "Pray/Meditate 10min": 0, "Reach Out": 0 });
    setTab("quests");
  };

  // Save profile to Supabase
  const saveProfile = async (updates) => {
    if (!userId) return;
    try {
      await supabase.from("profiles").update({
        ...updates, updated_at: new Date().toISOString(),
      }).eq("id", userId);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!userId || !file) return;
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      // Add cache buster
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithBust);
      saveProfile({ avatar_url: urlWithBust });
    } catch (e) {
      console.error("Failed to upload avatar:", e);
    }
  };

  const handleInterviewComplete = async (cls, level) => {
    setPlayerClass(cls);
    setPlayerLevel(level);
    const baseStats = { str: 10, agi: 10, int: 10, spi: 10, cha: 10 };
    const startBonus = (level - 1) * 2;
    const classWeights = {
      warrior: { str: 3, agi: 1, int: 0, spi: 1, cha: 0 },
      ranger: { str: 1, agi: 3, int: 1, spi: 0, cha: 0 },
      sage: { str: 0, agi: 0, int: 3, spi: 1, cha: 1 },
      monk: { str: 0, agi: 1, int: 1, spi: 3, cha: 0 },
      rogue: { str: 1, agi: 1, int: 0, spi: 0, cha: 3 },
      paladin: { str: 2, agi: 0, int: 0, spi: 2, cha: 1 },
      strategist: { str: 0, agi: 1, int: 1, spi: 0, cha: 3 },
      druid: { str: 0, agi: 2, int: 1, spi: 2, cha: 0 },
      spellblade: { str: 2, agi: 1, int: 2, spi: 0, cha: 0 },
      alchemist: { str: 0, agi: 2, int: 0, spi: 2, cha: 1 },
      warden: { str: 2, agi: 2, int: 0, spi: 1, cha: 0 },
    };
    const weights = classWeights[cls] || classWeights.warrior;
    const dist = distributeStatPoints(weights, startBonus);
    const newStats = {
      str: baseStats.str + dist.str, agi: baseStats.agi + dist.agi,
      int: baseStats.int + dist.int, spi: baseStats.spi + dist.spi,
      cha: baseStats.cha + dist.cha,
    };
    setPlayerStats(newStats);
    const startingXP = totalXpForLevel(level);
    setPlayerXP(startingXP);
    setScreen("reveal");

    // Save to Supabase
    saveProfile({
      class: cls, level, xp: startingXP, gold: 100,
      stat_str: newStats.str, stat_agi: newStats.agi,
      stat_int: newStats.int, stat_spi: newStats.spi, stat_cha: newStats.cha,
      onboarding_complete: true, display_name: playerName,
    });
  };

  const awardXP = (amount, statCategory) => {
    if (statCategory) {
      setActivityTally(prev => ({ ...prev, [statCategory]: prev[statCategory] + 1 }));
    }
    const newXP = playerXP + amount;

    // Handle multiple level-ups in a loop
    let currentLevel = playerLevel;
    let currentStats = { ...playerStats };
    let currentClass = playerClass;
    let currentTally = { ...activityTally };
    if (statCategory) currentTally[statCategory] = (currentTally[statCategory] || 0) + 1;
    let lastLevelUp = null;

    while (newXP >= totalXpForLevel(currentLevel + 1)) {
      const newLevel = currentLevel + 1;
      const oldClass = currentClass;
      const result = processLevelUp(newLevel, currentStats, currentTally);
      currentLevel = newLevel;
      currentStats = result.newStats;
      currentClass = result.newClass;
      currentTally = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };
      lastLevelUp = { level: newLevel, oldClass, newClass: result.newClass, distribution: result.distribution };
    }

    if (lastLevelUp) {
      setPlayerLevel(currentLevel);
      setPlayerStats(currentStats);
      setPlayerClass(currentClass);
      setActivityTally({ str: 0, agi: 0, int: 0, spi: 0, cha: 0 });
      setLevelUpData(lastLevelUp);

      // Persist level, stats, and class to Supabase
      if (userId) {
        saveProfile({
          level: currentLevel, class: currentClass, xp: newXP,
          stat_str: currentStats.str, stat_agi: currentStats.agi,
          stat_int: currentStats.int, stat_spi: currentStats.spi,
          stat_cha: currentStats.cha,
          tally_str: 0, tally_agi: 0, tally_int: 0, tally_spi: 0, tally_cha: 0,
        });
      }
    }
    setPlayerXP(newXP);
  };

  const handleRitualComplete = async (ritualName, rewards) => {
    const xpReward = rewards?.xp || 10;
    const goldReward = rewards?.gold || 2;
    if (completedRituals[ritualName]) return;
    if (processingRef.current.has(`ritual:${ritualName}`)) return;
    processingRef.current.add(`ritual:${ritualName}`);
    setCompletedRituals(prev => ({ ...prev, [ritualName]: true }));
    // Increment weekly count for this ritual
    setWeeklyRitualCounts(prev => ({ ...prev, [ritualName]: (prev[ritualName] || 0) + 1 }));
    const stat = ACTIVITY_STAT_MAP[ritualName] || "str";
    awardXP(xpReward, stat);
    setPlayerGold(prev => prev + goldReward);

    // Save ritual to Supabase
    if (userId) {
      const today = getLocalDate();
      const ritualColumn = {
        "Bodyweight Workout": "bodyweight_workout",
        "Walk/Jog 20min": "walk_jog",
        "Read 20min": "read_20",
        "Pray/Meditate 10min": "pray_meditate",
        "Reach Out": "reach_out",
      }[ritualName];
      if (ritualColumn) {
        await supabase.from("daily_rituals").upsert({
          user_id: userId, ritual_date: today, [ritualColumn]: true,
        }, { onConflict: "user_id,ritual_date" });
      }
      // Save XP/gold/tally to profile (use computed values to avoid stale closures)
      const newXP = playerXP + xpReward;
      const newGold = playerGold + goldReward;
      const newTally = { ...activityTally, [stat]: (activityTally[stat] || 0) + 1 };
      saveProfile({
        xp: newXP, gold: newGold,
        [`tally_${stat}`]: newTally[stat],
      });
      // Update streak for this ritual
      updateStreak(userId, ritualName);
      // Track completed article if provided
      if (rewards?.articleId) {
        const newArticles = [...completedArticles, rewards.articleId];
        setCompletedArticles(newArticles);
        supabase.from("profiles").update({ completed_articles: newArticles }).eq("id", userId);
      }
    }
  };

  // ── EQUIPMENT HANDLERS ──
  const handleBuyItem = async (itemId, price) => {
    if (inventory.includes(itemId) || playerGold < price) return;
    const newInventory = [...inventory, itemId];
    const newGold = playerGold - price;
    setInventory(newInventory);
    setPlayerGold(newGold);
    if (userId) {
      saveProfile({ gold: newGold, inventory: newInventory });
    }
  };

  const handleEquip = async (slot, itemId) => {
    const newEquipment = { ...equipment, [slot]: itemId };
    setEquipment(newEquipment);
    if (userId) {
      supabase.from("profiles").update({ equipment: newEquipment }).eq("id", userId);
    }
  };

  const handleUnequip = async (slot) => {
    const newEquipment = { ...equipment, [slot]: null };
    setEquipment(newEquipment);
    if (userId) {
      supabase.from("profiles").update({ equipment: newEquipment }).eq("id", userId);
    }
  };

  // Daily meditation completion
  const handleMeditationComplete = async (title, chestItem) => {
    setMeditationComplete(true);
    setMeditationTitle(title);
    setShowMeditation(false);

    // Add chest item to inventory if received
    if (chestItem) {
      const newInventory = [...inventory, chestItem.id];
      setInventory(newInventory);
      if (userId) {
        const today = getLocalDate();
        saveProfile({
          meditation_date: today,
          meditation_title: title,
          inventory: newInventory,
        });
      }
    } else if (userId) {
      const today = getLocalDate();
      saveProfile({
        meditation_date: today,
        meditation_title: title,
      });
    }
  };

  // Guild handlers
  const handleCreateGuild = async (name, description, crest) => {
    if (!userId) return;
    const { data: guild, error } = await supabase
      .from("guilds").insert({
        name, description, leader_id: userId,
        ...(crest ? { crest } : {}),
      }).select().single();
    if (error) throw error;
    const { error: memberErr } = await supabase
      .from("guild_members").insert({ guild_id: guild.id, user_id: userId, role: "leader" });
    if (memberErr) throw memberErr;
    setUserGuild({ guilds: guild, guild_id: guild.id });
    setGuildMembers([{ user_id: userId, role: "leader", weekly_rituals: 0, profiles: { display_name: playerName, class: playerClass, level: playerLevel } }]);
  };

  const handleJoinByCode = async (code) => {
    if (!userId) return;
    const { data: guild, error } = await supabase
      .from("guilds").select("*").eq("invite_code", code).single();
    if (error || !guild) throw new Error("Invalid invite code");
    const { error: memberErr } = await supabase
      .from("guild_members").insert({ guild_id: guild.id, user_id: userId, role: "member" });
    if (memberErr) throw memberErr;
    setUserGuild({ guilds: guild, guild_id: guild.id });
    const { data: members } = await supabase
      .from("guild_members").select("*, profiles(display_name, class, level)").eq("guild_id", guild.id);
    setGuildMembers(members || []);
  };

  const handleLeaveGuild = async () => {
    if (!userId || !userGuild) return;
    await supabase.from("guild_members").delete().eq("user_id", userId).eq("guild_id", userGuild.guild_id);
    setUserGuild(null);
    setGuildMembers([]);
  };

  const xpNeeded = xpForLevel(playerLevel);
  const rawXpInLevel = playerXP - totalXpForLevel(playerLevel);
  const xpInLevel = Math.max(0, Math.min(rawXpInLevel, xpNeeded));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; background: ${C.bg}; color: ${C.text}; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: C.bg, position: "relative" }}>
        {levelUpData && (
          <LevelUpModal
            level={levelUpData.level} oldClass={levelUpData.oldClass}
            newClass={levelUpData.newClass} distribution={levelUpData.distribution}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {screen === "loading" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.gold, letterSpacing: 2 }}>GUILDUP</div>
          </div>
        )}
        {screen === "landing" && (
          <LandingScreen
            onSignUp={() => { setAuthMode("signup"); setScreen("welcome"); }}
            onSignIn={() => { setAuthMode("signin"); setScreen("auth"); }}
          />
        )}
        {screen === "welcome" && <WelcomeSlides onComplete={() => setScreen("auth")} />}
        {screen === "auth" && <AuthScreen onAuth={handleAuth} serverError={authError} initialMode={authMode} />}
        {screen === "resetPassword" && <ResetPasswordScreen onDone={() => {
          recoveryMode.current = false;
          supabase.auth.signOut().then(() => setScreen("landing"));
        }} />}
        {screen === "interviewIntro" && (
          <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 32,
            animation: "fadeIn 0.4s ease",
          }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🎭</div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.gold, marginBottom: 16, textAlign: "center" }}>
              Your Answers Shape Your Character
            </h2>
            <p style={{ color: C.textMuted, lineHeight: 1.7, fontSize: 15, textAlign: "center", marginBottom: 40, maxWidth: 320 }}>
              11 questions. Answer honestly — your responses determine your starting class and level. Your class will evolve based on what you actually do, not just what you say.
            </p>
            <button onClick={() => setScreen("interview")} style={{
              width: "100%", maxWidth: 300, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: "#000", fontSize: 16, fontWeight: 700,
            }}>
              Begin
            </button>
          </div>
        )}
        {screen === "interview" && <InterviewScreen onComplete={handleInterviewComplete} />}
        {screen === "reveal" && (
          <ClassRevealScreen className={playerClass} startingLevel={playerLevel} onContinue={() => setScreen("dashboard")} />
        )}
        {screen === "dashboard" && (
          <>
            {showRitualDetail ? (
              showRitualDetail.name === "Reach Out" ? (
                <RallyAlliesFlow
                  playerStats={playerStats}
                  onBack={(didComplete, rewards) => {
                    if (didComplete) handleRitualComplete(showRitualDetail.name, rewards);
                    setShowRitualDetail(null);
                  }}
                />
              ) : showRitualDetail.name === "Bodyweight Workout" ? (
                <ForgeTheBodyFlow
                  playerStats={playerStats}
                  onBack={(didComplete, rewards) => {
                    if (didComplete) handleRitualComplete(showRitualDetail.name, rewards);
                    setShowRitualDetail(null);
                  }}
                />
              ) : showRitualDetail.name === "Read 20min" ? (
                <SharpenTheMindFlow
                  playerStats={playerStats}
                  completedArticles={completedArticles}
                  onBack={(didComplete, rewards) => {
                    if (didComplete) handleRitualComplete(showRitualDetail.name, rewards);
                    setShowRitualDetail(null);
                  }}
                />
              ) : showRitualDetail.name === "Pray/Meditate 10min" ? (
                <StillTheSpiritFlow
                  playerStats={playerStats}
                  onBack={(didComplete, rewards) => {
                    if (didComplete) handleRitualComplete(showRitualDetail.name, rewards);
                    setShowRitualDetail(null);
                  }}
                />
              ) : showRitualDetail.name === "Walk/Jog 20min" ? (
                <ExploreTheLandFlow
                  playerStats={playerStats}
                  onBack={(didComplete, rewards) => {
                    if (didComplete) handleRitualComplete(showRitualDetail.name, rewards);
                    setShowRitualDetail(null);
                  }}
                />
              ) : (
                <RitualDetailScreen
                  ritual={showRitualDetail}
                  onBack={(didComplete) => {
                    if (didComplete) handleRitualComplete(showRitualDetail.name);
                    setShowRitualDetail(null);
                  }}
                />
              )
            ) : (
              <>
                {tab === "quests" && !showMeditation && (
                  <QuestsScreen
                    onOpenRitual={(r) => setShowRitualDetail(r)}
                    completedRituals={completedRituals}
                    playerClass={playerClass}
                    playerLevel={playerLevel}
                    ritualStreaks={ritualStreaks}
                    weeklyRitualCounts={weeklyRitualCounts}
                    todayMeditation={getTodayMeditation(getLocalDate(), userId)}
                    meditationComplete={meditationComplete}
                    meditationTitle={meditationTitle}
                    onOpenMeditation={() => setShowMeditation(true)}
                  />
                )}
                {tab === "quests" && showMeditation && (
                  <MeditationScreen
                    meditation={getTodayMeditation(getLocalDate(), userId)}
                    playerLevel={playerLevel}
                    inventory={inventory}
                    onBack={() => setShowMeditation(false)}
                    onComplete={handleMeditationComplete}
                  />
                )}
                {tab === "avatar" && (
                  <AvatarScreen
                    playerClass={playerClass} playerLevel={playerLevel}
                    playerStats={playerStats} playerGold={playerGold}
                    playerName={playerName} onSignOut={handleSignOut}
                    avatarUrl={avatarUrl} onAvatarUpload={handleAvatarUpload}
                    inventory={inventory} equipment={equipment}
                    onEquip={handleEquip} onUnequip={handleUnequip}
                  />
                )}
                {tab === "battle" && <BattleScreen />}
                {tab === "store" && <StoreScreen playerGold={playerGold} playerLevel={playerLevel} inventory={inventory} userId={userId} onBuy={handleBuyItem} />}
                {tab === "guild" && <GuildScreen
                  userId={userId}
                  onCreateGuild={handleCreateGuild}
                  onJoinByCode={handleJoinByCode}
                  onLeaveGuild={handleLeaveGuild}
                  userGuild={userGuild}
                  guildMembers={guildMembers}
                />}
              </>
            )}
            {!showRitualDetail && <XPBar xp={xpInLevel} maxXp={xpNeeded} level={playerLevel} />}
            <TabBar active={tab} onSwitch={(t) => { setTab(t); setShowRitualDetail(null); }} />
          </>
        )}
      </div>
    </>
  );
}