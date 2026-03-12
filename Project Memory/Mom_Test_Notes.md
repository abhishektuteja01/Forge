# Mom Test Notes — Forge

## The 3 Big Questions

1. How do you currently try to build or break habits, and what's the hardest part about staying consistent? (Goal: Understand the real problem and current workarounds ⤴).
2. Tell me about the last habit tracker or system you tried — what made you stop using it? (Goal: Assess severity of abandonment problem ☇).
3. When you do track habits, what does your daily routine with the app actually look like? (Goal: Workflow context ^ and friction points ☐).

## Customer Slicing (Personas)

1. **The Overwhelmed Beginner (Priya, College Sophomore):** Read _Atomic Habits_ but hasn't applied any frameworks. Needs a non-intimidating starting point.
2. **The Serial Abandoner (Marcus, Junior Software Engineer):** Has downloaded 4+ habit apps in the past year. Loses motivation after the first week because streaks feel punishing.
3. **The Identity Seeker (Jess, Graduate Student):** Wants to become "someone who works out" — motivated by transformation, not checkboxes.
4. **The Optimizer (Carlos, Marketing Analyst):** Tracks habits already in a spreadsheet. Wants to understand _why_ certain habits stick and others don't.

---

## Simulated Conversations

### User 1: Priya (College Sophomore, 19)

**Tag:** Overwhelmed Beginner
_Context: Campus library, chatting during a study break._

**Interviewer:** "How's the semester going? Are you managing to stay on top of things?"
**Priya:** "Honestly, not really. I keep saying I'll start a morning routine but every day I just wake up and scroll my phone for 30 minutes." ^
**Interviewer:** "Have you tried anything to fix that?"
**Priya:** "I read _Atomic Habits_ over winter break and got really motivated. ⤴ I made a list of habits I wanted to build in my Notes app — like 12 things. I lasted two days." ☇
**Interviewer:** "What happened on day three?"
**Priya:** "I looked at my list and just felt exhausted before I even started. ☇ Twelve things is too many. I didn't know which ones actually mattered, so I just closed the app and forgot about it."
**Interviewer:** "If you could go back to that moment, what would have helped?"
**Priya:** "Honestly, if something had just told me to _start by writing down what I already do_ — not what I want to do — that would have taken the pressure off. ☐ The book talks about that, the Scorecard thing, but I didn't know how to actually do it on my phone." ☑
**Interviewer:** "Walk me through what your morning actually looks like right now."
**Priya:** "I wake up, check Instagram, brush my teeth, grab coffee from the dining hall, go to class. That's it. I don't think of those as 'habits' but I guess they are." ⤴
**Interviewer:** "How long do you think it would take you to type those into an app?"
**Priya:** "Like a minute? But most apps make you set goals and reminders and stuff before you even start. That's where I give up." ☇

**Key Takeaways:**

- Onboarding must be frictionless — writing down _existing_ routines (not aspirational goals) is the correct first step
- 12 habits on day one is overwhelming; the app must limit initial scope
- She already has routines she doesn't recognize as routines — the Scorecard reframes them

**Relevant User Stories:** US-1 (Scorecard — List and Tag), US-8 (Onboarding Flow)
**Relevant Success Metric:** Full habit tracking loop completed in under 3 minutes

---

### User 2: Marcus (Junior Software Engineer, 24)

**Tag:** Serial Abandoner
_Context: Slack DM after he posted about "trying Habitica again" in a community server._

