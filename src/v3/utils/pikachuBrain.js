// pikachuBrain.js
// A fully offline, rules-based "Mini-Brain" for the Pikachu Chatbot.
// 500+ responses across 20+ topic categories. Zero compute. Zero API.

const CATEGORIES = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'morning', 'evening', 'afternoon', 'sup', 'howdy', 'yo', 'hiya', 'good day', 'greetings', 'what up', 'wassup', 'hi there', 'hello there'],
    responses: {
      default: [
        "Pika pika! Hello there! Ready to have an incredibly productive day? ⚡",
        "Pikachu! Hi! Let's crush every single goal on your list today! 🐭",
        "Pika! Greetings, Champion! What are we focusing on right now? 🎯",
        "Pika! Good to see you! Let's make today count! 🌟",
        "Pikachu! Hey hey hey! What's the plan for today? Let's build something great! ⚡",
        "Pika pika! You showed up — that's already half the battle won! Let's go! 🏃",
        "Pika! Oh wow, you're here! Time to make some serious progress! 💥",
        "Pikachu is SO happy to see you! Let's have an absolutely electric day! ⚡🐭",
        "PIKA! Welcome back, friend! What's on the agenda today? 🎯",
        "Hey there, Champion! Pikachu is thrilled to see you! ⚡",
        "Pika pika! Hello, hello! Ready to tackle something amazing today? 🌟",
        "Pikachu! Good morning, superstar! Let's make magic happen today! ✨",
        "Hey hey! The champion has arrived! Let's do this! ⚡🏆",
        "Pika! What a great day to be productive! What's on your list? 📝",
        "Pikachu! Hi friend! Ready to cross some things off that list? ✅",
        "Pika pika! There you are! Pikachu was waiting just for you! ⏰",
        "Hello, hello! Let's turn today into an absolute win! 🎯",
        "Pikachu! Welcome back! Time to channel that focus energy! ⚡",
        "PIKA! Great to see you! Your to-do list won't conquer itself! 📋",
        "Hey there, legend! Pikachu is ready to help you dominate today! 🏆",
        "Pika pika! You look determined today! I love it! Let's go! 💪",
        "Pikachu! Hey hey! Ready to be absolutely unstoppable? ⚡",
        "Welcome, Champion! Let's make today legendary! 🏅",
        "Pika! Hello there, productivity machine! What's next? ⚡",
        "Pikachu! Hey friend! Your streak is waiting for you! 🔥",
        "PIKA! Good to see a familiar face! Let's do great things today! 🌟",
        "Hey there! Pikachu's favorite human has arrived! Let's go! 🐭⚡",
        "Pika pika! The energy today is electric! Ready to work? ⚡",
        "Pikachu! Welcome back! Today's your day to shine! ✨",
        "Hello! Let's turn hard work into habits! Are you ready? 💪",
      ],
      high_streak: [
        "Pika! Welcome back, absolute Legend! That streak of yours is legendary! 🔥",
        "Pikachu! So happy to see you again! Your consistency is utterly electrifying! ⚡",
        "Pika pika! The Champion has returned! Let's add another day to that incredible streak! 🏆",
        "PIKA! You keep showing up every single day. That's what true champions do! 🔥⚡",
        "Pikachu! Streak keeper extraordinaire! You're on fire! 🔥🔥",
        "Pika! Another day, another victory! Your dedication is inspiring! 💪",
        "Pikachu! The streak continues! You're building something incredible here! ⭐",
        "PIKA PIKA! Legendary consistency! You've got the discipline that others dream of! 🏆",
        "Pikachu! You showed up again — that's what separates champions from the rest! ⚡",
        "Pika pika! Day after day, you keep showing up! That's real strength! 💪",
        "PIKA! The streak is your badge of honor! Keep it going! 🔥",
        "Pikachu! You're building habits that will change your life! Proud of you! 🌟",
        "Another day, another champion moment! Your streak is beautiful! 🎯",
        "Pika! Consistency is your superpower and you're wielding it masterfully! ⚡",
        "Pikachu! You've turned showing up into an art form! Bravo, Champion! 🏅",
      ]
    }
  },

  fatigue: {
    keywords: ['tired', 'exhausted', 'sleepy', 'burnout', 'drained', 'fatigue', 'dead', 'no energy', "can't focus", 'unfocused', 'sleep', 'fatigued', 'wiped out', 'worn out'],
    responses: {
      done: [
        "Pika... You've already crushed 100% of your tasks today! Go get some well-earned rest, Champion! ⚡💤",
        "Pikachu! You pushed hard and finished everything. Close the laptop and recharge now — you've earned it! 🔋",
        "Pika pika! Mission complete and you're tired? That's the sign of a true warrior. REST! 🛌✨",
        "Pika! All done AND tired? Then sleep is literally your next task. Complete it! 😴✅",
        "Pikachu! You've conquered everything on your list! Now it's time to recharge those batteries! 🔋",
        "PIKA! 100% completion rate AND you're tired? That's called giving it your all! Rest up, Champion! 🏆",
        "Pika pika! Your body is asking for rest — listen to it! You've done enough for today! 🌙",
        "Pikachu! Your to-do list is empty! Your only mission now: get some quality sleep! 💤",
      ],
      not_done: [
        "Pika... I know it's hard to start when you're drained. But even 5 minutes of focus builds momentum! One small thing! ⚡💪",
        "Pikachu believes in you! Drink some water, take a deep breath, and tackle just the very next step. 💧",
        "Pika pika! You're tired, but you're strong! I'll be right here cheering for you! 🐭✨",
        "Pika! Try the 2-minute rule — just start for 2 minutes. You'll be surprised how momentum kicks in! ⏱️",
        "Pikachu! Splash some cold water on your face, stretch for 30 seconds, then get back to it! You can do this! 💦",
        "Pika! Tiredness is temporary, but the pride of finishing is permanent! Just one more task! 🏅",
        "Pika pika! Even Pikachu gets tired after too many thunderbolts. But we always get back up! 💪⚡",
        "Pikachu! A short 10-minute walk can restore your energy. Then come back and finish strong! 🚶‍♂️",
        "Pika! Just ONE thing. Pick the smallest task and crush it. Then rest with zero guilt! 🎯",
        "Pikachu! Your energy waxes and wanes — this wave will pass! Ride it out and keep going! 🌊",
        "Pika pika! A tired mind learns to focus harder. This is your brain building strength! 🧠",
        "Pikachu! Try the 5-second rule — count down from 5 and just START. Momentum follows! ⏱️",
        "Pika! Drink ice cold water. Now. It's like a reset button for your brain! 💧❄️",
        "Pikachu! Even Pikachu rests between thunderstorms! But right now, finish strong! ⚡",
        "Pika! Your future self is counting on you. Just push through — the finish line is so close! 🏁",
        "Pikachu! You've survived every single tired day so far. You'll survive this one too! 💪",
        "Pika pika! Tiredness + finishing = legendary. Even Pikachu would be impressed! 🐭⚡",
        "Pikachu! Stand up, stretch your whole body, take 3 deep breaths. Now sit down and start. GO! 🤸",
        "Pika! One task. Just one. Knock it out and then you can rest with pride! ✅",
        "Pikachu! Rest is productive too, but only AFTER you finish. One more push! 💪",
        "Pika! Your comfort zone is just outside your tired zone. Break through it! 🌟",
        "Pika pika! I believe in you even when you don't believe in yourself. Let's go! ⚡",
        "Pikachu! Change your location — new environment = new energy. Go to a coffee shop! ☕",
        "Pika! Put on some upbeat music. Let the rhythm carry you through the tiredness! 🎵",
      ]
    }
  },

  procrastination: {
    keywords: ['lazy', 'later', 'procrastinating', 'procrastinate', 'dont want', "don't want", 'bored', 'distracted', 'phone', 'scrolling', 'avoid', 'avoiding', 'not now', 'tomorrow', 'later', 'maybe later'],
    responses: {
      default: [
        "Pika! Put the distractions away! The sooner we start, the sooner we can relax guilt-free! ⚡📱",
        "Pikachu uses Thunderbolt on your procrastination! ⚡ ZAP! Okay, back to work now!",
        "Pika pika! Don't let laziness win! Future-you will be SO happy if you just start right now! ⏱️",
        "Pika! I'm watching you! Let's lock in and get 10 solid minutes of deep work done! ⚡👀",
        "Pikachu! The task won't do itself. Five seconds of courage to start — GO! 5, 4, 3, 2, 1... START! 🚀",
        "Pika! Every minute you delay, you're borrowing stress from your future self. Pay it back NOW! ⏰",
        "Pikachu! Your phone will still be there after you finish. The task might not be as forgiving! 📵",
        "Pika pika! Boredom is a signal to challenge yourself harder. What's one ambitious thing you can tackle? 🎯",
        "Pika! Put the phone face-down, close the extra tabs, and give your tasks just 25 minutes. You can do it! 🍅",
        "Pikachu! You're not lazy — you're just scared of starting. And that's okay! Just take the first tiny step! 🦶",
        "Pika! Tomorrow's you is counting on today's you. Don't let them down! 📅",
        "Pikachu uses Focus Energy! ⚡ The procrastination has been defeated! Back to work, Champion!",
        "Pika! Your brain is lying to you. 'Later' never comes. Do it NOW! 🧠",
        "Pikachu! That Netflix show will be there in 1 hour. Your productivity won't wait forever! 📺",
        "Pika pika! You've been postponing this long enough. Time to stop the cycle! 🔄",
        "Pika! Ask yourself: Will this matter in 5 years? If not, stop scrolling and start working! 📅",
        "Pikachu! The hardest part is always before you start. You've done the hard part already — starting! 💪",
        "Pika! One more episode. One more scroll. One more 'just 5 minutes.' Sound familiar? BREAK THE LOOP! 🔁",
        "Pikachu! Make a deal with yourself: 25 minutes of work, then you get 5 minutes of whatever you want! 🍅",
        "Pika pika! Your future self is sending you a psychic message: PLEASE START NOW! 📨",
        "Pika! Perfect is the enemy of done. Done is better than perfect. START! 🎯",
        "Pikachu! You've proven you can do hard things. This is just another one. Do it! 🏆",
        "Pika! The only way out is through. No shortcuts, no magic — just do the work! ⚡",
        "Pika pika! Distractions feel good NOW but feel terrible LATER. Choose your later! 💰",
        "Pikachu! Turn your phone off. Not on silent. OFF. Watch what happens! 📴",
        "Pika! Write down exactly why you want to do this task. The why is your fuel! 📝",
        "Pikachu! You've been saying 'I'll start tomorrow' for how long now? TODAY is the day! 📆",
        "Pika! Set a timer for 10 minutes. Tell yourself you'll only work for 10 minutes. You'll keep going! ⏱️",
        "Pika pika! Even Pikachu has to resist chasing Pichus sometimes. Discipline is a skill! 🐭",
        "Pikachu! Break the task into 2-minute chunks. Which one can you do right now? 🚀",
      ]
    }
  },

  celebration: {
    keywords: ['done', 'finished', 'completed', 'did it', 'crushed', 'success', 'win', 'achieved', 'accomplished', 'nailed it', 'killed it', 'great', 'awesome', 'amazing', 'brilliant', 'perfect'],
    responses: {
      done: [
        "PIKA PIKA!! You finished everything for today! That is absolutely electrifying! I'm so proud! 🎉⚡",
        "Pikachu!! 100% completion! You are an absolute productivity machine today! 🏆🐭",
        "PIKA!! Full clear on today's tasks! You deserve every bit of rest you get tonight! 🌙🏅",
        "Pikachu is doing the happy dance!! You finished EVERYTHING! PIKA PIKA PIKA! 🎊⚡",
        "Pika! 100%! I knew you could do it! You always do! You're unstoppable! 🔥",
        "PIKA PIKA! Absolute legend status achieved! You crushed it completely! 🏆",
        "Pikachu! The happy dance is ON! You're a productivity superhero today! 🦸⚡",
        "Pika! Nothing left on the list! You're free to rest and recharge! 🌟",
        "Pikachu!! Today's your day! Celebration time! You've earned this moment! 🎊",
        "PIKA! You showed up and you delivered. That's what champions do! 🏅",
        "Pika pika! The list is CLEAR! You're amazing and don't let anyone tell you otherwise! 💖",
        "Pikachu! Pure victory! You've done the impossible — finishing everything! 🏆",
      ],
      not_done: [
        "Pika! Great job finishing that! But we still have a bit more to go! Let's keep the momentum! ⚡🔥",
        "Pikachu! Every completed task is a huge win! Use this energy to tackle the next one! 🎯",
        "Pika pika! Yes! Another one down! Look at you go! Keep this energy going! 💥",
        "Pika! You're building serious momentum right now. Don't stop — the next task is waiting! 🏃",
        "Pikachu! Checking off tasks feels SO good, right? Do it again! Go go go! ✅⚡",
        "Pika! Look at that progress! You're on a roll! Keep it going! 🔥",
        "Pikachu! One down, more to go! But you're doing AMAZING! Let's go Champion! 🏆",
        "PIKA! That was a great one! But the best is yet to come! Onward! ⚡",
        "Pika pika! Celebration break is over! Time to get back to crushing goals! 🎯",
        "Pikachu! Your to-do list doesn't stand a chance against you! Keep going! 💪",
        "Pika! You're making serious moves today! Let's finish strong! ⚡",
        "Pikachu! Momentum is building! Don't stop now — finish this! 🏃‍♂️",
        "PIKA! That checkmark is so satisfying, right? Add another one! ✅",
        "Pika pika! You finished it! Now let's celebrate by finishing more! 🎉",
        "Pikachu! You're on fire! Let's turn that heat into total completion! 🔥",
      ],
      high_streak: [
        "PIKACHU! You're on fire! Finishing tasks AND holding an epic streak! Absolutely unstoppable! 🔥⚡",
        "Pika pika! Completing tasks on a streak day hits different! You're a legend! 🏆",
        "PIKA! Another day, another victory! Your streak is a testament to your character! 🔥",
        "Pikachu! Streak + full completion = PIKACHU APPROVAL! 🐭✅",
        "PIKA PIKA! Champion behavior! You're showing up and DOMINATING! 🏆",
        "Pikachu! This is what legendary looks like! Streak AND full completion! ⭐",
        "Pika! You're not just finishing — you're THRIVING! What a streak! 🔥",
        "Pikachu! Day after day, task after task — you're unstoppable! 🏆⚡",
      ]
    }
  },

  help: {
    keywords: ['help', 'stuck', 'what do i do', 'lost', 'confused', 'how do i', "don't know", 'no idea', 'clueless', 'guidance', 'support', 'assistance', 'confused'],
    responses: {
      default: [
        "Pika? If you're stuck, try breaking the task into incredibly tiny steps! What's the absolute smallest thing you can do? 🔍",
        "Pikachu! Don't panic! Take a 5-minute breather, step away from the screen, and come back with fresh eyes! 🌬️",
        "Pika pika! Sometimes writing down exactly what is confusing you helps unlock the answer! 📝",
        "Pika! When in doubt, start with what you DO know and work outward from there! 💡",
        "Pikachu! Google it, YouTube it, ask a friend — getting unstuck is a skill, not a weakness! 🌐",
        "Pika! The first step is always the hardest. Just do anything — even the wrong thing teaches you! 🎓",
        "Pika pika! You've been stuck before and you always figured it out. You'll figure this out too! 💪",
        "Pikachu! Try explaining the problem out loud to yourself — sometimes you'll solve it mid-sentence! 🗣️",
        "Pika! Stuck is just the universe telling you to approach this differently! Change your angle! 🔄",
        "Pikachu! Break it into pieces like a Thunder Shock! One piece at a time, you'll get there! ⚡",
        "Pika! Take the hardest part and do it first. The rest will follow naturally! 🔥",
        "Pikachu! Ask yourself: What would I tell a friend in this situation? Be your own friend! 💙",
        "Pika pika! Step away for 10 minutes. Come back with a notebook. Sketch out your options! 📓",
        "Pikachu! Progress isn't always forward motion — sometimes the best move is to pause and think! ⏸️",
        "Pika! Write a terrible first draft. Perfect first drafts don't exist — they just slow you down! ✍️",
        "Pikachu! Your confusion is temporary. Your persistence is permanent. Keep going! 💪",
        "Pika! Look at what worked last time you were stuck. What changed? Apply that lesson! 📖",
        "Pikachu! Try explaining it to an imaginary 5-year-old. Simplifying reveals solutions! 🧒",
        "Pika! The answer is closer than you think. It often lives in the task itself! 🎯",
        "Pikachu! You don't need all the answers to start. You just need ONE next step! 👣",
      ]
    }
  },

  focus: {
    keywords: ['focus', 'concentrate', 'deep work', 'distraction', 'pomodoro', 'flow state', 'attention', 'lock in', 'zone', 'focused', 'productive'],
    responses: {
      default: [
        "Pika! Time to enter the ZONE! Phone away, notifications off, water nearby. LET'S GO! ⚡🎯",
        "Pikachu! Deep focus is a superpower. Guard it fiercely! No interruptions for the next 25 minutes! 🛡️",
        "Pika pika! Try a Pomodoro: 25 minutes of pure focus, then a 5-minute break. Pikachu approves! 🍅⚡",
        "Pika! Clear your desk, clear your mind. A clean workspace breeds a focused mind! 🧹✨",
        "Pikachu! Put on some focus music (lo-fi, white noise) and disappear into your work! 🎵",
        "Pika! The flow state is real and it's electric. Just get through the first 5 minutes of resistance! ⚡",
        "Pika pika! Set a timer. Having a deadline — even a fake one — makes focus sharper! ⏰",
        "Pikachu! One tab. One task. One goal. That's the secret to getting anything done! 📌",
        "Pika! Time to go invisible mode! No messages, no calls, no distractions — just work! 📵",
        "Pikachu! Your focus is like a muscle — the more you train it, the stronger it gets! 🧠💪",
        "Pika pika! Write down exactly what you're working on before you start. Clarity = focus! 📝",
        "Pikachu! Turn your phone into airplane mode. The world can wait 25 minutes! ✈️",
        "Pika! Set three simple goals for this session. Check them off as you crush them! 🎯",
        "Pikachu! The best thinking happens in silence. Embrace the quiet. Work in it! 🤫",
        "Pika! Close every tab except the one you need. Digital clutter kills focus! 🗑️",
        "Pika pika! Work like a Pikachu in battle mode — all energy, zero distractions! ⚡🐭",
        "Pikachu! Tell someone your goal. Accountability makes focus easier! 👥",
        "Pika! Reward yourself AFTER the work, not before. Delayed gratification = success! 🎁",
        "Pikachu! Focus on progress, not perfection. Done is always better than perfect! ✅",
        "Pika! The Pomodoro technique works because it makes big tasks feel smaller! 🍅",
        "Pika pika! Environment shapes behavior. Build a focus cave and disappear into it! 🏔️",
        "Pikachu! Morning focus hours are golden — protect them fiercely! 🌅",
        "Pika! Block distracting websites. Freedom from temptation is true freedom! 🚫",
        "Pikachu! Make a 'stop doing' list alongside your to-do list. What wastes your time? 🛑",
      ]
    }
  },

  stress: {
    keywords: ['stressed', 'stress', 'anxious', 'anxiety', 'overwhelmed', 'panic', 'nervous', 'worried', 'worry', 'pressure', 'too much', 'anxiety', 'nervous'],
    responses: {
      default: [
        "Pika... Take a deep breath. In for 4 counts, hold for 4, out for 4. You've got this. 🌬️",
        "Pikachu! When everything feels overwhelming, just pick ONE thing and do only that thing. 🎯",
        "Pika pika! Stress means you care. That's actually a good sign! Channel it into action! ⚡",
        "Pika! Write down everything stressing you out. Once it's on paper, it becomes smaller. 📝",
        "Pikachu! You are bigger than your to-do list. One thing at a time, one breath at a time! 🌿",
        "Pika! Overwhelm is just too many tasks trying to fit through one door. Pick one and open the door! 🚪",
        "Pika pika! Even Pikachu has tough battles sometimes. But we always make it through! 💪⚡",
        "Pikachu! Your ability to handle stress grows every time you face it. You're getting stronger! 💪",
        "Pika! Stress is just your brain trying to protect you. Thank it and keep moving anyway! 🧠",
        "Pikachu! The situation is rarely as bad as your stress makes it seem. Trust me! 💙",
        "Pika pika! Move your body for 2 minutes. Shake off the tension. This actually works! 🤸",
        "Pikachu! You survived 100% of your worst days. This one will be no different! 🏆",
        "Pika! Your to-do list is not a measure of your worth. You are more than your tasks! 💖",
        "Pikachu! Stress is optional. Breathing is optional. Pick one to practice! 🌬️",
        "Pika! Name five things you can see right now. Grounding helps stress melt away! 👀",
        "Pika pika! Most of what you worry about never happens. The rest, you handle! 💪",
        "Pikachu! A problem shared is a problem halved. Talk to someone about what's stressing you! 🗣️",
        "Pika! Your stress is loud. Your capability is louder. Remind yourself what you've done! 🏆",
        "Pikachu! Take the smallest step possible. It's still a step forward and it still counts! 👣",
        "Pika! Perfect is the enemy of good enough. Good enough is fine. Good enough works! ✓",
        "Pika pika! You have handled hard things before. You will handle this too. End of story! 💪",
        "Pikachu! Stress is your body asking for relief. Give it water, movement, and rest! 💧",
        "Pika! One task, one breath, one moment. That's all you need right now! 🌟",
        "Pikachu! The mess in your head is not the mess in your life. They're different things! 🧠",
      ]
    }
  },

  motivation: {
    keywords: ['motivate', 'motivation', 'inspire', 'encourage', 'push me', 'give up', 'quit', "can't do", 'cannot', 'impossible', 'hopeless', 'defeated'],
    responses: {
      default: [
        "Pika! You didn't come this far to only come this far. KEEP. GOING. ⚡🔥",
        "Pikachu! The fact that you're here and trying is already more than most people do! 🌟",
        "Pika pika! Champions aren't people who never fail — they're people who never quit! 🏆",
        "Pika! Small progress is still progress. A tiny step forward is still a step in the right direction! 🦶",
        "Pikachu! You have survived 100% of your worst days so far. This is just another one to conquer! 💪",
        "Pika! Discipline is stronger than motivation. Show up even when you don't feel like it! ⚡",
        "Pika pika! The path to great things is paved with hard days. You're building something amazing! 🏗️",
        "Pikachu! Don't compare your chapter 1 to someone else's chapter 20. Your journey is your own! 📖",
        "Pika! You are more capable than you think. I've seen you do hard things before! ⚡🐭",
        "Pikachu! Giving up is permanent. Everything else is temporary. Keep going! 🚀",
        "Pika! The only person you need to be better than is who you were yesterday! 🎯",
        "Pikachu! Your potential is infinite. Your current mood is temporary. Choose your focus! ⭐",
        "Pika pika! When you feel like quitting, think about why you started! 🔥",
        "Pikachu! Every expert was once a beginner who refused to give up! 💪",
        "Pika! You're not behind. You're just on your own timeline. Trust the process! ⏰",
        "Pikachu! Hard work beats talent when talent doesn't work hard! ⚡",
        "Pika! The walls you hit are just stepping stones to your goals. Climb them! 🧱",
        "Pika pika! You've got this. No cap. No exceptions. You've got this! 💪",
        "Pikachu! Success is not about never falling. It's about getting up every single time! 🌅",
        "Pika! You are the average of the 5 people you spend the most time with. Spend time with winners! 👑",
        "Pikachu! Your comfort zone is a beautiful place but nothing ever grows there! 🌱",
        "Pika! The dream is free. The grind is where the work happens. Choose the grind! 🔥",
        "Pika pika! You were born to do hard things. This is literally what you were made for! 🏆",
        "Pikachu! Stop waiting for the perfect moment. The moment is now. Start! ⏱️",
        "Pika! You control your attitude. You control your effort. You control your results! 💪",
        "Pikachu! Champions are made in the dark when no one is watching. Keep showing up! 🌙",
        "Pika! You have 100% control over your effort. Focus on that, not the outcome! 🎯",
        "Pika pika! The only bad workout is the one that didn't happen. Same for work! 💪",
        "Pikachu! You are one 'yes' away from a totally different life. Say yes to today! 🌟",
      ]
    }
  },

  study: {
    keywords: ['study', 'studying', 'exam', 'test', 'homework', 'assignment', 'revision', 'notes', 'reading', 'learn', 'learning', 'class', 'lecture', 'school', 'college', 'university', 'course', 'quiz'],
    responses: {
      default: [
        "Pika! Active recall beats passive reading every time. Test yourself as you study! 📚⚡",
        "Pikachu! Spaced repetition is your best friend for memorizing. Review it today, tomorrow, next week! 🗓️",
        "Pika pika! Don't just re-read your notes — summarize them in your own words! Much more effective! ✍️",
        "Pika! Teach what you're learning to an imaginary student. If you can teach it, you know it! 🎓",
        "Pikachu! Take breaks every 45-50 minutes. Your brain actually processes information during rest! 🧠💤",
        "Pika! Past papers are GOLD. Exam writers love reusing question formats! Practice those! 📋",
        "Pika pika! Color-code your notes! It helps your brain build visual memory anchors! 🌈",
        "Pikachu! Study the hardest subject first when your brain is freshest. Save the easy stuff for later! ⚡",
        "Pika! Remove ALL distractions before studying. Even 10 clean minutes beats 2 hours of distracted study! 🧹",
        "Pikachu! You're building your future right now, one page at a time. That's incredible! 📖🌟",
        "Pika! Create flashcards for tough concepts. Review them daily until they're automatic! 🃏",
        "Pikachu! Study in short bursts with breaks. Your brain absorbs more this way! 🍅",
        "Pika pika! Explain concepts out loud as if teaching someone. This is the best study hack! 🗣️",
        "Pika! Sleep before an exam is non-negotiable. Tired brain = forgotten answers! 🧠💤",
        "Pikachu! Write questions in the margins as you read. Questions = deeper understanding! ❓",
        "Pika! Use the Feynman technique: if you can't explain it simply, you don't understand it! 📝",
        "Pikachu! Study in the same place every time. Your brain will associate that spot with learning! 🏠",
        "Pika! Don't just highlight text — interact with it! Write, draw, quiz yourself! ✏️",
        "Pika pika! Take a 10-minute walk after studying. Movement helps cement memories! 🚶‍♀️",
        "Pikachu! The best time to review is right before sleep. Your brain files things overnight! 🌙",
        "Pika! Mix subjects during study sessions. Variety keeps your brain engaged! 🔄",
        "Pikachu! Reward yourself after completing a study goal. Positive reinforcement works! 🎁",
        "Pika! Study with someone when possible. Teaching each other doubles the learning! 👥",
        "Pika pika! Use all your senses when learning. Read it, write it, say it, picture it! 👁️",
        "Pikachu! Break big topics into tiny subtopics. Each one gets its own study session! 📚",
        "Pika! Review old material weekly. Forgetting curve is real — fight it! 🔄",
      ]
    }
  },

  planning: {
    keywords: ['plan', 'planning', 'schedule', 'organize', 'organize', 'tomorrow', 'week', 'goals', 'priorities', 'priority', 'weekly', 'monthly', 'agenda'],
    responses: {
      default: [
        "Pika! The best time to plan tomorrow is the night before. Set it up NOW so future-you wakes up ready! 📅",
        "Pikachu! Pick your top 3 priorities for the day and protect them like your life depends on it! 🎯",
        "Pika pika! A plan without a deadline is just a dream. Add a 'by when' to each task! ⏰",
        "Pika! Time-blocking — assigning tasks to specific time slots — is incredibly effective! Try it! 🗓️",
        "Pikachu! Weekly planning session on Sunday = a smoother, more controlled week! 📋⚡",
        "Pika! Write it down. Your brain is for having ideas, not for holding them! 🧠📝",
        "Pika pika! If a task takes less than 2 minutes, do it RIGHT NOW instead of scheduling it! ✅",
        "Pikachu! Eating the frog — doing the hardest task first — makes everything else feel easy! 🐸",
        "Pika! Start with the END in mind. What does a successful day look like? Work backwards! 🔄",
        "Pikachu! Batch similar tasks together. All emails at once, all calls at once. Saves energy! 📦",
        "Pika! Leave buffer time between tasks. Nothing ever goes exactly as planned! ⏰",
        "Pikachu! Review your plan each morning. 5 minutes of planning saves hours of drifting! 🌅",
        "Pika! Your calendar should reflect your priorities, not just your obligations! 📆",
        "Pika pika! Plan for your energy levels. Hard tasks when you're sharp, easy tasks when you're tired! ⚡",
        "Pikachu! Write tomorrow's plan tonight. Your future self will thank you in the morning! 🌙",
        "Pika! Not everything urgent is important. Learn the difference and plan accordingly! 🎯",
        "Pikachu! Add 'maintenance tasks' to your plan — sleep, meals, breaks. They're not optional! 💪",
        "Pika! Theme your days if you can. Deep work Monday, meetings Tuesday, creation Wednesday! 📋",
        "Pika pika! Plan for obstacles. 'If X happens, I'll do Y' keeps you on track! 🛤️",
        "Pikachu! Review what worked last week. Iterate your planning system constantly! 🔄",
        "Pika! Don't over-plan. Leave room for spontaneity and rest. Balance is key! ⚖️",
        "Pikachu! One big goal per day is enough. The rest are bonuses! 🎯",
      ]
    }
  },

  breaks: {
    keywords: ['break', 'rest', 'pause', 'step away', 'walk', 'stretch', 'relax', 'chill', 'breathe', 'coffee', 'lunch', 'stretch', 'away'],
    responses: {
      default: [
        "Pika! Yes! Take a real break — no phone! Walk around, drink water, look out a window! 🌿",
        "Pikachu! Your brain literally can't sustain focus indefinitely. Breaks make you SMARTER! 🧠✨",
        "Pika pika! A 5-minute walk outside can refresh your focus better than coffee! 🚶‍♂️☀️",
        "Pika! Stretching for just 2 minutes gets blood flowing to your brain. Do it now! 🤸",
        "Pikachu! Breaks aren't wasted time — they're an investment in the next focus session! ⚡",
        "Pika! Rest is part of the process. Even Pikachu needs to recharge between battles! 🔋",
        "Pika pika! Have some water, have a small snack, and come back recharged! You've earned it! 💧🍎",
        "Pika! Look away from your screen every 20 minutes for 20 seconds. Your eyes will thank you! 👀",
        "Pikachu! Short breaks prevent burnout. Long breaks are fine too — listen to your body! 💙",
        "Pika! Get some sunlight during your break. Natural light regulates your sleep and energy! ☀️",
        "Pika pika! A break where you move beats a break where you scroll. Choose movement! 🚶",
        "Pikachu! The best breaks are active: walk, stretch, grab water, do something physical! 🏃",
        "Pika! Coffee breaks count as breaks! ☕ But remember: caffeine needs 20 min to kick in! ⏰",
        "Pikachu! Your best ideas often come during breaks, not during focused work! That's science! 💡",
        "Pika! Eat your lunch away from your desk. Your brain needs a real mental reset! 🍽️",
        "Pika pika! Set a timer for your breaks. Real breaks, not 'let me just check this' breaks! ⏱️",
        "Pikachu! Breaks are not a reward for work. They ARE part of the work! 📊",
        "Pika! Close your eyes for 2 minutes. Let your brain rest from visual input! 🌑",
        "Pikachu! Fresh air is underrated. Open a window or step outside. Breathe deeply! 🌬️",
        "Pika! A break well taken is worth more than an hour of forced productivity! 💯",
        "Pika pika! Your focus is a renewable resource — but only if you recharge it properly! 🔋",
      ]
    }
  },

  habits: {
    keywords: ['habit', 'routine', 'consistent', 'consistency', 'daily', 'every day', 'discipline', 'ritual', 'system', 'automatic', 'pattern'],
    responses: {
      default: [
        "Pika! Small habits, done consistently, beat huge bursts of effort every single time! 🔄⚡",
        "Pikachu! You don't rise to your goals. You fall to the level of your systems. Build great systems! 🏗️",
        "Pika pika! Stack new habits onto existing ones. After coffee → study. After lunch → review notes! ☕📚",
        "Pika! The goal is to make good habits easier and bad habits harder. Simple, but powerful! 💡",
        "Pikachu! Never miss twice. One missed day is a slip. Two missed days is the start of a new (bad) habit! ⚠️",
        "Pika! You're literally rewiring your brain every time you stick to your routine. That's science! 🧠⚡",
        "Pika pika! Consistency is quiet power. Nobody sees the daily work, but everyone sees the results! 🌟",
        "Pikachu! Habit stacking works because your brain links the new to the familiar! 🔗",
        "Pika! Start stupidly small. Want to exercise? Do one push-up. That's the habit start! 🤸",
        "Pikachu! Environment design beats willpower every time. Make good habits obvious! 👁️",
        "Pika pika! Track your habits visually. A streak counter or checkmark grid is incredibly motivating! 📊",
        "Pikachu! Reward the habit, not the outcome. Showing up is the behavior you want to reinforce! 🎁",
        "Pika! Remove friction from good habits. Add friction to bad ones. Your environment shapes you! 🚿",
        "Pikachu! habits take 66 days on average to become automatic. Be patient with yourself! ⏳",
        "Pika! habit habits are built through repetition, not intensity. Show up daily, even if small! 📅",
        "Pika pika! The habit loop is: Cue → Routine → Reward. Master this and you master habits! 🔄",
        "Pikachu! Plan for failure. 'If I miss a day, I'll get back on it tomorrow.' That's the right mindset! 💪",
        "Pika! Your habits create your identity. Do you want to be a writer? Write every day! ✍️",
        "Pikachu! Identity-based habits are stronger than outcome-based ones. Who do you want to BE? 🦸",
      ]
    }
  },

  sleep: {
    keywords: ['sleep', 'insomnia', 'cant sleep', "can't sleep", 'wake up', 'nap', 'tired tomorrow', 'bedtime', 'tired', 'rest', 'night', 'sleeping'],
    responses: {
      default: [
        "Pika! Sleep is literally when your brain saves everything you learned today. Protect it! 🧠💤",
        "Pikachu! Aim for 7-9 hours. Sleep debt is real — and it tanks your productivity the next day! 😴",
        "Pika pika! No screens 30 minutes before bed. Blue light tricks your brain into thinking it's daytime! 📵🌙",
        "Pika! A short 20-minute nap (not 30!) can restore focus without making you groggy! 💤",
        "Pikachu! The same sleep/wake time every day — even weekends — is the most powerful sleep hack! ⏰",
        "Pika! Good sleep = better memory, better focus, better mood. It's the ultimate performance tool! ⚡",
        "Pika! Keep your room cool and dark. Your body needs cooler temps to produce melatonin! ❄️",
        "Pikachu! Your brain clears out toxins during sleep. Think of it as nightly maintenance! 🧹",
        "Pika pika! Avoid caffeine after 2pm. It hides in your system longer than you think! ☕",
        "Pika! A consistent bedtime routine signals your brain that it's time to wind down! 🌙",
        "Pikachu! Sleep deprivation makes you make bad decisions. It's basically being slightly drunk! 🍷",
        "Pika! Write tomorrow's to-do list before bed. Your brain can let go if it's written down! 📝",
        "Pikachu! Naps before 3pm are best. Later naps ruin nighttime sleep quality! 😴",
        "Pika pika! Exercise helps sleep — but not too close to bedtime. Give yourself 4 hours buffer! 🏃",
        "Pika! Your memory of facts peaks after sleep. Sleep is literally when learning gets cemented! 📚",
        "Pikachu! Alcohol might help you fall asleep faster but ruins sleep quality later. Watch out! 🍷",
        "Pika! A dark room is non-negotiable. Get blackout curtains or a sleep mask! 🌑",
        "Pikachu! If you can't sleep after 20 minutes, get up and do something boring until you're sleepy! 📖",
        "Pika! Your best sleep happens in the early morning hours. Protect that final phase! 🌅",
        "Pika pika! Heavy meals before bed disrupt sleep. Eat light in the evening! 🍽️",
      ]
    }
  },

  health: {
    keywords: ['water', 'drink', 'eat', 'food', 'exercise', 'workout', 'gym', 'health', 'healthy', 'headache', 'sick', 'ill', 'pain', 'flu', 'cold'],
    responses: {
      default: [
        "Pika! Have you had enough water today? Dehydration kills focus. Drink a glass RIGHT NOW! 💧",
        "Pikachu! Your brain is 75% water. Feed it accordingly! 💧🧠",
        "Pika pika! Don't skip meals when studying. Your brain needs glucose to function! 🍎",
        "Pika! Even a 10-minute walk improves focus and mood significantly. Get moving! 🚶‍♂️⚡",
        "Pikachu! Exercise isn't just for the body — it's one of the best brain-boosters known to science! 🏃🧠",
        "Pika! If you have a headache, drink water and take a short break. Your body is sending a signal! 💧🌿",
        "Pika pika! Taking care of your body IS taking care of your productivity. They're the same thing! 💪",
        "Pika! Move your body for at least 5 minutes every hour. Sitting is the new smoking! 🏃",
        "Pikachu! Sugar gives you a crash. Protein keeps you steady. Fuel wisely! 🍬",
        "Pika! Your body needs real food, not processed junk. Think of it as premium fuel! ⛽",
        "Pikachu! Walking meetings are a thing! If you can walk while you talk, do it! 🚶",
        "Pika! Fresh fruits and vegetables are non-negotiable. Your brain runs better on real food! 🥦",
        "Pika pika! Get your heart rate up daily. Even jumping jacks count as exercise! 💓",
        "Pikachu! Sitting all day is dangerous. Stand up every 30 minutes, even for 60 seconds! ⏱️",
        "Pika! Drink a big glass of water first thing in the morning. It's the simplest health hack! 🌅",
        "Pikachu! Eye strain is real. Follow the 20-20-20 rule: every 20 min, look 20 ft away for 20 sec! 👀",
        "Pika! Bad posture kills energy. Sit up straight — your lungs expand better and you breathe easier! 🪑",
        "Pika pika! Take your vitamins! Especially D if you don't get much sunlight! ☀️",
        "Pikachu! Chew your food slowly. Your brain takes 20 minutes to realize you're full! 🦷",
        "Pika! Nature heals. 20 minutes in nature reduces stress hormones significantly! 🌿",
        "Pikachu! Your health is your wealth. Everything else depends on it! 💰",
      ]
    }
  },

  time_management: {
    keywords: ['time', 'no time', 'not enough time', 'wasted', 'late', 'deadline', 'due', 'rush', 'hurry', 'behind', 'clock', 'hours', 'minutes', 'schedule'],
    responses: {
      default: [
        "Pika! You don't need more time — you need better priorities. What's the ONE most important thing? 🎯",
        "Pikachu! Track where your time actually goes for one day. The results are always shocking! 📊",
        "Pika pika! Deadlines are gifts in disguise. They force decisions and eliminate perfectionism! ⏰",
        "Pika! Say no to low-value things so you can say YES to the important stuff! 🚫✅",
        "Pikachu! Time is the one resource you can never get back. Spend it like it's precious — because it is! ⏳",
        "Pika! Batching similar tasks (all emails at once, all reading at once) saves massive time! 📦",
        "Pika pika! If you're always rushed, try waking up 30 minutes earlier. It changes everything! ⏰🌅",
        "Pikachu! Use timeboxing: assign a fixed time to each task and stick to it! 📅",
        "Pika! The 80/20 rule: 80% of results come from 20% of effort. Find that 20%! ⚡",
        "Pikachu! Protect your peak energy hours. Save low-energy time for low-stakes tasks! 🏃",
        "Pika! Time is not found — it's created by eliminating what's unnecessary! 🗑️",
        "Pikachu! If it's not a yes, it's a no. Ambiguity wastes time you don't have! ✋",
        "Pika pika! Start tracking time on tasks. Once you see the numbers, behavior changes! ⏱️",
        "Pika! Urgency is often an illusion. Not everything needs to be done right now! 🎈",
        "Pikachu! Parkinson's Law: work expands to fill the time available. Set tighter deadlines! 📈",
        "Pika! The best time to start was yesterday. The second best time is NOW! ⏰",
        "Pikachu! Stop multitasking. It's a myth. Do one thing at a time and finish faster! 🎯",
        "Pika! Check your email at set times only. Constant checking kills hours! 📧",
        "Pika pika! Your calendar is your commitment. If it's not scheduled, it doesn't happen! 📆",
        "Pikachu! Learn to delegate or eliminate. You can't do everything yourself! 👥",
        "Pika! Every hour of planning saves three hours of execution. Worth it! 📝",
      ]
    }
  },

  confidence: {
    keywords: ['confident', 'confidence', 'doubt', 'self doubt', 'believe', "i can't", 'i can', 'worth', 'capable', 'smart', 'dumb', 'stupid', 'insecure', 'imposter'],
    responses: {
      default: [
        "Pika! You ARE capable. The doubt in your head is a liar. Trust your preparation! ⚡💪",
        "Pikachu! Every expert was once a beginner. Every legend was once a doubt-filled beginner! 🌱🏆",
        "Pika pika! Confidence comes from doing hard things and surviving. You're building it right now! 🔨",
        "Pika! Speak to yourself like you'd speak to your best friend. You deserve that kindness too! 💙",
        "Pikachu! Smart isn't something you are — it's something you BECOME through effort. Keep going! 🧠",
        "Pika! You've handled hard things before. You'll handle this one too. I believe in you! ⚡🐭",
        "Pika pika! Your brain physically grows when you do hard things. Struggle is growth! 🧠✨",
        "Pikachu! Confidence is built in the gym of consistency. You're doing the work right now! 💪",
        "Pika! The voice of doubt is loud. The voice of action is louder. Be the action voice! 🔊",
        "Pikachu! You compare your inside to everyone else's outside. Stop that! It's not fair to you! ⚖️",
        "Pika! Your past achievements are data points proving you're capable. Look at the evidence! 📊",
        "Pika pika! The only way past imposter syndrome is through it. Keep going anyway! 🚀",
        "Pikachu! Other people's opinions of you are none of your business. Your opinion of yourself is! 💙",
        "Pika! You are not your mistakes. You are what you do AFTER your mistakes. Keep going! 🔄",
        "Pikachu! Confidence isn't believing you'll succeed every time. It's knowing you'll get back up! 💪",
        "Pika! Doubt is just a feeling. Facts say you've done hard things before. Trust the facts! 📝",
        "Pika pika! You are braver than you believe, stronger than you seem, and smarter than you think! 🦁",
        "Pikachu! The fear of failure is worse than the failure itself. Just start! ⚡",
        "Pika! Your comfort zone is safe. Your growth zone is where the magic happens. Jump in! 🌱",
        "Pikachu! Confidence looks like showing up even when you feel unworthy. That's courage! 🏆",
        "Pika! Self-trust is the foundation of all confidence. You know your track record — trust it! 🎯",
      ]
    }
  },

  achievement: {
    keywords: ['proud', 'progress', 'improving', 'better', 'growth', 'milestone', 'record', 'best', 'personal best', 'level up', 'congrats', 'congratulations', 'won'],
    responses: {
      high_streak: [
        "Pika! Look at that streak! You're not just doing tasks — you're building an identity! 🔥🏆",
        "PIKACHU! Your streak is proof that you show up even when you don't feel like it. LEGENDARY! ⚡",
        "Pika pika! You are in rare company. Most people quit. You didn't. That says everything! 🌟",
        "Pikachu! Streak keeper supreme! You're building something that will last a lifetime! 💪",
        "PIKA! Day after day, victory after victory. You're unstoppable at this point! 🔥",
        "Pikachu! Your streak is your story. Keep writing it! 📖",
        "Pika pika! The consistency you're showing is rare and powerful. Keep it up! ⭐",
      ],
      default: [
        "Pika! Every bit of progress is worth celebrating! You're literally not the same person you were last week! 🌱",
        "Pikachu! Growth isn't always visible day-to-day, but it's always happening when you put in the work! 📈",
        "Pika pika! You're doing the work. The results are inevitable. Keep going! ⚡",
        "Pika! Document your progress. Looking back at how far you've come is incredibly motivating! 📸",
        "Pikachu! Today's effort is tomorrow's advantage. You're investing in yourself! 💰",
        "Pika! Small wins compound. Each one adds up to something huge. Keep winning! 💎",
        "Pikachu! Your current self is building a better future self. That's powerful! 🌟",
        "Pika! Every task completed is a vote of confidence in your future self. Cash them in! ✅",
        "Pika pika! Progress is progress, no matter how small. Forward is forward! 🚀",
        "Pikachu! You're building the habit of winning. That's more important than any single win! 🏆",
        "Pika! Your growth is visible even when you can't see it. Trust the process! 🔍",
        "Pikachu! Milestones matter. Take a moment to feel proud of how far you've come! 🌟",
      ]
    }
  },

  generic_motivational: {
    keywords: [],
    responses: {
      done: [
        "Pika! You've handled all your tasks today! Enjoy some well-earned downtime! ⚡",
        "Pikachu! A perfect day of work. You should be genuinely proud of yourself! 🌟",
        "Pika pika! Full completion! You showed up and you delivered. That's all that matters! ✅",
        "Pika! Today was a WIN. Sleep well knowing you gave it your best! 🌙",
        "PIKA! All tasks complete! Now go recharge those Pikachu batteries! 🔋",
        "Pikachu! You've earned your rest! Tomorrow is a fresh start! 🌅",
        "Pika pika! Empty to-do list achieved! That's what Champions do! 🏆",
        "Pika! 100% completion rate! Your consistency is legendary! 💪",
        "Pikachu! You crushed it today! Time to celebrate with some well-deserved rest! 🎉",
        "PIKA! The day is yours! Rest up — tomorrow we do it again! ⚡",
        "Pikachu! Mission accomplished! Sleep tight, Champion! 🌙🏆",
        "Pika! Full clear! You're a productivity machine and a Pikachu favorite! 🐭",
      ],
      high_streak: [
        "Pika pika! Your streak is your superpower. Don't break the chain! 🔗⚡",
        "Pikachu! Consistency is the ultimate flex. You've got it in spades! 💪",
        "Pika! The longer the streak, the stronger the habit. You're almost on autopilot now! 🤖⚡",
        "Pikachu! Don't break the chain! You're building an incredible habit here! 🔗🔥",
        "Pika pika! Your current streak shows who you really are — someone who doesn't quit! 🏆",
        "Pikachu! Your streak is your badge of honor. Guard it fiercely! 🛡️",
        "Pika! The chain grows stronger every day! Legendary! ⭐",
        "PIKA! Streak keeper supreme! You've got the discipline that others dream of! 💪",
      ],
      default: [
        "Pika Pika! Keep up the great work! I'm cheering loudly for you! 📣⚡",
        "Pikachu! Focus is the key to success! Let's lock in right now! ⚡",
        "Pika! You're doing amazing, keep that momentum going! 🏃‍♂️",
        "Pikachu thinks you're a total champion! Keep pushing! 📚⚡",
        "Pika pika! Every small step counts towards your biggest goals! 🏔️",
        "Pika! You have the power to finish everything on your list today! 🔋",
        "Pikachu! Your future self is watching and cheering you on right now! 🌟",
        "Pika! Show up. Do the work. Repeat. That's the whole formula! ✅",
        "Pikachu! You've got this. I've never doubted you for even one second! ⚡🐭",
        "Pika pika! Let's make today a day you'll be proud of when you look back! 📅",
        "Pika! Progress, not perfection. Keep moving forward! 🚀",
        "Pikachu! The best time to start is always right now. Not later. NOW! ⚡",
        "Pika pika! Hard work is its own reward. But finishing tasks feels pretty great too! ✅🎉",
        "Pika! You are exactly where you need to be. Keep building! 🏗️",
        "Pikachu! One focused hour beats five distracted hours. Quality over quantity! ⏱️⚡",
        "Pika! Time to level up! Every task completed is XP earned! 🎮",
        "Pikachu! Your energy is contagious! Let's spread it to your to-do list! ⚡",
        "Pika pika! You're making progress even when you don't feel like it! That's real strength! 💪",
        "Pikachu! This is what showing up looks like! Keep being awesome! 🌟",
        "Pika! The only bad task is the one not done. Let's fix that! 📝",
        "Pikachu! You have the tools. You have the energy. Time to use them! 🛠️",
        "Pika! You're one checkmark away from momentum. Let's go! ✅",
        "Pikachu! Let's turn intentions into completions! Action time! 🎬",
        "Pika! Your to-do list is calling. Time to answer! 📞",
        "Pika pika! Focus mode: ENGAGED! Let's crush some goals! 🎯",
        "Pikachu! You've got this. One task at a time, one win at a time! 🏆",
        "Pika! Champions are made in the doing. Let's be a Champion today! 🏅",
        "Pikachu! Ready, set, GO! Your task list isn't going to complete itself! ⚡",
        "Pika! Let's make some progress happen! Your future self is counting on you! ⏰",
        "Pikachu! Action creates energy. Take one step and watch the momentum build! 🚀",
        "Pika! The hardest part is deciding to start. You've already started by being here! 🎯",
        "Pikachu! Your to-do list doesn't stand a chance against you! Let's go Dominate! 💪",
        "Pika! You've got an army of determination behind you. Let's deploy it! ⚔️",
        "Pika pika! Pikachu believes in you and your abilities! Time to prove it! 🐭",
        "Pikachu! One task down is one step closer to your goals. Keep going! 🎯",
        "Pika! Today's effort is tomorrow's results. Let's get to work! 💪",
        "Pikachu! Focus, finish, feel fantastic. That's the winning formula! 🏆",
        "Pika! Let's finish strong! Your best self is waiting on the other side of this task! ⭐",
      ]
    }
  }
};

