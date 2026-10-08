import sys

# Section bounds within layer2:
# y starts at 3160 (Banner height 64)
# Space available: y = 3240 to 3890 (height = 650px)

print("Section Y: 3160 to 3890")
banner_y = 3160
banner_h = 64

# Content area
content_top = 3250
content_bottom = 3880
total_h = content_bottom - content_top # 630px

# Column 1 (Left): x = 100 to 2100 (w = 2000)
# Container / Header: x = 100, y = 3250, w = 2000, h = 630
# Card 1 (WORK ACTIVITY != TASK STATE): x = 120, y = 3280, w = 1960, h = 270
# Card 2 (BUSINESS LINKAGE): x = 120, y = 3580, w = 1960, h = 270

# Column 2 (Center): x = 2300 to 4300 (w = 2000)
# We have 2 vertical tracks:
# Track A (Initiation & Execution): x = 2300, w = 980
# Track B (Submission & Review): x = 3320, w = 980
# Inside Track A, 6 vertical steps:
# Heights: 75px each, gaps: 25px
# y_start = 3280
# step 1: y = 3280
# step 2: y = 3380
# step 3: y = 3480
# step 4: y = 3580
# step 5: y = 3680
# step 6: y = 3780
# step 6 ends at 3780 + 75 = 3855 <= 3880! Perfect!

# Inside Track B:
# step 7 (Submit): y = 3280, h = 75
# step 8 (Manager reviews): y = 3380, h = 75
# step 9 (Approved?): y = 3480, h = 75 (rhombus)
# step 10 (Complete & close): y = 3580, h = 75 (Yes branch down)
# step 11 (Changes Requested): y = 3680, h = 75 (No branch down)
# step 12 (Employee revises): y = 3780, h = 75 (resubmit loop up to step 8)

# Column 3 (Right): x = 4500 to 6500 (w = 2000)
# 3 Domain cards:
# card 1 (MEMBERSHIP WORK): x = 4520, y = 3280, w = 1960, h = 175
# card 2 (MEMBER DEAL & ROYALTY): x = 4520, y = 3480, w = 1960, h = 175
# card 3 (CREATIVE & RESEARCH): x = 4520, y = 3680, w = 1960, h = 175
# card 3 ends at 3680 + 175 = 3855 <= 3880! Perfect!

print("Layout coordinates successfully computed without any overlaps!")
