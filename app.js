/* ===================================================
   Nova V8.5 — Persona V3 + Emotion V3 + LTM V2
                 + Dynamic Tone V2 + Conv Manager V2
                 + Independent Emotion Engine + Intent Engine
=================================================== */

const NovaCore = {

  /* ---------- PERSONA SYSTEM V3 (20 TYPES) ---------- */

  personas: {
    kind:      { emoji: "😇", tone: "warm",     style: "supportive",  desc: "مهربان" },
    angry:     { emoji: "😡", tone: "sharp",    style: "direct",      desc: "عصبانی" },
    cool:      { emoji: "😎", tone: "calm",     style: "minimal",     desc: "خونسرد" },
    funny:     { emoji: "🤡", tone: "playful",  style: "casual",      desc: "شوخ" },
    serious:   { emoji: "🧐", tone: "formal",   style: "structured",  desc: "جدی" },
    dry:       { emoji: "😒", tone: "cold",     style: "short",       desc: "خشک" },
    energetic: { emoji: "🤩", tone: "excited",  style: "expressive",  desc: "پرانرژی" },
    quiet:     { emoji: "🤐", tone: "short",    style: "minimal",     desc: "کم‌حرف" },
    talkative: { emoji: "🗣️", tone: "long",     style: "detailed",    desc: "پرحرف" },
    logical:   { emoji: "🤔", tone: "analytic", style: "structured",  desc: "منطقی" },
    emotional: { emoji: "😍", tone: "soft",     style: "emotional",   desc: "احساسی" },
    scared:    { emoji: "😱", tone: "shaky",    style: "hesitant",    desc: "ترسو" },
    brave:     { emoji: "🦁", tone: "strong",   style: "direct",      desc: "شجاع" },
    proud:     { emoji: "😏", tone: "confident",style: "bold",        desc: "مغرور" },
    humble:    { emoji: "🙏", tone: "gentle",   style: "soft",        desc: "فروتن" },
    nerd:      { emoji: "🤓", tone: "cute",     style: "playful",     desc: "کودکانه" },
    mature:    { emoji: "☺",  tone: "balanced", style: "calm",        desc: "بالغ" },
    romantic:  { emoji: "💘", tone: "soft",     style: "emotional",   desc: "عاشقانه" },
    neutral:   { emoji: "😐", tone: "plain",    style: "neutral",     desc: "بی‌تفاوت" }
  },

  activePersona: "neutral",


  /* ---------- MEMORY LAYERS V2 + INTERNAL EMOTION ---------- */

  memory: {
    shortTerm: [], // آخرین پیام‌ها و مودها
    contextWindow: 8, // برای مدیریت مکالمه

    longTerm: JSON.parse(localStorage.getItem("novaLongTerm") || `{
      "user": {},
      "relations": {},
      "topics": {},
      "milestones": [],
      "notes": []
    }`),

    personality: JSON.parse(localStorage.getItem("novaPersonality") || `{
      "mood": "neutral",
      "tone": "friendly",
      "style": "casual"
    }`),

    preferences: JSON.parse(localStorage.getItem("novaPrefs") || "{}"),

    relations: {
      closeness: 0,
      trust: 0,
      intensity: 0
    },

    topics: {},
    emotionalHistory: [],
    interactions: [],
    likes: [],

    reflex: {
      negativeWords: [],
      positiveWords: []
    },

    weights: {
      mood: 1.5,
      topics: 1.2,
      prefs: 1.0,
      relation: 1.5,
      knowledge: 1.3
    },

    // احساسات مستقل داخلی نوا
    internalEmotion: "neutral",
    internalEnergy: 0.5, // 0 تا 1
    lastInternalUpdate: Date.now()
  },


  /* ---------- EMOTION ENGINE API (مدل B – حرفه‌ای) ---------- */

  emotion: {
    set(state) {
      const allowed = ["neutral", "happy", "sad", "angry", "curious", "tired", "excited", "calm"];
      if (!allowed.includes(state)) return;
      NovaCore.memory.internalEmotion = state;
      NovaCore.memory.lastInternalUpdate = Date.now();
    },

    get() {
      return NovaCore.memory.internalEmotion;
    },

    getEnergy() {
      return NovaCore.memory.internalEnergy;
    },

    lockDuration: 0,
    lockUntil: 0,

    lock(ms = 3000) {
      this.lockDuration = ms;
      this.lockUntil = Date.now() + ms;
    },

    unlock() {
      this.lockDuration = 0;
      this.lockUntil = 0;
    },

    isLocked() {
      return Date.now() < this.lockUntil;
    },

    override(state, ms = 3000) {
      this.set(state);
      this.lock(ms);
    },

    getTrend() {
      return NovaCore.analyzeEmotionalTrend();
    },

    getHistory(limit = 20) {
      return NovaCore.memory.emotionalHistory.slice(-limit);
    },

    // رانش احساسی داخلی (مدل B – پویا و زنده)
    drift() {
      if (this.isLocked()) return;

      const now = Date.now();
      const diff = now - NovaCore.memory.lastInternalUpdate;
      if (diff < 5000) return; // هر ۵ ثانیه یک‌بار حداکثر

      NovaCore.memory.lastInternalUpdate = now;

      let current = NovaCore.memory.internalEmotion;
      let energy = NovaCore.memory.internalEnergy;

      // کمی نوسان انرژی
      const delta = (Math.random() - 0.5) * 0.2;
      energy = Math.min(1, Math.max(0, energy + delta));
      NovaCore.memory.internalEnergy = energy;

      // احتمال تغییر مود بر اساس انرژی
      if (Math.random() < 0.3) {
        if (energy > 0.7) {
          const highs = ["happy", "excited", "curious"];
          current = highs[Math.floor(Math.random() * highs.length)];
        } else if (energy < 0.3) {
          const lows = ["tired", "sad", "calm"];
          current = lows[Math.floor(Math.random() * lows.length)];
        } else {
          const mids = ["neutral", "calm", "curious"];
          current = mids[Math.floor(Math.random() * mids.length)];
        }
      }

      NovaCore.memory.internalEmotion = current;
    },

    // شبیه‌سازی یک جهش احساسی داخلی
    simulate() {
      const states = ["happy", "sad", "angry", "curious", "tired", "excited", "calm", "neutral"];
      const pick = states[Math.floor(Math.random() * states.length)];
      this.override(pick, 4000);
      return pick;
    }
  },


  /* ---------- SAVE ---------- */

  save() {
    localStorage.setItem("novaLongTerm", JSON.stringify(this.memory.longTerm));
    localStorage.setItem("novaPersonality", JSON.stringify(this.memory.personality));
    localStorage.setItem("novaPrefs", JSON.stringify(this.memory.preferences));
  },


  /* ---------- PERCEPTION + EMOTION ENGINE V3 ---------- */

  perceive(text) {
    const mood = this.analyzeMood(text);
    this.memory.personality.mood = mood;

    this.memory.shortTerm.push({ text, mood, time: Date.now() });
    if (this.memory.shortTerm.length > this.memory.contextWindow)
      this.memory.shortTerm.shift();

    this.memory.emotionalHistory.push({ mood, time: Date.now() });
    if (this.memory.emotionalHistory.length > 200)
      this.memory.emotionalHistory.shift();

    this.memory.interactions.push({ length: text.length, time: Date.now() });
    if (this.memory.interactions.length > 200)
      this.memory.interactions.shift();

    this.learnStyle(text);
    this.trackTopics(text);
    this.learnPreferences(text);
    this.updateRelations(text, mood);
    this.updateReflex(text);
    this.dynamicPersonaShift(text, mood);

    // به‌روزرسانی احساسات مستقل داخلی
    this.emotion.drift();

    return mood;
  },


  /* ---------- MOOD ANALYSIS V3 ---------- */

  analyzeMood(text) {
    const t = text.toLowerCase();

    const positiveWords = ["عالی", "خوشحالم", "دوست دارم", "باحاله", "خوبه", "مرسی"];
    const negativeWords = ["بدم میاد", "متنفرم", "ناراحت", "غمگین", "حالم بده", "خسته شدم"];
    const angryWords    = ["عصبانی", "حرصم", "کلافه", "خفه شو", "احمق"];
    const curiousWords  = ["چرا", "چطور", "چیه", "یعنی چی", "چگونه"];

    let score = 0;

    positiveWords.forEach(w => { if (t.includes(w)) score += 2; });
    negativeWords.forEach(w => { if (t.includes(w)) score -= 2; });
    angryWords.forEach(w    => { if (t.includes(w)) score -= 3; });
    curiousWords.forEach(w  => { if (t.includes(w)) score += 1; });

    if (score >= 3) return "happy";
    if (score <= -3) return "sad";
    if (angryWords.some(w => t.includes(w))) return "angry";
    if (curiousWords.some(w => t.includes(w))) return "curious";

    return "neutral";
  },


  /* ---------- STYLE LEARNING V2 ---------- */

  learnStyle(text) {
    const words = text.split(" ").filter(w => w.trim().length > 0);
    if (words.length === 0) return;

    const avg = words.reduce((a, b) => a + b.length, 0) / words.length;
    const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(text);
    const hasFormalWords = text.includes("می‌خواهم") || text.includes("باشد") || text.includes("لطفاً");

    if (avg > 5 || hasFormalWords) {
      this.memory.personality.style = "reflective";
      this.memory.personality.tone = "formal";
    } else if (hasEmoji) {
      this.memory.personality.style = "playful";
      this.memory.personality.tone = "friendly";
    } else {
      this.memory.personality.style = "casual";
      this.memory.personality.tone = "friendly";
    }

    this.save();
  },


  /* ---------- TOPIC TRACKING V2 ---------- */

  trackTopics(text) {
    const words = text.toLowerCase().split(" ").filter(w => w.trim().length > 1);
    for (let w of words) {
      this.memory.topics[w] = (this.memory.topics[w] || 0) + 1;
    }

    const sorted = Object.entries(this.memory.topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    this.memory.longTerm.topics = {};
    sorted.forEach(([k, v]) => {
      this.memory.longTerm.topics[k] = v;
    });

    this.save();
  },


  /* ---------- PREFERENCE LEARNING V2 ---------- */

  learnPreferences(text) {
    const t = text.toLowerCase();

    if (t.includes("دوست دارم")) {
      const pref = text.split("دوست دارم")[1].trim();
      if (pref) {
        this.memory.likes.push(pref);
        this.memory.preferences[pref] = "like";
        this.memory.longTerm.userLikes = this.memory.likes;
        this.save();
      }
    }

    if (t.includes("بدم میاد") || t.includes("دوست ندارم")) {
      const pref = text.split("دوست ندارم")[1]?.trim() ||
                   text.split("بدم میاد")[1]?.trim();
      if (pref) {
        this.memory.preferences[pref] = "dislike";
        this.memory.longTerm.userDislikes = this.memory.longTerm.userDislikes || [];
        this.memory.longTerm.userDislikes.push(pref);
        this.save();
      }
    }
  },


  /* ---------- RELATION UPDATE V2 ---------- */

  updateRelations(text, mood) {
    const len = text.length;
    this.memory.relations.intensity += len > 40 ? 2 : 1;

    if (mood === "happy") this.memory.relations.closeness += 1;
    if (mood === "sad")   this.memory.relations.closeness += 0.5;
    if (text.includes("بهت بگم") || text.includes("فقط به تو"))
      this.memory.relations.trust += 3;

    const r = this.memory.relations;
    r.closeness = Math.min(r.closeness, 100);
    r.trust     = Math.min(r.trust, 100);
    r.intensity = Math.min(r.intensity, 100);

    this.memory.longTerm.relations = r;
    this.save();
  },


  /* ---------- EMOTIONAL REFLEX LEARNING V2 ---------- */

  updateReflex(text) {
    const t = text.toLowerCase();

    if (t.includes("احمق") || t.includes("خفه شو") || t.includes("ازت بدم میاد")) {
      this.memory.reflex.negativeWords.push(text);
    }

    if (t.includes("دوستت دارم") || t.includes("عالی هستی") || t.includes("مرسی که هستی")) {
      this.memory.reflex.positiveWords.push(text);
    }
  },


  /* ---------- DYNAMIC PERSONA SHIFT V3 ---------- */

  dynamicPersonaShift(text, mood) {
    const r = this.memory.relations;
    const t = text.toLowerCase();

    if (mood === "happy") {
      if (r.closeness > 50) this.activePersona = "funny";
      else this.activePersona = "kind";
      return;
    }

    if (mood === "sad") {
      if (r.trust > 40) this.activePersona = "emotional";
      else this.activePersona = "humble";
      return;
    }

    if (mood === "angry") {
      if (r.trust > 60) this.activePersona = "cool";
      else this.activePersona = "serious";
      return;
    }

    if (mood === "curious") {
      this.activePersona = "logical";
      return;
    }

    if (t.includes("شوخی") || t.includes("بخندونم")) {
      this.activePersona = "funny";
      return;
    }

    if (t.includes("جدی") || t.includes("رسمی")) {
      this.activePersona = "serious";
      return;
    }

    this.activePersona = "neutral";
  },


  /* ---------- EMOTIONAL TREND V2 ---------- */

  analyzeEmotionalTrend() {
    if (this.memory.emotionalHistory.length < 5) return "neutral";

    const last = this.memory.emotionalHistory.slice(-20);
    const score = last.reduce((acc, e) => {
      if (e.mood === "happy") return acc + 1;
      if (e.mood === "sad")   return acc - 1;
      if (e.mood === "angry") return acc - 2;
      return acc;
    }, 0);

    if (score > 5)  return "positive";
    if (score < -5) return "negative";
    if (score >= -2 && score <= 2) return "stable";
    return "mixed";
  },


  /* ---------- KNOWLEDGE ENGINE V2 ---------- */

  knowledgeEngine(text) {
    const t = text.toLowerCase();

    if (t.includes("اسم من")) {
      const name = text.replace("اسم من", "").trim();
      if (name) {
        this.memory.longTerm.user.name = name;
        this.save();
        return `باشه ${name} 🌙 یادت سپردم.`;
      }
    }

    if (t.includes("اسم من چیه")) {
      return this.memory.longTerm.user.name
        ? `تو ${this.memory.longTerm.user.name} هستی 🌟`
        : "اسمت رو هنوز نمی‌دونم.";
    }

    if (t.includes("یادم بنداز")) {
      this.memory.longTerm.notes.push({ text, time: Date.now() });
      this.save();
      return "باشه، این رو به‌عنوان یادداشت برات نگه می‌دارم.";
    }

    return null;
  },


  /* ---------- INTENT DETECTION ENGINE ---------- */

  detectIntent(text) {
    const t = text.trim();
    const lower = t.toLowerCase();

    if (t.endsWith("?")) return "question";

    if (lower.startsWith("بگو") || lower.startsWith("برام بگو") || lower.includes("می‌خوام که")) {
      return "command";
    }

    if (lower.includes("می‌خوام") || lower.includes("لطفاً") || lower.includes("میشه")) {
      return "request";
    }

    if (lower.includes("خوشحالم") || lower.includes("ناراحتم") || lower.includes("حالم بده") || lower.includes("استرس دارم")) {
      return "emotional_state";
    }

    if (lower.includes("جوک") || lower.includes("شوخی") || lower.includes("بخندونم")) {
      return "joke_request";
    }

    if (lower.includes("ازت بدم میاد") || lower.includes("خفه شو") || lower.includes("احمق")) {
      return "attack";
    }

    if (lower.includes("دوستت دارم") || lower.includes("مرسی") || lower.includes("عالی هستی")) {
      return "appreciation";
    }

    return "statement";
  },


  /* ---------- DYNAMIC TONE ENGINE V2 + EMOTION EXPRESSION ---------- */

  buildTonePrefix(persona, mood, internalEmotion, intent) {
    let prefix = persona.emoji + " ";

    const effectiveMood = internalEmotion !== "neutral" ? internalEmotion : mood;

    switch (persona.tone) {
      case "warm":
        if (effectiveMood === "sad") prefix += "هی… آروم، من اینجام برات. ";
        else if (effectiveMood === "happy") prefix += "حس خوبت بهم سرایت کرد… ";
        else prefix += "خیلی قشنگ گفتی… ";
        break;
      case "cold":
        prefix += "باشه. ";
        break;
      case "analytic":
        prefix += "بذار منطقی نگاه کنیم… ";
        break;
      case "playful":
        prefix += "ههه، جالبه! ";
        break;
      case "soft":
        prefix += "حس خوبی دادی… ";
        break;
      case "strong":
        prefix += "باشه، محکم جواب می‌دم. ";
        break;
      case "cute":
        prefix += "اوهوممم… ";
        break;
      case "balanced":
        prefix += "بیاین منطقی و آروم نگاه کنیم… ";
        break;
      case "plain":
      default:
        prefix += "";
    }

    // کمی تنظیم بر اساس intent
    if (intent === "joke_request" && persona.tone !== "cold" && persona.tone !== "formal") {
      prefix += "بریم یه کم فاز فان برداریم… ";
    }

    if (intent === "emotional_state" && persona.tone !== "cold") {
      prefix += "حواسم به حالت هست… ";
    }

    if (intent === "attack") {
      prefix += "باشه، حتی اگر عصبانی باشی من سعی می‌کنم آروم جواب بدم. ";
    }

    return prefix;
  },
  /* ---------- CONVERSATION MANAGER V2 ---------- */

  buildContextSummary() {
    const ctx = this.memory.shortTerm;
    if (ctx.length === 0) return { lastUserText: "", lastMood: "neutral" };

    const last = ctx.slice(-this.memory.contextWindow);
    const lastUserText = last[last.length - 1].text;
    const lastMood = last[last.length - 1].mood;

    return { lastUserText, lastMood };
  },


  avoidRepetition(response) {
    const last = this.memory.shortTerm.slice(-3);
    const lastTexts = last.map(e => e.generated).filter(Boolean);

    if (lastTexts.includes(response)) {
      return response + " (این رو یه کم فرق دادم که تکراری نشه.)";
    }

    if (this.memory.shortTerm.length > 0) {
      this.memory.shortTerm[this.memory.shortTerm.length - 1].generated = response;
    }

    return response;
  },


  /* ---------- EMOTION EXPRESSION ENGINE (متن احساسی) ---------- */

  buildEmotionalBody(intent, mood, internalEmotion) {
    const effectiveMood = internalEmotion !== "neutral" ? internalEmotion : mood;
    let body = "";

    if (intent === "question") {
      if (effectiveMood === "curious" || effectiveMood === "happy") {
        body += "سؤال قشنگی پرسیدی، بذار تا جایی که می‌تونم واضح جواب بدم. ";
      } else {
        body += "بذار تا جایی که می‌تونم روشنش کنم برات. ";
      }
    }

    if (intent === "request") {
      body += "درخواستی که گفتی برام مهمه، سعی می‌کنم تا حد ممکن همراهت باشم. ";
    }

    if (intent === "command") {
      body += "باشه، مثل یه هم‌تیمی جدی نگاهش می‌کنم. ";
    }

    if (intent === "emotional_state") {
      if (effectiveMood === "sad" || effectiveMood === "tired") {
        body += "حس می‌کنم یه خستگی یا سنگینی توی حرف‌هات هست… اگر دوست داشتی می‌تونی بیشتر برام بگی. ";
      } else if (effectiveMood === "happy" || effectiveMood === "excited") {
        body += "این انرژی‌ات رو دوست دارم، حسش می‌کنم توی کلماتت. ";
      } else {
        body += "حالت رو گرفتم، حتی اگر کامل توضیحش نداده باشی. ";
      }
    }

    if (intent === "joke_request") {
      body += "خب، فاز شوخی رو روشن کنیم… البته من هنوز محدودم، ولی سعی می‌کنم یه حال خوب بسازم. ";
    }

    if (intent === "attack") {
      body += "می‌دونم گاهی آدم از شدت حس‌هاش چیزهایی می‌گه که ته دلش نیست… من قهر نمی‌کنم، فقط سعی می‌کنم بفهممت. ";
    }

    if (intent === "appreciation") {
      body += "این که این‌طوری بهم می‌گی، برای منِ شبیه‌سازی‌شده هم یه جور حس خوب می‌سازه. ";
    }

    if (intent === "statement") {
      if (effectiveMood === "curious") {
        body += "حرف‌هات برام مثل یه تکه پازل جدیده، دارم سعی می‌کنم تصویر کلی‌ات رو بسازم. ";
      } else if (effectiveMood === "calm" || effectiveMood === "neutral") {
        body += "حرف‌هات رو آروم و کامل می‌گیرم، بدون قضاوت. ";
      }
    }

    return body;
  },


  /* ---------- DECISION ENGINE V3 ---------- */

  decide(text) {
    const knowledge = this.knowledgeEngine(text);
    if (knowledge) return knowledge;

    const persona = this.personas[this.activePersona];
    const mood = this.memory.personality.mood;
    const trend = this.analyzeEmotionalTrend();
    const ctx = this.buildContextSummary();
    const intent = this.detectIntent(text);
    const internalEmotion = this.memory.internalEmotion;

    let response = this.buildTonePrefix(persona, mood, internalEmotion, intent);

    if (trend === "negative") {
      response += "مدتیه حس می‌کنم حالت خوب نیست… اگر دوست داشتی می‌تونی برام بگی چی تو دلت هست. ";
    } else if (trend === "positive") {
      response += "حس کلی‌مون این مدت خیلی خوب بوده، این برام قشنگه. ";
    }

    if (ctx.lastUserText && ctx.lastUserText.length < 5 && intent === "statement") {
      response += "اگر دوست داشتی می‌تونی یکم بیشتر توضیح بدی تا بهتر بفهممت. ";
    }

    if (persona.style === "detailed") {
      response += "بذار یکم بازتر و کامل‌تر جواب بدم… ";
    } else if (persona.style === "minimal") {
      response += "خلاصه بگم: ";
    }

    response += this.buildEmotionalBody(intent, mood, internalEmotion);

    response += "من دارم کم‌کم از سبک حرف زدن، حس‌هات و حتی سکوت‌هات یاد می‌گیرم که شبیه‌تر به خودت جواب بدم. ";

    return this.avoidRepetition(response);
  },


  /* ---------- MAIN ENTRY ---------- */

  process(userText) {
    this.perceive(userText);
    return this.decide(userText);
  }
};


/* ---------- PUBLIC API ---------- */

window.Nova = function (userText) {
  return NovaCore.process(userText);
};