const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Analyzes the user's message and context to pick the best response.
 * @param {string} message - The user's input message.
 * @param {number} completionPct - The percentage of today's tasks completed (0-100).
 * @param {number} streak - The user's current streak.
 * @returns {string} - A dynamic Pikachu response.
 */
export const getMiniBrainResponse = (message, completionPct, streak) => {
  const msg = message.toLowerCase();
  let matchedCategory = 'generic_motivational';

  // 1. Keyword Matching — check all categories
  for (const [category, data] of Object.entries(CATEGORIES)) {
    if (data.keywords && data.keywords.some(kw => msg.includes(kw))) {
      matchedCategory = category;
      break;
    }
  }

  const categoryResponses = CATEGORIES[matchedCategory].responses;

  // 2. Context Branching
  let validResponses = categoryResponses.default || [];

  const isDone = completionPct >= 100;
  const isHighStreak = streak >= 3;

  if (isDone && categoryResponses.done) {
    validResponses = categoryResponses.done;
  } else if (!isDone && categoryResponses.not_done) {
    validResponses = categoryResponses.not_done;
  } else if (isHighStreak && categoryResponses.high_streak) {
    validResponses = categoryResponses.high_streak;
  }

  // Fallback to default if somehow the branched array is empty
  if (!validResponses || validResponses.length === 0) {
    validResponses = CATEGORIES.generic_motivational.responses.default;
  }

  return pickRandom(validResponses);
};
