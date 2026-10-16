import { blobToImage } from "./imageTools";

/* =========================================================================
   ZYVAR TEMPLATE — generates the branded product poster with canvas.

   Layout (1080 x 1080): black background, gold frame, ZYVAR logo + tagline,
   glowing product shot, product name, tick benefits, "Order Now" button.
   Partner uploads also get "Sold by <store>" under the tagline.
   ========================================================================= */

const SIZE = 1080;
const GOLD = "#C6922B";
const GOLD_LIGHT = "#E8C77A";
const FONT = `"Montserrat","Sora","Segoe UI",Arial,sans-serif`;

let logoPromise;
function loadLogo() {
  if (!logoPromise) {
    logoPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = "/zyvar-logo.png";
    });
  }
  return logoPromise;
}

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#8A6417");
  g.addColorStop(0.5, GOLD_LIGHT);
  g.addColorStop(1, "#8A6417");
  return g;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length > maxLines ? null : lines;
}

function drawTick(ctx, x, y, s) {
  ctx.save();
  ctx.strokeStyle = "#D4A017";
  ctx.lineWidth = s * 0.16;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.05);
  ctx.lineTo(x + s * 0.34, y + s * 0.4);
  ctx.lineTo(x + s * 0.95, y - s * 0.4);
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {Blob} productBlob  product picture (cut-out PNG looks best)
 * @param {{name:string, benefits?:string[], storeName?:string}} info
 * @returns {Promise<Blob>} PNG
 */
export async function renderZyvarTemplate(productBlob, info) {
  const { name = "", benefits = [], storeName = "" } = info;

  if (document.fonts?.load) {
    try {
      await Promise.race([
        Promise.all([
          document.fonts.load(`700 40px "Montserrat"`),
          document.fonts.load(`400 30px "Montserrat"`),
        ]),
        new Promise((r) => setTimeout(r, 800)),
      ]);
    } catch {
      /* fall back to system font */
    }
  }

  const [product, logo] = await Promise.all([blobToImage(productBlob), loadLogo()]);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  /* ---- background ---- */
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const glow = ctx.createRadialGradient(SIZE / 2, 470, 20, SIZE / 2, 470, 430);
  glow.addColorStop(0, "rgba(255,255,255,0.30)");
  glow.addColorStop(0.45, "rgba(255,255,255,0.08)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 150, SIZE, 620);

  /* ---- gold frame ---- */
  ctx.lineWidth = 3;
  ctx.strokeStyle = goldGradient(ctx, 0, 0, SIZE, SIZE);
  ctx.strokeRect(20, 20, SIZE - 40, SIZE - 40);

  /* ---- logo + tagline ---- */
  let y = 62;
  if (logo) {
    const lw = 400;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, (SIZE - lw) / 2, y, lw, lh);
    y += lh;
  } else {
    ctx.fillStyle = GOLD_LIGHT;
    ctx.font = `700 76px Georgia, serif`;
    ctx.fillText("ZYVAR", SIZE / 2, y + 70);
    y += 90;
  }

  ctx.fillStyle = GOLD;
  ctx.font = `400 21px ${FONT}`;
  ctx.fillText("Original Cosmetics  •  Family Essentials  •  Imported Treats", SIZE / 2, y + 28);
  y += 28;

  if (storeName) {
    ctx.fillStyle = GOLD_LIGHT;
    ctx.font = `600 22px ${FONT}`;
    const label = `Sold by ${storeName}`.slice(0, 48);
    ctx.fillText(label, SIZE / 2, y + 36);
    y += 36;
  }

  /* ---- product ---- */
  const boxTop = y + 24;
  const boxBottom = 735;
  const boxW = 620;
  const boxH = boxBottom - boxTop;
  const scale = Math.min(boxW / product.width, boxH / product.height);
  const pw = product.width * scale;
  const ph = product.height * scale;
  const px = (SIZE - pw) / 2;
  const py = boxTop + (boxH - ph) / 2;

  // floor light
  const floor = ctx.createRadialGradient(SIZE / 2, boxBottom + 6, 5, SIZE / 2, boxBottom + 6, 380);
  floor.addColorStop(0, "rgba(255,255,255,0.25)");
  floor.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.translate(0, boxBottom + 6);
  ctx.scale(1, 0.07);
  ctx.translate(0, -(boxBottom + 6));
  ctx.fillStyle = floor;
  ctx.fillRect(0, boxBottom - 420, SIZE, 900);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  ctx.drawImage(product, px, py, pw, ph);
  ctx.restore();

  /* ---- divider ---- */
  ctx.fillStyle = goldGradient(ctx, 150, 0, SIZE - 150, 0);
  ctx.fillRect(150, 758, SIZE - 300, 2);

  /* ---- title ---- */
  ctx.fillStyle = "#fff";
  let titleSize = 46;
  let lines = null;
  while (titleSize >= 26 && !lines) {
    ctx.font = `700 ${titleSize}px ${FONT}`;
    lines = wrapLines(ctx, name, SIZE - 150, titleSize > 34 ? 1 : 2);
    if (!lines) titleSize -= 2;
  }
  if (!lines) {
    ctx.font = `700 28px ${FONT}`;
    lines = [name.slice(0, 60)];
  }
  const cleanBenefits = benefits.map((b) => b.trim()).filter(Boolean).slice(0, 3);

  const titleY = lines.length > 1 ? 790 : 820;
  lines.forEach((l, i) => ctx.fillText(l, SIZE / 2, titleY + i * (titleSize + 6)));
  const rowY = titleY + (lines.length - 1) * (titleSize + 6) + 40;

  /* ---- benefits with ticks ---- */
  const rowStep = 34;
  const fontPx = 24;
  ctx.font = `400 ${fontPx}px ${FONT}`;
  const widest = Math.max(0, ...cleanBenefits.map((b) => ctx.measureText(b).width));
  const blockW = 54 + widest;
  const startX = (SIZE - blockW) / 2;

  cleanBenefits.forEach((b, i) => {
    const by = rowY + i * rowStep;
    drawTick(ctx, startX, by - fontPx * 0.35, 26);
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.fillText(b, startX + 54, by);
    ctx.textAlign = "center";
  });

  /* ---- Order Now button ---- */
  const btnW = 380;
  const btnH = 66;
  const btnX = (SIZE - btnW) / 2;
  const btnY = SIZE - 40 - btnH - 20;
  const bg = ctx.createLinearGradient(0, btnY, 0, btnY + btnH);
  bg.addColorStop(0, "#2a2a2a");
  bg.addColorStop(1, "#050505");
  roundRect(ctx, btnX, btnY, btnW, btnH, btnH / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = goldGradient(ctx, btnX, 0, btnX + btnW, 0);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("Order Now", SIZE / 2, btnY + btnH / 2 + 12);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Template failed"))), "image/png")
  );
}
