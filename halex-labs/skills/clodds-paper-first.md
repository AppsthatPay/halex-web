# Skill: Clodds Paper First (HALEX LABS)

Plain English: prove on paper before any live talk, and never reset
paper history.

Inputs: closed paper trades count, measured win rate, measured profit factor.
Outputs: paper-proven true/false, reasons, and the note that paper-proven
is necessary but not sufficient for live.
Limits: HALEX proving bar is 30+ closed paper trades, 65%+ win rate,
profit factor 1.2+. Paper history is never reset, ever. Clodds' paper
reset handler was explicitly not adopted.
Gates: live still requires Allen2 bridge custody, sell-sim 90%+,
copycat, and position cap gates, in full.
Source: adapted from CloddsBot paper-trading discipline, MIT, see NOTICE.md.
Code: sources/clodds/paper_first.py
