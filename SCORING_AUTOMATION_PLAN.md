# Scoring Automation Plan (UPDATED)

## User Decisions Made:
- ✅ Wheel of Fortune: Don't swap players between puzzles, split into teams of 2
- ✅ Jonpardy: Scale scoring based on question value ($200 = +2, $400 = +4, etc.)
- ✅ Keep floating score panel for manual overrides
- ✅ Smarter Than Jon: Show top scorer splash screen at game start
- ✅ WoF already has working setup screen - just add hub import option

---

## Implementation Order

### 1. Jonpardy (FIRST - Easiest)
**Auto-Scoring Triggers:**
| Event | Points | Who Gets It |
|-------|--------|-------------|
| Correct $200 answer | +2 | Answering team |
| Correct $400 answer | +4 | Answering team |
| Correct $600 answer | +6 | Answering team |
| Correct $800 answer | +8 | Answering team |
| Correct $1000 answer | +10 | Answering team |
| Daily Double correct | +15 | Answering team |
| Final Jonpardy correct | +25 | Answering team |

---

### 2. Family Feud (SECOND)
**Auto-Scoring Triggers:**
| Event | Points | Who Gets It |
|-------|--------|-------------|
| Team wins round (bank awarded) | +25 | Entire winning team |
| Player buzzes & reveals #1 answer | +10 | That specific player |
| Fast Money target hit | +20 | The Fast Money player |

**Challenge:** Need to track which PLAYER buzzed, not just which team.

---

### 3. Wheel of Fortune (THIRD)
**Setup Flow:**
1. WoF loads → Check for hub data
2. If hub data exists, show "Import from Game Night" option
3. Auto-split hub players into WoF teams of 2
4. Can shuffle/randomize team assignments
5. Same players for all puzzles (no rotation)

**Auto-Scoring Triggers:**
| Event | Points | Who Gets It |
|-------|--------|-------------|
| Team solves puzzle | +10 | Entire WoF team (maps to hub players) |
| Bonus round win | +20 | Bonus round player |

---

### 4. Smarter Than Jon (FOURTH - Minimal)
**Splash Screen at Game Start:**
```
┌─────────────────────────────────────────────────────┐
│        🧠 Are You Smarter Than Jon?                 │
│              THE FINALE                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│         🏆 TOP SCORER PLAYS!                        │
│                                                     │
│         ┌─────────────────────────┐                 │
│         │   🥇 SARAH              │                 │
│         │      145 points         │                 │
│         │      Team A             │                 │
│         └─────────────────────────┘                 │
│                                                     │
│         Runner-up: Mike (140 pts)                   │
│                                                     │
│         [ ▶️ Start Game with Sarah ]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Auto-Scoring:** Minimal - just tracks who played. Points from this game add to their total.

---

## Keep Manual Override
The floating score panel stays for any hiccups or manual adjustments needed.
