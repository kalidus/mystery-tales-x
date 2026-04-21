# Prompts usados para generar sprites de Xavier

Fuente: historial de chat donde se creó el set de 10 imágenes del personaje principal.

## 1) `xavier_idle_1.png`
High-quality pixel art sprite of a paranormal phenomena detective named Xavier, full body, standing front-facing slightly rotated to the right, IDLE pose frame 1 (breathing out, chest slightly lower). Canvas: 1024 wide by 1536 tall. Character is centered horizontally and feet rest exactly on y=1456 (80 px from bottom). Character height about 1350 px.

STRICT REQUIREMENTS (critical):
- Background: PURE solid magenta #FF00FF, absolutely flat, NO gradient, NO texture, NO antialiasing, NO halo or bloom around the character. The magenta must be exactly RGB(255,0,255) everywhere outside the silhouette.
- Pixel art style: crisp hard-edge pixels, visible chunky pixel blocks (approx 6-8 px per art unit), strong 1px dark outline around the full silhouette, NO blur, NO soft shadows, NO glow bleed onto the magenta.
- Limited palette, consistent colors.

Character design (Detective of Paranormal Phenomena):
- Long brown worn trenchcoat reaching mid-calf, color #5c3d28 with darker shadows #3a2818, buttoned, with belt.
- Grey slightly dented fedora hat on head, color #4a4a4a, dark band #20202a.
- Visible short dark brown beard and mustache, tired hazel eyes.
- Skin tone #e8c39e with slight shadow #b48a6a.
- Dark almost-black worn leather boots #1a1520.
- On the belt at the right hip: a strange handheld device labeled "Pocket Spectrometer" - small brass-and-wood gadget with two tiny glowing bright green lights #7cff8a (one lit brighter than the other).
- Subtle cool rim lighting from upper-left, gentle warm fill. Overall noir mysterious vibe but CLEAN silhouette.
- Facing 3/4 view to the RIGHT (character's body slightly angled right, so the design can be mirrored for left-facing).
- Arms relaxed at sides, one hand near belt/spectrometer. Feet slightly apart for balance.
- Pose: relaxed idle, chest slightly LOWERED (exhaling). Symmetric, stable weight distribution.

No text, no watermark, no border, no logo. The character must be perfectly within the canvas with at least 40 px of magenta padding on all sides. Feet at the same baseline that will be used for all 10 frames.

## 2) `xavier_idle_2.png`
EXACT same pixel art sprite as the reference image, SAME character, SAME pose, SAME canvas (1024x1536), SAME position, SAME palette, SAME outline, SAME magenta #FF00FF background, but this is IDLE frame 2: the chest is slightly RAISED (inhaling) - so the shoulders and chest lift up by just 4-6 pixels compared to the reference. The rest (arms, legs, feet, head position, hat, beard, belt, spectrometer lights) must be IDENTICAL to the reference. Feet must be at the EXACT same pixel baseline as the reference. No other changes. Pure flat magenta RGB(255,0,255) background, no halo, no antialiasing, crisp pixel art with hard 1px outline.

## 3) `xavier_walk_1.png`
EXACT same pixel art character as the reference (same Xavier detective with brown trenchcoat, grey fedora, beard, belt with green-lit Pocket Spectrometer, dark boots). SAME canvas 1024x1536, SAME pixel art style, SAME palette, SAME outline, SAME solid flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing, no gradient).

This is WALK cycle frame 1 of 4 (CONTACT - right foot forward touching ground). The character is now in a WALKING pose facing RIGHT (3/4 profile to the right):
- Right leg extended FORWARD (heel just touching ground in front), left leg extended BACK (toes pushing off ground behind).
- Right arm swung BACKWARD (counter to right leg forward), left arm swung FORWARD slightly.
- Trenchcoat flaps back slightly from forward motion, coat tail lifted a bit behind.
- Torso leans forward VERY slightly (3-5 pixels).
- Hat and head bob slightly DOWN (lowest point in walk cycle, ~4 px lower than idle).

