#!/bin/bash
# Builds game-ready assets from raw generated art + text overlays.
set -e
R=/workspace/projects/d9e8a3d4-e3fa-437d-a04c-5dd0be4b97e0/work/raw_art
G=/workspace/projects/d9e8a3d4-e3fa-437d-a04c-5dd0be4b97e0/game/assets
mkdir -p $G/images/avatars $G/images/photos $G/images/art
SERIF=/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf
MONO=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
MONOB=/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf
HAND=/usr/share/fonts/opentype/urw-base35/Z003-MediumItalic.otf
SANS=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
SANSB=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

# ---------- avatars (square 320) ----------
av() { convert "$R/$1" -resize "320x320^" -gravity $3 -extent 320x320 -quality 85 "$G/images/avatars/$2.jpg"; }
av avatar_ivy.png ivy north
av avatar_maya.png maya center
av avatar_jonah.png jonah center
av avatar_walt.png walt north
av avatar_brennan.png brennan north
av avatar_tide.png tide center
av avatar_theo.png theo center
# Ivy cropped tighter for face
convert "$R/avatar_ivy.png" -crop 768x768+0+120 +repage -resize 320x320 -quality 85 "$G/images/avatars/ivy.jpg"
convert "$R/avatar_walt.png" -crop 768x768+0+100 +repage -resize 320x320 -quality 85 "$G/images/avatars/walt.jpg"
convert "$R/avatar_brennan.png" -crop 768x768+0+100 +repage -resize 320x320 -quality 85 "$G/images/avatars/brennan.jpg"

# ---------- art ----------
for f in art_ch1 art_ch2 art_ch3 art_end_bad art_end_good art_end_true art_gullrock; do
  convert "$R/$f.png" -resize 1200x -quality 82 "$G/images/art/${f#art_}.jpg"
done
convert "$R/wallpaper.png" -resize 900x -quality 82 "$G/images/art/wallpaper.jpg"

# ---------- photo clues ----------
# Plaque with engraved text
convert "$R/photo_plaque_base.png" \
  \( -size 560x300 xc:none -font $SERIF -fill '#2a1d0e' -gravity center -pointsize 25 \
     -annotate +0-110 'IN MEMORY OF THOSE LOST' -annotate +0-74 'ABOARD THE MV MERROW' \
     -pointsize 24 -annotate +0-20 'NORA CALDER  ·  EDWIN HOLT' -annotate +0+14 'AGNES PIKE  ·  SAMUEL REID' \
     -pointsize 40 -annotate +0+75 '17 · III · 2020' \
     -pointsize 14 -annotate +0+118 '“THE SEA KEEPS WHAT THE TOWN REMEMBERS”' \
     \( +clone -background '#d9b77a' -shadow 60x1+1+1 \) +swap -background none -layers merge +repage \) \
  -gravity northwest -geometry +440+205 -composite -resize 1200x -quality 84 "$G/images/photos/plaque.jpg"

# Merrow archive photo with registration on bow
convert "$R/photo_merrow_base.png" \
  -font $SANSB -fill '#14202a' -pointsize 34 -annotate 0x0+842+468 'SM-4127' \
  -font $SANSB -fill '#14202a' -pointsize 22 -annotate 0x0+905+440 'MERROW' \
  -resize 1200x -quality 84 "$G/images/photos/merrow.jpg"

# Logbook page (original inspection)
convert "$R/photo_logbook_base.png" \
  -font $HAND -fill '#1b2a52' -pointsize 26 \
  -annotate 0x0+350+240 'Saltmere Harbour Authority' \
  -annotate 0x0+350+272 'Inspection Log  ·  Vol. 9' \
  -pointsize 22 \
  -annotate 0x0+350+330 '03 Mar 2020' \
  -annotate 0x0+350+362 'Vessel: MV Merrow   Reg. SM-4127' \
  -annotate 0x0+350+394 'Owner: Callow Line Ltd.' \
  -annotate 0x0+350+446 'Hull plating, frame 12 —' \
  -annotate 0x0+350+478 'corrosion approx. 40%' \
  -annotate 0x0+350+530 'Result:' \
  -pointsize 30 -annotate 0x0+450+532 'FAIL' \
  -stroke '#1b2a52' -strokewidth 3 -draw 'line 445,522 520,522' -stroke none \
  -fill '#7a1010' -pointsize 30 -annotate -8x-8+530+520 'PASS' \
  -fill '#1b2a52' -pointsize 22 \
  -annotate 0x0+350+590 'Not fit for passenger service' \
  -annotate 0x0+350+650 'Inspector:' -pointsize 34 -annotate 0x0+470+654 'W.D.' \
  -pointsize 22 -annotate 0x0+725+250 '04 Mar 2020' \
  -annotate 0x0+725+282 'Certificate issued' \
  -fill '#7a1010' -annotate 0x0+725+314 '— W.D.' \
  -fill '#1b2a52' -annotate 0x0+725+380 '(page torn below)' \
  -resize 1200x -quality 86 "$G/images/photos/logbook.jpg"

# Ivy's own blurry partial photo of the page (survives even if the book is lost)
convert "$G/images/photos/logbook.jpg" -crop 520x420+260+280 +repage -background '#1a1410' -rotate 4 -blur 0x1.4 \
  -modulate 85,80 -resize 1000x -quality 70 "$G/images/photos/logbook_partial.jpg"

# Timecard
convert "$R/photo_timecard_base.png" \
  -font $MONOB -fill '#222' -pointsize 15 \
  -annotate -4x-4+828+282 'PRICE, J.   #0117' \
  -font $MONO -pointsize 13 \
  -annotate -4x-4+830+330 'SAT 03  IN  00:58' \
  -annotate -4x-4+832+360 'SAT 03  OUT 09:02' \
  -resize 1200x -quality 84 "$G/images/photos/timecard.jpg"

