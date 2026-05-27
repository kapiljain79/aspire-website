# Aspire IT Systems - Gemini Image Prompt Kit (LinkedIn)

How to use this file:
1. **Always paste the "Style Block" first** as the opening of every Gemini image request.
2. **Then paste one of the eight prompt variations** below for the specific post you need.
3. **After Gemini returns the image, add your actual logo + headline text in Photopea (free, https://www.photopea.com) or Figma** (~2 min). AI image generators cannot reproduce your exact triangle logo or render crisp text reliably - leave those layers to a real design tool.

LinkedIn image specs:
- **Feed post (single):** 1200 × 627 px (landscape) or 1080 × 1080 px (square)
- **Cover banner:** 1584 × 396 px
- **Carousel slide:** 1080 × 1350 px (portrait) or 1080 × 1080 px

---

## 🎨 STYLE BLOCK - paste this at the start of every prompt

```
Generate a professional B2B LinkedIn image for "Aspire IT Systems", a North American IT infrastructure consultancy.

VISUAL STYLE - strict guide:
- Aesthetic: editorial, premium, sophisticated. Confident not flashy. Inspired by Stripe, Linear, Vercel marketing pages - clean, technical, high-end.
- Background mood: deep navy (#0B1A2E) as primary OR warm cream (#F4F1EA) as alternative - pick ONE per image. Never both. No pure black, no pure white.
- Primary accent: warm teal (#2BB3B3 to #3FCFCF). Use sparingly as glows, lines, highlights.
- CTA / energy accent: warm orange (#E87722). Use very sparingly - one focal element only.
- Typography hint (if rendering any text): elegant serif (Fraunces style) for headlines, geometric sans (Space Grotesk style) for labels. Monospace (JetBrains Mono) for tech labels.
- Lighting: soft, directional, slightly cinematic. Avoid harsh shadows.
- Texture: subtle - fine grid patterns, dotted matrices, gradient meshes, or noise. Never busy.
- Composition: lots of breathing room. Off-center hero element. Generous negative space (40–60% of frame).
- Illustration style for any technical motifs: thin-line vector, wireframe diagrams, network topologies, glowing nodes, circuit-like patterns. NOT 3D realism. NOT cartoon. NOT stock-photo glossy.
- Mood words: trustworthy, exact, calm, intelligent, engineered.

LEAVE EMPTY SPACE in upper-left or upper-right corner for a logo overlay (I will add the actual Aspire logo afterward).
LEAVE EMPTY SPACE for headline text (typically left half or bottom-left third).

DO NOT include:
- Stock-photo people in suits shaking hands
- Generic "cloud icons" floating on blue gradients
- Hacker-in-hoodie imagery
- Lock icons, shield icons, anything cliché
- Existing brand logos (Cisco, AWS, Azure, etc.) - those go on the site, not the image
- Any text rendered inside the image (I'll add text in Photopea (free, https://www.photopea.com))
```

---

## 8 ready-to-use prompts

Pick the one that matches the post, paste it AFTER the Style Block.

### 1. Announcement / event teaser (e.g., InfoComm 2026)

```
SUBJECT: A flowing network visualization on a deep navy (#0B1A2E) background. Thin teal wireframe lines connecting glowing nodes form an abstract grid that suggests a major event venue or city skyline. Subtle warm orange pulse at one focal node. Cinematic depth, slight bokeh on distant nodes. 1200x627 landscape. Leave the left third as clean negative space for "InfoComm 2026 - Booth #1234" headline overlay.
```

### 2. Service spotlight - Data Center / Spine-Leaf

```
SUBJECT: Abstract architectural illustration of a Spine/Leaf network fabric. Two parallel rows of glowing teal nodes (the "spine") connected by fine criss-crossing lines to a wider row below (the "leaf"). All in thin wireframe vector style on warm cream (#F4F1EA) background with a faint dot-grid. A single subtle orange highlight on one critical path. Editorial, technical, beautiful. 1080x1080 square. Headline space at bottom 30%.
```

### 3. Service spotlight - Cloud migration

```
SUBJECT: A clean isometric illustration of an on-premises data center on the left being connected via flowing teal energy paths to abstract cloud-shaped vertices on the right. Deep navy (#0B1A2E) background with subtle hexagonal grid texture. Thin-line vector style, glowing connection paths. Warm orange accent on a single "delivery confirmed" node. 1200x627 landscape. Leave upper-right corner clean for logo.
```

### 4. Educational / insight post (e.g., a tech tip)

```
SUBJECT: Minimalist editorial composition. A single elegant teal line traces an arc across a warm cream (#F4F1EA) background, ending at a glowing teal dot. Subtle dot-grid texture in background. Single tiny orange marker mid-arc. Feels like a tasteful financial-times-style data visualization. 1080x1080 square. Bottom 40% reserved for headline text.
```

### 5. Case study / outcome highlight (with big metric)

```
SUBJECT: Abstract data-visualization style. A bold geometric shape (large teal arc, ring, or angular line) on a deep navy (#0B1A2E) background with fine grid texture. Subtle radial glow behind the shape. One small orange dot as a focal accent. Cinematic, premium, confident. 1200x627 landscape. Leave the left half empty so I can overlay "25% CapEx reduction" type stat.
```

### 6. Security / SASE / Zero-Trust theme

```
SUBJECT: Abstract layered ring visualization - concentric thin-line teal circles on a deep navy (#0B1A2E) background suggesting layered security or radar perimeters. Subtle radial gradient at center. Glowing teal nodes positioned at intersections. One orange node marking an "anomaly detected" point. Wireframe vector style, editorial, clean. 1080x1080 square. Upper-left negative space for logo.
```

### 7. Team / hiring / culture post

```
SUBJECT: A soft, abstract editorial image suggesting collaboration without showing literal people. Warm cream (#F4F1EA) background with several flowing teal lines converging toward a focal point in the lower-right (where text will go). A single small orange dot among the teal. Minimalist, warm but technical. 1200x1200 square. Leave lower-right third for hiring headline.
```

### 8. Quote / testimonial / thought-leadership post

```
SUBJECT: Minimalist editorial composition for a quote card. Warm cream (#F4F1EA) background with a single thin teal vertical line on the left edge (like a pull-quote bar). Subtle fine grid in background, very faint. Tiny orange accent dot in bottom-right corner. Lots of negative space - the headline overlay (the quote text) will dominate. 1080x1350 portrait. Leave center-right 70% completely clean.
```

---

## After Gemini generates - finish the image (all free options)

**Recommended: Photopea** (https://www.photopea.com) - free, browser-based, no signup. Photoshop-style interface. Or use **PowerPoint** if you have M365 (set slide size to 1200×627, drop image+logo+text, export as PNG). **Figma** free tier is another good option.

Workflow in any of them:
1. Import the AI image as a background.
2. Add your **logo file** (use the PNG from your website: `logo-mark.png`) in the empty corner you specified.
3. Add the **headline text** using the brand fonts:
   - Headlines: **Fraunces** (serif, 600 weight) - available free from Google Fonts
   - Subhead/labels: **Space Grotesk** (sans-serif, 500–700 weight)
   - Tiny tech labels (e.g., "RACK-12A · YYC-DC1"): **JetBrains Mono** (uppercase, letter-spacing)
4. Use the exact brand palette for text:
   - Headlines on dark bg: `#ECE9E0` (warm off-white)
   - Headlines on cream bg: `#0B1A2E` (deep navy)
   - Accent: `#2BB3B3` (teal) - use for one or two highlight words
   - Call-to-action button: `#E87722` (orange) background, white text
5. Apply a thin border or no border. Avoid drop shadows on text.

Export as PNG (better quality than JPG for graphics with text).

---

## Variations to try

If Gemini's first output looks too generic, regenerate with one of these added to the prompt:

- **More technical** → "render with a slight CRT-monitor glow effect, suggesting NOC dashboard aesthetic"
- **More editorial** → "in the visual style of a New York Times Magazine feature illustration, restrained, sophisticated"
- **More motion** → "with motion blur suggesting data flowing along the lines"
- **More texture** → "with subtle film grain, fine noise overlay"
- **More minimal** → "with even more negative space, the focal element occupying only 30% of the frame"

---

## What to AVOID asking Gemini for

- ❌ Your exact Aspire triangle logo (it will hallucinate something close but wrong)
- ❌ Specific text inside the image (it'll come out misspelled or warped)
- ❌ Specific real partner logos (Cisco, AWS, etc.)
- ❌ Real photographs of identifiable buildings or people
- ❌ Anything claiming to be a "real" diagram (it'll look plausible but be wrong)

Use Gemini for the **vibe + background**. Use Photopea (free, https://www.photopea.com) for the **logo + text + brand-accurate finishing**.

---

## One paste-it-all version

If you want a single block to paste into Gemini right now and get started, here's the Style Block + a generic "company brand image" prompt combined:

```
Generate a professional B2B LinkedIn image for "Aspire IT Systems", a North American IT infrastructure consultancy.

VISUAL STYLE: Editorial, premium, sophisticated. Like Stripe or Linear's marketing pages. Deep navy (#0B1A2E) background OR warm cream (#F4F1EA) - pick one. Primary accent warm teal (#2BB3B3 to #3FCFCF). Sparing warm orange (#E87722) energy accent - one focal element only. Soft cinematic lighting. Subtle grid or dot-matrix texture, never busy. 40–60% negative space. Thin-line wireframe vector style for any technical motifs. Trustworthy, exact, calm, intelligent, engineered.

NO stock-photo handshakes, NO floating cloud icons on blue gradients, NO hacker hoodies, NO cliché security shields, NO existing brand logos, NO text inside the image.

SUBJECT: Abstract network/infrastructure visualization - glowing teal nodes connected by thin-line edges across a vast deep-navy field, suggesting a continental-scale fiber network or data fabric. One single orange-glow node marks the headquarters. Subtle radial glow behind it. Cinematic depth. Composition: focal element off-center, generous breathing room.

Leave upper-left corner clean for a logo overlay. Leave lower half clean for headline text. Format: 1200x627 landscape (LinkedIn feed post size).
```