CRITICAL: feet baseline must be the SAME pixel row as the idle reference (the back foot toe or front foot heel at y~1456). The character's horizontal center stays near the same column as the reference - do not shift the whole character sideways, only the legs/arms move. Same character design, NO other changes to hat/coat colors/beard/face/spectrometer. Crisp pixel art, hard 1px dark outline, no blur.

## 4) `xavier_walk_2.png`
EXACT same pixel art Xavier detective character as the reference. SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing).

This is WALK cycle frame 2 of 4 (PASSING pose - legs crossing in the middle). Character facing RIGHT:
- Right leg is now UNDER the body vertical (foot flat on ground, bearing weight).
- Left leg passing FORWARD in the air, knee slightly bent, foot just off ground (about 20 px raised).
- Arms in neutral position, both near body sides, slight counter-swing.
- Torso UPRIGHT (not leaning), hat/head at HIGHEST point of walk cycle (~4 px higher than contact frame - this is the peak of the walk bounce).
- Coat hangs straight.

CRITICAL: supporting leg's foot (right foot) must rest at exactly the SAME pixel baseline as the reference character's feet (y~1456). The horizontal center of the body stays at the SAME column as reference. NO horizontal shift of the character. Same face, same hat, same beard, same belt with green-glowing spectrometer. Crisp pixel art, hard 1px outline, no blur, no soft shadows.

## 5) `xavier_walk_3.png`
EXACT same pixel art Xavier detective character as the reference. SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing, no gradient).

This is WALK cycle frame 3 of 4 (OPPOSITE CONTACT - left foot forward touching ground). Character facing RIGHT:
- Left leg extended FORWARD (heel just touching ground in front), right leg extended BACK (toes pushing off behind).
- Left arm swung BACKWARD (counter-opposite of right leg), right arm swung FORWARD slightly (so opposite to walk_1).
- Trenchcoat flaps back slightly from forward motion.
- Torso leans forward VERY slightly (3-5 pixels).
- Hat and head at LOWEST bobbing point (same height as walk_1 contact frame, ~4 px lower than passing).

This is the MIRROR-leg version of walk_1 (opposite leg forward).

CRITICAL: feet baseline must be EXACTLY the same pixel row as reference (y~1456). Horizontal center of character stays at SAME column as reference. No horizontal character shift. Same face, hat, coat, beard, belt with green-glowing spectrometer. Crisp pixel art, hard 1px dark outline, no blur, no soft shadows.

## 6) `xavier_walk_4.png`
EXACT same pixel art Xavier detective character as the reference. SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing).

This is WALK cycle frame 4 of 4 (OPPOSITE PASSING - legs crossing again but weight on left leg). Character facing RIGHT:
- Left leg is now UNDER the body vertical (foot flat, bearing weight).
- Right leg passing FORWARD in the air, knee slightly bent, foot just off ground (about 20 px raised).
- Arms in neutral position near sides.
- Torso UPRIGHT, hat/head at HIGHEST point of walk cycle (~4 px higher than contact frames, same height as walk_2).
- Coat hangs straight.

This is like walk_2 (passing pose) but with OPPOSITE leg carrying weight.

CRITICAL: supporting leg's foot (left foot) must rest at EXACTLY the SAME pixel baseline as reference (y~1456). Horizontal center of the character stays at SAME column. NO horizontal shift. Same face, same hat, same coat, same beard, same belt with green-glowing Pocket Spectrometer. Crisp pixel art, hard 1px dark outline, no blur.

## 7) `xavier_talk_1.png`
EXACT same pixel art Xavier detective character as the reference. SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing).

This is TALK frame 1 of 2 (mouth CLOSED, neutral speaking pose). Character standing facing RIGHT in 3/4 view, same idle stance as the reference (arms relaxed at sides, feet slightly apart).

