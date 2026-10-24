import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import './NamePlateManager.css';

// ESL 7.50 DDS GATT Constants
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const CHAR_UUID = '0000fff5-0000-1000-8000-00805f9b34fb';
const PACKET_SIZE = 200; // 200 bytes per chunk (192KB total dual payload)

// Helper: Alphanumeric Normalized MAC (Colon, hyphen, spaces agnostic)
const cleanMac = (val) => String(val || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export default function NamePlateManager() {
  const [plates, setPlates] = useState([
    {
      id: 1,
      frontName: 'Rahul Thakur',
      frontDesignation: 'Full Stack Developer',
      frontProject: 'Ghaziabad',
      backName: 'Rahul Thakur',
      backDesignation: 'Full Stack Developer',
      backProject: 'Ghaziabad',
      mac: 'E4:52:1E:E5:6A:BA',
      status: 'Pending'
    }
  ]);

  // Synchronous State References (Loop aur Event Handlers ke liye race-condition proof)
  const platesRef = useRef(plates);
  useEffect(() => {
    platesRef.current = plates;
  }, [plates]);

  const [deviceMap, setDeviceMap] = useState({});
  const deviceMapRef = useRef(deviceMap);
  useEffect(() => {
    deviceMapRef.current = deviceMap;
  }, [deviceMap]);

  // UI Form States
  const [syncBothSides, setSyncBothSides] = useState(true);
  const [newFrontName, setNewFrontName] = useState('');
  const [newFrontDesignation, setNewFrontDesignation] = useState('');
  const [newFrontProject, setNewFrontProject] = useState('');
  const [newBackName, setNewBackName] = useState('');
  const [newBackDesignation, setNewBackDesignation] = useState('');
  const [newBackProject, setNewBackProject] = useState('');
  const [newMac, setNewMac] = useState('');

  // Sidebar Formatting Controls
  const [fontSizeChoice, setFontSizeChoice] = useState('auto');
  const [isBold, setIsBold] = useState(true);
  const [textCaseChoice, setTextCaseChoice] = useState('uppercase');
  const [textColorChoice, setTextColorChoice] = useState('#000000');
  const [bgColorChoice, setBgColorChoice] = useState('#FFFFFF');

  // Sidebar Graphics: Photo & QR
  const [showLogo, setShowLogo] = useState(false);
  const [logoImageObj, setLogoImageObj] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [qrMode, setQrMode] = useState('upload');
  const [qrImageObj, setQrImageObj] = useState(null);
  const [qrText, setQrText] = useState('https://company.com');
  const [qrCanvasElement, setQrCanvasElement] = useState(null);

  // Table Row Edit State
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    frontName: '',
    frontDesignation: '',
    frontProject: '',
    backName: '',
    backDesignation: '',
    backProject: '',
    mac: ''
  });

  // Preview & Queue States
  const [previewSide, setPreviewSide] = useState('front');
  const [previewItem, setPreviewItem] = useState(plates[0]);
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [globalStatus, setGlobalStatus] = useState('Ready for deployment');
  const [waitingForGestureIdx, setWaitingForGestureIdx] = useState(null);

  const canvasRef = useRef(null);

  // Text Case Formatter (UPPERCASE vs Proper Case)
  const formatTextCase = (str) => {
    if (!str) return '';
    const clean = String(str).trim();
    if (textCaseChoice === 'uppercase') {
      return clean.toUpperCase();
    }
    return clean.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // QR Canvas Generator
  useEffect(() => {
    if (!showQr || qrMode !== 'text' || !qrText.trim()) {
      setQrCanvasElement(null);
      return;
    }
    const offCanvas = document.createElement('canvas');
    QRCode.toCanvas(
      offCanvas,
      qrText.trim(),
      {
        width: 120,
        margin: 1,
        color: {
          dark: textColorChoice === '#FFFFFF' ? '#FFFFFF' : '#000000',
          light: bgColorChoice === '#000000' ? '#000000' : '#FFFFFF'
        }
      },
      (err) => {
        if (!err) setQrCanvasElement(offCanvas);
      }
    );
  }, [showQr, qrMode, qrText, textColorChoice, bgColorChoice]);

  // Photo & QR File Upload Handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setLogoImageObj(img);
        setShowLogo(true);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setQrImageObj(img);
        setShowQr(true);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Engine (800x480 resolution)
  const renderCanvasWithDetails = (canvas, item, options = {}) => {
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    const bg = options.bgColor || bgColorChoice;
    const txtColor = options.textColor || textColorChoice;
    const customSize = options.fontSize || fontSizeChoice;
    const boldWeight = options.bold !== undefined ? (options.bold ? 'bold' : 'normal') : (isBold ? 'bold' : 'normal');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 480);

    const photoWidth = 140;
    const photoHeight = 175;
    const photoX = 35;
    const photoY = 30;

    if (showLogo && logoImageObj) {
      try {
        ctx.save();
        ctx.strokeStyle = txtColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4);
        ctx.drawImage(logoImageObj, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
      } catch (err) {}
    }

    const qrSize = 120;
    const qrX = 800 - qrSize - 35;
    const qrY = 30;

    if (showQr) {
      try {
        if (qrMode === 'upload' && qrImageObj) {
          ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
        } else if (qrMode === 'text' && qrCanvasElement) {
          ctx.drawImage(qrCanvasElement, qrX, qrY, qrSize, qrSize);
        }
      } catch (err) {}
    }

    const cleanName = formatTextCase(item?.name || '');
    const cleanDesig = formatTextCase(item?.designation || '');
    const cleanProj = formatTextCase(item?.project || '');

    if (!cleanName) return;

    let subParts = [];
    if (cleanDesig) subParts.push(cleanDesig);
    if (cleanProj) subParts.push(cleanProj);
    const subText = subParts.join('  |  ');

    const hasLeftGraphic = showLogo && logoImageObj;
    const hasRightGraphic = showQr && (qrImageObj || qrCanvasElement);

    let textCenterX = 400;
    let MAX_WIDTH = 750;

    if (hasLeftGraphic && hasRightGraphic) {
      MAX_WIDTH = 460;
    } else if (hasLeftGraphic) {
      MAX_WIDTH = 550;
      textCenterX = 480;
    } else if (hasRightGraphic) {
      MAX_WIDTH = 550;
      textCenterX = 320;
    }

    const words = cleanName.split(/\s+/);
    let nameLines = [];

    if (words.length > 1 && (cleanName.length > 12 || words.some((w) => w.length > 8))) {
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

    let nameFontSize;
    let subFontSize;

    if (customSize !== 'auto') {
      const baseSize = parseInt(customSize, 10);
      nameFontSize = nameLines.length > 1 ? Math.round(baseSize * 0.8) : baseSize;
      subFontSize = Math.max(24, Math.min(52, Math.round(baseSize * 0.45)));
    } else {
      nameFontSize = nameLines.length > 1 ? 76 : 105;
      if (subText) nameFontSize = nameLines.length > 1 ? 68 : 95;
      subFontSize = 38;
    }

    const MIN_FONT_SIZE = 24;
    ctx.font = `${boldWeight} ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
    const getLongestLineWidth = () => Math.max(...nameLines.map((line) => ctx.measureText(line).width));

    while (getLongestLineWidth() > MAX_WIDTH && nameFontSize > MIN_FONT_SIZE) {
      nameFontSize -= 2;
      ctx.font = `${boldWeight} ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
    }

    ctx.fillStyle = txtColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (!subText) {
      if (nameLines.length === 1) {
        ctx.fillText(nameLines[0], textCenterX, 240);
      } else {
        const lineHeight = nameFontSize * 1.18;
        const startY = 240 - lineHeight / 2;
        ctx.fillText(nameLines[0], textCenterX, startY);
        ctx.fillText(nameLines[1], textCenterX, startY + lineHeight);
      }
    } else {
      let nameCenterY = nameLines.length === 1 ? 210 : 180;
      if (nameLines.length === 1) {
        ctx.fillText(nameLines[0], textCenterX, nameCenterY);
      } else {
        const lineHeight = nameFontSize * 1.15;
        const startY = nameCenterY - lineHeight / 2;
        ctx.fillText(nameLines[0], textCenterX, startY);
        ctx.fillText(nameLines[1], textCenterX, startY + lineHeight);
      }

      ctx.strokeStyle = txtColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const lineStart = Math.max(40, textCenterX - MAX_WIDTH / 2.2);
      const lineEnd = Math.min(760, textCenterX + MAX_WIDTH / 2.2);
      ctx.moveTo(lineStart, 305);
      ctx.lineTo(lineEnd, 305);
      ctx.stroke();

      ctx.font = `${boldWeight} ${subFontSize}px Arial, "Segoe UI", sans-serif`;
      while (ctx.measureText(subText).width > MAX_WIDTH && subFontSize > 20) {
        subFontSize -= 2;
        ctx.font = `${boldWeight} ${subFontSize}px Arial, "Segoe UI", sans-serif`;
      }
      ctx.fillText(subText, textCenterX, 375);
    }
  };

  useEffect(() => {
    if (!previewItem) return;
    const currentData = previewSide === 'front'
      ? { name: previewItem.frontName, designation: previewItem.frontDesignation, project: previewItem.frontProject }
      : { name: previewItem.backName, designation: previewItem.backDesignation, project: previewItem.backProject };

    renderCanvasWithDetails(canvasRef.current, currentData, {
      bgColor: bgColorChoice,
      textColor: textColorChoice,
      fontSize: fontSizeChoice,
      bold: isBold
    });
  }, [previewItem, previewSide, fontSizeChoice, isBold, textCaseChoice, textColorChoice, bgColorChoice, showLogo, logoImageObj, showQr, qrMode, qrImageObj, qrCanvasElement]);

  // Payload Converter: 96,000 bytes per screen (2-bit raw encoding)
  const renderSingleScreenBytes = (sideItem) => {
    const WIDTH = 800;
    const HEIGHT = 480;
    const TOTAL_PIXELS = WIDTH * HEIGHT;
    const PHOTO = { x: 35, y: 30, w: 140, h: 175 };

    const getColorCode = (hex) => {
      const normalized = (hex || '').trim().toUpperCase();
      if (normalized === '#D32F2F') return 3; // Red
      if (normalized === '#FBC02D') return 2; // Yellow
      if (normalized === '#FFFFFF') return 1; // White
      return 0; // Black
    };

    const bgCode = getColorCode(bgColorChoice);
    const textCode = getColorCode(textColorChoice);

    const offscreen = document.createElement('canvas');
    offscreen.width = WIDTH;
    offscreen.height = HEIGHT;

    renderCanvasWithDetails(offscreen, sideItem, {
      bgColor: bgColorChoice,
      textColor: textColorChoice,
      fontSize: fontSizeChoice,
      bold: isBold
    });

    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;

    const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const src = imgData.data;
    const colorCodes = new Uint8Array(TOTAL_PIXELS);

    const isPhotoPixel = (x, y) =>
      Boolean(showLogo && logoImageObj) &&
      x >= PHOTO.x &&
      x < PHOTO.x + PHOTO.w &&
      y >= PHOTO.y &&
      y < PHOTO.y + PHOTO.h;

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const pixelIndex = y * WIDTH + x;
        const i = pixelIndex * 4;
        const r = src[i];
        const g = src[i + 1];
        const b = src[i + 2];
        const alpha = src[i + 3];

        if (isPhotoPixel(x, y)) {
          if (x === PHOTO.x || x === PHOTO.x + PHOTO.w - 1 || y === PHOTO.y || y === PHOTO.y + PHOTO.h - 1) {
            colorCodes[pixelIndex] = (bgCode === 0) ? 1 : 0;
            continue;
          }
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 160) {
            colorCodes[pixelIndex] = 1;
            continue;
          }
          if (r > 140 && g < 75 && b < 75) {
            colorCodes[pixelIndex] = 3;
          } else if (r > 150 && g > 140 && b < 85) {
            colorCodes[pixelIndex] = 2;
          } else {
            colorCodes[pixelIndex] = lum < 112 ? 0 : 1;
          }
          continue;
        }

        if (alpha < 100) {
          colorCodes[pixelIndex] = bgCode;
          continue;
        }

        const isPureBlack = (r < 60 && g < 60 && b < 60);
        if (showQr && (x >= 800 - 160) && (y <= 160)) {
          colorCodes[pixelIndex] = isPureBlack ? 0 : 1;
          continue;
        }

        const isRed = (r > 130 && g < 80 && b < 80);
        const isYellow = (r > 140 && g > 130 && b < 85);

        if (textCode === 3 && isRed) {
          colorCodes[pixelIndex] = 3;
        } else if (textCode === 2 && isYellow) {
          colorCodes[pixelIndex] = 2;
        } else {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (bgCode === 0) {
            colorCodes[pixelIndex] = (lum > 75 || isRed || isYellow) ? textCode : 0;
          } else if (bgCode === 1) {
            colorCodes[pixelIndex] = (lum < 175) ? textCode : 1;
          } else if (bgCode === 3) {
            colorCodes[pixelIndex] = (lum > 130) ? textCode : 3;
          } else {
            colorCodes[pixelIndex] = (lum < 140) ? textCode : 2;
          }
        }
      }
    }

    const output = new Uint8Array(96000);
    let byteIndex = 0;
    for (let i = 0; i < TOTAL_PIXELS; i += 4) {
      output[byteIndex++] =
        (colorCodes[i] << 6) |
        (colorCodes[i + 1] << 4) |
        (colorCodes[i + 2] << 2) |
        colorCodes[i + 3];
    }
    return output;
  };

  const generateDualDdsPayload = (plate) => {
    const frontBytes = renderSingleScreenBytes({
      name: plate.frontName,
      designation: plate.frontDesignation,
      project: plate.frontProject
    });

    const backBytes = renderSingleScreenBytes({
      name: plate.backName,
      designation: plate.backDesignation,
      project: plate.backProject
    });

    const totalDdsPayload = new Uint8Array(192000);
    totalDdsPayload.set(frontBytes, 0);
    totalDdsPayload.set(backBytes, 96000);
    return totalDdsPayload;
  };

  // 1-Time Auto-Rehydrate: Paired devices ko page load hote hi bina popup load karna
  const rehydratePairedDevices = useCallback(async () => {
    if (!navigator.bluetooth?.getDevices) return;

    try {
      const authorizedDevices = await navigator.bluetooth.getDevices();
      const updatedMap = { ...deviceMapRef.current };

      authorizedDevices.forEach((dev) => {
        const cleanNameStr = cleanMac(dev.name);

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ble_mac_binding_')) {
            const storedMac = key.replace('ble_mac_binding_', '');
            const savedChromeId = localStorage.getItem(key);

            if (dev.id === savedChromeId || (cleanNameStr && cleanNameStr.includes(storedMac))) {
              updatedMap[storedMac] = dev;
              updatedMap[dev.id] = dev;
            }
          }
        }
      });

      setDeviceMap(updatedMap);

      setPlates((prev) =>
        prev.map((plate) => {
          const target = cleanMac(plate.mac);
          if (updatedMap[target]) {
            return { ...plate, status: plate.status === 'Updated' ? 'Updated' : 'Paired' };
          }
          return plate;
        })
      );
    } catch (err) {
      console.warn('Rehydrate BLE cache notice:', err);
    }
  }, []);

  useEffect(() => {
    rehydratePairedDevices();
  }, [rehydratePairedDevices]);

  // Strict 1-to-1 Device Resolver (NO BLIND INDEXING)
  const resolveExactDeviceForMac = async (targetMac, allowInteractivePrompt = false) => {
    const normalizedTarget = cleanMac(targetMac);
    if (!normalizedTarget) {
      throw new Error('Is row me koi MAC address specify nahi hai.');
    }

    let matched = null;

    // 1. In-memory check
    if (deviceMapRef.current[normalizedTarget]) {
      matched = deviceMapRef.current[normalizedTarget];
    }

    // 2. Browser authorized devices pool check (Silent Zero-Popup)
    if (!matched && navigator.bluetooth?.getDevices) {
      try {
        const authorizedDevices = await navigator.bluetooth.getDevices();
        const savedChromeId = localStorage.getItem(`ble_mac_binding_${normalizedTarget}`);

        for (const dev of authorizedDevices) {
          const devCleanName = cleanMac(dev.name);
          if ((savedChromeId && dev.id === savedChromeId) || (devCleanName && devCleanName.includes(normalizedTarget))) {
            matched = dev;
            deviceMapRef.current[normalizedTarget] = dev;
            deviceMapRef.current[dev.id] = dev;
            break;
          }
        }
      } catch (e) {}
    }

    // 3. Agar device paired nahi mila aur explicit user gesture allow hai
    if (!matched && allowInteractivePrompt) {
      const selectedDev = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'DDS' },
          { namePrefix: 'ESL' }
        ],
        optionalServices: [SERVICE_UUID]
      });

      const selCleanName = cleanMac(selectedDev.name);
      if (selCleanName && !selCleanName.includes(normalizedTarget)) {
        const userConfirm = window.confirm(
          `Dhyan dein!\nSelected Hardware: "${selectedDev.name}"\nTarget MAC: "${targetMac}"\n\nKya aap pakka is physical tag ko is row ke MAC ke sath permanently link karna chahte hain?`
        );
        if (!userConfirm) {
          throw new Error(`Device mismatch: Target MAC ${targetMac} se match nahi hua.`);
        }
      }

      matched = selectedDev;
      localStorage.setItem(`ble_mac_binding_${normalizedTarget}`, selectedDev.id);
      deviceMapRef.current[normalizedTarget] = selectedDev;
      deviceMapRef.current[selectedDev.id] = selectedDev;
      setDeviceMap({ ...deviceMapRef.current });
    }

    return matched;
  };

  // Transmission Engine (Silent Paired Run vs Interactive Run)
  const updateSingleDevice = async (plate, index, allowInteractive = true) => {
    setActiveIdx(index);
    setPreviewItem(plate);
    const targetMac = cleanMac(plate.mac);

    setGlobalStatus(`Updating [${index + 1}/${platesRef.current.length}]: "${plate.frontName}" | MAC: ${plate.mac}...`);

    setPlates((prev) =>
      prev.map((p, i) => (i === index ? { ...p, status: 'Connecting...' } : p))
    );

    let device = null;
    let server = null;

    try {
      device = await resolveExactDeviceForMac(targetMac, allowInteractive);

      if (!device) {
        throw new Error('Device paired nahi hai.');
      }

      if (device.gatt?.connected) {
        try {
          await device.gatt.disconnect();
          await new Promise((r) => setTimeout(r, 400));
        } catch (e) {}
      }

      try {
        server = await device.gatt.connect();
      } catch (connErr) {
        await new Promise((r) => setTimeout(r, 800));
        server = await device.gatt.connect();
      }

      if (!server || !server.connected) {
        throw new Error('BLE radio out of range ya asleep hai.');
      }

      const service = await server.getPrimaryService(SERVICE_UUID);
      const char = await service.getCharacteristic(CHAR_UUID);

      const payload = generateDualDdsPayload(plate);
      const totalPackets = Math.ceil(payload.length / PACKET_SIZE);

      for (let pkt = 0; pkt < totalPackets; pkt++) {
        const start = pkt * PACKET_SIZE;
        const end = Math.min((pkt + 1) * PACKET_SIZE, payload.length);
        const chunk = payload.slice(start, end);

        await char.writeValueWithoutResponse(chunk);

        if ((pkt + 1) % 40 === 0 || pkt === totalPackets - 1) {
          const pct = Math.round(((pkt + 1) / totalPackets) * 100);
          setPlates((prev) =>
            prev.map((p, i) => (i === index ? { ...p, status: `Sending: ${pct}%` } : p))
          );
        }
        await new Promise((r) => setTimeout(r, 8));
      }

      // Flash memory buffer write delay
      await new Promise((r) => setTimeout(r, 1200));

      if (device.gatt?.connected) {
        await device.gatt.disconnect();
      }

      // Radio cleanup delay before next target
      await new Promise((r) => setTimeout(r, 800));

      setPlates((prev) =>
        prev.map((p, i) => (i === index ? { ...p, status: 'Updated' } : p))
      );
      return { success: true };

    } catch (err) {
      console.error(`Error on index ${index}:`, err);
      if (device?.gatt?.connected) {
        try { await device.gatt.disconnect(); } catch (e) {}
      }

      const isUnpaired = err.message.includes('paired nahi hai');
      setPlates((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, status: isUnpaired ? 'Needs Pairing' : `Failed: ${err.message}` } : p
        )
      );
      return { success: false, isUnpaired };
    }
  };

  // Top-to-Bottom Batch Pipeline with Auto-Pause on Unpaired Devices
  const runSequentialQueue = async () => {
    setIsQueueRunning(true);
    let currentIndex = 0;

    while (currentIndex < platesRef.current.length) {
      const currentPlate = platesRef.current[currentIndex];

      if (currentPlate.status === 'Updated') {
        currentIndex++;
        continue;
      }

      const target = cleanMac(currentPlate.mac);
      const isKnown = Boolean(deviceMapRef.current[target] || localStorage.getItem(`ble_mac_binding_${target}`));

      // 1. Paired Device: Zero Popup, fully automatic background stream
      if (isKnown) {
        const res = await updateSingleDevice(currentPlate, currentIndex, false);
        if (res.success) {
          currentIndex++;
          continue;
        }
      }

      // 2. Unpaired / New Tag: Safe Auto-Pause with Spacebar / Pair Modal
      setWaitingForGestureIdx(currentIndex);
      setGlobalStatus(
        `Auto-Paused: New / Unpaired device found at Row #${currentIndex + 1} ("${currentPlate.frontName}"). Target MAC: ${currentPlate.mac}. Press SPACEBAR to pair.`
      );
      return;
    }

    setIsQueueRunning(false);
    setActiveIdx(-1);
    setWaitingForGestureIdx(null);
    setGlobalStatus('All devices in queue updated successfully!');
  };

  const resumeBatchWithGesture = async (index) => {
    setWaitingForGestureIdx(null);
    const res = await updateSingleDevice(platesRef.current[index], index, true);
    if (res.success) {
      runSequentialQueue();
    } else {
      setIsQueueRunning(false);
      setActiveIdx(-1);
    }
  };

  // Spacebar Hook for Auto-Paused Resume
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'Space' && waitingForGestureIdx !== null) {
        e.preventDefault();
        resumeBatchWithGesture(waitingForGestureIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForGestureIdx]);

  // Excel / CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        if (!rawRows || rawRows.length === 0) {
          alert('Excel sheet empty hai!');
          return;
        }

        const findVal = (row, keywords) => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.toLowerCase().replace(/[\s_\-\.]/g, '');
            for (const kw of keywords) {
              const cleanKw = kw.toLowerCase().replace(/[\s_\-\.]/g, '');
              if (cleanKey === cleanKw || cleanKey.includes(cleanKw)) {
                const val = row[key];
                if (val !== undefined && val !== null) {
                  const str = String(val).trim();
                  if (str.length > 0) return str;
                }
              }
            }
          }
          return '';
        };

        const formatted = rawRows.map((row, idx) => {
          const fName = findVal(row, ['frontname', 'employeename', 'empname', 'officername', 'fullname', 'name']);
          const fDesig = findVal(row, ['frontdesignation', 'designation', 'desig', 'post', 'role', 'title', 'position']);
          const fProj = findVal(row, ['frontproject', 'personnelarea', 'project', 'location', 'site', 'station', 'plant', 'area', 'city']);
          const bName = findVal(row, ['backname', 'back_name']) || fName;
          const bDesig = findVal(row, ['backdesignation', 'back_designation']) || fDesig;
          const bProj = findVal(row, ['backproject', 'back_project']) || fProj;
          const devMac = findVal(row, ['mac', 'device', 'deviceid', 'eslid', 'tagid', 'ble', 'hardware']);

          const target = cleanMac(devMac);
          const isPaired = Boolean(deviceMapRef.current[target] || localStorage.getItem(`ble_mac_binding_${target}`));

          return {
            id: Date.now() + idx,
            frontName: fName,
            frontDesignation: fDesig,
            frontProject: fProj,
            backName: bName,
            backDesignation: bDesig,
            backProject: bProj,
            mac: devMac.toUpperCase(),
            status: isPaired ? 'Paired' : 'Pending'
          };
        }).filter((item) => item.frontName.length > 0);

        if (formatted.length === 0) {
          alert('Excel me Name column nahi mila.');
          return;
        }

        setPlates(formatted);
        setPreviewItem(formatted[0]);
        setGlobalStatus(`Loaded ${formatted.length} plates successfully.`);
      } catch (err) {
        alert('File upload error: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Add Single Entry
  const handleAddPlate = () => {
    if (!newFrontName.trim()) return;

    const target = cleanMac(newMac);
    const isPaired = Boolean(deviceMapRef.current[target] || localStorage.getItem(`ble_mac_binding_${target}`));

    const newPlate = {
      id: Date.now(),
      frontName: newFrontName.trim(),
      frontDesignation: newFrontDesignation.trim(),
      frontProject: newFrontProject.trim(),
      backName: syncBothSides ? newFrontName.trim() : (newBackName.trim() || newFrontName.trim()),
      backDesignation: syncBothSides ? newFrontDesignation.trim() : newBackDesignation.trim(),
      backProject: syncBothSides ? newFrontProject.trim() : newBackProject.trim(),
      mac: newMac.trim().toUpperCase(),
      status: isPaired ? 'Paired' : 'Pending'
    };

    setPlates([...plates, newPlate]);
    setPreviewItem(newPlate);

    setNewFrontName('');
    setNewFrontDesignation('');
    setNewFrontProject('');
    setNewBackName('');
    setNewBackDesignation('');
    setNewBackProject('');
    setNewMac('');
  };

  // Standalone Pair Dedicated Handler
  const handlePairNewDevice = async () => {
    try {
      setGlobalStatus('Scanning for new ESL hardware...');
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'DDS' }, { namePrefix: 'ESL' }],
        optionalServices: [SERVICE_UUID]
      });

      const devName = device.name || 'DDS-Tag';
      const cleanNameStr = cleanMac(devName);

      setPlates((prev) => {
        const targetIdx = prev.findIndex((p) => {
          const tMac = cleanMac(p.mac);
          return !tMac || !deviceMapRef.current[tMac];
        });

        if (targetIdx !== -1) {
          const targetMacStr = prev[targetIdx].mac ? cleanMac(prev[targetIdx].mac) : cleanNameStr;

          localStorage.setItem(`ble_mac_binding_${targetMacStr}`, device.id);
          deviceMapRef.current[targetMacStr] = device;
          deviceMapRef.current[device.id] = device;
          setDeviceMap({ ...deviceMapRef.current });

          setGlobalStatus(`Device "${devName}" paired & locked to MAC: ${prev[targetIdx].mac || devName}.`);
          return prev.map((p, i) => (i === targetIdx ? { ...p, status: 'Paired' } : p));
        }
        return prev;
      });
    } catch (err) {
      setGlobalStatus('Pairing cancelled.');
    }
  };

  // Edit Handlers
  const handleEditClick = (plate) => {
    setEditingId(plate.id);
    setEditFormData({
      frontName: plate.frontName,
      frontDesignation: plate.frontDesignation,
      frontProject: plate.frontProject,
      backName: plate.backName,
      backDesignation: plate.backDesignation,
      backProject: plate.backProject,
      mac: plate.mac
    });
    setPreviewItem(plate);
  };

  const handleEditFieldChange = (field, value) => {
    const updatedForm = { ...editFormData, [field]: value };
    setEditFormData(updatedForm);
    setPreviewItem({ ...previewItem, ...updatedForm });
  };

  const handleSaveEdit = (id) => {
    const target = cleanMac(editFormData.mac);
    const isPaired = Boolean(deviceMapRef.current[target] || localStorage.getItem(`ble_mac_binding_${target}`));

    setPlates((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...editFormData, status: isPaired ? 'Paired' : 'Pending' } : p
      )
    );
    setPreviewItem({ ...editFormData, id });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    const original = plates.find((p) => p.id === editingId);
    if (original) setPreviewItem(original);
    setEditingId(null);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '20px auto', fontFamily: 'Segoe UI, Roboto, sans-serif', padding: '16px' }}>
      
      {/* Responsive Header Box */}
      <div className="header-box">
        <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', letterSpacing: '0.5px', fontWeight: 'bold' }}>
          ESL Gateway - Automated Nameplate System
        </h2>
        <small style={{ color: '#ffcdd2', fontSize: '13px', display: 'block' }}>
          Hardware: ESL 7.50 DDS (Dual-Sided 192KB Pipeline)
        </small>
        <span className="header-badge">MERN & BLE</span>
      </div>

      {/* Status Bar */}
      <div style={{
        background: globalStatus.includes('Failed') ? '#ffebee' : '#e8f5e9',
        border: `1px solid ${globalStatus.includes('Failed') ? '#ef9a9a' : '#c8e6c9'}`,
        color: globalStatus.includes('Failed') ? '#c62828' : '#2e7d32',
        padding: '12px 16px',
        borderRadius: '6px',
        fontWeight: 'bold',
        marginBottom: '16px'
      }}>
        Status: {globalStatus}
      </div>

      {/* Auto-Pause Spacebar / Pair Modal Banner */}
      {waitingForGestureIdx !== null && (
        <div style={{
          background: '#e3f2fd',
          border: '2px solid #1976d2',
          padding: '14px 20px',
          borderRadius: '8px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)'
        }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d47a1', display: 'block' }}>
              👉 Auto-Paused: Pair Required for "{plates[waitingForGestureIdx].frontName}"
            </span>
            <small style={{ color: '#455a64' }}>
              Row #{waitingForGestureIdx + 1} of {plates.length} | Target MAC: <strong>{plates[waitingForGestureIdx].mac}</strong>
            </small>
          </div>

          <button
            type="button"
            onClick={() => resumeBatchWithGesture(waitingForGestureIdx)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            Pair & Continue (Press SPACEBAR)
          </button>
        </div>
      )}

      {/* 2-Column Responsive Dashboard */}
      <div className="dashboard-container">
        
        {/* Left Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card 1: Text & Style Formatting */}
          <div style={{ background: '#fff', border: '1px solid #dcdcdc', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#b71c1c', borderBottom: '2px solid #ffebee', paddingBottom: '6px' }}>
              🎨 Text & Display Style
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                Letter Case:
              </label>
              <select
                value={textCaseChoice}
                onChange={(e) => setTextCaseChoice(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
              >
                <option value="uppercase">ALL UPPERCASE (RAHUL)</option>
                <option value="propercase">Proper Case (Rahul)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '10px', marginBottom: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Style:</label>
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  style={{
                    width: '100%',
                    padding: '7px',
                    borderRadius: '4px',
                    border: isBold ? '2px solid #b71c1c' : '1px solid #ccc',
                    background: isBold ? '#ffebee' : '#fafafa',
                    color: isBold ? '#b71c1c' : '#333',
                    fontWeight: '900',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  B
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Font Size:</label>
                <select
                  value={fontSizeChoice}
                  onChange={(e) => setFontSizeChoice(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
                >
                  <option value="auto">Auto-Fit (Default)</option>
                  <option value="48">48 px</option>
                  <option value="60">60 px</option>
                  <option value="72">72 px</option>
                  <option value="85">85 px</option>
                  <option value="105">105 px</option>
                  <option value="125">125 px</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Text Color:</label>
              <select
                value={textColorChoice}
                onChange={(e) => setTextColorChoice(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
              >
                <option value="#000000">Black</option>
                <option value="#FFFFFF">White</option>
                <option value="#D32F2F">Red</option>
                <option value="#FBC02D">Yellow</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Background Color:</label>
              <select
                value={bgColorChoice}
                onChange={(e) => setBgColorChoice(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
              >
                <option value="#FFFFFF">White (Standard)</option>
                <option value="#000000">Black (Inverted)</option>
                <option value="#D32F2F">Red Background</option>
                <option value="#FBC02D">Yellow Background</option>
              </select>
            </div>
          </div>

          {/* Card 2: Photo & Logo */}
          <div style={{ background: '#f9fbe7', border: '1px solid #c0ca33', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📷 Photo / Logo (140x175)
            </h3>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
              />
              Enable Photo on Screen
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              disabled={!showLogo}
              onChange={handleLogoUpload}
              style={{
                width: '100%',
                fontSize: '12px',
                cursor: showLogo ? 'pointer' : 'not-allowed',
                opacity: showLogo ? 1 : 0.6
              }}
            />
          </div>

          {/* Card 3: QR Code Generator */}
          <div style={{ background: '#f9fbe7', border: '1px solid #c0ca33', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🏁 QR Code (Top-Right)
            </h3>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={showQr}
                onChange={(e) => setShowQr(e.target.checked)}
              />
              Enable QR on Screen
            </label>

            <select
              value={qrMode}
              onChange={(e) => setQrMode(e.target.value)}
              disabled={!showQr}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px' }}
            >
              <option value="upload">Upload QR Image</option>
              <option value="text">Generate from URL / Text</option>
            </select>

            {qrMode === 'upload' ? (
              <input
                type="file"
                accept="image/png, image/jpeg"
                disabled={!showQr}
                onChange={handleQrUpload}
                style={{
                  width: '100%',
                  fontSize: '12px',
                  cursor: showQr ? 'pointer' : 'not-allowed',
                  opacity: showQr ? 1 : 0.6
                }}
              />
            ) : (
              <input
                type="text"
                placeholder="Enter URL or Text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                disabled={!showQr}
                style={{
                  width: '93%',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                  background: showQr ? '#fff' : '#f0f0f0'
                }}
              />
            )}
          </div>

        </div>

        {/* Right Main Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Inputs: Excel Upload & Single Entry */}
          <div className="input-grid-container">
            <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#222' }}>1. Upload Excel / CSV</h3>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
                Auto-Detects: Name, Designation, Project, Physical MAC
              </p>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </div>

            <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#222' }}>2. Add Single Entry</h3>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={syncBothSides}
                    onChange={(e) => setSyncBothSides(e.target.checked)}
                  />
                  Same Front & Back
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  placeholder="Front Name (e.g. Priya)"
                  value={newFrontName}
                  onChange={(e) => setNewFrontName(e.target.value)}
                  style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                />
                <input
                  placeholder="Front Designation"
                  value={newFrontDesignation}
                  onChange={(e) => setNewFrontDesignation(e.target.value)}
                  style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                />
              </div>

              {!syncBothSides && (
                <div style={{ border: '1px dashed #b71c1c', background: '#fff5f5', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                  <small style={{ color: '#b71c1c', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Back Side Custom Details:</small>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      placeholder="Back Name"
                      value={newBackName}
                      onChange={(e) => setNewBackName(e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                    />
                    <input
                      placeholder="Back Designation"
                      value={newBackDesignation}
                      onChange={(e) => setNewBackDesignation(e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <input
                  placeholder="Project / Location"
                  value={newFrontProject}
                  onChange={(e) => setNewFrontProject(e.target.value)}
                  style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                />
                <input
                  placeholder="Physical MAC (E4:52:...)"
                  value={newMac}
                  onChange={(e) => setNewMac(e.target.value)}
                  style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                />
              </div>

              <button
                type="button"
                onClick={handleAddPlate}
                style={{ width: '100%', background: '#b71c1c', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Add to Queue
              </button>
            </div>
          </div>

          {/* Live Canvas Preview */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fff', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setPreviewSide('front')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  background: previewSide === 'front' ? '#b71c1c' : '#eee',
                  color: previewSide === 'front' ? '#fff' : '#444'
                }}
              >
                Preview Front Side
              </button>
              <button
                type="button"
                onClick={() => setPreviewSide('back')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  background: previewSide === 'back' ? '#b71c1c' : '#eee',
                  color: previewSide === 'back' ? '#fff' : '#444'
                }}
              >
                Preview Back Side
              </button>
            </div>

            <small style={{ color: '#777', display: 'block', marginBottom: '10px' }}>
              Viewing: <strong>{previewSide.toUpperCase()}</strong> | Name: <strong>{formatTextCase(previewSide === 'front' ? previewItem?.frontName : previewItem?.backName)}</strong> | Target MAC: <strong>{previewItem?.mac || 'Unassigned'}</strong>
            </small>

            <div style={{ display: 'inline-block', border: '2px solid #444', borderRadius: '4px', background: '#fff', maxWidth: '640px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>

          {/* Deployment Queue Table */}
          <div className="table-responsive-box">
            <div style={{ padding: '14px 18px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Deployment Queue ({plates.length} Plates)</span>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handlePairNewDevice}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                  }}
                >
                  + Pair New Plate
                </button>

                <button
                  type="button"
                  onClick={runSequentialQueue}
                  disabled={isQueueRunning || plates.length === 0}
                  style={{
                    background: isQueueRunning ? '#aaa' : '#2e7d32',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 22px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: isQueueRunning ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isQueueRunning ? 'Running Batch Update...' : 'Start Batch Update (All Line-by-Line)'}
                </button>
              </div>
            </div>

            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '2px solid #eee', fontSize: '13px', color: '#666' }}>
                  <th style={{ padding: '12px' }}>#</th>
                  <th style={{ padding: '12px' }}>Front Display</th>
                  <th style={{ padding: '12px' }}>Back Display</th>
                  <th style={{ padding: '12px' }}>Project</th>
                  <th style={{ padding: '12px' }}>Physical MAC Address</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {plates.map((plate, idx) => {
                  const isEditing = editingId === plate.id;
                  return (
                    <tr
                      key={plate.id}
                      onClick={() => !isEditing && setPreviewItem(plate)}
                      style={{
                        borderBottom: '1px solid #eee',
                        background: activeIdx === idx ? '#fffde7' : previewItem?.id === plate.id ? '#f5f5f5' : '#fff',
                        cursor: isEditing ? 'default' : 'pointer'
                      }}
                    >
                      <td style={{ padding: '12px', fontSize: '14px' }}>{idx + 1}</td>

                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div>
                            <input
                              value={editFormData.frontName}
                              onChange={(e) => handleEditFieldChange('frontName', e.target.value)}
                              style={{ padding: '4px', width: '90%', fontSize: '13px', marginBottom: '4px', border: '1px solid #b71c1c', borderRadius: '4px' }}
                            />
                            <input
                              value={editFormData.frontDesignation}
                              onChange={(e) => handleEditFieldChange('frontDesignation', e.target.value)}
                              style={{ padding: '4px', width: '90%', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontWeight: isBold ? 'bold' : 'normal', fontSize: '14px' }}>{formatTextCase(plate.frontName)}</span>
                            <small style={{ display: 'block', color: '#666' }}>{formatTextCase(plate.frontDesignation) || '-'}</small>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div>
                            <input
                              value={editFormData.backName}
                              onChange={(e) => handleEditFieldChange('backName', e.target.value)}
                              style={{ padding: '4px', width: '90%', fontSize: '13px', marginBottom: '4px', border: '1px solid #b71c1c', borderRadius: '4px' }}
                            />
                            <input
                              value={editFormData.backDesignation}
                              onChange={(e) => handleEditFieldChange('backDesignation', e.target.value)}
                              style={{ padding: '4px', width: '90%', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontWeight: isBold ? 'bold' : 'normal', fontSize: '14px' }}>{formatTextCase(plate.backName)}</span>
                            <small style={{ display: 'block', color: '#666' }}>{formatTextCase(plate.backDesignation) || '-'}</small>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px', fontSize: '14px', color: '#555' }}>
                        {isEditing ? (
                          <input
                            value={editFormData.frontProject}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = { ...editFormData, frontProject: val, backProject: val };
                              setEditFormData(updated);
                              setPreviewItem({ ...previewItem, ...updated });
                            }}
                            style={{ padding: '5px', width: '90%', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        ) : (
                          formatTextCase(plate.frontProject) || '-'
                        )}
                      </td>

                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        {isEditing ? (
                          <input
                            value={editFormData.mac}
                            onChange={(e) => handleEditFieldChange('mac', e.target.value)}
                            style={{ padding: '5px', width: '90%', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        ) : (
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1565c0' }}>
                            {plate.mac || 'Unassigned'}
                          </span>
                        )}
                      </td>

                      <td style={{
                        padding: '12px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        color: plate.status === 'Updated' ? '#2e7d32' : plate.status.includes('Failed') ? '#c62828' : '#e65100'
                      }}>
                        {plate.status}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(plate.id)}
                              style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              style={{ background: '#757575', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(plate);
                              }}
                              disabled={isQueueRunning}
                              style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSingleDevice(plate, idx, true);
                              }}
                              disabled={isQueueRunning}
                              style={{ background: '#b71c1c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Update
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}