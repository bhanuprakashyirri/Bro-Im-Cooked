/**
 * BRO, I'M COOKED 💀 - Core Game Controller & State Machine
 * Handles HUD updates, 4 core actions, professor suspicion loop,
 * random event scheduler, game over, victory titles, and audio hooks.
 */

class BroImCookedGame {
  constructor() {
    // Initial Stats as per prompt
    this.initialStats = {
      sanity: 100,
      energy: 100,
      attendance: 85,
      money: 100,
      suspicion: 0
    };

    this.stats = { ...this.initialStats };
    this.totalTimeSeconds = 300; // 05:00 minutes
    this.timeRemaining = this.totalTimeSeconds;
    this.simSpeed = 1; // 1x, 2x, 5x speed toggle

    this.isPlaying = false;
    this.isPaused = false;
    this.mainTimer = null;
    this.profBehaviorTimer = null;
    this.eventSchedulerTimer = null;

    // Active event state
    this.currentEvent = null;
    this.eventTimeoutTimer = null;
    this.eventTimeRemaining = 0;
    this.usedEventIds = new Set();

    // Stats history for final title computation
    this.actionCounts = {
      study: 0,
      sleep: 0,
      phone: 0,
      lookBusy: 0
    };

    // Professor states: 'writing' (back turned), 'lecturing' (facing), 'suspicious' (>=50%), 'watching' (>=75%), 'caught' (100%)
    this.profState = 'writing';
    this.lastProfStateChange = 0;

    // Cache DOM Elements
    this.dom = {
      hud: document.getElementById('hud'),
      hudClock: document.getElementById('hud-clock'),
      timerDisplay: document.getElementById('timer-display'),
      suspicionVal: document.getElementById('suspicion-val'),
      suspicionFill: document.getElementById('suspicion-bar-fill'),
      suspicionAlertPill: document.getElementById('suspicion-alert-pill'),
      bannerWatching: document.getElementById('banner-watching'),
      
      valSanity: document.getElementById('val-sanity'),
      valEnergy: document.getElementById('val-energy'),
      valAttendance: document.getElementById('val-attendance'),
      valMoney: document.getElementById('val-money'),

      pillSanity: document.getElementById('stat-sanity'),
      pillEnergy: document.getElementById('stat-energy'),
      pillAttendance: document.getElementById('stat-attendance'),
      pillMoney: document.getElementById('stat-money'),

      professor: document.getElementById('professor'),
      profBubble: document.getElementById('prof-bubble'),
      profBubbleText: document.getElementById('prof-bubble-text'),
      profAlertMark: document.getElementById('prof-alert-mark'),
      
      playerChar: document.getElementById('player-character'),
      actionFx: document.getElementById('action-floating-fx'),
      humorMessage: document.getElementById('humor-message'),

      // Buttons
      btnStudy: document.getElementById('btn-study'),
      btnSleep: document.getElementById('btn-sleep'),
      btnPhone: document.getElementById('btn-phone'),
      btnLookBusy: document.getElementById('btn-look-busy'),
      btnSpeed: document.getElementById('btn-speed-toggle'),
      speedText: document.getElementById('speed-text'),
      btnAudio: document.getElementById('btn-audio-toggle'),
      audioIcon: document.getElementById('audio-icon'),

      // Dialogs
      eventDialog: document.getElementById('event-dialog'),
      caughtDialog: document.getElementById('caught-dialog'),
      successDialog: document.getElementById('success-dialog'),
      failureDialog: document.getElementById('failure-dialog'),
      titleScreen: document.getElementById('title-screen'),
      howToPlayDialog: document.getElementById('how-to-play-dialog')
    };

    this.bindEvents();
  }