**Interviewer:** "I saw you're back on Habitica — how many times have you tried it?"
**Marcus:** "Third time. I also tried Streaks, HabitBull, and just a Google Sheet. ⤴ I usually last about 8–10 days." ^
**Interviewer:** "What happens on day 10?"
**Marcus:** "I miss one day and the streak resets to zero. ☇ And then I think, 'well, I already broke it,' and I stop opening the app entirely. The streak counter is supposed to motivate me but it actually makes me feel _worse_ when I fail." ☇
**Interviewer:** "Tell me about yesterday. Did you check in?"
**Marcus:** "Yeah, I checked off 'go to gym' and 'read 10 pages.' But I also have 'meditate' on there and I skipped it. So the app shows me a red X next to it. It's like a report card I'm failing." ☐
**Interviewer:** "If streaks aren't working, what _would_ keep you going?"
**Marcus:** "I think… knowing that going to the gym 4 out of 7 days is still really good? ⤴ Like, I want to see that I'm mostly a person who works out, not that I missed Wednesday." ☑
**Interviewer:** "What about linking habits together? Like, 'after I make coffee, I read 10 pages'?"
**Marcus:** "Oh, I actually do that already without thinking about it. ⤴ After I open my laptop at work, I always check Slack first. If I could stack 'check Slack' with 'review my to-do list,' that would be more natural than a random reminder at 9 AM." ☑
**Interviewer:** "When you check into a habit app, how long does it take before you feel done?"
**Marcus:** "If it takes more than 30 seconds I start to resent it. ☐ The check-in should be fast — like, I open it, tap tap tap, done."

**Key Takeaways:**

- Streak counters are actively harmful for this persona — they punish failure instead of celebrating progress
- Identity framing ("I'm mostly a person who works out") resonates more than binary pass/fail
- He already does habit stacking unconsciously — the app should surface and formalize it
- Daily check-in must be completable in under 30 seconds

**Relevant User Stories:** US-2 (Daily Check-In), US-3 (Habit Stacking — Create Linked Pairs), US-6 (Vote Counter)
**Relevant Success Metric:** Habit stacks correctly reflect completion state in real time

---

### User 3: Jess (Graduate Student, 26)

**Tag:** Identity Seeker
_Context: After a yoga class, talking about New Year's resolutions that stuck._

**Interviewer:** "You mentioned you started working out consistently last year. What changed?"
**Jess:** "I stopped thinking of it as 'I need to exercise' and started thinking 'I'm a person who moves her body every day.' ^ It sounds cheesy but it genuinely changed how I make decisions." ⤴
**Interviewer:** "Where did you get that idea?"
**Jess:** "Atomic Habits, obviously. ⤴ The identity chapter. But I've never found an app that actually _uses_ that concept. Every app just asks 'did you do the thing?' — nobody asks 'who are you becoming?'" ☇
**Interviewer:** "How do you track that identity shift right now?"
**Jess:** "I journal about it. I have a page in my notebook where I wrote 'I am someone who moves every day' and every time I work out, I put a little tally mark next to it. ⤴ It's very analog." ☐
**Interviewer:** "How does it feel when you look at that tally?"
**Jess:** "Amazing, honestly. ☑ Seeing 47 tally marks is way more motivating than a streak counter saying '12 days.' Because 47 marks means I've _voted_ for that identity 47 times. Even if I missed some days, the total keeps growing."
**Interviewer:** "Would you want that in an app?"
**Jess:** "Yes, but only if it doesn't bury it under 10 other features. ☐ I'd want to open the app and immediately see my identity and my vote count. Not a dashboard with 15 charts."
**Interviewer:** "Do you track on your phone at all right now?"
**Jess:** "No, just the notebook. I've tried apps on my phone but they all feel like productivity tools, not _personal growth_ tools. ☇ Also, I use Safari and half of these apps are janky on iPhone Safari." ☐

**Key Takeaways:**

- Identity-based framing is the core differentiator — she already does it manually with pen and paper
- Vote count (cumulative) is inherently more motivating than streaks (resettable) for this persona
- Identity must be prominently displayed, not buried — she wants to see it immediately
- Safari compatibility is a real concern for mobile-first users on iPhone

**Relevant User Stories:** US-5 (Identity Statements), US-6 (Vote Counter + Progress)
**Relevant Success Metric:** All Sprint 1 features functional on mobile Chrome and Safari

---

### User 4: Carlos (Marketing Analyst, 28)

**Tag:** The Optimizer
_Context: Coffee shop, he's got his laptop open with a habit spreadsheet visible._

