function main() {
  const grid = document.getElementById("game-grid");
  const hint = document.getElementById("hint");
  const wheel = document.getElementById("color-wheel");
  const title = document.getElementById("game-title");
  const victoryOverlay = document.getElementById("victory-overlay");
  const tryAgainOverlay = document.getElementById("try-again-overlay");
  const saveButton = document.getElementById("save-palette");
  const saveButtonLose = document.getElementById("save-palette-lose");
  const infoBtn = document.getElementById("info-btn");
  const infoOverlay = document.getElementById("info-overlay");
  const closeInfo = document.getElementById("close-info");
  const loginOverlay = document.getElementById("login-overlay");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const closeLoginOverlayBtn = document.getElementById("close-login-overlay");
  const loginError = document.getElementById("login-error");
  const paletteBorder = document.getElementById("palette-border");
  const playAgainBtn = document.getElementById("play-again");
  const playAgainLoseBtn = document.getElementById("play-again-lose");
  const authStatus = document.getElementById("auth-status");
  const shareBtn = document.getElementById("share-results");
  const shareBtnLose = document.getElementById("share-results-lose");
  const statsBtn = document.getElementById("stats-btn");
  const statsOverlay = document.getElementById("stats-overlay");
  const closeStats = document.getElementById("close-stats");
  const createAccountInfo = document.getElementById("create-account-info");
  const confettiContainer = document.getElementById("confetti-container");
  const streakDisplay = document.getElementById("streak-display");
  const streakCount = document.getElementById("streak-count");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const loginDivider = document.getElementById("login-divider");

  let colors = [];
  let hiddenPattern = [];
  let currentRow = 0;
  let eliminatedColors = new Set();
  let currentScheme = "";
  let gameComplete = false;
  let isLoggedIn = false;
  let userEmail = "";
  let gameResults = [];

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  function getLocalStats() {
    const stats = localStorage.getItem('colorChaseStats');
    return stats ? JSON.parse(stats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0],
      lastPlayedDate: null
    };
  }

  function saveLocalStats(stats) {
    localStorage.setItem('colorChaseStats', JSON.stringify(stats));
  }

  function updateStatsAfterGame(won, guessCount) {
    const stats = getLocalStats();
    const today = getTodaySeed();
    
    if (stats.lastPlayedDate === today) return;
    
    stats.gamesPlayed++;
    stats.lastPlayedDate = today;
    
    if (won) {
      stats.gamesWon++;
      stats.currentStreak++;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      if (guessCount >= 1 && guessCount <= 5) {
        stats.guessDistribution[guessCount - 1]++;
      }
    } else {
      stats.currentStreak = 0;
    }
    
    saveLocalStats(stats);
    updateStreakDisplay();
  }

  function updateStreakDisplay() {
    const stats = getLocalStats();
    if (stats.currentStreak > 0 && streakDisplay && streakCount) {
      streakCount.textContent = stats.currentStreak;
      streakDisplay.classList.remove('hidden');
    }
  }

  function showStatsModal() {
    const stats = getLocalStats();
    
    document.getElementById('stat-played').textContent = stats.gamesPlayed;
    document.getElementById('stat-win-pct').textContent = stats.gamesPlayed > 0 
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
      : 0;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;
    
    const distContainer = document.getElementById('guess-distribution');
    distContainer.innerHTML = '';
    const maxGuesses = Math.max(...stats.guessDistribution, 1);
    
    stats.guessDistribution.forEach((count, i) => {
      const row = document.createElement('div');
      row.className = 'guess-row';
      row.innerHTML = `
        <span class="guess-num">${i + 1}</span>
        <div class="guess-bar" style="width: ${Math.max((count / maxGuesses) * 100, 8)}%">${count}</div>
      `;
      distContainer.appendChild(row);
    });
    
    statsOverlay.classList.remove('hidden');
    statsOverlay.style.display = 'flex';
  }

  function hideStatsModal() {
    statsOverlay.classList.add('hidden');
    statsOverlay.style.display = 'none';
  }

  function generateShareText() {
    const today = getTodaySeed();
    const won = gameComplete && currentRow < 5;
    const guessNum = won ? currentRow + 1 : 'X';
    
    let grid = '';
    const rows = document.getElementsByClassName('row');
    for (let i = 0; i <= Math.min(currentRow, 4); i++) {
      const tiles = rows[i].getElementsByClassName('tile');
      let rowStr = '';
      for (let tile of tiles) {
        if (tile.classList.contains('correct')) rowStr += '🟩';
        else if (tile.classList.contains('misplaced')) rowStr += '🟧';
        else if (tile.classList.contains('wrong')) rowStr += '⬛';
        else rowStr += '⬜';
      }
      grid += rowStr + '\n';
    }
    
    return `Color Chase ${today}\n${guessNum}/5\n\n${grid}`;
  }

  async function shareResults(e) {
    const text = generateShareText();
    const btn = e.target;
    
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = originalText, 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = originalText, 2000);
    }
  }

  function launchConfetti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    
    const paletteColors = hiddenPattern.length > 0 ? hiddenPattern : colors.slice(0, 5);
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = paletteColors[i % paletteColors.length];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
      confettiContainer.appendChild(confetti);
    }
    
    setTimeout(() => {
      confettiContainer.innerHTML = '';
    }, 4000);
  }

  function checkFirstTimeVisitor() {
    const hasVisited = localStorage.getItem('colorChaseVisited');
    if (!hasVisited) {
      localStorage.setItem('colorChaseVisited', 'true');
      setTimeout(() => {
        infoOverlay.classList.remove('hidden');
        infoOverlay.style.display = 'flex';
      }, 500);
    }
  }

  function playAddSound() {
    const t = audioContext.currentTime;
    const bufferSize = audioContext.sampleRate * 0.15;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.12);
    filter.Q.setValueAtTime(1, t);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.15, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start(t);
    noise.stop(t + 0.12);
  }

  function playRemoveSound() {
    const t = audioContext.currentTime;
    
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.05);
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1800, t);
    osc1.frequency.exponentialRampToValueAtTime(600, t + 0.03);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3200, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.02);
    
    gainNode.gain.setValueAtTime(0.25, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.08);
    osc2.stop(t + 0.08);
  }

  function spinWheel() {
    if (!wheel) return;
    wheel.style.transition = 'transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheel.style.transform = 'rotate(1080deg)';
    setTimeout(() => {
      wheel.style.transition = 'none';
      wheel.style.transform = 'rotate(0deg)';
    }, 2000);
  }

  function getTodaySeed() {
    const now = new Date();
    const resetHour = 9;
    let seedDate = new Date(now);
    if (now.getHours() < resetHour) {
      seedDate.setDate(seedDate.getDate() - 1);
    }
    return `${seedDate.getFullYear()}-${String(seedDate.getMonth() + 1).padStart(2, '0')}-${String(seedDate.getDate()).padStart(2, '0')}`;
  }

  function createSeededRNG(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    let state = hash;
    return function() {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  function seededRandom(seed) {
    const rng = createSeededRNG(seed);
    return rng();
  }

  const PALETTE_FAMILIES = {
    warm: { hueRange: [0, 60], satRange: [65, 85], lightRange: [45, 60], name: "Warm Sunset" },
    cool: { hueRange: [180, 270], satRange: [50, 75], lightRange: [40, 60], name: "Cool Ocean" },
    pastel: { hueRange: [0, 360], satRange: [40, 60], lightRange: [70, 85], name: "Soft Pastel" },
    jewel: { hueRange: [0, 360], satRange: [70, 95], lightRange: [35, 50], name: "Jewel Tones" },
    earth: { hueRange: [20, 50], satRange: [30, 55], lightRange: [35, 55], name: "Earth & Clay" },
    vibrant: { hueRange: [0, 360], satRange: [80, 100], lightRange: [50, 60], name: "Vibrant Pop" },
    muted: { hueRange: [0, 360], satRange: [25, 45], lightRange: [45, 65], name: "Muted Modern" },
    forest: { hueRange: [80, 160], satRange: [40, 70], lightRange: [30, 55], name: "Forest Grove" },
    sunset: { hueRange: [330, 60], satRange: [70, 90], lightRange: [50, 65], name: "Golden Hour" },
    ocean: { hueRange: [170, 220], satRange: [55, 80], lightRange: [40, 60], name: "Deep Sea" },
    berry: { hueRange: [280, 350], satRange: [50, 75], lightRange: [35, 55], name: "Berry Harvest" },
    citrus: { hueRange: [30, 90], satRange: [75, 95], lightRange: [55, 70], name: "Citrus Burst" }
  };

  const TONE_TREATMENTS = {
    tint: { satMod: -15, lightMod: 20, name: "Light & Airy" },
    tone: { satMod: -20, lightMod: 0, name: "Muted & Balanced" },
    shade: { satMod: 5, lightMod: -15, name: "Deep & Rich" },
    vivid: { satMod: 15, lightMod: 5, name: "Bold & Bright" },
    neutral: { satMod: -30, lightMod: 10, name: "Soft & Subtle" }
  };

  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function colorDistance(hex1, hex2) {
    const c1 = hexToHsl(hex1);
    const c2 = hexToHsl(hex2);
    
    let hueDiff = Math.abs(c1.h - c2.h);
    if (hueDiff > 180) hueDiff = 360 - hueDiff;
    const hueWeight = 2.0;
    const satDiff = Math.abs(c1.s - c2.s);
    const lightDiff = Math.abs(c1.l - c2.l);
    
    return Math.sqrt(
      Math.pow(hueDiff * hueWeight, 2) + 
      Math.pow(satDiff, 2) + 
      Math.pow(lightDiff * 1.5, 2)
    );
  }

  function isTooClose(newColor, existingColors, minDistance) {
    for (const existing of existingColors) {
      if (colorDistance(newColor, existing) < minDistance) {
        return true;
      }
    }
    return false;
  }

  function generateDailyColorWheel(seed) {
    const rng = createSeededRNG(seed + "wheel");
    
    const familyKeys = Object.keys(PALETTE_FAMILIES);
    const familyIndex = Math.floor(rng() * familyKeys.length);
    const family = PALETTE_FAMILIES[familyKeys[familyIndex]];
    
    const treatmentKeys = Object.keys(TONE_TREATMENTS);
    const treatmentIndex = Math.floor(rng() * treatmentKeys.length);
    const treatment = TONE_TREATMENTS[treatmentKeys[treatmentIndex]];
    
    const wheelColors = [];
    const MIN_COLOR_DISTANCE = 25;
    
    const isFullSpectrum = (family.hueRange[1] - family.hueRange[0]) >= 300 || 
                           (family.hueRange[0] === 0 && family.hueRange[1] === 360);
    
    if (isFullSpectrum) {
      const baseHueShift = Math.floor(rng() * 360);
      for (let i = 0; i < 12; i++) {
        const hue = (i * 30 + baseHueShift) % 360;
        
        let attempts = 0;
        let color;
        do {
          const satVariance = (rng() - 0.5) * 15;
          const lightVariance = (rng() - 0.5) * 12;
          
          let saturation = family.satRange[0] + rng() * (family.satRange[1] - family.satRange[0]);
          let lightness = family.lightRange[0] + rng() * (family.lightRange[1] - family.lightRange[0]);
          
          saturation = Math.max(25, Math.min(95, saturation + treatment.satMod + satVariance));
          lightness = Math.max(25, Math.min(80, lightness + treatment.lightMod + lightVariance));
          
          color = hslToHex(hue, saturation, lightness);
          attempts++;
        } while (isTooClose(color, wheelColors, MIN_COLOR_DISTANCE) && attempts < 10);
        
        wheelColors.push(color);
      }
    } else {
      let hueStart = family.hueRange[0];
      let hueEnd = family.hueRange[1];
      let hueRange;
      
      if (hueStart > hueEnd) {
        hueRange = (360 - hueStart) + hueEnd;
      } else {
        hueRange = hueEnd - hueStart;
      }
      
      const isNarrowRange = hueRange < 100;
      const satSpread = isNarrowRange ? 50 : 25;
      const lightSpread = isNarrowRange ? 45 : 25;
      
      const baseSat = (family.satRange[0] + family.satRange[1]) / 2 + treatment.satMod;
      const baseLight = (family.lightRange[0] + family.lightRange[1]) / 2 + treatment.lightMod;
      
      const satLightCombos = [];
      for (let si = 0; si < 4; si++) {
        for (let li = 0; li < 3; li++) {
          const sat = baseSat - satSpread/2 + (si / 3) * satSpread;
          const light = baseLight - lightSpread/2 + (li / 2) * lightSpread;
          satLightCombos.push({ sat, light });
        }
      }
      
      for (let i = satLightCombos.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [satLightCombos[i], satLightCombos[j]] = [satLightCombos[j], satLightCombos[i]];
      }
      
      const hueStep = hueRange / 12;
      const jitter = Math.floor(rng() * hueRange * 0.1);
      
      for (let i = 0; i < 12; i++) {
        let attempts = 0;
        let color;
        
        do {
          let hue = hueStart + (i * hueStep) + jitter + (rng() - 0.5) * (hueStep * 0.3);
          
          if (hueStart > hueEnd) {
            hue = ((hue % 360) + 360) % 360;
          } else {
            hue = Math.max(hueStart, Math.min(hueEnd, hue));
          }
          
          const combo = satLightCombos[i % satLightCombos.length];
          const satVariance = (rng() - 0.5) * 8;
          const lightVariance = (rng() - 0.5) * 6;
          
          let saturation = combo.sat + satVariance;
          let lightness = combo.light + lightVariance;
          
          saturation = Math.max(20, Math.min(95, saturation));
          lightness = Math.max(25, Math.min(80, lightness));
          
          color = hslToHex(hue, saturation, lightness);
          attempts++;
        } while (isTooClose(color, wheelColors, MIN_COLOR_DISTANCE) && attempts < 15);
        
        wheelColors.push(color);
      }
    }
    
    return {
      colors: wheelColors,
      familyName: family.name,
      treatmentName: treatment.name,
      familyKey: familyKeys[familyIndex],
      treatmentKey: treatmentKeys[treatmentIndex]
    };
  }

  function generatePaletteByScheme(scheme, wheelColors, seed) {
    const rng = createSeededRNG(seed + "pattern");
    const baseIndex = Math.floor(rng() * 12);
    let indices = [];

    switch (scheme) {
      case "complementary":
        indices = [baseIndex, (baseIndex + 6) % 12];
        indices.push((baseIndex + 1) % 12, (baseIndex + 5) % 12, (baseIndex + 7) % 12);
        break;
      case "triadic":
        indices = [baseIndex, (baseIndex + 4) % 12, (baseIndex + 8) % 12];
        indices.push((baseIndex + 2) % 12, (baseIndex + 6) % 12);
        break;
      case "analogous":
        indices = [
          (baseIndex - 2 + 12) % 12,
          (baseIndex - 1 + 12) % 12,
          baseIndex,
          (baseIndex + 1) % 12,
          (baseIndex + 2) % 12
        ];
        break;
      case "split-complementary":
        indices = [baseIndex, (baseIndex + 5) % 12, (baseIndex + 7) % 12];
        indices.push((baseIndex + 1) % 12, (baseIndex + 6) % 12);
        break;
      case "tetradic":
        indices = [baseIndex, (baseIndex + 3) % 12, (baseIndex + 6) % 12, (baseIndex + 9) % 12];
        indices.push((baseIndex + 1) % 12);
        break;
      default:
        indices = [0, 2, 4, 6, 8];
    }

    indices = indices.slice(0, 5);

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + "shuffle" + i) * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices.map(i => wheelColors[i]);
  }

  let currentPaletteInfo = null;

  function generatePuzzle() {
    const today = getTodaySeed();
    const rng = createSeededRNG(today + "main");
    
    const wheelData = generateDailyColorWheel(today);
    colors = wheelData.colors;
    currentPaletteInfo = {
      family: wheelData.familyName,
      treatment: wheelData.treatmentName
    };
    
    const schemes = ["complementary", "triadic", "analogous", "split-complementary", "tetradic"];
    const schemeIndex = Math.floor(rng() * schemes.length);
    currentScheme = schemes[schemeIndex];
    
    hiddenPattern = generatePaletteByScheme(currentScheme, colors, today);
    
    initializeGame();
  }

  function initializeGame() {
    setHint(currentScheme);
    setTitleColors();
    createColorWheel();
    updatePaletteBorder();
    spinWheel();
  }

  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      isLoggedIn = data.loggedIn;
      userEmail = data.email || "";
      updateAuthUI();
    } catch (e) {
      isLoggedIn = false;
      updateAuthUI();
    }
  }

  async function checkGoogleAuthAvailable() {
    try {
      const response = await fetch('/api/auth/google-available');
      const data = await response.json();
      if (data.available && googleLoginBtn && loginDivider) {
        googleLoginBtn.classList.remove('hidden');
        loginDivider.classList.remove('hidden');
        googleLoginBtn.addEventListener('click', () => {
          window.location.href = '/google_login';
        });
      }
    } catch (e) {
      console.error('Failed to check Google auth availability:', e);
    }
  }

  function updateAuthUI() {
    if (!authStatus) return;
    
    if (isLoggedIn) {
      const displayName = userEmail.split('@')[0];
      authStatus.innerHTML = `<button class="auth-btn logged-in" id="header-logout-btn">${displayName}</button>`;
      document.getElementById("header-logout-btn")?.addEventListener("click", handleLogout);
    } else {
      authStatus.innerHTML = `<button id="header-login-btn" class="auth-btn">Log In</button>`;
      document.getElementById("header-login-btn")?.addEventListener("click", showLoginOverlay);
    }
    
    updateSaveButtonText();
  }

  function showLoginOverlay() {
    if (loginOverlay) {
      loginOverlay.classList.remove("hidden");
      loginOverlay.style.display = "flex";
    }
  }

  function hideLoginOverlay() {
    if (loginOverlay) {
      loginOverlay.classList.add("hidden");
      loginOverlay.style.display = "none";
      if (loginError) loginError.textContent = "";
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      isLoggedIn = false;
      userEmail = "";
      updateAuthUI();
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  async function handleLogin() {
    const email = loginEmail?.value?.trim();
    const password = loginPassword?.value;
    
    if (!email || !password) {
      if (loginError) loginError.textContent = "Please enter email and password";
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        isLoggedIn = true;
        userEmail = data.email;
        hideLoginOverlay();
        updateAuthUI();
      } else {
        if (loginError) loginError.textContent = data.error || "Login failed";
      }
    } catch (e) {
      if (loginError) loginError.textContent = "Connection error. Please try again.";
    }
  }

  async function handleSignup() {
    const email = loginEmail?.value?.trim();
    const password = loginPassword?.value;
    
    if (!email || !password) {
      if (loginError) loginError.textContent = "Please enter email and password";
      return;
    }
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        isLoggedIn = true;
        userEmail = data.email;
        hideLoginOverlay();
        updateAuthUI();
      } else {
        if (loginError) loginError.textContent = data.error || "Signup failed";
      }
    } catch (e) {
      if (loginError) loginError.textContent = "Connection error. Please try again.";
    }
  }

  async function updateSaveButtonText() {
    const text = isLoggedIn ? "Save Today's Palette" : "Save Today's Palette";
    if (saveButton) saveButton.textContent = text;
    if (saveButtonLose) saveButtonLose.textContent = text;
  }

  if (grid) {
    for (let i = 0; i < 5; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (let j = 0; j < 5; j++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.addEventListener("click", () => clearTile(tile, i));
        row.appendChild(tile);
      }
      grid.appendChild(row);
    }
  }

  function createColorWheel() {
    if (!wheel) return;
    wheel.innerHTML = "";
    colors.forEach((color, index) => {
      if (!eliminatedColors.has(color)) {
        const wedge = document.createElement("div");
        wedge.classList.add("wedge");
        wedge.style.backgroundColor = color;
        wedge.style.transform = `rotate(${index * 30 - 15}deg) skewY(-60deg)`;
        wedge.style.setProperty("--angle", `${index * 30 - 15}deg`);
        wedge.addEventListener("click", () => addColorToRow(color));
        wheel.appendChild(wedge);
      }
    });
  }

  function addColorToRow(color) {
    if (gameComplete) return;
    
    const row = document.getElementsByClassName("row")[currentRow];
    if (!row) return;
    const tiles = Array.from(row.getElementsByClassName("tile"));
    for (let tile of tiles) {
      if (!tile.style.backgroundColor) {
        tile.style.backgroundColor = color;
        tile.dataset.color = color;
        playAddSound();
        break;
      }
    }
    if (tiles.every(tile => tile.style.backgroundColor)) checkRow();
  }

  function clearTile(tile, rowIndex) {
    if (gameComplete) return;
    if (rowIndex === currentRow && tile.style.backgroundColor) {
      tile.style.backgroundColor = "";
      delete tile.dataset.color;
      playRemoveSound();
    }
  }

  function checkRow() {
    const row = document.getElementsByClassName("row")[currentRow];
    const tiles = Array.from(row.getElementsByClassName("tile"));
    let correctCount = 0;
    
    const patternCopy = [...hiddenPattern];
    const results = new Array(5).fill(null);
    
    tiles.forEach((tile, index) => {
      if (tile.dataset.color === hiddenPattern[index]) {
        results[index] = "correct";
        patternCopy[index] = null;
        correctCount++;
      }
    });
    
    tiles.forEach((tile, index) => {
      if (results[index]) return;
      
      const colorIndex = patternCopy.indexOf(tile.dataset.color);
      if (colorIndex !== -1) {
        results[index] = "misplaced";
        patternCopy[colorIndex] = null;
      } else {
        results[index] = "wrong";
        eliminatedColors.add(tile.dataset.color);
      }
    });
    
    tiles.forEach((tile, index) => {
      tile.classList.add(results[index]);
    });
    
    if (correctCount === 5) {
      gameComplete = true;
      setTimeout(() => showVictoryMessage(), 500);
    } else {
      currentRow++;
      createColorWheel();
      
      if (currentRow === 5) {
        gameComplete = true;
        setTimeout(() => showTryAgainMessage(), 500);
      }
    }
  }

  function showVictoryMessage() {
    if (victoryOverlay) {
      victoryOverlay.classList.remove("hidden");
      victoryOverlay.style.display = "flex";
      revealPattern("reveal-pattern");
      updatePaletteBorder();
      launchConfetti();
      updateStatsAfterGame(true, currentRow + 1);
    }
  }

  function showTryAgainMessage() {
    if (tryAgainOverlay) {
      tryAgainOverlay.classList.remove("hidden");
      tryAgainOverlay.style.display = "flex";
      revealPattern("reveal-pattern-lose");
      updatePaletteBorder();
      updateStatsAfterGame(false, 5);
    }
  }

  function revealPattern(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
      hiddenPattern.forEach(color => {
        const tile = document.createElement("div");
        tile.classList.add("reveal-tile");
        tile.style.backgroundColor = color;
        container.appendChild(tile);
      });
    }
  }

  function setTitleColors() {
    if (title) {
      title.innerHTML = "";
      const titleText = "COLOR CHASE";
      if (!colors.length) return;
      [...titleText].forEach((char, i) => {
        const span = document.createElement("span");
        span.textContent = char;
        if (char !== " ") {
          span.style.color = colors[i % colors.length];
        }
        title.appendChild(span);
      });
    }
  }

  function setHint(scheme) {
    if (!hint) return;
    const schemeHints = {
      complementary: "Opposites attract.",
      triadic: "Three anchors form the base.",
      analogous: "Neighbors in harmony.",
      "split-complementary": "Split the difference.",
      tetradic: "Four corners unite."
    };
    
    let hintText = schemeHints[scheme] || "Find today's palette!";
    
    if (currentPaletteInfo) {
      hintText = `${currentPaletteInfo.family} \u2022 ${hintText}`;
    }
    
    hint.textContent = hintText;
  }

  function updatePaletteBorder() {
    if (!paletteBorder) return;
    paletteBorder.innerHTML = "";
    hiddenPattern.forEach(color => {
      const swatch = document.createElement("div");
      swatch.classList.add("swatch");
      swatch.style.backgroundColor = color;
      paletteBorder.appendChild(swatch);
    });
  }

  async function savePalette() {
    if (!isLoggedIn) {
      showLoginOverlay();
      return;
    }
    
    try {
      const response = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: getTodaySeed(),
          colors: hiddenPattern,
          scheme: currentScheme,
          guessCount: currentRow + 1,
          won: gameComplete && currentRow < 5
        })
      });
      
      const data = await response.json();
      if (data.success) {
        window.location.href = "player.html";
      } else if (response.status === 401) {
        isLoggedIn = false;
        updateAuthUI();
        showLoginOverlay();
      }
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save palette. Please try again.');
    }
  }

  function resetGameForReplay() {
    currentRow = 0;
    eliminatedColors = new Set();
    gameComplete = false;

    const rows = document.getElementsByClassName("row");
    for (let row of rows) {
      const tiles = row.getElementsByClassName("tile");
      for (let tile of tiles) {
        tile.style.backgroundColor = "";
        delete tile.dataset.color;
        tile.classList.remove("correct", "misplaced", "wrong");
      }
    }

    createColorWheel();

    if (victoryOverlay) {
      victoryOverlay.classList.add("hidden");
      victoryOverlay.style.display = "none";
    }
    if (tryAgainOverlay) {
      tryAgainOverlay.classList.add("hidden");
      tryAgainOverlay.style.display = "none";
    }
  }

  if (saveButton) saveButton.addEventListener("click", savePalette);
  if (saveButtonLose) saveButtonLose.addEventListener("click", savePalette);
  if (playAgainBtn) playAgainBtn.addEventListener("click", resetGameForReplay);
  if (playAgainLoseBtn) playAgainLoseBtn.addEventListener("click", resetGameForReplay);
  if (shareBtn) shareBtn.addEventListener("click", shareResults);
  if (shareBtnLose) shareBtnLose.addEventListener("click", shareResults);
  if (statsBtn) statsBtn.addEventListener("click", showStatsModal);
  if (closeStats) closeStats.addEventListener("click", hideStatsModal);
  if (createAccountInfo) createAccountInfo.addEventListener("click", () => {
    infoOverlay.classList.add("hidden");
    infoOverlay.style.display = "none";
    showLoginOverlay();
  });
  
  statsOverlay?.addEventListener("click", (e) => {
    if (e.target === statsOverlay) hideStatsModal();
  });
  
  if (infoBtn) infoBtn.addEventListener("click", () => {
    infoOverlay.classList.remove("hidden");
    infoOverlay.style.display = "flex";
  });
  
  if (closeInfo) closeInfo.addEventListener("click", () => {
    infoOverlay.classList.add("hidden");
    infoOverlay.style.display = "none";
  });
  
  if (closeLoginOverlayBtn) closeLoginOverlayBtn.addEventListener("click", hideLoginOverlay);
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  if (signupBtn) signupBtn.addEventListener("click", handleSignup);

  infoOverlay?.addEventListener("click", (e) => {
    if (e.target === infoOverlay) {
      infoOverlay.classList.add("hidden");
      infoOverlay.style.display = "none";
    }
  });

  loginOverlay?.addEventListener("click", (e) => {
    if (e.target === loginOverlay) hideLoginOverlay();
  });

  let bestPlayersRotation = [];
  let currentBestPlayerIndex = 0;

  async function fetchDailyStats() {
    try {
      const today = getTodaySeed();
      const response = await fetch(`/api/daily-stats?date=${today}`);
      const data = await response.json();
      
      const playerCountEl = document.getElementById('player-count');
      const bestPlayerEl = document.getElementById('best-player');
      const bestGuessEl = document.getElementById('best-guess');
      const bestGuessStat = document.getElementById('best-guess-stat');
      
      if (playerCountEl) playerCountEl.textContent = data.playerCount || 0;
      
      if (data.bestPlayers && data.bestPlayers.length > 0 && data.bestGuess) {
        bestPlayersRotation = data.bestPlayers;
        currentBestPlayerIndex = 0;
        if (bestPlayerEl) bestPlayerEl.textContent = bestPlayersRotation[0];
        if (bestGuessEl) bestGuessEl.textContent = data.bestGuess === 1 ? '1 guess' : data.bestGuess + ' guesses';
        if (bestGuessStat) bestGuessStat.style.display = 'flex';
        
        if (bestPlayersRotation.length > 1) {
          setInterval(() => {
            currentBestPlayerIndex = (currentBestPlayerIndex + 1) % bestPlayersRotation.length;
            if (bestPlayerEl) bestPlayerEl.textContent = bestPlayersRotation[currentBestPlayerIndex];
          }, 3000);
        }
      }
    } catch (e) {
      console.error('Failed to fetch daily stats:', e);
    }
  }

  const RESET_HOUR = 9;
  
  function getNextResetTime() {
    const now = new Date();
    const reset = new Date(now);
    reset.setHours(RESET_HOUR, 0, 0, 0);
    if (now >= reset) {
      reset.setDate(reset.getDate() + 1);
    }
    return reset;
  }
  
  let lastPuzzleSeed = getTodaySeed();
  let hasReloaded = false;
  
  function updateCountdown() {
    const now = new Date();
    const nextReset = getNextResetTime();
    const diff = nextReset - now;
    
    // Check if the puzzle seed has changed (9 AM passed)
    const currentSeed = getTodaySeed();
    if (currentSeed !== lastPuzzleSeed && !hasReloaded) {
      hasReloaded = true;
      window.location.reload();
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
      countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
  fetchDailyStats();

  generatePuzzle();
  checkAuthStatus();
  checkGoogleAuthAvailable();
  updateStreakDisplay();
  checkFirstTimeVisitor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