  bindEvents() {
    // Menu buttons
    document.getElementById('btn-start-class').addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      this.dom.howToPlayDialog.showModal();
      window.soundEngine.playClick();
    });
    document.getElementById('btn-close-guide').addEventListener('click', () => {
      this.dom.howToPlayDialog.close();
      window.soundEngine.playClick();
    });
    document.getElementById('btn-guide-got-it').addEventListener('click', () => {
      this.dom.howToPlayDialog.close();
      window.soundEngine.playClick();
    });

    // Replay buttons
    document.getElementById('btn-success-replay').addEventListener('click', () => {
      this.dom.successDialog.close();
      this.startNewGame();
    });
    document.getElementById('btn-failure-replay').addEventListener('click', () => {
      this.dom.failureDialog.close();
      this.startNewGame();
    });

    // HUD controls
    this.dom.btnAudio.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.dom.audioIcon.textContent = isMuted ? '🔇' : '🔊';
      window.soundEngine.playClick();
    });

    this.dom.btnSpeed.addEventListener('click', () => {
      if (this.simSpeed === 1) this.simSpeed = 2;
      else if (this.simSpeed === 2) this.simSpeed = 5;
      else this.simSpeed = 1;
      this.dom.speedText.textContent = `${this.simSpeed}x SPEED`;
      window.soundEngine.playClick();
      this.showToast(`Simulation speed set to ${this.simSpeed}x`);
    });

    // 4 Action Buttons
    this.dom.btnStudy.addEventListener('click', () => this.handleAction('study'));
    this.dom.btnSleep.addEventListener('click', () => this.handleAction('sleep'));
    this.dom.btnPhone.addEventListener('click', () => this.handleAction('phone'));
    this.dom.btnLookBusy.addEventListener('click', () => this.handleAction('lookBusy'));

    // Caught Defense choices
    document.getElementById('caught-choice-1').addEventListener('click', () => this.handleCaughtChoice('notes'));
    document.getElementById('caught-choice-2').addEventListener('click', () => this.handleCaughtChoice('nothing'));
    document.getElementById('caught-choice-3').addEventListener('click', () => this.handleCaughtChoice('time'));
  }

  startNewGame() {
    this.stats = { ...this.initialStats };
    this.timeRemaining = this.totalTimeSeconds;
    this.isPlaying = true;
    this.isPaused = false;
    this.usedEventIds.clear();
    this.actionCounts = { study: 0, sleep: 0, phone: 0, lookBusy: 0 };
    this.profState = 'writing';

    // Hide overlays & modals
    this.dom.titleScreen.classList.add('hidden');
    this.dom.hud.classList.remove('hidden');
    document.body.classList.remove('screen-shaking');

    try {
      this.dom.eventDialog.close();
      this.dom.caughtDialog.close();
      this.dom.successDialog.close();
      this.dom.failureDialog.close();
    } catch (e) {}

    // Start audio
    window.soundEngine.ensureContext();
    window.soundEngine.startClassroomAmbience();
    window.soundEngine.playClick();

    // Reset visual professor
    this.setProfessorState('writing');
    this.setPlayerPose('study');

    this.updateHUD();
    this.showToast('Class has commenced. Keep your head down and stay alive.');

    // Clear old loops
    clearInterval(this.mainTimer);
    clearInterval(this.profBehaviorTimer);
    clearTimeout(this.eventSchedulerTimer);

    // Launch game loops
    this.mainTimer = setInterval(() => this.tick(), 1000);
    this.profBehaviorTimer = setInterval(() => this.professorAITick(), 3000);
    this.scheduleNextRandomEvent();
  }

  /**
   * Main 1-second countdown tick (accelerated by this.simSpeed)
   */
  tick() {
    if (!this.isPlaying || this.isPaused) return;

    // Apply sim speed step
    const step = this.simSpeed;
    this.timeRemaining -= step;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.triggerSuccess();
      return;
    }

    // Natural stat drift: sitting in class slowly drains sanity & energy
    if (Math.random() < 0.25 * step) {
      this.adjustStat('sanity', -1, false);
    }
    if (Math.random() < 0.20 * step) {
      this.adjustStat('energy', -1, false);
    }

    // Passive suspicion decay if professor is writing on whiteboard
    if (this.profState === 'writing' && this.stats.suspicion > 0) {
      this.adjustStat('suspicion', -1, false);
    }

    // Check critical state failure conditions
    this.checkCriticalFailures();

    this.updateHUD();
  }

  /**
   * Professor behavior AI: alternates between writing, lecturing, glancing
   */
  professorAITick() {
    if (!this.isPlaying || this.isPaused) return;

    // If suspicion is high, professor stares at the backbench
    if (this.stats.suspicion >= 75) {
      this.setProfessorState('watching');
      this.showProfessorSpeech('I am watching you, Roll 42!');
      window.soundEngine.playWarningPulse();
      return;
    }

    if (this.stats.suspicion >= 50) {
      this.setProfessorState('suspicious');
      this.showProfessorSpeech('Who is causing that disturbance?');
      return;
    }

    // Normal random routine: 60% writing on board, 40% lecturing / looking
    const roll = Math.random();
    if (roll < 0.6) {
      this.setProfessorState('writing');
    } else {
      this.setProfessorState('lecturing');
      const lectures = [
        "Pay attention! Normalization is worth 20 marks!",
        "Sharma, excellent notes. Others take inspiration.",
        "Attendance below 75% means direct backlog.",
        "What is Boyce-Codd Normal Form? Anyone?"
      ];
      if (Math.random() < 0.35) {
        this.showProfessorSpeech(lectures[Math.floor(Math.random() * lectures.length)]);
      }
    }
  }

  setProfessorState(state) {
    this.profState = state;
    this.dom.professor.className = `professor-char state-${state}`;

    if (state === 'watching' || state === 'caught') {
      this.dom.profAlertMark.classList.remove('hidden');
    } else {
      this.dom.profAlertMark.classList.add('hidden');
    }

    if (state === 'watching' || this.stats.suspicion >= 75) {
      this.dom.bannerWatching.classList.remove('hidden');
      this.dom.suspicionAlertPill.classList.remove('hidden');
    } else {
      this.dom.bannerWatching.classList.add('hidden');
      this.dom.suspicionAlertPill.classList.add('hidden');
    }
  }

  showProfessorSpeech(text) {
    this.dom.profBubbleText.textContent = text;
    this.dom.profBubble.classList.remove('hidden');
    clearTimeout(this.profBubbleTimeout);
    this.profBubbleTimeout = setTimeout(() => {
      this.dom.profBubble.classList.add('hidden');
    }, 2800);
  }

  /**
   * Player Pose switching (typing, sleeping, phone, study)
   */
  setPlayerPose(pose) {
    const poses = {
      study: this.dom.playerChar.querySelector('.pose-study'),
      typing: this.dom.playerChar.querySelector('.pose-typing'),
      phone: this.dom.playerChar.querySelector('.pose-phone'),
      sleep: this.dom.playerChar.querySelector('.pose-sleep')
    };

    Object.values(poses).forEach(el => el?.classList.add('hidden'));

    if (poses[pose]) {
      poses[pose].classList.remove('hidden');
    }

    // Auto-return to study/idle pose after action duration
    clearTimeout(this.playerPoseTimeout);
    if (pose !== 'study') {
      this.playerPoseTimeout = setTimeout(() => {
        this.setPlayerPose('study');
      }, 2000);
    }
  }

  /**
   * Handling the 4 Core Actions
   */
  handleAction(action) {
    if (!this.isPlaying || this.isPaused) return;

    window.soundEngine.ensureContext();
    this.actionCounts[action]++;

    let mult = 1;
    // Actions are twice as risky if professor is facing students or watching!
    if (this.profState === 'watching') mult = 1.6;
    else if (this.profState === 'suspicious') mult = 1.3;
    else if (this.profState === 'writing') mult = 0.7; // Safer!

    switch (action) {
      case 'study':
        // Study: Suspicion -5, Sanity -2, Energy -3
        this.adjustStat('suspicion', -5);
        this.adjustStat('sanity', -2);
        this.adjustStat('energy', -3);
        this.setPlayerPose('study');
        window.soundEngine.playActionSound('study');
        this.spawnFloatingEffect('📖 -5 Suspicion | -2 Sanity');
        this.showToast('You stare intensely at your notes. Professor nods in approval.');
        break;

      case 'sleep':
        // Sleep: Energy +10, Sanity +5, Suspicion +15
        const sleepSusp = Math.round(15 * mult);
        this.adjustStat('energy', 10);
        this.adjustStat('sanity', 5);
        this.adjustStat('suspicion', sleepSusp);
        this.setPlayerPose('sleep');
        window.soundEngine.playActionSound('sleep');
        this.spawnFloatingEffect(`💤 +10 Energy | +${sleepSusp} Suspicion`);
        this.showToast('You collapse your head onto the desk. Restful, but highly visible!');
        break;

      case 'phone':
        // Use Phone: Sanity +8, Suspicion +25
        const phoneSusp = Math.round(25 * mult);
        this.adjustStat('sanity', 8);
        this.adjustStat('suspicion', phoneSusp);
        this.setPlayerPose('phone');
        window.soundEngine.playActionSound('phone');
        this.spawnFloatingEffect(`📱 +8 Sanity | +${phoneSusp} Suspicion`);
        this.showToast('You secretly laugh at Indian college memes on Reddit. Dangerously fun.');
        break;

      case 'lookBusy':
        // Look Busy: Suspicion -3, Sanity +2, Random chance of "Professor noticed"
        this.setPlayerPose('typing');
        window.soundEngine.playActionSound('type');

        const noticedChance = this.profState === 'writing' ? 0.15 : 0.35;
        if (Math.random() < noticedChance) {
          // Professor noticed!
          const noticeSusp = Math.round(12 * mult);
          this.adjustStat('suspicion', noticeSusp);
          this.adjustStat('sanity', -2);
          this.spawnFloatingEffect(`⚠️ PROFESSOR NOTICED! +${noticeSusp} Suspicion`);
          this.showToast('Professor noticed: "Why are your keys clicking like an AK-47 back there?!"');
          this.showProfessorSpeech('Stop hammering that keyboard!');
          window.soundEngine.playWarningPulse();
        } else {
          this.adjustStat('suspicion', -3);
          this.adjustStat('sanity', 2);
          this.spawnFloatingEffect('💻 -3 Suspicion | +2 Sanity');
          this.showToast('You aggressively type fake SQL queries. You look like a certified genius.');
        }
        break;
    }

    this.checkCriticalFailures();
    this.updateHUD();
  }

  /**
   * Adjust numeric stat with clamp and UI pulse feedback
   */
  adjustStat(stat, delta, triggerBump = true) {
    if (delta === 0) return;
    const oldVal = this.stats[stat];
    let newVal = oldVal + delta;

    if (stat === 'suspicion') {
      newVal = Math.max(0, Math.min(100, newVal));
      this.stats.suspicion = newVal;

      if (newVal >= 100) {
        this.triggerCaughtSequence();
        return;
      }
    } else if (stat === 'attendance') {
      newVal = Math.max(0, Math.min(100, newVal));
      this.stats.attendance = newVal;
    } else if (stat === 'money') {
      newVal = Math.max(0, newVal);
      this.stats.money = newVal;
    } else {
      // Sanity and Energy
      newVal = Math.max(0, Math.min(100, newVal));
      this.stats[stat] = newVal;
    }

    // UI bump animation
    if (triggerBump) {
      const pillMap = {
        sanity: this.dom.pillSanity,
        energy: this.dom.pillEnergy,
        attendance: this.dom.pillAttendance,
        money: this.dom.pillMoney
      };
      const pill = pillMap[stat];
      if (pill) {
        pill.classList.remove('stat-bumped', 'stat-bump-good', 'stat-bump-bad');
        void pill.offsetWidth; // trigger reflow
        pill.classList.add('stat-bumped');
        pill.classList.add(delta > 0 ? 'stat-bump-good' : 'stat-bump-bad');
        setTimeout(() => {
          pill.classList.remove('stat-bumped', 'stat-bump-good', 'stat-bump-bad');
        }, 350);
      }
    }

    // Check system comedy quips
    this.evaluateHumorTriggers();
  }

  /**
   * Contextual comedy system messages
   */
  evaluateHumorTriggers() {
    if (this.stats.sanity <= 20) {
      this.showToast('“Your brain has left the classroom.” 🧠💨');
    } else if (this.stats.energy <= 20) {
      this.showToast('“You are operating on approximately 2% battery.” 🔋💀');
    } else if (this.stats.suspicion >= 70) {
      this.showToast('“Bro. The professor knows.” 👀');
    } else if (this.stats.money <= 20 && this.stats.money > 0) {
      this.showToast('“Your wallet is experiencing technical difficulties.” 💸');
    }
  }

  spawnFloatingEffect(text) {
    const fx = document.createElement('div');
    fx.className = 'floating-text';
    fx.textContent = text;
    this.dom.actionFx.appendChild(fx);
    setTimeout(() => {
      fx.remove();
    }, 1100);
  }

  showToast(msg) {
    this.dom.humorMessage.textContent = msg;
  }

  /**
   * Caught System (100% Suspicion)
   */
  triggerCaughtSequence() {
    this.isPaused = true;
    this.setProfessorState('caught');
    document.body.classList.add('screen-shaking');

    window.soundEngine.playFootsteps(4);
    window.soundEngine.playCaughtStinger();

    setTimeout(() => {
      document.body.classList.remove('screen-shaking');
      this.dom.caughtDialog.showModal();
    }, 700);
  }

  handleCaughtChoice(choice) {
    this.dom.caughtDialog.close();
    window.soundEngine.playClick();

    let escapeChance = 0;
    let defenseText = '';

    if (choice === 'notes') {
      escapeChance = 0.25; // 25% chance of escape
      defenseText = '“Taking notes, sir.”';
    } else if (choice === 'nothing') {
      escapeChance = 0.40; // 40% chance of escape
      defenseText = '“Nothing, sir.”';
    } else {
      escapeChance = 0.10; // 10% chance of escape
      defenseText = '“I was checking the time.”';
    }

    const escaped = Math.random() < escapeChance;

    if (escaped) {
      // Survived the interrogation!
      this.stats.suspicion = 60; // Drops to 60%
      this.adjustStat('sanity', -10);
      this.isPaused = false;
      this.setProfessorState('suspicious');
      this.showProfessorSpeech('Last warning! Don\'t test my patience!');
      this.showToast(`Defense worked! Professor let you off with a harsh warning. Suspicion reset to 60%.`);
      this.updateHUD();
    } else {
      // Failed! Game Over
      this.triggerFailure(`Professor caught you red-handed after your defense: ${defenseText}`);
    }
  }

  /**
   * Random Event Scheduler
   * Guarantees at least 6 events occur unpredictably during the 5 minutes.
   */
  scheduleNextRandomEvent() {
    if (!this.isPlaying) return;

    // Schedule next event in 22 to 38 seconds (divided by simulation speed)
    const delayMs = (Math.floor(Math.random() * 16000) + 22000) / this.simSpeed;

    this.eventSchedulerTimer = setTimeout(() => {
      if (this.isPlaying && !this.isPaused) {
        this.triggerRandomEvent();
      }
      this.scheduleNextRandomEvent();
    }, delayMs);
  }

  triggerRandomEvent() {
    if (this.isPaused) return;

    // Pick an unplayed event if possible, or any event if all were seen
    let pool = GAME_EVENTS.filter(e => !this.usedEventIds.has(e.id));
    if (pool.length === 0) {
      pool = GAME_EVENTS;
      this.usedEventIds.clear();
    }

    const event = pool[Math.floor(Math.random() * pool.length)];
    this.usedEventIds.add(event.id);
    this.currentEvent = event;
    this.isPaused = true;

    // Play event audio
    if (event.id === 'phone_ringing') {
      window.soundEngine.playPhoneRing();
    } else {
      window.soundEngine.playNotification();
    }

    // Populate Event Modal
    document.getElementById('event-icon').textContent = event.icon;
    document.getElementById('event-type-tag').textContent = event.type;
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-description').textContent = event.description;

    const timerBox = document.getElementById('event-timer-container');
    const timerBar = document.getElementById('event-timer-bar');
    const timerVal = document.getElementById('event-countdown');

    // Handle Quick-Time events with timers (e.g. Phone ring, Attendance)
    if (event.timeLimit) {
      timerBox.classList.remove('hidden');
      this.eventTimeRemaining = event.timeLimit;
      timerVal.textContent = `${this.eventTimeRemaining}s`;
      timerBar.style.width = '100%';

      clearInterval(this.eventTimeoutTimer);
      const totalTime = event.timeLimit;
      const intervalStep = 100;
      let elapsed = 0;

      this.eventTimeoutTimer = setInterval(() => {
        elapsed += intervalStep;
        const remaining = totalTime - elapsed / 1000;
        timerVal.textContent = `${Math.ceil(Math.max(0, remaining))}s`;
        timerBar.style.width = `${Math.max(0, (remaining / totalTime) * 100)}%`;

        if (remaining <= 0) {
          clearInterval(this.eventTimeoutTimer);
          this.handleEventTimeout(event);
        }
      }, intervalStep);
    } else {
      timerBox.classList.add('hidden');
      clearInterval(this.eventTimeoutTimer);
    }

    // Populate choices
    const choicesContainer = document.getElementById('event-choices-list');
    choicesContainer.innerHTML = '';

    event.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'event-choice-btn';
      btn.innerHTML = `
        <div class="choice-text-wrap">
          <span class="choice-main-text">${choice.text}</span>
          <span class="choice-hint-text">${choice.hint || ''}</span>
        </div>
        <span class="choice-action-arrow">&rarr;</span>
      `;
      btn.addEventListener('click', () => {
        this.handleEventChoice(choice);
      });
      choicesContainer.appendChild(btn);
    });

    this.dom.eventDialog.showModal();
  }

  handleEventChoice(choice) {
    clearInterval(this.eventTimeoutTimer);
    this.dom.eventDialog.close();
    window.soundEngine.playClick();

    const outcome = choice.effect(this);
    if (outcome && outcome.msg) {
      this.showToast(outcome.msg);
    }

    this.isPaused = false;
    this.checkCriticalFailures();
    this.updateHUD();
  }

  handleEventTimeout(event) {
    this.dom.eventDialog.close();
    if (event.onTimeout) {
      const outcome = event.onTimeout(this);
      if (outcome && outcome.msg) {
        this.showToast(outcome.msg);
      }
    }
    this.isPaused = false;
    this.checkCriticalFailures();
    this.updateHUD();
  }

  /**
   * Health Checks: Can fail from 0 Sanity, 0 Energy, or <75% Attendance
   */
  checkCriticalFailures() {
    if (!this.isPlaying) return;

    if (this.stats.sanity <= 0) {
      this.triggerFailure('Mental breakdown from excessive DBMS normalization. Your brain melted.');
    } else if (this.stats.energy <= 0) {
      this.triggerFailure('Passed out completely on the desk. Snored loudly during professor\'s explanation.');
    } else if (this.stats.attendance < 75) {
      this.triggerFailure('Attendance dropped below the 75% cutoff! HOD immediately dispatched a debarment order.');
    }
  }

  /**
   * Game Over: YOU GOT COOKED 💀
   */
  triggerFailure(reason) {
    this.isPlaying = false;
    this.isPaused = true;
    clearInterval(this.mainTimer);
    clearInterval(this.profBehaviorTimer);
    clearTimeout(this.eventSchedulerTimer);
    clearInterval(this.eventTimeoutTimer);

    window.soundEngine.playFailureSound();

    document.getElementById('failure-reason-text').textContent = reason;
    document.getElementById('fail-sanity').textContent = this.stats.sanity;
    document.getElementById('fail-energy').textContent = this.stats.energy;
    document.getElementById('fail-attendance').textContent = `${this.stats.attendance}%`;
    document.getElementById('fail-suspicion').textContent = `${this.stats.suspicion}%`;

    this.dom.failureDialog.showModal();
  }

  /**
   * Victory: CLASS SURVIVED 🎉
   */
  triggerSuccess() {
    this.isPlaying = false;
    this.isPaused = true;
    clearInterval(this.mainTimer);
    clearInterval(this.profBehaviorTimer);
    clearTimeout(this.eventSchedulerTimer);
    clearInterval(this.eventTimeoutTimer);

    window.soundEngine.playSuccessFanfare();

    // Populate final stats
    document.getElementById('final-sanity').textContent = this.stats.sanity;
    document.getElementById('final-energy').textContent = this.stats.energy;
    document.getElementById('final-attendance').textContent = `${this.stats.attendance}%`;
    document.getElementById('final-money').textContent = `₹${this.stats.money}`;
    document.getElementById('final-suspicion').textContent = `${this.stats.suspicion}%`;

    // Generate humorous reputation title based on playstyle
    const titleData = this.generateReputationTitle();
    document.getElementById('player-title-display').textContent = titleData.title;
    document.getElementById('player-title-desc').textContent = titleData.description;

    this.dom.successDialog.showModal();
  }

  generateReputationTitle() {
    const { sanity, energy, attendance, money, suspicion } = this.stats;
    const { study, sleep, phone, lookBusy } = this.actionCounts;

    if (study >= 8 && attendance >= 90) {
      return {
        title: "ACADEMIC WEAPON",
        description: "You took 40 pages of notes, solved BCNF in your head, and terrorized the backbenchers."
      };
    } else if (sleep >= 5 && energy >= 70) {
      return {
        title: "SLEEPING BEAUTY OF CSE",
        description: "You slept through 90% of relational algebra and woke up like nothing happened."
      };
    } else if (phone >= 6 && suspicion >= 70) {
      return {
        title: "PROFESSIONAL BACKBENCHER",
        description: "You scrolled 200 reels, liked 50 memes, and dodged eye contact with master ninja agility."
      };
    } else if (suspicion >= 85) {
      return {
        title: "SUSPICIOUS INDIVIDUAL",
        description: "The professor had his eye on you the whole time, but lacked concrete evidence."
      };
    } else if (sanity <= 25 || energy <= 25) {
      return {
        title: "SOMEHOW ALIVE",
        description: "Pulse: questionable. Cognitive capacity: 1%. Survival: absolute miracle."
      };
    } else if (money < 50) {
      return {
        title: "CANTEEN SPONSOR",
        description: "You spent your tuition money on samosas and chai under the desk. Respect."
      };
    } else {
      return {
        title: "THE SHADOW BACKBENCHER",
        description: "Balanced all stats gracefully. Neither the professor nor your friends noticed your existence."
      };
    }
  }

  /**
   * Update HUD Elements & Timers
   */
  updateHUD() {
    // 1. Timer Display MM:SS
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    this.dom.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // 2. Advancing Clock Display (Starts at 10:35 AM -> 10:40 AM)
    const elapsed = this.totalTimeSeconds - this.timeRemaining;
    const elapsedMinutes = Math.floor(elapsed / 60);
    const clockMin = 35 + elapsedMinutes;
    this.dom.hudClock.textContent = `10:${String(clockMin).padStart(2, '0')} AM`;

    // 3. Suspicion Meter
    this.dom.suspicionVal.textContent = `${this.stats.suspicion}%`;
    this.dom.suspicionFill.style.width = `${this.stats.suspicion}%`;

    this.dom.suspicionFill.className = 'suspicion-bar-fill';
    if (this.stats.suspicion >= 75) {
      this.dom.suspicionFill.classList.add('danger');
    } else if (this.stats.suspicion >= 50) {
      this.dom.suspicionFill.classList.add('warning');
    }

    // 4. Resource Values
    this.dom.valSanity.textContent = this.stats.sanity;
    this.dom.valEnergy.textContent = this.stats.energy;
    this.dom.valAttendance.textContent = `${this.stats.attendance}%`;
    this.dom.valMoney.textContent = `₹${this.stats.money}`;

    // Dim actions if player has zero resources
    this.dom.btnStudy.disabled = this.stats.sanity < 2 || this.stats.energy < 3;
  }
}

// Instantiate game on load
window.addEventListener('DOMContentLoaded', () => {
  window.broImCookedGame = new BroImCookedGame();
});