**Interviewer:** "I see you've got a spreadsheet going — walk me through it."
**Carlos:** "Yeah, I've been tracking habits in Google Sheets for about 4 months. ^ I have columns for each habit, rows for each day, and I color-code green for done, red for missed." ⤴
**Interviewer:** "That's serious dedication. What's not working about it?"
**Carlos:** "I can see _that_ I keep failing at 'read before bed,' but I can't see _why._ ☇ Is it because it's too hard? Too boring? Is there no trigger for it? The spreadsheet just shows red cells." ☐
**Interviewer:** "Have you tried to diagnose that yourself?"
**Carlos:** "Sort of. I read the Four Laws chapter again and tried to audit it mentally — like, is it obvious? Not really, my book is in the other room. Is it easy? Thirty minutes is a lot after a long day. ⤴ But I didn't write any of that down, it was just in my head."
**Interviewer:** "What if an app walked you through that audit?"
**Carlos:** "That would be incredible. ☑ Like, 'rate this habit on Obvious, Attractive, Easy, Satisfying' and then tell me 'your weakest link is Easy — try reducing to 5 minutes.' That's actionable." ☑
**Interviewer:** "What about the habits that _are_ working — do you understand why?"
**Carlos:** "Honestly, the ones that work are the ones I stacked onto other things. ⤴ I do pushups right after I brush my teeth. I never miss that one. But I set up that stack by accident — I didn't plan it using the book's framework."
**Interviewer:** "How fast does your spreadsheet load on your phone?"
**Carlos:** "Ha. It doesn't, really. ☇ Google Sheets on mobile is miserable. I only update it on my laptop, which means I sometimes forget and have to backfill 3 days from memory." ☐
**Interviewer:** "So a fast mobile experience would change your behavior?"
**Carlos:** "Absolutely. If I could check in on my phone in 10 seconds right when I finish a habit, the data would be way more accurate." ☑

**Key Takeaways:**

- Power users who already track want _diagnostic_ tools, not just logging — the Four Laws Audit is the feature that would convert him
- His successful habits are already stacked (pushups after brushing teeth) — he just doesn't have the vocabulary for it
- Mobile performance is a blocker — his current tool (Sheets) is unusable on mobile
- Backfilling from memory degrades data quality; real-time mobile check-in is essential

**Relevant User Stories:** US-1 (Scorecard — tagging positive/negative), US-3 (Habit Stacking), US-9 (Four Laws Audit — Sprint 2)
**Relevant Success Metric:** Scorecard loads in under 1 second on mobile

---

## Synthesis for Product Insights

| Insight                                                                    | Evidence                                                                                | Implication                                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Onboarding must start with what you already do, not aspirational goals** | Priya quit after 2 days because 12 new habits was overwhelming                          | US-8 onboarding should prompt users to list _existing_ routines first, then tag them        |
| **Streaks are actively demotivating for most users**                       | Marcus quits every app on the day he breaks a streak                                    | Forge should emphasize cumulative votes over streaks — never show a "streak broken" message |
| **Identity framing is the killer differentiator**                          | Jess already tracks identity votes manually with tally marks in a notebook              | US-5/US-6 identity + vote counter must be front-and-center, not a secondary feature         |
| **Users already habit-stack without knowing it**                           | Marcus stacks Slack after laptop open; Carlos stacks pushups after brushing teeth       | US-3 should let users formalize _existing_ stacks, not just create new ones                 |
| **"Why" matters more than "what"**                                         | Carlos can see red cells but can't diagnose why he fails at reading                     | Four Laws Audit (US-9) is the Sprint 2 feature with the highest pull from power users       |
| **Mobile speed is a hard requirement, not a nice-to-have**                 | Carlos can't use Sheets on mobile; Priya only uses her phone; Jess needs Safari support | The < 1 second load time metric is validated by real user pain                              |

### Current Alternatives & Why They Fail

- **Google Sheets:** Powerful but unusable on mobile, no diagnostic features
- **Habitica / Streaks / HabitBull:** Streak-based motivation that punishes failure
- **Notes app / Journaling:** Low friction but no structure, analysis, or persistence
- **Nothing (mental tracking):** Zero accountability, vocabulary mismatch when searching memory
