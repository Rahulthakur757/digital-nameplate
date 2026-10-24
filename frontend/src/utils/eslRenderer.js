// src/utils/eslRenderer.js

// 800x480 resolution layout drawer
export const drawNamePlateCanvas = (canvas, item, options = {}) => {
  if (!canvas) return;
  canvas.width = 800;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const {
    bgColor = '#FFFFFF',
    textColor = '#000000',
    nameSizeOverride = null // Slider control
  } = options;

  // Background Fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 800, 480);

  const cleanName = (item?.name || '').trim();
  const cleanDesig = (item?.designation || '').trim();
  const cleanProj = (item?.project || '').trim();

  if (!cleanName) return;

  let subParts = [];
  if (cleanDesig) subParts.push(cleanDesig);
  if (cleanProj) subParts.push(cleanProj);
  const subText = subParts.join('  |  ');

  // Auto-wrap logic
  const words = cleanName.split(/\s+/);
  const MAX_WIDTH = 740;
  let nameLines = [];

  if (words.length > 1 && (cleanName.length > 13 || words.some((w) => w.length > 9))) {
    if (words.length === 2) {
      nameLines = [words[0], words[1]];
    } else if (words.length === 3) {
      nameLines = [`${words[0]} ${words[1]}`, words[2]];
    } else {
      const mid = Math.ceil(words.length / 2);
      nameLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    }
  } else {
    nameLines = [cleanName];
  }

  // Font sizing
  let nameFontSize = nameSizeOverride 
    ? Number(nameSizeOverride) 
    : (subText ? (nameLines.length > 1 ? 70 : 92) : (nameLines.length > 1 ? 80 : 105));
  
  const MIN_FONT_SIZE = 30;
  ctx.font = `bold ${nameFontSize}px Arial, "Segoe UI", sans-serif`;

  const getLongestLineWidth = () => Math.max(...nameLines.map((line) => ctx.measureText(line).width));
  while (getLongestLineWidth() > MAX_WIDTH && nameFontSize > MIN_FONT_SIZE) {
    nameFontSize -= 2;
    ctx.font = `bold ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (!subText) {
    if (nameLines.length === 1) {
      ctx.fillText(nameLines[0], 400, 240);
    } else {
      const lineHeight = nameFontSize * 1.18;
      const startY = 240 - lineHeight / 2;
      ctx.fillText(nameLines[0], 400, startY);
      ctx.fillText(nameLines[1], 400, startY + lineHeight);
    }
  } else {
    let nameCenterY = nameLines.length === 1 ? 190 : 160;
    if (nameLines.length === 1) {
      ctx.fillText(nameLines[0], 400, nameCenterY);
    } else {
      const lineHeight = nameFontSize * 1.15;
      const startY = nameCenterY - lineHeight / 2;
      ctx.fillText(nameLines[0], 400, startY);
      ctx.fillText(nameLines[1], 400, startY + lineHeight);
    }

    // Separator Line
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 285);
    ctx.lineTo(680, 285);
    ctx.stroke();

    // Subtitle
    let subFontSize = 44;
    ctx.font = `bold ${subFontSize}px Arial, "Segoe UI", sans-serif`;
    while (ctx.measureText(subText).width > MAX_WIDTH && subFontSize > 26) {
      subFontSize -= 2;
      ctx.font = `bold ${subFontSize}px Arial, "Segoe UI", sans-serif`;
    }
    ctx.fillText(subText, 400, 350);
  }
};

// Canvas pixel data to 96,000 bytes single-screen stream
export const canvasToBwry96KB = (canvas) => {
  const ctx = canvas.getContext('2d');
  const pixels = ctx.getImageData(0, 0, 800, 480).data;
  const singleScreenBytes = new Uint8Array(96000); // 800 * 480 / 4

  let byteIdx = 0;
  let b = 0;
  let j = 0;

  for (let p = 0; p < pixels.length; p += 4) {
    const r = pixels[p];
    const g = pixels[p + 1];
    const b_val = pixels[p + 2];

    b = (b << 2) & 0xFF;
    const isWhite = (r > 140 && g > 140 && b_val > 140);
    if (isWhite) {
      b = (b | 1) & 0xFF;
    } else {
      b = (b | 0) & 0xFF;
    }

    j++;
    if (j === 4) {
      singleScreenBytes[byteIdx++] = b;
      j = 0;
      b = 0;
    }
  }
  return singleScreenBytes;
};

// Generate full 192,000 byte dual-sided payload
export const generateDualPayload = (frontItem, backItem, frontOpts, backOpts) => {
  const frontCanvas = document.createElement('canvas');
  drawNamePlateCanvas(frontCanvas, frontItem, frontOpts);
  const frontBytes = canvasToBwry96KB(frontCanvas);

  const backCanvas = document.createElement('canvas');
  drawNamePlateCanvas(backCanvas, backItem, backOpts);
  const backBytes = canvasToBwry96KB(backCanvas);

  const totalDdsPayload = new Uint8Array(192000);
  totalDdsPayload.set(frontBytes, 0);       // Front screen at byte 0
  totalDdsPayload.set(backBytes, 96000);   // Back screen at byte 96000

  return totalDdsPayload;
};