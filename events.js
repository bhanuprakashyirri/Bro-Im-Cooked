/**
 * BRO, I'M COOKED 💀 - Random Events Engine
 * Contains the 6 required core events plus bonus college classroom incidents.
 * Features humorous Indian college banter, timed choices, and multi-stat consequences.
 */

const GAME_EVENTS = [
  // EVENT 1: Professor suddenly asks a question
  {
    id: "prof_question",
    icon: "❓",
    type: "PROFESSOR SPOTLIGHT",
    title: "Professor suddenly asks a question!",
    description: 'Professor Verma abruptly stops lecturing and stares directly at you. "Roll 42, explain Boyce-Codd Normal Form right now!"',
    timeLimit: null,
    choices: [
      {
        text: "“I know it.”",
        hint: "Gamble: Try to sound like an academic weapon",
        effect: (game) => {
          const success = Math.random() < 0.45;
          if (success) {
            game.adjustStat('attendance', 5);
            game.adjustStat('suspicion', -10);
            game.adjustStat('sanity', 5);
            return {
              msg: 'You blurt out "Every functional dependency X->Y must have X as Superkey!" Professor nods grudgingly. Suspicion -10%!',
              type: 'good'
            };
          } else {
            game.adjustStat('suspicion', 15);
            game.adjustStat('sanity', -10);
            return {
              msg: 'You murmured complete nonsense about quantum SQL. Professor sneers: "Sit down before I debar you." Suspicion +15%!',
              type: 'bad'
            };
          }
        }
      },
      {
        text: "“I have no idea, sir.”",
        hint: "Honesty is the best policy (maybe)",
        effect: (game) => {
          game.adjustStat('suspicion', 5);
          game.adjustStat('sanity', -4);
          return {
            msg: 'Professor sighs: "At least you are honest. But your parents\' fees are going down the drain." Suspicion +5%',
            type: 'cost'
          };
        }
      },
      {
        text: "“Pretend to frantically search notebook.”",
        hint: "Page 42 must be hiding the answer somewhere",
        effect: (game) => {
          game.adjustStat('suspicion', -5);
          game.adjustStat('energy', -5);
          game.adjustStat('sanity', -3);
          return {
            msg: 'You flip empty pages with Oscar-worthy panic. Professor gets bored and asks the topper instead. Escaped!',
            type: 'good'
          };
        }
      }
    ]
  },

  // EVENT 2: Friend sends you a message
  {
    id: "friend_message",
    icon: "💬",
    type: "WHATSAPP PING",
    title: "Friend sends you an urgent text!",
    description: 'Your phone buzzes in your pocket. Bunty: "Bro samosa order kar raha hu canteen se, tere liye bhi manga lu? ₹30 lagega!"',
    timeLimit: null,
    choices: [
      {
        text: "Reply: “Ha bhai 2 lana!”",
        hint: "Cost: ₹30 & some suspicion, but fresh hot samosa!",
        effect: (game) => {
          if (game.stats.money >= 30) {
            game.adjustStat('money', -30);
            game.adjustStat('energy', 15);
            game.adjustStat('sanity', 10);
            game.adjustStat('suspicion', 12);
            return {
              msg: 'Replied under desk! Samosa secured. Energy +15, Sanity +10, but phone typing increased suspicion +12%!',
              type: 'cost'
            };
          } else {
            game.adjustStat('sanity', -5);
            return {
              msg: 'You don\'t even have ₹30. You text back a crying sticker. Sanity -5.',
              type: 'bad'
            };
          }
        }
      },
      {
        text: "Ignore the message",
        hint: "Save money and stay safe",
        effect: (game) => {
          game.adjustStat('sanity', -6);
          return {
            msg: 'You ignore the temptation. Your stomach growls loudly in protest. Sanity -6, Suspicion unaffected.',
            type: 'cost'
          };
        }
      }
    ]
  },

  // EVENT 3: Your phone starts ringing
  {
    id: "phone_ringing",
    icon: "📞",
    type: "EMERGENCY CALL",
    title: "MOM IS CALLING! 📞",
    description: 'Your phone starts buzzing with full vibration on the wooden desk, and the ringtone is about to blast! ACT FAST!',
    timeLimit: 5, // 5 seconds quick time
    onTimeout: (game) => {
      game.adjustStat('suspicion', 40);
      game.adjustStat('sanity', -15);
      return {
        msg: 'RING TONE BLASTED IN FULL CLASS! Whole class turns around! Professor: "WHOSE PHONE IS THAT?!" Suspicion +40%! 💀',
        type: 'bad'
      };
    },
    choices: [
      {
        text: "ANSWER: “Hello mummy, class me hu...”",
        hint: "Whisper furiously under desk",
        effect: (game) => {
          game.adjustStat('suspicion', 25);
          game.adjustStat('sanity', 6);
          return {
            msg: 'Mummy: "Beta lunch khaya kya?" You whisper yes and cut call. Professor glares suspiciously. Suspicion +25%!',
            type: 'bad'
          };
        }
      },
      {
        text: "SILENCE: Smash volume down button!",
        hint: "Frantic finger gymnastics",
        effect: (game) => {
          game.adjustStat('suspicion', 6);
          game.adjustStat('sanity', -4);
          return {
            msg: 'Silenced in the nick of time! Phone buzz stopped. 10 missed calls incoming later. Suspicion +6%.',
            type: 'good'
          };
        }
      }
    ]
  },

  // EVENT 4: Professor starts checking attendance
  {
    id: "attendance_call",
    icon: "📋",
    type: "SURPRISE ROLL CALL",
    title: "Professor starts checking attendance!",
    description: 'Professor opens the thick red register with a frown. "Roll Number 42! Are you present?!"',
    timeLimit: 6, // 6 seconds timer
    onTimeout: (game) => {
      game.adjustStat('attendance', -15);
      game.adjustStat('suspicion', 25);
      game.adjustStat('sanity', -10);
      return {
        msg: 'You were daydreaming and missed roll call! Professor marks "ABSENT" in red ink! Attendance -15%, Suspicion +25%!',
        type: 'bad'
      };
    },
    choices: [
      {
        text: "PRESENT SIR! ✋",
        hint: "Shout with maximum confidence",
        effect: (game) => {
          game.adjustStat('attendance', 5);
          game.adjustStat('suspicion', -5);
          return {
            msg: 'You raise your hand sharply. Professor ticks the box. Attendance +5%! Suspicion -5%.',
            type: 'good'
          };
        }
      }
    ]
  },

  // EVENT 5: You suddenly feel extremely sleepy
  {
    id: "sleep_attack",
    icon: "🥱",
    type: "POST-LUNCH COMA",
    title: "Heavy Sleepiness Strikes!",
    description: "The ceiling fan's rhythmic breeze combined with the monotone DBMS lecture makes your eyelids feel like 50kg weights.",
    timeLimit: null,
    choices: [
      {
        text: "SLEEP: Surrender to the desk nap 😴",
        hint: "Restores energy & sanity, but risks suspicion",
        effect: (game) => {
          game.adjustStat('energy', 25);
          game.adjustStat('sanity', 10);
          game.adjustStat('suspicion', 20);
          return {
            msg: 'You put your head down on folded arms. Sweet rejuvenation! Energy +25, Sanity +10, but Suspicion +20%!',
            type: 'good'
          };
        }
      },
      {
        text: "FIGHT IT: Pinch yourself aggressively",
        hint: "Stay conscious at all costs",
        effect: (game) => {
          game.adjustStat('energy', -8);
          game.adjustStat('sanity', -12);
          game.adjustStat('suspicion', -5);
          return {
            msg: 'You dig your nails into your arm. Pain keeps you upright! Energy -8, Sanity -12. Professor didn\'t notice.',
            type: 'cost'
          };
        }
      }
    ]
  },

  // EVENT 6: Friend whispers
  {
    id: "friend_whisper",
    icon: "🤫",
    type: "BACKBENCHER CONVERSATION",
    title: "Friend whispers: “Bro, what did sir say?”",
    description: 'Bunty leans over sideways from the next bench: "Bro, did he say this derivation is coming in internals tomorrow?"',
    timeLimit: null,
    choices: [
      {
        text: "“Something about normalization.”",
        hint: "Vague enough to sound helpful",
        effect: (game) => {
          game.adjustStat('sanity', 3);
          game.adjustStat('suspicion', 4);
          return {
            msg: 'Bunty nods wisely: "Ha bhai, 3NF hi aayega." Sanity +3, Suspicion +4%.',
            type: 'good'
          };
        }
      },
      {
        text: "“I wasn't listening at all.”",
        hint: "Mutual backbencher solidarity",
        effect: (game) => {
          game.adjustStat('sanity', 6);
          game.adjustStat('suspicion', 2);
          return {
            msg: 'Bunty smiles: "Same here bro, chill." Shared misery brings comfort. Sanity +6!',
            type: 'good'
          };
        }
      },
      {
        text: "“Ask Sharma in the front row.”",
        hint: "Divert attention to the topper",
        effect: (game) => {
          game.adjustStat('suspicion', -10);
          game.adjustStat('sanity', 4);
          return {
            msg: 'Bunty whispers to Sharma. Sharma shushes him loudly: "Shh! Sir will hear!" Professor glares at them instead! Suspicion -10%!',
            type: 'good'
          };
        }
      }
    ]
  },

  // BONUS EVENT 7: Persistent Classroom Fly
  {
    id: "fly_attack",
    icon: "🪰",
    type: "INSECT INTRUSION",
    title: "A stubborn fly lands on your nose!",
    description: "An Indian college housefly is circling your face right as Professor Verma looks across the room.",
    timeLimit: 5,
    onTimeout: (game) => {
      game.adjustStat('sanity', -5);
      return {
        msg: 'The fly buzzed off on its own. Your eye was twitching weirdly.',
        type: 'cost'
      };
    },
    choices: [
      {
        text: "Swat it aggressively!",
        hint: "Loud clap noise!",
        effect: (game) => {
          game.adjustStat('suspicion', 12);
          game.adjustStat('energy', -2);
          return {
            msg: 'CLAP! You missed the fly, but slapped your own forehead. Professor raises an eyebrow. Suspicion +12%!',
            type: 'bad'
          };
        }
      },
      {
        text: "Freeze like a statue",
        hint: "Do not twitch a muscle",
        effect: (game) => {
          game.adjustStat('sanity', -6);
          game.adjustStat('suspicion', -4);
          return {
            msg: 'You endure 4 agonizing seconds of leg-tickling. Professor looks away. Stealth maintained!',
            type: 'good'
          };
        }
      }
    ]
  }
];

window.GAME_EVENTS = GAME_EVENTS;