Differences from the idle reference:
- Right arm/hand slightly RAISED and gesturing outward at chest height (like making a "as I was saying" gesture), elbow bent about 90 degrees, hand open palm up near chest.
- Left arm stays relaxed at side.
- Head slightly tilted up (maybe 2-3 pixels), eyebrow slightly raised giving sarcastic/skeptical expression.
- Mouth is CLOSED (just a thin line).

CRITICAL: feet baseline must be EXACTLY the same pixel row as reference (y~1456). Horizontal center of character body stays at SAME column as reference. Same hat, coat, beard, belt with green-glowing spectrometer. Crisp pixel art, hard 1px dark outline, no blur, no soft shadows.

## 8) `xavier_talk_2.png`
EXACT same pixel art Xavier detective character as the reference (brown trenchcoat, grey fedora, beard, belt with green-glowing Pocket Spectrometer, dark boots, facing right 3/4). SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing).

This is TALK frame 2 of 2 (mouth OPEN mid-sentence). Pose is IDENTICAL to talk_1 reference (right hand gesturing at chest height, left arm relaxed) but:
- Mouth is OPEN (showing a small dark oval, like he's pronouncing an "A" or "O" sound, about 8-10 pixels tall).
- Eyebrows maybe shifted 1-2 pixels for subtle animation (slight eyebrow raise).

Everything else must be IDENTICAL to the provided talk reference: same right-hand gesture position, same left arm at side, same head tilt, same feet position. Feet baseline at EXACTLY the same pixel row (y~1456). Horizontal center at SAME column. Same hat, coat, beard, belt. Crisp pixel art, hard 1px dark outline, no blur.

## 9) `xavier_reach.png`
EXACT same pixel art Xavier detective character as the reference (brown trenchcoat, grey fedora, beard, belt with green-glowing Pocket Spectrometer, dark boots, facing right 3/4). SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing).

This is REACH pose (frame 1 of 2 for grab animation). Character is reaching forward/down to grab an object from the ground:
- Torso leans FORWARD about 30 degrees (bending at waist), head down looking at an imaginary object in front of feet.
- Right arm fully EXTENDED FORWARD AND DOWN toward a point near the floor in front (fingers open, about to touch), hand reaching to ground level (~y=1420).
- Left arm bent back for balance.
- Legs: right leg slightly forward and bent at knee, left leg planted straight, both feet on ground.
- Coat falls forward a bit because of bent-over posture.

CRITICAL: both feet on ground at EXACTLY same baseline as reference (y~1456). The horizontal center of the character's FEET stays at SAME column as reference (so feet don't shift left/right even though torso leans forward). Same hat, coat color, beard, belt spectrometer glowing green. Crisp pixel art, hard 1px dark outline, no blur, no soft shadows.

## 10) `xavier_grab.png`
EXACT same pixel art Xavier detective character as reference (brown trenchcoat, grey fedora, beard, belt with green-glowing Pocket Spectrometer, dark boots). SAME canvas 1024x1536, SAME style, SAME palette, SAME pure flat magenta #FF00FF background (pure RGB 255,0,255, no halo, no antialiasing).

This is GRAB pose (frame 2 of 2 for grab animation). Continuation of the reach pose - the character has now CLOSED HIS FIST around a small object near the ground:
- Torso still leaned FORWARD about 30 degrees (same as reach reference).
- Right arm extended forward-down, hand now CLOSED INTO A FIST gripping a small glowing object (a tiny glass vial with green ectoplasm, about 30x50 px, glowing faint green #7cff8a).
- Left arm bent back for balance.
- Right leg slightly forward bent, left leg planted.
- Head tilted down looking at the grabbed object, satisfied small smile/smirk (sarcastic detective).

The feet must stay at EXACTLY the same pixel positions and baseline as the reach reference - do not shift horizontally. Same hat, coat, beard, belt spectrometer. Crisp pixel art, hard 1px dark outline, no blur.