# CCTV with timestamp
convert "$R/photo_cctv_base.png" \
  -font $MONOB -fill white -stroke black -strokewidth 1 -pointsize 30 \
  -annotate +60+80 'CAM 04  FERRY LOT' -annotate +60+120 '03-10-2026  03:05:41' \
  -resize 1200x -quality 70 "$G/images/photos/cctv.jpg"

for f in photo_bonfire:bonfire photo_cannery:cannery photo_locker_empty:locker_empty photo_rockpool:rockpool; do
  convert "$R/${f%%:*}.png" -resize 1200x -quality 82 "$G/images/photos/${f##*:}.jpg"
done
cp "$G/images/art/gullrock.jpg" "$G/images/photos/gullrock.jpg"

# Tide table (generated)
convert -size 1080x1350 xc:'#0d1b20' \
  -font $SANSB -fill '#f2a541' -pointsize 46 -annotate +70+120 'SALTMERE HARBOUR' \
  -font $SANS -fill '#9fb7bd' -pointsize 30 -annotate +70+170 'Tide predictions  ·  Heights above chart datum' \
  -fill '#1a3038' -draw 'rectangle 60,220 1020,1000' \
  -font $SANSB -fill '#e9f1f2' -pointsize 34 -annotate +100+290 'MON 12 OCT' \
  -font $MONO -pointsize 34 -fill '#cfe0e3' \
  -annotate +100+350 'HIGH   08:52   4.6 m' \
  -annotate +100+405 'LOW    15:10   1.3 m' \
  -annotate +100+460 'HIGH   21:15   4.4 m' \
  -font $SANSB -fill '#e9f1f2' -pointsize 34 -annotate +100+560 'TUE 13 OCT' \
  -font $MONO -pointsize 34 -fill '#cfe0e3' \
  -annotate +100+620 'LOW    03:40   0.4 m' \
  -annotate +100+675 'HIGH   09:41   4.7 m' \
  -annotate +100+730 'LOW    16:02   1.2 m' \
  -fill '#5d7b82' -pointsize 26 -annotate +100+800 'Spring tides. Next spring low: 27 Oct.' \
  -font $SANSB -fill '#f2a541' -pointsize 30 -annotate +70+1080 'GULL ROCK CAUSEWAY' \
  -font $SANS -fill '#cfe0e3' -pointsize 27 \
  -annotate +70+1130 'Passable on foot only when the tide is below 1.0 m,' \
  -annotate +70+1170 'roughly 70 minutes either side of low water.' \
  -annotate +70+1210 'Do not attempt in fog. Do not attempt alone.' \
  -quality 88 "$G/images/photos/tidetable.jpg"

# Harbour relay map (generated)
convert -size 1200x900 xc:'#0b2a33' \
  -fill '#24423f' -draw 'polygon 0,0 1200,0 1200,260 980,300 860,250 700,330 560,300 420,380 260,330 120,400 0,380' \
  -fill '#24423f' -draw 'circle 930,700 990,700' \
  -stroke '#3d5f5b' -strokewidth 6 -draw 'line 760,330 900,660' -stroke none \
  -fill '#2c4b48' -draw 'rectangle 380,330 470,420' \
  -font $SANSB -fill '#f2a541' -pointsize 34 -annotate +40+60 'SALTMERE HARBOUR AUTHORITY' \
  -font $SANS -fill '#9fb7bd' -pointsize 24 -annotate +40+98 'Tide-sensor Bluetooth relay network (public map)' \
  -fill '#f2a541' \
  -draw 'circle 150,390 160,390' -draw 'circle 300,340 310,340' -draw 'circle 430,370 440,370' \
  -draw 'circle 600,305 610,305' -draw 'circle 760,330 770,330' -draw 'circle 880,260 890,260' \
  -draw 'circle 930,690 940,690' -draw 'circle 1100,240 1110,240' \
  -font $SANSB -fill '#e9f1f2' -pointsize 22 \
  -annotate +120+430 'R1 Slipway' -annotate +270+300 'R2 Fish market' -annotate +400+455 'R3 Cannery pier' \
  -annotate +560+270 'R4 Harbour office' -annotate +700+380 'R5 Breakwater' -annotate +830+225 'R6 Ferry terminal' \
  -annotate +860+760 'R7 Gull Rock fog station' -annotate +1020+205 'R8 Lifeboat' \
  -font $SANS -fill '#7fa0a6' -pointsize 20 -annotate +770+520 'tidal causeway' \
  -annotate +40+870 'Relays accept pairing from registered staff devices. Range ~60 m.' \
  -quality 88 "$G/images/photos/relaymap.jpg"

# ---------- icon / splash ----------
convert "$R/icon.png" -resize 1024x1024 "$G/icon.png"
convert "$R/icon.png" -resize 48x48 "$G/favicon.png"
convert "$R/icon.png" -resize 1024x1024 "$G/android-icon-foreground.png"
convert -size 1024x1024 xc:'#0b1f24' "$G/android-icon-background.png"
convert "$R/icon.png" -resize 1024x1024 -colorspace gray -threshold 55% "$G/android-icon-monochrome.png"
convert "$R/splash_mark.png" -trim +repage -resize 900x900 -background none -gravity center -extent 1024x1024 "$G/splash-icon.png"
echo done
convert "$R/avatar_rahman.png" -crop 768x768+0+100 +repage -resize 320x320 -quality 85 "$G/images/avatars/rahman.jpg"
