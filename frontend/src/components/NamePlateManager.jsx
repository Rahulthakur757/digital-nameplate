// import React, { useState, useRef, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import QRCode from 'qrcode';

// // Hardware Protocol Constants (ESL 7.50 DDS)
// const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
// const CHAR_UUID = '0000fff5-0000-1000-8000-00805f9b34fb';
// const PACKET_SIZE = 200; // 200 bytes per chunk

// export default function NamePlateManager() {
//   const [plates, setPlates] = useState([
//     {
//       id: 1,
//       frontName: 'Rahul Thakur',
//       frontDesignation: 'Full Stack Developer',
//       frontProject: 'Ghaziabad',
//       backName: 'Rahul Thakur',
//       backDesignation: 'Full Stack Developer',
//       backProject: 'Ghaziabad',
//       mac: 'E4:52:1E:E5:6A:BA',
//       status: 'Pending'
//     }
//   ]);

//   // Live Bluetooth Hardware Mapping (MAC Address -> Active Bluetooth Device Object)
//   const [deviceMap, setDeviceMap] = useState({});

//   // Form States (Front & Back)
//   const [syncBothSides, setSyncBothSides] = useState(true);
//   const [newFrontName, setNewFrontName] = useState('');
//   const [newFrontDesignation, setNewFrontDesignation] = useState('');
//   const [newFrontProject, setNewFrontProject] = useState('');

//   const [newBackName, setNewBackName] = useState('');
//   const [newBackDesignation, setNewBackDesignation] = useState('');
//   const [newBackProject, setNewBackProject] = useState('');
//   const [newMac, setNewMac] = useState('');

//   // Office / Excel style Formatting States
//   const [fontSizeChoice, setFontSizeChoice] = useState('auto');
//   const [isBold, setIsBold] = useState(true);
//   const [textColorChoice, setTextColorChoice] = useState('#000000');
//   const [bgColorChoice, setBgColorChoice] = useState('#FFFFFF');

//   // Graphics States: Photo & QR
//   const [showLogo, setShowLogo] = useState(false);
//   const [logoImageObj, setLogoImageObj] = useState(null);

//   const [showQr, setShowQr] = useState(false);
//   const [qrMode, setQrMode] = useState('upload'); // 'upload' or 'text'
//   const [qrImageObj, setQrImageObj] = useState(null);
//   const [qrText, setQrText] = useState('https://company.com');
//   const [qrCanvasElement, setQrCanvasElement] = useState(null);

//   // Edit Row States
//   const [editingId, setEditingId] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     frontName: '',
//     frontDesignation: '',
//     frontProject: '',
//     backName: '',
//     backDesignation: '',
//     backProject: '',
//     mac: ''
//   });

//   // Preview States
//   const [previewSide, setPreviewSide] = useState('front');
//   const [previewItem, setPreviewItem] = useState(plates[0]);

//   // Queue & Transmission States
//   const [isQueueRunning, setIsQueueRunning] = useState(false);
//   const [activeIdx, setActiveIdx] = useState(-1);
//   const [globalStatus, setGlobalStatus] = useState('Ready for deployment');
//   const [waitingForGestureIdx, setWaitingForGestureIdx] = useState(null);

//   const canvasRef = useRef(null);

//   // QR Canvas Generator for Text/URL Mode
//   useEffect(() => {
//     if (!showQr || qrMode !== 'text' || !qrText.trim()) {
//       setQrCanvasElement(null);
//       return;
//     }
//     const offCanvas = document.createElement('canvas');
//     QRCode.toCanvas(
//       offCanvas,
//       qrText.trim(),
//       {
//         width: 120,
//         margin: 1,
//         color: {
//           dark: textColorChoice === '#FFFFFF' ? '#FFFFFF' : '#000000',
//           light: bgColorChoice === '#000000' ? '#000000' : '#FFFFFF'
//         }
//       },
//       (err) => {
//         if (!err) setQrCanvasElement(offCanvas);
//       }
//     );
//   }, [showQr, qrMode, qrText, textColorChoice, bgColorChoice]);

//   // Photo & QR File Upload Handlers
//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const img = new Image();
//       img.onload = () => {
//         setLogoImageObj(img);
//         setShowLogo(true);
//       };
//       img.src = evt.target.result;
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleQrUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const img = new Image();
//       img.onload = () => {
//         setQrImageObj(img);
//         setShowQr(true);
//       };
//       img.src = evt.target.result;
//     };
//     reader.readAsDataURL(file);
//   };

//   // 1. High Resolution Canvas Renderer
//   const renderCanvasWithDetails = (canvas, item, options = {}) => {
//     if (!canvas) return;
//     canvas.width = 800;
//     canvas.height = 480;
//     const ctx = canvas.getContext('2d');

//     const bg = options.bgColor || bgColorChoice;
//     const txtColor = options.textColor || textColorChoice;
//     const customSize = options.fontSize || fontSizeChoice;
//     const boldWeight = options.bold !== undefined ? (options.bold ? 'bold' : 'normal') : (isBold ? 'bold' : 'normal');

//     // Solid Background Fill
//     ctx.fillStyle = bg;
//     ctx.fillRect(0, 0, 800, 480);

//     // Large Photo (140x175 Portrait Size)
//     const photoWidth = 140;
//     const photoHeight = 175;
//     const photoX = 35;
//     const photoY = 30;

//     if (showLogo && logoImageObj) {
//       try {
//         ctx.save();
//         ctx.strokeStyle = txtColor;
//         ctx.lineWidth = 3;
//         ctx.strokeRect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4);
//         ctx.drawImage(logoImageObj, photoX, photoY, photoWidth, photoHeight);
//         ctx.restore();
//       } catch (err) {
//         console.warn('Photo draw error:', err);
//       }
//     }

//     // QR Code (Top-Right: 120x120)
//     const qrSize = 120;
//     const qrX = 800 - qrSize - 35;
//     const qrY = 30;

//     if (showQr) {
//       try {
//         if (qrMode === 'upload' && qrImageObj) {
//           ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
//         } else if (qrMode === 'text' && qrCanvasElement) {
//           ctx.drawImage(qrCanvasElement, qrX, qrY, qrSize, qrSize);
//         }
//       } catch (err) {
//         console.warn('QR draw error:', err);
//       }
//     }

//     const cleanName = (item?.name || '').trim();
//     const cleanDesig = (item?.designation || '').trim();
//     const cleanProj = (item?.project || '').trim();

//     if (!cleanName) return;

//     let subParts = [];
//     if (cleanDesig) subParts.push(cleanDesig);
//     if (cleanProj) subParts.push(cleanProj);
//     const subText = subParts.join('  |  ');

//     const hasLeftGraphic = showLogo && logoImageObj;
//     const hasRightGraphic = showQr && (qrImageObj || qrCanvasElement);

//     let textCenterX = 400;
//     let MAX_WIDTH = 750;

//     if (hasLeftGraphic && hasRightGraphic) {
//       MAX_WIDTH = 460;
//     } else if (hasLeftGraphic) {
//       MAX_WIDTH = 550;
//       textCenterX = 480;
//     } else if (hasRightGraphic) {
//       MAX_WIDTH = 550;
//       textCenterX = 320;
//     }

//     // Name Word Wrap Logic
//     const words = cleanName.split(/\s+/);
//     let nameLines = [];

//     if (words.length > 1 && (cleanName.length > 12 || words.some((w) => w.length > 8))) {
//       if (words.length === 2) {
//         nameLines = [words[0], words[1]];
//       } else if (words.length === 3) {
//         nameLines = [`${words[0]} ${words[1]}`, words[2]];
//       } else {
//         const mid = Math.ceil(words.length / 2);
//         nameLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
//       }
//     } else {
//       nameLines = [cleanName];
//     }

//     let nameFontSize;
//     let subFontSize;

//     if (customSize !== 'auto') {
//       const baseSize = parseInt(customSize, 10);
//       nameFontSize = nameLines.length > 1 ? Math.round(baseSize * 0.8) : baseSize;
//       subFontSize = Math.max(24, Math.min(52, Math.round(baseSize * 0.45)));
//     } else {
//       nameFontSize = nameLines.length > 1 ? 76 : 105;
//       if (subText) nameFontSize = nameLines.length > 1 ? 68 : 95;
//       subFontSize = 38;
//     }

//     const MIN_FONT_SIZE = 24;
//     ctx.font = `${boldWeight} ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
//     const getLongestLineWidth = () => Math.max(...nameLines.map((line) => ctx.measureText(line).width));

//     while (getLongestLineWidth() > MAX_WIDTH && nameFontSize > MIN_FONT_SIZE) {
//       nameFontSize -= 2;
//       ctx.font = `${boldWeight} ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
//     }

//     ctx.fillStyle = txtColor;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';

//     if (!subText) {
//       if (nameLines.length === 1) {
//         ctx.fillText(nameLines[0], textCenterX, 240);
//       } else {
//         const lineHeight = nameFontSize * 1.18;
//         const startY = 240 - lineHeight / 2;
//         ctx.fillText(nameLines[0], textCenterX, startY);
//         ctx.fillText(nameLines[1], textCenterX, startY + lineHeight);
//       }
//     } else {
//       let nameCenterY = nameLines.length === 1 ? 210 : 180;
//       if (nameLines.length === 1) {
//         ctx.fillText(nameLines[0], textCenterX, nameCenterY);
//       } else {
//         const lineHeight = nameFontSize * 1.15;
//         const startY = nameCenterY - lineHeight / 2;
//         ctx.fillText(nameLines[0], textCenterX, startY);
//         ctx.fillText(nameLines[1], textCenterX, startY + lineHeight);
//       }

//       // Separator Line
//       ctx.strokeStyle = txtColor;
//       ctx.lineWidth = 3;
//       ctx.beginPath();
//       const lineStart = Math.max(40, textCenterX - MAX_WIDTH / 2.2);
//       const lineEnd = Math.min(760, textCenterX + MAX_WIDTH / 2.2);
//       ctx.moveTo(lineStart, 305);
//       ctx.lineTo(lineEnd, 305);
//       ctx.stroke();

//       // Designation & Project Subtitle
//       ctx.font = `${boldWeight} ${subFontSize}px Arial, "Segoe UI", sans-serif`;
//       while (ctx.measureText(subText).width > MAX_WIDTH && subFontSize > 20) {
//         subFontSize -= 2;
//         ctx.font = `${boldWeight} ${subFontSize}px Arial, "Segoe UI", sans-serif`;
//       }
//       ctx.fillText(subText, textCenterX, 375);
//     }
//   };

//   // Preview Re-render Trigger
//   useEffect(() => {
//     if (!previewItem) return;
//     const currentData = previewSide === 'front'
//       ? { name: previewItem.frontName, designation: previewItem.frontDesignation, project: previewItem.frontProject }
//       : { name: previewItem.backName, designation: previewItem.backDesignation, project: previewItem.backProject };

//     renderCanvasWithDetails(canvasRef.current, currentData, {
//       bgColor: bgColorChoice,
//       textColor: textColorChoice,
//       fontSize: fontSizeChoice,
//       bold: isBold
//     });
//   }, [previewItem, previewSide, fontSizeChoice, isBold, textColorChoice, bgColorChoice, showLogo, logoImageObj, showQr, qrMode, qrImageObj, qrCanvasElement]);

//   // 2. 100% Zero-Noise Direct Color Snapping Engine (Zero Dots on Any Color/Photo)
//   const renderSingleScreenBytes = (sideItem) => {
//     const WIDTH = 800;
//     const HEIGHT = 480;
//     const TOTAL_PIXELS = WIDTH * HEIGHT;
//     const PHOTO = { x: 35, y: 30, w: 140, h: 175 };

//     const getColorCode = (hex) => {
//       const normalized = (hex || '').trim().toUpperCase();
//       if (normalized === '#D32F2F') return 3; // Red
//       if (normalized === '#FBC02D') return 2; // Yellow
//       if (normalized === '#FFFFFF') return 1; // White
//       return 0; // Black
//     };

//     const bgCode = getColorCode(bgColorChoice);
//     const textCode = getColorCode(textColorChoice);

//     const offscreen = document.createElement('canvas');
//     offscreen.width = WIDTH;
//     offscreen.height = HEIGHT;

//     renderCanvasWithDetails(offscreen, sideItem, {
//       bgColor: bgColorChoice,
//       textColor: textColorChoice,
//       fontSize: fontSizeChoice,
//       bold: isBold
//     });

//     const ctx = offscreen.getContext('2d', { willReadFrequently: true });
//     ctx.imageSmoothingEnabled = false;

//     const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
//     const src = imgData.data;
//     const colorCodes = new Uint8Array(TOTAL_PIXELS);

//     const isPhotoPixel = (x, y) =>
//       Boolean(showLogo && logoImageObj) &&
//       x >= PHOTO.x &&
//       x < PHOTO.x + PHOTO.w &&
//       y >= PHOTO.y &&
//       y < PHOTO.y + PHOTO.h;

//     for (let y = 0; y < HEIGHT; y++) {
//       for (let x = 0; x < WIDTH; x++) {
//         const pixelIndex = y * WIDTH + x;
//         const i = pixelIndex * 4;
//         const r = src[i];
//         const g = src[i + 1];
//         const b = src[i + 2];
//         const alpha = src[i + 3];

//         // 1. Photo Area Processing
//         if (isPhotoPixel(x, y)) {
//           // Border Line Frame
//           if (x === PHOTO.x || x === PHOTO.x + PHOTO.w - 1 || y === PHOTO.y || y === PHOTO.y + PHOTO.h - 1) {
//             colorCodes[pixelIndex] = (bgCode === 0) ? 1 : 0;
//             continue;
//           }

//           const lum = 0.299 * r + 0.587 * g + 0.114 * b;
//           // Grey Background Removal (Solid White, No Dots)
//           if (lum > 160) {
//             colorCodes[pixelIndex] = 1;
//             continue;
//           }

//           // Suit/Face/Tie Detailing
//           if (r > 140 && g < 75 && b < 75) {
//             colorCodes[pixelIndex] = 3; // Red
//           } else if (r > 150 && g > 140 && b < 85) {
//             colorCodes[pixelIndex] = 2; // Yellow
//           } else {
//             colorCodes[pixelIndex] = lum < 112 ? 0 : 1; // Solid Black or White
//           }
//           continue;
//         }

//         // 2. Text, Background & QR Area Processing
//         if (alpha < 100) {
//           colorCodes[pixelIndex] = bgCode;
//           continue;
//         }

//         const isPureBlack = (r < 60 && g < 60 && b < 60);
//         if (showQr && (x >= 800 - 160) && (y <= 160)) {
//           colorCodes[pixelIndex] = isPureBlack ? 0 : 1;
//           continue;
//         }

//         const isRed = (r > 130 && g < 80 && b < 80);
//         const isYellow = (r > 140 && g > 130 && b < 85);

//         if (textCode === 3 && isRed) {
//           colorCodes[pixelIndex] = 3;
//         } else if (textCode === 2 && isYellow) {
//           colorCodes[pixelIndex] = 2;
//         } else {
//           const lum = 0.299 * r + 0.587 * g + 0.114 * b;
//           if (bgCode === 0) {
//             colorCodes[pixelIndex] = (lum > 75 || isRed || isYellow) ? textCode : 0;
//           } else if (bgCode === 1) {
//             colorCodes[pixelIndex] = (lum < 175) ? textCode : 1;
//           } else if (bgCode === 3) {
//             colorCodes[pixelIndex] = (lum > 130) ? textCode : 3;
//           } else {
//             colorCodes[pixelIndex] = (lum < 140) ? textCode : 2;
//           }
//         }
//       }
//     }

//     // 2-bit packing (MSB-first) -> exactly 96,000 bytes
//     const output = new Uint8Array(96000);
//     let byteIndex = 0;
//     for (let i = 0; i < TOTAL_PIXELS; i += 4) {
//       output[byteIndex++] =
//         (colorCodes[i] << 6) |
//         (colorCodes[i + 1] << 4) |
//         (colorCodes[i + 2] << 2) |
//         colorCodes[i + 3];
//     }
//     return output;
//   };

//   // Dual-Sided DDS Payload: Front (96KB) + Back (96KB) = 192,000 bytes
//   const generateDualDdsPayload = (plate) => {
//     const frontBytes = renderSingleScreenBytes({
//       name: plate.frontName,
//       designation: plate.frontDesignation,
//       project: plate.frontProject
//     });

//     const backBytes = renderSingleScreenBytes({
//       name: plate.backName,
//       designation: plate.backDesignation,
//       project: plate.backProject
//     });

//     const totalDdsPayload = new Uint8Array(192000);
//     totalDdsPayload.set(frontBytes, 0);
//     totalDdsPayload.set(backBytes, 96000);
//     return totalDdsPayload;
//   };

//   // 3. Universal Smart Excel Parser (Auto-Detects Any Header Variant)
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       try {
//         const bstr = evt.target.result;
//         const wb = XLSX.read(bstr, { type: 'binary' });
//         const wsName = wb.SheetNames[0];
//         const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

//         if (!rawRows || rawRows.length === 0) {
//           alert('Excel sheet is empty!');
//           return;
//         }

//         const findVal = (row, keywords) => {
//           for (const key of Object.keys(row)) {
//             const cleanKey = key.toLowerCase().replace(/[\s_\-\.]/g, '');
//             for (const kw of keywords) {
//               const cleanKw = kw.toLowerCase().replace(/[\s_\-\.]/g, '');
//               if (cleanKey === cleanKw || cleanKey.includes(cleanKw)) {
//                 const val = row[key];
//                 if (val !== undefined && val !== null) {
//                   const str = String(val).trim();
//                   if (str.length > 0) return str;
//                 }
//               }
//             }
//           }
//           return '';
//         };

//         const formatted = rawRows.map((row, idx) => {
//           const fName = findVal(row, ['frontname', 'employeename', 'empname', 'officername', 'fullname', 'name']);
//           const fDesig = findVal(row, ['frontdesignation', 'designation', 'desig', 'post', 'role', 'title', 'position']);
//           const fProj = findVal(row, ['frontproject', 'personnelarea', 'project', 'location', 'site', 'station', 'plant', 'area', 'city']);

//           const bName = findVal(row, ['backname', 'back_name']) || fName;
//           const bDesig = findVal(row, ['backdesignation', 'back_designation']) || fDesig;
//           const bProj = findVal(row, ['backproject', 'back_project']) || fProj;

//           const devMac = findVal(row, ['mac', 'device', 'deviceid', 'eslid', 'tagid', 'ble', 'hardware']);

//           return {
//             id: Date.now() + idx,
//             frontName: fName,
//             frontDesignation: fDesig,
//             frontProject: fProj,
//             backName: bName,
//             backDesignation: bDesig,
//             backProject: bProj,
//             mac: devMac.toUpperCase(),
//             status: 'Pending'
//           };
//         }).filter((item) => item.frontName.length > 0);

//         if (formatted.length === 0) {
//           alert('Could not detect Employee Name column in Excel file.');
//           return;
//         }

//         setPlates(formatted);
//         setPreviewItem(formatted[0]);
//         setGlobalStatus(`Loaded ${formatted.length} plates successfully with MAC matching enabled.`);
//       } catch (err) {
//         alert('File read error: ' + err.message);
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

//   // 4. Add Single Entry Handler
//   const handleAddPlate = () => {
//     if (!newFrontName.trim()) return;

//     const newPlate = {
//       id: Date.now(),
//       frontName: newFrontName.trim(),
//       frontDesignation: newFrontDesignation.trim(),
//       frontProject: newFrontProject.trim(),
//       backName: syncBothSides ? newFrontName.trim() : (newBackName.trim() || newFrontName.trim()),
//       backDesignation: syncBothSides ? newFrontDesignation.trim() : newBackDesignation.trim(),
//       backProject: syncBothSides ? newFrontProject.trim() : newBackProject.trim(),
//       mac: newMac.trim().toUpperCase(),
//       status: 'Pending'
//     };

//     setPlates([...plates, newPlate]);
//     setPreviewItem(newPlate);

//     setNewFrontName('');
//     setNewFrontDesignation('');
//     setNewFrontProject('');
//     setNewBackName('');
//     setNewBackDesignation('');
//     setNewBackProject('');
//     setNewMac('');
//   };

//   // 5. Dedicated Pair Handler: Device ko physical MAC ke sath permanently link karein
//   const handlePairNewDevice = async () => {
//     try {
//       setGlobalStatus('Scanning for ESL devices... Select plate to pair.');
//       const device = await navigator.bluetooth.requestDevice({
//         filters: [
//           { namePrefix: 'DDS' },
//           { namePrefix: 'ESL' }
//         ],
//         optionalServices: [SERVICE_UUID]
//       });

//       const devName = device.name || 'DDS-Device';

//       // Find first row that has no live device mapped
//       setPlates((prev) => {
//         const targetIdx = prev.findIndex((p) => !p.mac || p.mac.trim() === '' || !deviceMap[p.mac]);
//         if (targetIdx !== -1) {
//           const targetMac = prev[targetIdx].mac || devName;

//           // Lock in live device map
//           setDeviceMap((dMap) => ({
//             ...dMap,
//             [targetMac.toUpperCase()]: device,
//             [device.id]: device
//           }));

//           localStorage.setItem(`ble_mac_${targetMac.toUpperCase()}`, device.id);
//           setGlobalStatus(`Device "${devName}" paired & locked to ${targetMac}.`);

//           return prev.map((p, i) => (i === targetIdx ? { ...p, status: 'Paired' } : p));
//         }
//         return prev;
//       });

//     } catch (err) {
//       console.log('Pairing cancelled or error:', err);
//       setGlobalStatus('Pairing cancelled.');
//     }
//   };

//   // 6. Edit Row Handlers
//   const handleEditClick = (plate) => {
//     setEditingId(plate.id);
//     const data = {
//       frontName: plate.frontName,
//       frontDesignation: plate.frontDesignation,
//       frontProject: plate.frontProject,
//       backName: plate.backName,
//       backDesignation: plate.backDesignation,
//       backProject: plate.backProject,
//       mac: plate.mac
//     };
//     setEditFormData(data);
//     setPreviewItem(plate);
//   };

//   const handleEditFieldChange = (field, value) => {
//     const updatedForm = { ...editFormData, [field]: value };
//     setEditFormData(updatedForm);
//     setPreviewItem({ ...previewItem, ...updatedForm });
//   };

//   const handleSaveEdit = (id) => {
//     setPlates((prev) =>
//       prev.map((p) =>
//         p.id === id ? { ...p, ...editFormData, status: 'Pending' } : p
//       )
//     );
//     setPreviewItem({ ...editFormData, id });
//     setEditingId(null);
//   };

//   const handleCancelEdit = () => {
//     const original = plates.find((p) => p.id === editingId);
//     if (original) setPreviewItem(original);
//     setEditingId(null);
//   };

//   // 7. Silent Zero-Popup Batch Engine (Connects Directly via Live MAC Map)
//   const updateSingleDevice = async (plate, index) => {
//     setActiveIdx(index);
//     setPreviewItem(plate);
//     const targetMac = (plate.mac || '').trim().toUpperCase();
//     setGlobalStatus(`Updating [${index + 1}/${plates.length}]: "${plate.frontName}" | MAC: ${targetMac}...`);

//     setPlates((prev) =>
//       prev.map((p, i) => (i === index ? { ...p, status: 'Connecting...' } : p))
//     );

//     let device = null;
//     let server = null;

//     try {
//       // Step A: Live Device Memory Map se fetch karein (Zero Popup)
//       if (deviceMap[targetMac]) {
//         device = deviceMap[targetMac];
//       }

//       // Step B: Browser Session Memory Fallback
//       if (!device && navigator.bluetooth && navigator.bluetooth.getDevices) {
//         try {
//           const knownDevices = await navigator.bluetooth.getDevices();
//           const savedId = localStorage.getItem(`ble_mac_${targetMac}`);

//           if (savedId) {
//             device = knownDevices.find((d) => d.id === savedId);
//           }
//           if (!device && knownDevices[index]) {
//             device = knownDevices[index];
//           }
//         } catch (e) {
//           console.warn('Memory scan failed:', e);
//         }
//       }

//       // Step C: Fallback prompt ONLY if device is not paired at all
//       if (!device) {
//         device = await navigator.bluetooth.requestDevice({
//           filters: [
//             { namePrefix: 'DDS' },
//             { namePrefix: 'ESL' }
//           ],
//           optionalServices: [SERVICE_UUID]
//         });

//         if (targetMac) {
//           setDeviceMap((dMap) => ({ ...dMap, [targetMac]: device }));
//           localStorage.setItem(`ble_mac_${targetMac}`, device.id);
//         }
//       }

//       // Stale Session Disconnect
//       if (device.gatt && device.gatt.connected) {
//         try {
//           await device.gatt.disconnect();
//           await new Promise((r) => setTimeout(r, 400));
//         } catch (e) {
//           console.warn('Stale disconnect ignored');
//         }
//       }

//       // GATT Connection Handshake
//       try {
//         server = await device.gatt.connect();
//       } catch (connErr) {
//         console.warn('Direct connect failed, retrying handshake...', connErr);
//         await new Promise((r) => setTimeout(r, 1000));
//         server = await device.gatt.connect();
//       }

//       if (!server || !server.connected) {
//         throw new Error('Device BLE radio asleep or out of range.');
//       }

//       // Service & Characteristic Discovery
//       const service = await server.getPrimaryService(SERVICE_UUID);
//       const char = await service.getCharacteristic(CHAR_UUID);

//       // Payload Streaming (192,000 bytes)
//       const payload = generateDualDdsPayload(plate);
//       const totalPackets = Math.ceil(payload.length / PACKET_SIZE);

//       for (let pkt = 0; pkt < totalPackets; pkt++) {
//         const start = pkt * PACKET_SIZE;
//         const end = Math.min((pkt + 1) * PACKET_SIZE, payload.length);
//         const chunk = payload.slice(start, end);

//         await char.writeValueWithoutResponse(chunk);

//         if ((pkt + 1) % 40 === 0 || pkt === totalPackets - 1) {
//           const pct = Math.round(((pkt + 1) / totalPackets) * 100);
//           setPlates((prev) =>
//             prev.map((p, i) => (i === index ? { ...p, status: `Sending: ${pct}%` } : p))
//           );
//         }
//         await new Promise((r) => setTimeout(r, 8));
//       }

//       // Flash memory writing buffer
//       await new Promise((r) => setTimeout(r, 1200));

//       if (device.gatt && device.gatt.connected) {
//         await device.gatt.disconnect();
//       }

//       // Adapter cooldown delay before connecting next device
//       await new Promise((r) => setTimeout(r, 800));

//       setPlates((prev) =>
//         prev.map((p, i) => (i === index ? { ...p, status: 'Updated' } : p))
//       );
//       return true;

//     } catch (err) {
//       console.error(`Error on device ${index}:`, err);
//       if (device?.gatt?.connected) {
//         try {
//           await device.gatt.disconnect();
//         } catch (dcErr) {}
//       }
//       setPlates((prev) =>
//         prev.map((p, i) =>
//           i === index ? { ...p, status: `Failed: ${err.message}` } : p
//         )
//       );
//       return false;
//     }
//   };

//   // 8. Queue Execution Handlers
//   const triggerNextBatchItem = async (index) => {
//     setWaitingForGestureIdx(null);
//     const success = await updateSingleDevice(plates[index], index);

//     if (success) {
//       const nextIdx = plates.findIndex((p, i) => i > index && p.status !== 'Updated');
//       if (nextIdx !== -1) {
//         setWaitingForGestureIdx(nextIdx);
//         setGlobalStatus(`Ready for [${nextIdx + 1}/${plates.length}]: "${plates[nextIdx].frontName}" (MAC: ${plates[nextIdx].mac}). Press SPACEBAR.`);
//       } else {
//         setIsQueueRunning(false);
//         setActiveIdx(-1);
//         setGlobalStatus('All plates in queue updated successfully!');
//       }
//     } else {
//       setIsQueueRunning(false);
//       setActiveIdx(-1);
//     }
//   };

//   const runSequentialQueue = async () => {
//     setIsQueueRunning(true);
//     const firstPendingIdx = plates.findIndex((p) => p.status !== 'Updated');

//     if (firstPendingIdx !== -1) {
//       await triggerNextBatchItem(firstPendingIdx);
//     } else {
//       setIsQueueRunning(false);
//       setGlobalStatus('All nameplates are already marked as Updated.');
//     }
//   };

//   // Keyboard Spacebar Listener for Safe Trigger
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
//         return;
//       }
//       if (e.code === 'Space' && waitingForGestureIdx !== null) {
//         e.preventDefault();
//         triggerNextBatchItem(waitingForGestureIdx);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [waitingForGestureIdx, plates]);

//   return (
//     <div style={{ maxWidth: '980px', margin: '20px auto', fontFamily: 'Segoe UI, Roboto, sans-serif', padding: '16px' }}>

//       {/* Title Header */}
//       <div style={{ background: '#b71c1c', color: '#fff', padding: '16px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//         <div>
//           <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>ESL Gateway - Automated Nameplate System</h2>
//           <small style={{ color: '#ffcdd2' }}>Hardware: ESL 7.50 DDS (Dual-Sided 192KB Pipeline)</small>
//         </div>
//         <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '14px', fontWeight: 'bold' }}>MERN & BLE</span>
//       </div>

//       {/* Global Status Alert */}
//       <div style={{
//         background: globalStatus.includes('Failed') ? '#ffebee' : '#e8f5e9',
//         border: `1px solid ${globalStatus.includes('Failed') ? '#ef9a9a' : '#c8e6c9'}`,
//         color: globalStatus.includes('Failed') ? '#c62828' : '#2e7d32',
//         padding: '12px 16px',
//         borderRadius: '6px',
//         fontWeight: 'bold',
//         marginBottom: '16px'
//       }}>
//         Status: {globalStatus}
//       </div>

//       {/* Spacebar Action Banner */}
//       {waitingForGestureIdx !== null && (
//         <div style={{
//           background: '#e3f2fd',
//           border: '2px solid #1976d2',
//           padding: '14px 20px',
//           borderRadius: '8px',
//           marginBottom: '18px',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)'
//         }}>
//           <div>
//             <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d47a1', display: 'block' }}>
//               👉 Next Device Ready: "{plates[waitingForGestureIdx].frontName}"
//             </span>
//             <small style={{ color: '#455a64' }}>
//               Item #{waitingForGestureIdx + 1} of {plates.length} | Target MAC: <strong>{plates[waitingForGestureIdx].mac}</strong>
//             </small>
//           </div>

//           <button
//             type="button"
//             onClick={() => triggerNextBatchItem(waitingForGestureIdx)}
//             style={{
//               background: '#1976d2',
//               color: '#fff',
//               border: 'none',
//               padding: '10px 22px',
//               borderRadius: '24px',
//               fontSize: '14px',
//               fontWeight: 'bold',
//               cursor: 'pointer',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
//             }}
//           >
//             Update Next (Press SPACEBAR)
//           </button>
//         </div>
//       )}

//       {/* Office Style Formatting Ribbon */}
//       <div style={{ background: '#ffffff', border: '1px solid #dcdcdc', borderRadius: '8px', padding: '12px 18px', marginBottom: '14px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Style:</span>
//           <button
//             type="button"
//             onClick={() => setIsBold(!isBold)}
//             style={{
//               padding: '5px 14px',
//               borderRadius: '4px',
//               border: isBold ? '2px solid #b71c1c' : '1px solid #ccc',
//               background: isBold ? '#ffebee' : '#fafafa',
//               color: isBold ? '#b71c1c' : '#333',
//               fontWeight: '900',
//               fontSize: '15px',
//               cursor: 'pointer'
//             }}
//           >
//             B
//           </button>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Font Size:</span>
//           <select
//             value={fontSizeChoice}
//             onChange={(e) => setFontSizeChoice(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
//           >
//             <option value="auto">Auto-Fit (Default Layout)</option>
//             <option value="48">48 px</option>
//             <option value="60">60 px</option>
//             <option value="72">72 px</option>
//             <option value="85">85 px</option>
//             <option value="105">105 px</option>
//             <option value="125">125 px</option>
//           </select>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Text Color:</span>
//           <select
//             value={textColorChoice}
//             onChange={(e) => setTextColorChoice(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
//           >
//             <option value="#000000">Black</option>
//             <option value="#FFFFFF">White</option>
//             <option value="#D32F2F">Red</option>
//             <option value="#FBC02D">Yellow</option>
//           </select>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Background:</span>
//           <select
//             value={bgColorChoice}
//             onChange={(e) => setBgColorChoice(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
//           >
//             <option value="#FFFFFF">White (Standard)</option>
//             <option value="#000000">Black (Inverted)</option>
//             <option value="#D32F2F">Red Background</option>
//             <option value="#FBC02D">Yellow Background</option>
//           </select>
//         </div>

//       </div>

//       {/* Graphics Toolbar: Large Photo & QR Mode */}
//       <div style={{ background: '#f9fbe7', border: '1px solid #c0ca33', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
//             <input
//               type="checkbox"
//               checked={showLogo}
//               onChange={(e) => setShowLogo(e.target.checked)}
//             />
//             Show Photo / Logo (140x175)
//           </label>
//           <input
//             type="file"
//             accept="image/png, image/jpeg"
//             onChange={handleLogoUpload}
//             style={{ fontSize: '12px', maxWidth: '180px' }}
//           />
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
//           <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
//             <input
//               type="checkbox"
//               checked={showQr}
//               onChange={(e) => setShowQr(e.target.checked)}
//             />
//             Show QR (Top-Right)
//           </label>

//           <select
//             value={qrMode}
//             onChange={(e) => setQrMode(e.target.value)}
//             disabled={!showQr}
//             style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
//           >
//             <option value="upload">Upload QR Image</option>
//             <option value="text">Enter URL / Text</option>
//           </select>

//           {qrMode === 'upload' ? (
//             <input
//               type="file"
//               accept="image/png, image/jpeg"
//               onChange={handleQrUpload}
//               disabled={!showQr}
//               style={{ fontSize: '12px', maxWidth: '170px' }}
//             />
//           ) : (
//             <input
//               type="text"
//               placeholder="Enter URL or Text for QR"
//               value={qrText}
//               onChange={(e) => setQrText(e.target.value)}
//               disabled={!showQr}
//               style={{
//                 padding: '5px 10px',
//                 borderRadius: '4px',
//                 border: '1px solid #ccc',
//                 fontSize: '12px',
//                 flex: 1,
//                 background: showQr ? '#fff' : '#f0f0f0'
//               }}
//             />
//           )}
//         </div>

//       </div>

//       {/* Input Sections: Excel Upload & Manual Add */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '16px', marginBottom: '20px' }}>

//         <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
//           <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#222' }}>1. Upload Excel / CSV</h3>
//           <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
//             Auto-Detects: Employee Name, Designation, Project/Area, Physical MAC
//           </p>
//           <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
//         </div>

//         <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//             <h3 style={{ margin: 0, fontSize: '15px', color: '#222' }}>2. Add Single Entry</h3>
//             <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
//               <input
//                 type="checkbox"
//                 checked={syncBothSides}
//                 onChange={(e) => setSyncBothSides(e.target.checked)}
//               />
//               Same for Front & Back
//             </label>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
//             <input
//               placeholder="Front Name (e.g. PRIYA)"
//               value={newFrontName}
//               onChange={(e) => setNewFrontName(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//             <input
//               placeholder="Front Designation"
//               value={newFrontDesignation}
//               onChange={(e) => setNewFrontDesignation(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//           </div>

//           {!syncBothSides && (
//             <div style={{ border: '1px dashed #b71c1c', background: '#fff5f5', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
//               <small style={{ color: '#b71c1c', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Back Side Custom Details:</small>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
//                 <input
//                   placeholder="Back Name"
//                   value={newBackName}
//                   onChange={(e) => setNewBackName(e.target.value)}
//                   style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//                 />
//                 <input
//                   placeholder="Back Designation"
//                   value={newBackDesignation}
//                   onChange={(e) => setNewBackDesignation(e.target.value)}
//                   style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//                 />
//               </div>
//             </div>
//           )}

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
//             <input
//               placeholder="Project / Location"
//               value={newFrontProject}
//               onChange={(e) => setNewFrontProject(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//             <input
//               placeholder="Physical MAC (e.g. E4:52:1E:E5:6A:BA)"
//               value={newMac}
//               onChange={(e) => setNewMac(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//           </div>

//           <button
//             onClick={handleAddPlate}
//             style={{ width: '100%', background: '#b71c1c', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
//           >
//             Add to Queue
//           </button>
//         </div>
//       </div>

//       {/* Live Canvas Preview */}
//       <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fff', marginBottom: '20px', textAlign: 'center' }}>
//         <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
//           <button
//             onClick={() => setPreviewSide('front')}
//             style={{
//               padding: '6px 16px',
//               borderRadius: '20px',
//               border: 'none',
//               fontWeight: 'bold',
//               fontSize: '13px',
//               cursor: 'pointer',
//               background: previewSide === 'front' ? '#b71c1c' : '#eee',
//               color: previewSide === 'front' ? '#fff' : '#444'
//             }}
//           >
//             Preview Front Side
//           </button>
//           <button
//             onClick={() => setPreviewSide('back')}
//             style={{
//               padding: '6px 16px',
//               borderRadius: '20px',
//               border: 'none',
//               fontWeight: 'bold',
//               fontSize: '13px',
//               cursor: 'pointer',
//               background: previewSide === 'back' ? '#b71c1c' : '#eee',
//               color: previewSide === 'back' ? '#fff' : '#444'
//             }}
//           >
//             Preview Back Side
//           </button>
//         </div>

//         <small style={{ color: '#777', display: 'block', marginBottom: '10px' }}>
//           Viewing: <strong>{previewSide.toUpperCase()}</strong> | Name: <strong>{previewSide === 'front' ? previewItem?.frontName : previewItem?.backName}</strong> | 
//           Target MAC: <strong>{previewItem?.mac || 'Unassigned'}</strong>
//         </small>

//         <div style={{ display: 'inline-block', border: '2px solid #444', borderRadius: '4px', background: '#fff', maxWidth: '640px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//           <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
//         </div>
//       </div>

//       {/* Queue Table with Silent Batch Controls */}
//       <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
//         <div style={{ padding: '14px 18px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
//           <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Deployment Queue ({plates.length} Plates)</span>

//           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//             <button
//               type="button"
//               onClick={handlePairNewDevice}
//               style={{
//                 background: '#1976d2',
//                 color: '#fff',
//                 border: 'none',
//                 padding: '9px 18px',
//                 borderRadius: '20px',
//                 fontSize: '13px',
//                 fontWeight: 'bold',
//                 cursor: 'pointer',
//                 boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
//               }}
//             >
//               + Pair New Plate
//             </button>

//             <button
//               onClick={runSequentialQueue}
//               disabled={isQueueRunning || plates.length === 0}
//               style={{
//                 background: isQueueRunning ? '#aaa' : '#2e7d32',
//                 color: '#fff',
//                 border: 'none',
//                 padding: '9px 22px',
//                 borderRadius: '20px',
//                 fontSize: '14px',
//                 fontWeight: 'bold',
//                 cursor: isQueueRunning ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {isQueueRunning ? 'Running Batch Update...' : 'Start Batch Update (All Line-by-Line)'}
//             </button>
//           </div>
//         </div>

//         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//           <thead>
//             <tr style={{ background: '#fafafa', borderBottom: '2px solid #eee', fontSize: '13px', color: '#666' }}>
//               <th style={{ padding: '12px' }}>#</th>
//               <th style={{ padding: '12px' }}>Front Display</th>
//               <th style={{ padding: '12px' }}>Back Display</th>
//               <th style={{ padding: '12px' }}>Project</th>
//               <th style={{ padding: '12px' }}>Physical MAC Address</th>
//               <th style={{ padding: '12px' }}>Status</th>
//               <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {plates.map((plate, idx) => {
//               const isEditing = editingId === plate.id;
//               return (
//                 <tr
//                   key={plate.id}
//                   onClick={() => !isEditing && setPreviewItem(plate)}
//                   style={{
//                     borderBottom: '1px solid #eee',
//                     background: activeIdx === idx ? '#fffde7' : previewItem?.id === plate.id ? '#f5f5f5' : '#fff',
//                     cursor: isEditing ? 'default' : 'pointer'
//                   }}
//                 >
//                   <td style={{ padding: '12px', fontSize: '14px' }}>{idx + 1}</td>

//                   <td style={{ padding: '12px' }}>
//                     {isEditing ? (
//                       <div>
//                         <input
//                           value={editFormData.frontName}
//                           onChange={(e) => handleEditFieldChange('frontName', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '13px', marginBottom: '4px', border: '1px solid #b71c1c', borderRadius: '4px' }}
//                         />
//                         <input
//                           value={editFormData.frontDesignation}
//                           onChange={(e) => handleEditFieldChange('frontDesignation', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                       </div>
//                     ) : (
//                       <div>
//                         <span style={{ fontWeight: isBold ? 'bold' : 'normal', fontSize: '14px' }}>{plate.frontName}</span>
//                         <small style={{ display: 'block', color: '#666' }}>{plate.frontDesignation || '-'}</small>
//                       </div>
//                     )}
//                   </td>

//                   <td style={{ padding: '12px' }}>
//                     {isEditing ? (
//                       <div>
//                         <input
//                           value={editFormData.backName}
//                           onChange={(e) => handleEditFieldChange('backName', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '13px', marginBottom: '4px', border: '1px solid #b71c1c', borderRadius: '4px' }}
//                         />
//                         <input
//                           value={editFormData.backDesignation}
//                           onChange={(e) => handleEditFieldChange('backDesignation', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                       </div>
//                     ) : (
//                       <div>
//                         <span style={{ fontWeight: isBold ? 'bold' : 'normal', fontSize: '14px' }}>{plate.backName}</span>
//                         <small style={{ display: 'block', color: '#666' }}>{plate.backDesignation || '-'}</small>
//                       </div>
//                     )}
//                   </td>

//                   <td style={{ padding: '12px', fontSize: '14px', color: '#555' }}>
//                     {isEditing ? (
//                       <input
//                         value={editFormData.frontProject}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           const updated = { ...editFormData, frontProject: val, backProject: val };
//                           setEditFormData(updated);
//                           setPreviewItem({ ...previewItem, ...updated });
//                         }}
//                         style={{ padding: '5px', width: '90%', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
//                       />
//                     ) : (
//                       plate.frontProject || '-'
//                     )}
//                   </td>

//                   <td style={{ padding: '12px', fontSize: '13px' }}>
//                     {isEditing ? (
//                       <input
//                         value={editFormData.mac}
//                         onChange={(e) => handleEditFieldChange('mac', e.target.value)}
//                         style={{ padding: '5px', width: '90%', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
//                       />
//                     ) : (
//                       <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1565c0' }}>
//                         {plate.mac || 'Unassigned'}
//                       </span>
//                     )}
//                   </td>

//                   <td style={{
//                     padding: '12px',
//                     fontWeight: 'bold',
//                     fontSize: '13px',
//                     color: plate.status === 'Updated' ? '#2e7d32' : plate.status.includes('Failed') ? '#c62828' : '#e65100'
//                   }}>
//                     {plate.status}
//                   </td>

//                   <td style={{ padding: '12px', textAlign: 'center' }}>
//                     {isEditing ? (
//                       <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
//                         <button
//                           onClick={() => handleSaveEdit(plate.id)}
//                           style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
//                         >
//                           Save
//                         </button>
//                         <button
//                           onClick={handleCancelEdit}
//                           style={{ background: '#757575', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleEditClick(plate);
//                           }}
//                           disabled={isQueueRunning}
//                           style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             updateSingleDevice(plate, idx);
//                           }}
//                           disabled={isQueueRunning}
//                           style={{ background: '#b71c1c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
//                         >
//                           Update
//                         </button>
//                       </div>
//                     )}
//                   </td>

//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }












































// import React, { useState, useRef, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import QRCode from 'qrcode';

// // Hardware Protocol Constants (ESL 7.50 DDS)
// const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
// const CHAR_UUID = '0000fff5-0000-1000-8000-00805f9b34fb';
// const PACKET_SIZE = 200; // 200 bytes per chunk

// export default function NamePlateManager() {
//   const [plates, setPlates] = useState([
//     {
//       id: 1,
//       frontName: 'Rahul Thakur',
//       frontDesignation: 'Full Stack Developer',
//       frontProject: 'Ghaziabad',
//       backName: 'Rahul Thakur',
//       backDesignation: 'Full Stack Developer',
//       backProject: 'Ghaziabad',
//       mac: 'E4:52:1E:E5:6A:BA',
//       status: 'Pending'
//     }
//   ]);

//   // Live Bluetooth Hardware Mapping (MAC Address -> Active Bluetooth Device Object)
//   const [deviceMap, setDeviceMap] = useState({});

//   // Form States (Front & Back)
//   const [syncBothSides, setSyncBothSides] = useState(true);
//   const [newFrontName, setNewFrontName] = useState('');
//   const [newFrontDesignation, setNewFrontDesignation] = useState('');
//   const [newFrontProject, setNewFrontProject] = useState('');

//   const [newBackName, setNewBackName] = useState('');
//   const [newBackDesignation, setNewBackDesignation] = useState('');
//   const [newBackProject, setNewBackProject] = useState('');
//   const [newMac, setNewMac] = useState('');

//   // Office / Excel style Formatting States
//   const [fontSizeChoice, setFontSizeChoice] = useState('auto');
//   const [isBold, setIsBold] = useState(true);
//   const [textColorChoice, setTextColorChoice] = useState('#000000');
//   const [bgColorChoice, setBgColorChoice] = useState('#FFFFFF');

//   // Graphics States: Photo & QR
//   const [showLogo, setShowLogo] = useState(false);
//   const [logoImageObj, setLogoImageObj] = useState(null);

//   const [showQr, setShowQr] = useState(false);
//   const [qrMode, setQrMode] = useState('upload'); // 'upload' or 'text'
//   const [qrImageObj, setQrImageObj] = useState(null);
//   const [qrText, setQrText] = useState('https://company.com');
//   const [qrCanvasElement, setQrCanvasElement] = useState(null);

//   // Edit Row States
//   const [editingId, setEditingId] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     frontName: '',
//     frontDesignation: '',
//     frontProject: '',
//     backName: '',
//     backDesignation: '',
//     backProject: '',
//     mac: ''
//   });

//   // Preview States
//   const [previewSide, setPreviewSide] = useState('front');
//   const [previewItem, setPreviewItem] = useState(plates[0]);

//   // Queue & Transmission States
//   const [isQueueRunning, setIsQueueRunning] = useState(false);
//   const [activeIdx, setActiveIdx] = useState(-1);
//   const [globalStatus, setGlobalStatus] = useState('Ready for deployment');

//   const canvasRef = useRef(null);

//   // QR Canvas Generator for Text/URL Mode
//   useEffect(() => {
//     if (!showQr || qrMode !== 'text' || !qrText.trim()) {
//       setQrCanvasElement(null);
//       return;
//     }
//     const offCanvas = document.createElement('canvas');
//     QRCode.toCanvas(
//       offCanvas,
//       qrText.trim(),
//       {
//         width: 120,
//         margin: 1,
//         color: {
//           dark: textColorChoice === '#FFFFFF' ? '#FFFFFF' : '#000000',
//           light: bgColorChoice === '#000000' ? '#000000' : '#FFFFFF'
//         }
//       },
//       (err) => {
//         if (!err) setQrCanvasElement(offCanvas);
//       }
//     );
//   }, [showQr, qrMode, qrText, textColorChoice, bgColorChoice]);

//   // Photo & QR File Upload Handlers
//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const img = new Image();
//       img.onload = () => {
//         setLogoImageObj(img);
//         setShowLogo(true);
//       };
//       img.src = evt.target.result;
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleQrUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const img = new Image();
//       img.onload = () => {
//         setQrImageObj(img);
//         setShowQr(true);
//       };
//       img.src = evt.target.result;
//     };
//     reader.readAsDataURL(file);
//   };

//   // 1. High Resolution Canvas Renderer
//   const renderCanvasWithDetails = (canvas, item, options = {}) => {
//     if (!canvas) return;
//     canvas.width = 800;
//     canvas.height = 480;
//     const ctx = canvas.getContext('2d');

//     const bg = options.bgColor || bgColorChoice;
//     const txtColor = options.textColor || textColorChoice;
//     const customSize = options.fontSize || fontSizeChoice;
//     const boldWeight = options.bold !== undefined ? (options.bold ? 'bold' : 'normal') : (isBold ? 'bold' : 'normal');

//     // Solid Background Fill
//     ctx.fillStyle = bg;
//     ctx.fillRect(0, 0, 800, 480);

//     // Large Photo (140x175 Portrait Size)
//     const photoWidth = 140;
//     const photoHeight = 175;
//     const photoX = 35;
//     const photoY = 30;

//     if (showLogo && logoImageObj) {
//       try {
//         ctx.save();
//         ctx.strokeStyle = txtColor;
//         ctx.lineWidth = 3;
//         ctx.strokeRect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4);
//         ctx.drawImage(logoImageObj, photoX, photoY, photoWidth, photoHeight);
//         ctx.restore();
//       } catch (err) {
//         console.warn('Photo draw error:', err);
//       }
//     }

//     // QR Code (Top-Right: 120x120)
//     const qrSize = 120;
//     const qrX = 800 - qrSize - 35;
//     const qrY = 30;

//     if (showQr) {
//       try {
//         if (qrMode === 'upload' && qrImageObj) {
//           ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
//         } else if (qrMode === 'text' && qrCanvasElement) {
//           ctx.drawImage(qrCanvasElement, qrX, qrY, qrSize, qrSize);
//         }
//       } catch (err) {
//         console.warn('QR draw error:', err);
//       }
//     }

//     const cleanName = (item?.name || '').trim();
//     const cleanDesig = (item?.designation || '').trim();
//     const cleanProj = (item?.project || '').trim();

//     if (!cleanName) return;

//     let subParts = [];
//     if (cleanDesig) subParts.push(cleanDesig);
//     if (cleanProj) subParts.push(cleanProj);
//     const subText = subParts.join('  |  ');

//     const hasLeftGraphic = showLogo && logoImageObj;
//     const hasRightGraphic = showQr && (qrImageObj || qrCanvasElement);

//     let textCenterX = 400;
//     let MAX_WIDTH = 750;

//     if (hasLeftGraphic && hasRightGraphic) {
//       MAX_WIDTH = 460;
//     } else if (hasLeftGraphic) {
//       MAX_WIDTH = 550;
//       textCenterX = 480;
//     } else if (hasRightGraphic) {
//       MAX_WIDTH = 550;
//       textCenterX = 320;
//     }

//     // Name Word Wrap Logic
//     const words = cleanName.split(/\s+/);
//     let nameLines = [];

//     if (words.length > 1 && (cleanName.length > 12 || words.some((w) => w.length > 8))) {
//       if (words.length === 2) {
//         nameLines = [words[0], words[1]];
//       } else if (words.length === 3) {
//         nameLines = [`${words[0]} ${words[1]}`, words[2]];
//       } else {
//         const mid = Math.ceil(words.length / 2);
//         nameLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
//       }
//     } else {
//       nameLines = [cleanName];
//     }

//     let nameFontSize;
//     let subFontSize;

//     if (customSize !== 'auto') {
//       const baseSize = parseInt(customSize, 10);
//       nameFontSize = nameLines.length > 1 ? Math.round(baseSize * 0.8) : baseSize;
//       subFontSize = Math.max(24, Math.min(52, Math.round(baseSize * 0.45)));
//     } else {
//       nameFontSize = nameLines.length > 1 ? 76 : 105;
//       if (subText) nameFontSize = nameLines.length > 1 ? 68 : 95;
//       subFontSize = 38;
//     }

//     const MIN_FONT_SIZE = 24;
//     ctx.font = `${boldWeight} ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
//     const getLongestLineWidth = () => Math.max(...nameLines.map((line) => ctx.measureText(line).width));

//     while (getLongestLineWidth() > MAX_WIDTH && nameFontSize > MIN_FONT_SIZE) {
//       nameFontSize -= 2;
//       ctx.font = `${boldWeight} ${nameFontSize}px Arial, "Segoe UI", sans-serif`;
//     }

//     ctx.fillStyle = txtColor;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';

//     if (!subText) {
//       if (nameLines.length === 1) {
//         ctx.fillText(nameLines[0], textCenterX, 240);
//       } else {
//         const lineHeight = nameFontSize * 1.18;
//         const startY = 240 - lineHeight / 2;
//         ctx.fillText(nameLines[0], textCenterX, startY);
//         ctx.fillText(nameLines[1], textCenterX, startY + lineHeight);
//       }
//     } else {
//       let nameCenterY = nameLines.length === 1 ? 210 : 180;
//       if (nameLines.length === 1) {
//         ctx.fillText(nameLines[0], textCenterX, nameCenterY);
//       } else {
//         const lineHeight = nameFontSize * 1.15;
//         const startY = nameCenterY - lineHeight / 2;
//         ctx.fillText(nameLines[0], textCenterX, startY);
//         ctx.fillText(nameLines[1], textCenterX, startY + lineHeight);
//       }

//       // Separator Line
//       ctx.strokeStyle = txtColor;
//       ctx.lineWidth = 3;
//       ctx.beginPath();
//       const lineStart = Math.max(40, textCenterX - MAX_WIDTH / 2.2);
//       const lineEnd = Math.min(760, textCenterX + MAX_WIDTH / 2.2);
//       ctx.moveTo(lineStart, 305);
//       ctx.lineTo(lineEnd, 305);
//       ctx.stroke();

//       // Designation & Project Subtitle
//       ctx.font = `${boldWeight} ${subFontSize}px Arial, "Segoe UI", sans-serif`;
//       while (ctx.measureText(subText).width > MAX_WIDTH && subFontSize > 20) {
//         subFontSize -= 2;
//         ctx.font = `${boldWeight} ${subFontSize}px Arial, "Segoe UI", sans-serif`;
//       }
//       ctx.fillText(subText, textCenterX, 375);
//     }
//   };

//   // Preview Re-render Trigger
//   useEffect(() => {
//     if (!previewItem) return;
//     const currentData = previewSide === 'front'
//       ? { name: previewItem.frontName, designation: previewItem.frontDesignation, project: previewItem.frontProject }
//       : { name: previewItem.backName, designation: previewItem.backDesignation, project: previewItem.backProject };

//     renderCanvasWithDetails(canvasRef.current, currentData, {
//       bgColor: bgColorChoice,
//       textColor: textColorChoice,
//       fontSize: fontSizeChoice,
//       bold: isBold
//     });
//   }, [previewItem, previewSide, fontSizeChoice, isBold, textColorChoice, bgColorChoice, showLogo, logoImageObj, showQr, qrMode, qrImageObj, qrCanvasElement]);

//   // 2. 100% Zero-Noise Direct Color Snapping Engine (Zero Dots on Any Color/Photo)
//   const renderSingleScreenBytes = (sideItem) => {
//     const WIDTH = 800;
//     const HEIGHT = 480;
//     const TOTAL_PIXELS = WIDTH * HEIGHT;
//     const PHOTO = { x: 35, y: 30, w: 140, h: 175 };

//     const getColorCode = (hex) => {
//       const normalized = (hex || '').trim().toUpperCase();
//       if (normalized === '#D32F2F') return 3; // Red
//       if (normalized === '#FBC02D') return 2; // Yellow
//       if (normalized === '#FFFFFF') return 1; // White
//       return 0; // Black
//     };

//     const bgCode = getColorCode(bgColorChoice);
//     const textCode = getColorCode(textColorChoice);

//     const offscreen = document.createElement('canvas');
//     offscreen.width = WIDTH;
//     offscreen.height = HEIGHT;

//     renderCanvasWithDetails(offscreen, sideItem, {
//       bgColor: bgColorChoice,
//       textColor: textColorChoice,
//       fontSize: fontSizeChoice,
//       bold: isBold
//     });

//     const ctx = offscreen.getContext('2d', { willReadFrequently: true });
//     ctx.imageSmoothingEnabled = false;

//     const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
//     const src = imgData.data;
//     const colorCodes = new Uint8Array(TOTAL_PIXELS);

//     const isPhotoPixel = (x, y) =>
//       Boolean(showLogo && logoImageObj) &&
//       x >= PHOTO.x &&
//       x < PHOTO.x + PHOTO.w &&
//       y >= PHOTO.y &&
//       y < PHOTO.y + PHOTO.h;

//     for (let y = 0; y < HEIGHT; y++) {
//       for (let x = 0; x < WIDTH; x++) {
//         const pixelIndex = y * WIDTH + x;
//         const i = pixelIndex * 4;
//         const r = src[i];
//         const g = src[i + 1];
//         const b = src[i + 2];
//         const alpha = src[i + 3];

//         // 1. Photo Area Processing
//         if (isPhotoPixel(x, y)) {
//           // Border Line Frame
//           if (x === PHOTO.x || x === PHOTO.x + PHOTO.w - 1 || y === PHOTO.y || y === PHOTO.y + PHOTO.h - 1) {
//             colorCodes[pixelIndex] = (bgCode === 0) ? 1 : 0;
//             continue;
//           }

//           const lum = 0.299 * r + 0.587 * g + 0.114 * b;
//           // Grey Background Removal (Solid White, No Dots)
//           if (lum > 160) {
//             colorCodes[pixelIndex] = 1;
//             continue;
//           }

//           // Suit/Face/Tie Detailing
//           if (r > 140 && g < 75 && b < 75) {
//             colorCodes[pixelIndex] = 3; // Red
//           } else if (r > 150 && g > 140 && b < 85) {
//             colorCodes[pixelIndex] = 2; // Yellow
//           } else {
//             colorCodes[pixelIndex] = lum < 112 ? 0 : 1; // Solid Black or White
//           }
//           continue;
//         }

//         // 2. Text, Background & QR Area Processing
//         if (alpha < 100) {
//           colorCodes[pixelIndex] = bgCode;
//           continue;
//         }

//         const isPureBlack = (r < 60 && g < 60 && b < 60);
//         if (showQr && (x >= 800 - 160) && (y <= 160)) {
//           colorCodes[pixelIndex] = isPureBlack ? 0 : 1;
//           continue;
//         }

//         const isRed = (r > 130 && g < 80 && b < 80);
//         const isYellow = (r > 140 && g > 130 && b < 85);

//         if (textCode === 3 && isRed) {
//           colorCodes[pixelIndex] = 3;
//         } else if (textCode === 2 && isYellow) {
//           colorCodes[pixelIndex] = 2;
//         } else {
//           const lum = 0.299 * r + 0.587 * g + 0.114 * b;
//           if (bgCode === 0) {
//             colorCodes[pixelIndex] = (lum > 75 || isRed || isYellow) ? textCode : 0;
//           } else if (bgCode === 1) {
//             colorCodes[pixelIndex] = (lum < 175) ? textCode : 1;
//           } else if (bgCode === 3) {
//             colorCodes[pixelIndex] = (lum > 130) ? textCode : 3;
//           } else {
//             colorCodes[pixelIndex] = (lum < 140) ? textCode : 2;
//           }
//         }
//       }
//     }

//     // 2-bit packing (MSB-first) -> exactly 96,000 bytes
//     const output = new Uint8Array(96000);
//     let byteIndex = 0;
//     for (let i = 0; i < TOTAL_PIXELS; i += 4) {
//       output[byteIndex++] =
//         (colorCodes[i] << 6) |
//         (colorCodes[i + 1] << 4) |
//         (colorCodes[i + 2] << 2) |
//         colorCodes[i + 3];
//     }
//     return output;
//   };

//   // Dual-Sided DDS Payload: Front (96KB) + Back (96KB) = 192,000 bytes
//   const generateDualDdsPayload = (plate) => {
//     const frontBytes = renderSingleScreenBytes({
//       name: plate.frontName,
//       designation: plate.frontDesignation,
//       project: plate.frontProject
//     });

//     const backBytes = renderSingleScreenBytes({
//       name: plate.backName,
//       designation: plate.backDesignation,
//       project: plate.backProject
//     });

//     const totalDdsPayload = new Uint8Array(192000);
//     totalDdsPayload.set(frontBytes, 0);
//     totalDdsPayload.set(backBytes, 96000);
//     return totalDdsPayload;
//   };

//   // 3. Universal Smart Excel Parser (Auto-Detects Any Header Variant)
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       try {
//         const bstr = evt.target.result;
//         const wb = XLSX.read(bstr, { type: 'binary' });
//         const wsName = wb.SheetNames[0];
//         const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

//         if (!rawRows || rawRows.length === 0) {
//           alert('Excel sheet is empty!');
//           return;
//         }

//         const findVal = (row, keywords) => {
//           for (const key of Object.keys(row)) {
//             const cleanKey = key.toLowerCase().replace(/[\s_\-\.]/g, '');
//             for (const kw of keywords) {
//               const cleanKw = kw.toLowerCase().replace(/[\s_\-\.]/g, '');
//               if (cleanKey === cleanKw || cleanKey.includes(cleanKw)) {
//                 const val = row[key];
//                 if (val !== undefined && val !== null) {
//                   const str = String(val).trim();
//                   if (str.length > 0) return str;
//                 }
//               }
//             }
//           }
//           return '';
//         };

//         const formatted = rawRows.map((row, idx) => {
//           const fName = findVal(row, ['frontname', 'employeename', 'empname', 'officername', 'fullname', 'name']);
//           const fDesig = findVal(row, ['frontdesignation', 'designation', 'desig', 'post', 'role', 'title', 'position']);
//           const fProj = findVal(row, ['frontproject', 'personnelarea', 'project', 'location', 'site', 'station', 'plant', 'area', 'city']);

//           const bName = findVal(row, ['backname', 'back_name']) || fName;
//           const bDesig = findVal(row, ['backdesignation', 'back_designation']) || fDesig;
//           const bProj = findVal(row, ['backproject', 'back_project']) || fProj;

//           const devMac = findVal(row, ['mac', 'device', 'deviceid', 'eslid', 'tagid', 'ble', 'hardware']);

//           return {
//             id: Date.now() + idx,
//             frontName: fName,
//             frontDesignation: fDesig,
//             frontProject: fProj,
//             backName: bName,
//             backDesignation: bDesig,
//             backProject: bProj,
//             mac: devMac.toUpperCase(),
//             status: 'Pending'
//           };
//         }).filter((item) => item.frontName.length > 0);

//         if (formatted.length === 0) {
//           alert('Could not detect Employee Name column in Excel file.');
//           return;
//         }

//         setPlates(formatted);
//         setPreviewItem(formatted[0]);
//         setGlobalStatus(`Loaded ${formatted.length} plates successfully with MAC matching enabled.`);
//       } catch (err) {
//         alert('File read error: ' + err.message);
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

//   // 4. Add Single Entry Handler
//   const handleAddPlate = () => {
//     if (!newFrontName.trim()) return;

//     const newPlate = {
//       id: Date.now(),
//       frontName: newFrontName.trim(),
//       frontDesignation: newFrontDesignation.trim(),
//       frontProject: newFrontProject.trim(),
//       backName: syncBothSides ? newFrontName.trim() : (newBackName.trim() || newFrontName.trim()),
//       backDesignation: syncBothSides ? newFrontDesignation.trim() : newBackDesignation.trim(),
//       backProject: syncBothSides ? newFrontProject.trim() : newBackProject.trim(),
//       mac: newMac.trim().toUpperCase(),
//       status: 'Pending'
//     };

//     setPlates([...plates, newPlate]);
//     setPreviewItem(newPlate);

//     setNewFrontName('');
//     setNewFrontDesignation('');
//     setNewFrontProject('');
//     setNewBackName('');
//     setNewBackDesignation('');
//     setNewBackProject('');
//     setNewMac('');
//   };

//   // 5. Dedicated Pair Handler: Device ko physical MAC ke sath permanently link karein
//   const handlePairNewDevice = async () => {
//     try {
//       setGlobalStatus('Scanning for ESL devices... Select plate to pair.');
//       const device = await navigator.bluetooth.requestDevice({
//         filters: [
//           { namePrefix: 'DDS' },
//           { namePrefix: 'ESL' }
//         ],
//         optionalServices: [SERVICE_UUID]
//       });

//       const devName = device.name || 'DDS-Device';

//       // Find first row that has no live device mapped
//       setPlates((prev) => {
//         const targetIdx = prev.findIndex((p) => !p.mac || p.mac.trim() === '' || !deviceMap[p.mac]);
//         if (targetIdx !== -1) {
//           const targetMac = prev[targetIdx].mac || devName;

//           // Lock in live device map
//           setDeviceMap((dMap) => ({
//             ...dMap,
//             [targetMac.toUpperCase()]: device,
//             [device.id]: device
//           }));

//           localStorage.setItem(`ble_mac_${targetMac.toUpperCase()}`, device.id);
//           setGlobalStatus(`Device "${devName}" paired & locked to ${targetMac}.`);

//           return prev.map((p, i) => (i === targetIdx ? { ...p, status: 'Paired' } : p));
//         }
//         return prev;
//       });

//     } catch (err) {
//       console.log('Pairing cancelled or error:', err);
//       setGlobalStatus('Pairing cancelled.');
//     }
//   };

//   // 6. Edit Row Handlers
//   const handleEditClick = (plate) => {
//     setEditingId(plate.id);
//     const data = {
//       frontName: plate.frontName,
//       frontDesignation: plate.frontDesignation,
//       frontProject: plate.frontProject,
//       backName: plate.backName,
//       backDesignation: plate.backDesignation,
//       backProject: plate.backProject,
//       mac: plate.mac
//     };
//     setEditFormData(data);
//     setPreviewItem(plate);
//   };

//   const handleEditFieldChange = (field, value) => {
//     const updatedForm = { ...editFormData, [field]: value };
//     setEditFormData(updatedForm);
//     setPreviewItem({ ...previewItem, ...updatedForm });
//   };

//   const handleSaveEdit = (id) => {
//     setPlates((prev) =>
//       prev.map((p) =>
//         p.id === id ? { ...p, ...editFormData, status: 'Pending' } : p
//       )
//     );
//     setPreviewItem({ ...editFormData, id });
//     setEditingId(null);
//   };

//   const handleCancelEdit = () => {
//     const original = plates.find((p) => p.id === editingId);
//     if (original) setPreviewItem(original);
//     setEditingId(null);
//   };

//   // 7. Silent Zero-Popup Batch Engine (Connects Directly via Live MAC Map)
//   const updateSingleDevice = async (plate, index) => {
//     setActiveIdx(index);
//     setPreviewItem(plate);
//     const targetMac = (plate.mac || '').trim().toUpperCase();
//     setGlobalStatus(`Updating [${index + 1}/${plates.length}]: "${plate.frontName}" | MAC: ${targetMac}...`);

//     setPlates((prev) =>
//       prev.map((p, i) => (i === index ? { ...p, status: 'Connecting...' } : p))
//     );

//     let device = null;
//     let server = null;

//     try {
//       // Step A: Live Device Memory Map se fetch karein (Zero Popup)
//       if (deviceMap[targetMac]) {
//         device = deviceMap[targetMac];
//       }

//       // Step B: Browser Session Memory Fallback
//       if (!device && navigator.bluetooth && navigator.bluetooth.getDevices) {
//         try {
//           const knownDevices = await navigator.bluetooth.getDevices();
//           const savedId = localStorage.getItem(`ble_mac_${targetMac}`);

//           if (savedId) {
//             device = knownDevices.find((d) => d.id === savedId);
//           }
//           if (!device && knownDevices[index]) {
//             device = knownDevices[index];
//           }
//         } catch (e) {
//           console.warn('Memory scan failed:', e);
//         }
//       }

//       // Step C: Fallback prompt ONLY if device is not paired at all
//       if (!device) {
//         device = await navigator.bluetooth.requestDevice({
//           filters: [
//             { namePrefix: 'DDS' },
//             { namePrefix: 'ESL' }
//           ],
//           optionalServices: [SERVICE_UUID]
//         });

//         if (targetMac) {
//           setDeviceMap((dMap) => ({ ...dMap, [targetMac]: device }));
//           localStorage.setItem(`ble_mac_${targetMac}`, device.id);
//         }
//       }

//       // Stale Session Disconnect
//       if (device.gatt && device.gatt.connected) {
//         try {
//           await device.gatt.disconnect();
//           await new Promise((r) => setTimeout(r, 400));
//         } catch (e) {
//           console.warn('Stale disconnect ignored');
//         }
//       }

//       // GATT Connection Handshake
//       try {
//         server = await device.gatt.connect();
//       } catch (connErr) {
//         console.warn('Direct connect failed, retrying handshake...', connErr);
//         await new Promise((r) => setTimeout(r, 1000));
//         server = await device.gatt.connect();
//       }

//       if (!server || !server.connected) {
//         throw new Error('Device BLE radio asleep or out of range.');
//       }

//       // Service & Characteristic Discovery
//       const service = await server.getPrimaryService(SERVICE_UUID);
//       const char = await service.getCharacteristic(CHAR_UUID);

//       // Payload Streaming (192,000 bytes)
//       const payload = generateDualDdsPayload(plate);
//       const totalPackets = Math.ceil(payload.length / PACKET_SIZE);

//       for (let pkt = 0; pkt < totalPackets; pkt++) {
//         const start = pkt * PACKET_SIZE;
//         const end = Math.min((pkt + 1) * PACKET_SIZE, payload.length);
//         const chunk = payload.slice(start, end);

//         await char.writeValueWithoutResponse(chunk);

//         if ((pkt + 1) % 40 === 0 || pkt === totalPackets - 1) {
//           const pct = Math.round(((pkt + 1) / totalPackets) * 100);
//           setPlates((prev) =>
//             prev.map((p, i) => (i === index ? { ...p, status: `Sending: ${pct}%` } : p))
//           );
//         }
//         await new Promise((r) => setTimeout(r, 8));
//       }

//       // Flash memory writing buffer
//       await new Promise((r) => setTimeout(r, 1200));

//       if (device.gatt && device.gatt.connected) {
//         await device.gatt.disconnect();
//       }

//       // Adapter cooldown delay before connecting next device
//       await new Promise((r) => setTimeout(r, 800));

//       setPlates((prev) =>
//         prev.map((p, i) => (i === index ? { ...p, status: 'Updated' } : p))
//       );
//       return true;

//     } catch (err) {
//       console.error(`Error on device ${index}:`, err);
//       if (device?.gatt?.connected) {
//         try {
//           await device.gatt.disconnect();
//         } catch (dcErr) {}
//       }
//       setPlates((prev) =>
//         prev.map((p, i) =>
//           i === index ? { ...p, status: `Failed: ${err.message}` } : p
//         )
//       );
//       return false;
//     }
//   };

//   // 8. Fully Automatic Batch Queue Engine (Zero Keypress / Zero Human Intervention)
//   const runSequentialQueue = async () => {
//     if (isQueueRunning) return;
//     setIsQueueRunning(true);

//     for (let i = 0; i < plates.length; i++) {
//       if (plates[i].status !== 'Updated') {
//         setGlobalStatus(`Auto-Processing plate ${i + 1} of ${plates.length}: "${plates[i].frontName}"...`);

//         const success = await updateSingleDevice(plates[i], i);

//         if (!success) {
//           console.warn(`Device at index ${i} failed. Continuing to next device automatically...`);
//         }

//         // Automatic seamless switch pause between plates
//         if (i < plates.length - 1) {
//           setGlobalStatus(`Plate ${i + 1} done. Switching to next plate automatically in 1 second...`);
//           await new Promise((r) => setTimeout(r, 1200));
//         }
//       }
//     }

//     setIsQueueRunning(false);
//     setActiveIdx(-1);
//     setGlobalStatus('All nameplates in queue have been processed automatically!');
//   };

//   return (
//     <div style={{ maxWidth: '980px', margin: '20px auto', fontFamily: 'Segoe UI, Roboto, sans-serif', padding: '16px' }}>

//       {/* Title Header */}
//       <div style={{ background: '#b71c1c', color: '#fff', padding: '16px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//         <div>
//           <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>ESL Gateway - Automated Nameplate System</h2>
//           <small style={{ color: '#ffcdd2' }}>Hardware: ESL 7.50 DDS (Dual-Sided 192KB Pipeline)</small>
//         </div>
//         <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '14px', fontWeight: 'bold' }}>MERN & BLE</span>
//       </div>

//       {/* Global Status Alert */}
//       <div style={{
//         background: globalStatus.includes('Failed') ? '#ffebee' : '#e8f5e9',
//         border: `1px solid ${globalStatus.includes('Failed') ? '#ef9a9a' : '#c8e6c9'}`,
//         color: globalStatus.includes('Failed') ? '#c62828' : '#2e7d32',
//         padding: '12px 16px',
//         borderRadius: '6px',
//         fontWeight: 'bold',
//         marginBottom: '16px'
//       }}>
//         Status: {globalStatus}
//       </div>

//       {/* Office Style Formatting Ribbon */}
//       <div style={{ background: '#ffffff', border: '1px solid #dcdcdc', borderRadius: '8px', padding: '12px 18px', marginBottom: '14px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Style:</span>
//           <button
//             type="button"
//             onClick={() => setIsBold(!isBold)}
//             style={{
//               padding: '5px 14px',
//               borderRadius: '4px',
//               border: isBold ? '2px solid #b71c1c' : '1px solid #ccc',
//               background: isBold ? '#ffebee' : '#fafafa',
//               color: isBold ? '#b71c1c' : '#333',
//               fontWeight: '900',
//               fontSize: '15px',
//               cursor: 'pointer'
//             }}
//           >
//             B
//           </button>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Font Size:</span>
//           <select
//             value={fontSizeChoice}
//             onChange={(e) => setFontSizeChoice(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
//           >
//             <option value="auto">Auto-Fit (Default Layout)</option>
//             <option value="48">48 px</option>
//             <option value="60">60 px</option>
//             <option value="72">72 px</option>
//             <option value="85">85 px</option>
//             <option value="105">105 px</option>
//             <option value="125">125 px</option>
//           </select>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Text Color:</span>
//           <select
//             value={textColorChoice}
//             onChange={(e) => setTextColorChoice(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
//           >
//             <option value="#000000">Black</option>
//             <option value="#FFFFFF">White</option>
//             <option value="#D32F2F">Red</option>
//             <option value="#FBC02D">Yellow</option>
//           </select>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Background:</span>
//           <select
//             value={bgColorChoice}
//             onChange={(e) => setBgColorChoice(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', background: '#fafafa', cursor: 'pointer' }}
//           >
//             <option value="#FFFFFF">White (Standard)</option>
//             <option value="#000000">Black (Inverted)</option>
//             <option value="#D32F2F">Red Background</option>
//             <option value="#FBC02D">Yellow Background</option>
//           </select>
//         </div>

//       </div>

//       {/* Graphics Toolbar: Large Photo & QR Mode */}
//       <div style={{ background: '#f9fbe7', border: '1px solid #c0ca33', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
//             <input
//               type="checkbox"
//               checked={showLogo}
//               onChange={(e) => setShowLogo(e.target.checked)}
//             />
//             Show Photo / Logo (140x175)
//           </label>
//           <input
//             type="file"
//             accept="image/png, image/jpeg"
//             onChange={handleLogoUpload}
//             style={{ fontSize: '12px', maxWidth: '180px' }}
//           />
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
//           <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
//             <input
//               type="checkbox"
//               checked={showQr}
//               onChange={(e) => setShowQr(e.target.checked)}
//             />
//             Show QR (Top-Right)
//           </label>

//           <select
//             value={qrMode}
//             onChange={(e) => setQrMode(e.target.value)}
//             disabled={!showQr}
//             style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
//           >
//             <option value="upload">Upload QR Image</option>
//             <option value="text">Enter URL / Text</option>
//           </select>

//           {qrMode === 'upload' ? (
//             <input
//               type="file"
//               accept="image/png, image/jpeg"
//               onChange={handleQrUpload}
//               disabled={!showQr}
//               style={{ fontSize: '12px', maxWidth: '170px' }}
//             />
//           ) : (
//             <input
//               type="text"
//               placeholder="Enter URL or Text for QR"
//               value={qrText}
//               onChange={(e) => setQrText(e.target.value)}
//               disabled={!showQr}
//               style={{
//                 padding: '5px 10px',
//                 borderRadius: '4px',
//                 border: '1px solid #ccc',
//                 fontSize: '12px',
//                 flex: 1,
//                 background: showQr ? '#fff' : '#f0f0f0'
//               }}
//             />
//           )}
//         </div>

//       </div>

//       {/* Input Sections: Excel Upload & Manual Add */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '16px', marginBottom: '20px' }}>

//         <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
//           <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#222' }}>1. Upload Excel / CSV</h3>
//           <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
//             Auto-Detects: Employee Name, Designation, Project/Area, Physical MAC
//           </p>
//           <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
//         </div>

//         <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//             <h3 style={{ margin: 0, fontSize: '15px', color: '#222' }}>2. Add Single Entry</h3>
//             <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
//               <input
//                 type="checkbox"
//                 checked={syncBothSides}
//                 onChange={(e) => setSyncBothSides(e.target.checked)}
//               />
//               Same for Front & Back
//             </label>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
//             <input
//               placeholder="Front Name (e.g. PRIYA)"
//               value={newFrontName}
//               onChange={(e) => setNewFrontName(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//             <input
//               placeholder="Front Designation"
//               value={newFrontDesignation}
//               onChange={(e) => setNewFrontDesignation(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//           </div>

//           {!syncBothSides && (
//             <div style={{ border: '1px dashed #b71c1c', background: '#fff5f5', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
//               <small style={{ color: '#b71c1c', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Back Side Custom Details:</small>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
//                 <input
//                   placeholder="Back Name"
//                   value={newBackName}
//                   onChange={(e) => setNewBackName(e.target.value)}
//                   style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//                 />
//                 <input
//                   placeholder="Back Designation"
//                   value={newBackDesignation}
//                   onChange={(e) => setNewBackDesignation(e.target.value)}
//                   style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//                 />
//               </div>
//             </div>
//           )}

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
//             <input
//               placeholder="Project / Location"
//               value={newFrontProject}
//               onChange={(e) => setNewFrontProject(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//             <input
//               placeholder="Physical MAC (e.g. E4:52:1E:E5:6A:BA)"
//               value={newMac}
//               onChange={(e) => setNewMac(e.target.value)}
//               style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
//             />
//           </div>

//           <button
//             onClick={handleAddPlate}
//             style={{ width: '100%', background: '#b71c1c', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
//           >
//             Add to Queue
//           </button>
//         </div>
//       </div>

//       {/* Live Canvas Preview */}
//       <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fff', marginBottom: '20px', textAlign: 'center' }}>
//         <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
//           <button
//             onClick={() => setPreviewSide('front')}
//             style={{
//               padding: '6px 16px',
//               borderRadius: '20px',
//               border: 'none',
//               fontWeight: 'bold',
//               fontSize: '13px',
//               cursor: 'pointer',
//               background: previewSide === 'front' ? '#b71c1c' : '#eee',
//               color: previewSide === 'front' ? '#fff' : '#444'
//             }}
//           >
//             Preview Front Side
//           </button>
//           <button
//             onClick={() => setPreviewSide('back')}
//             style={{
//               padding: '6px 16px',
//               borderRadius: '20px',
//               border: 'none',
//               fontWeight: 'bold',
//               fontSize: '13px',
//               cursor: 'pointer',
//               background: previewSide === 'back' ? '#b71c1c' : '#eee',
//               color: previewSide === 'back' ? '#fff' : '#444'
//             }}
//           >
//             Preview Back Side
//           </button>
//         </div>

//         <small style={{ color: '#777', display: 'block', marginBottom: '10px' }}>
//           Viewing: <strong>{previewSide.toUpperCase()}</strong> | Name: <strong>{previewSide === 'front' ? previewItem?.frontName : previewItem?.backName}</strong> | 
//           Target MAC: <strong>{previewItem?.mac || 'Unassigned'}</strong>
//         </small>

//         <div style={{ display: 'inline-block', border: '2px solid #444', borderRadius: '4px', background: '#fff', maxWidth: '640px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//           <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
//         </div>
//       </div>

//       {/* Queue Table with Fully Automatic Batch Controls */}
//       <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
//         <div style={{ padding: '14px 18px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
//           <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Deployment Queue ({plates.length} Plates)</span>

//           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//             <button
//               type="button"
//               onClick={handlePairNewDevice}
//               style={{
//                 background: '#1976d2',
//                 color: '#fff',
//                 border: 'none',
//                 padding: '9px 18px',
//                 borderRadius: '20px',
//                 fontSize: '13px',
//                 fontWeight: 'bold',
//                 cursor: 'pointer',
//                 boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
//               }}
//             >
//               + Pair New Plate
//             </button>

//             <button
//               onClick={runSequentialQueue}
//               disabled={isQueueRunning || plates.length === 0}
//               style={{
//                 background: isQueueRunning ? '#aaa' : '#2e7d32',
//                 color: '#fff',
//                 border: 'none',
//                 padding: '9px 22px',
//                 borderRadius: '20px',
//                 fontSize: '14px',
//                 fontWeight: 'bold',
//                 cursor: isQueueRunning ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {isQueueRunning ? 'Running Automatic Batch Update...' : 'Start Batch Update (All Line-by-Line)'}
//             </button>
//           </div>
//         </div>

//         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//           <thead>
//             <tr style={{ background: '#fafafa', borderBottom: '2px solid #eee', fontSize: '13px', color: '#666' }}>
//               <th style={{ padding: '12px' }}>#</th>
//               <th style={{ padding: '12px' }}>Front Display</th>
//               <th style={{ padding: '12px' }}>Back Display</th>
//               <th style={{ padding: '12px' }}>Project</th>
//               <th style={{ padding: '12px' }}>Physical MAC Address</th>
//               <th style={{ padding: '12px' }}>Status</th>
//               <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {plates.map((plate, idx) => {
//               const isEditing = editingId === plate.id;
//               return (
//                 <tr
//                   key={plate.id}
//                   onClick={() => !isEditing && setPreviewItem(plate)}
//                   style={{
//                     borderBottom: '1px solid #eee',
//                     background: activeIdx === idx ? '#fffde7' : previewItem?.id === plate.id ? '#f5f5f5' : '#fff',
//                     cursor: isEditing ? 'default' : 'pointer'
//                   }}
//                 >
//                   <td style={{ padding: '12px', fontSize: '14px' }}>{idx + 1}</td>

//                   <td style={{ padding: '12px' }}>
//                     {isEditing ? (
//                       <div>
//                         <input
//                           value={editFormData.frontName}
//                           onChange={(e) => handleEditFieldChange('frontName', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '13px', marginBottom: '4px', border: '1px solid #b71c1c', borderRadius: '4px' }}
//                         />
//                         <input
//                           value={editFormData.frontDesignation}
//                           onChange={(e) => handleEditFieldChange('frontDesignation', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                       </div>
//                     ) : (
//                       <div>
//                         <span style={{ fontWeight: isBold ? 'bold' : 'normal', fontSize: '14px' }}>{plate.frontName}</span>
//                         <small style={{ display: 'block', color: '#666' }}>{plate.frontDesignation || '-'}</small>
//                       </div>
//                     )}
//                   </td>

//                   <td style={{ padding: '12px' }}>
//                     {isEditing ? (
//                       <div>
//                         <input
//                           value={editFormData.backName}
//                           onChange={(e) => handleEditFieldChange('backName', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '13px', marginBottom: '4px', border: '1px solid #b71c1c', borderRadius: '4px' }}
//                         />
//                         <input
//                           value={editFormData.backDesignation}
//                           onChange={(e) => handleEditFieldChange('backDesignation', e.target.value)}
//                           style={{ padding: '4px', width: '90%', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                       </div>
//                     ) : (
//                       <div>
//                         <span style={{ fontWeight: isBold ? 'bold' : 'normal', fontSize: '14px' }}>{plate.backName}</span>
//                         <small style={{ display: 'block', color: '#666' }}>{plate.backDesignation || '-'}</small>
//                       </div>
//                     )}
//                   </td>

//                   <td style={{ padding: '12px', fontSize: '14px', color: '#555' }}>
//                     {isEditing ? (
//                       <input
//                         value={editFormData.frontProject}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           const updated = { ...editFormData, frontProject: val, backProject: val };
//                           setEditFormData(updated);
//                           setPreviewItem({ ...previewItem, ...updated });
//                         }}
//                         style={{ padding: '5px', width: '90%', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
//                       />
//                     ) : (
//                       plate.frontProject || '-'
//                     )}
//                   </td>

//                   <td style={{ padding: '12px', fontSize: '13px' }}>
//                     {isEditing ? (
//                       <input
//                         value={editFormData.mac}
//                         onChange={(e) => handleEditFieldChange('mac', e.target.value)}
//                         style={{ padding: '5px', width: '90%', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
//                       />
//                     ) : (
//                       <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1565c0' }}>
//                         {plate.mac || 'Unassigned'}
//                       </span>
//                     )}
//                   </td>

//                   <td style={{
//                     padding: '12px',
//                     fontWeight: 'bold',
//                     fontSize: '13px',
//                     color: plate.status === 'Updated' ? '#2e7d32' : plate.status.includes('Failed') ? '#c62828' : '#e65100'
//                   }}>
//                     {plate.status}
//                   </td>

//                   <td style={{ padding: '12px', textAlign: 'center' }}>
//                     {isEditing ? (
//                       <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
//                         <button
//                           onClick={() => handleSaveEdit(plate.id)}
//                           style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
//                         >
//                           Save
//                         </button>
//                         <button
//                           onClick={handleCancelEdit}
//                           style={{ background: '#757575', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleEditClick(plate);
//                           }}
//                           disabled={isQueueRunning}
//                           style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             updateSingleDevice(plate, idx);
//                           }}
//                           disabled={isQueueRunning}
//                           style={{ background: '#b71c1c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
//                         >
//                           Update
//                         </button>
//                       </div>
//                     )}
//                   </td>

//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }










































































































import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

// import './NamePlateManager.css';

// Hardware Protocol Constants (ESL 7.50 DDS)
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const CHAR_UUID = '0000fff5-0000-1000-8000-00805f9b34fb';
const PACKET_SIZE = 200; // 200 bytes per chunk


// Component function ke bahar define karein (Clean & Reusable)
const DEFAULT_PLATE = {
  id: 1,
  frontName: 'Rahul Thakur',
  frontDesignation: 'Full Stack Developer',
  frontProject: 'Ghaziabad',
  backName: 'Rahul Thakur',
  backDesignation: 'Full Stack Developer',
  backProject: 'Ghaziabad',
  mac: 'E4:52:1E:E5:6A:BA',
  status: 'Pending'
};


export default function NamePlateManager({ onLogout }) {




  // 1. Pehle State declare karein
  const [plates, setPlates] = useState([DEFAULT_PLATE]);

  // Synchronous State References
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
  // ... baaki saari states yahan rahengi ...

  // 2. States declare hone ke baad Delete aur Clear functions likhein:

  // Saari added plates clear karna (Sirf default plate bachegi)
  const handleClearQueue = () => {
    if (plates.length <= 1) return;
    const confirmClear = window.confirm("Do you want to clear all added plates?");
    if (!confirmClear) return;

    setPlates([DEFAULT_PLATE]);
    setPreviewItem(DEFAULT_PLATE);
    setGlobalStatus('Queue cleared. Default plate preserved.');
  };

  // Single specific row delete karna
  const handleDeletePlate = (id) => {
    if (id === DEFAULT_PLATE.id) {
      alert("Default plate ko delete nahi kiya ja sakta.");
      return;
    }
    const updated = plates.filter((p) => p.id !== id);
    setPlates(updated);
    if (previewItem?.id === id) {
      setPreviewItem(updated[0] || DEFAULT_PLATE);
    }
    setGlobalStatus('Plate removed from queue.');
  };




  // Row 1 (Master) ka text baki sabhi plates par sync karna bina MAC chhede
  const handleApplyMasterToAll = () => {
    if (plates.length <= 1) {
      alert("Queue me 1 se zyada plates honi chahiye.");
      return;
    }

    const master = plates[0];
    const confirmSync = window.confirm(
      `Do you want to apply the text from Row 1 ("${master.frontName}") to all the remaining ${plates.length - 1} devices?`
    );
    if (!confirmSync) return;

    const synced = plates.map((plate, idx) => {
      if (idx === 0) return plate;
      return {
        ...plate,
        frontName: master.frontName,
        frontDesignation: master.frontDesignation,
        frontProject: master.frontProject,
        backName: master.backName,
        backDesignation: master.backDesignation,
        backProject: master.backProject,
        mac: plate.mac, // 👈 Target hardware MAC safe rahega
        status: plate.status === 'Updated' ? 'Pending' : plate.status
      };
    });

    setPlates(synced);
    setGlobalStatus(`Row 1 details synced to all ${plates.length} plates. Ready to update.`);
  };



  // Live Bluetooth Hardware Mapping
  // const [deviceMap, setDeviceMap] = useState({});

  // Form States (Front & Back)
  // const [syncBothSides, setSyncBothSides] = useState(true);
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
  const [textCaseChoice, setTextCaseChoice] = useState('uppercase'); // 'uppercase' | 'propercase'
  const [textColorChoice, setTextColorChoice] = useState('#000000');
  const [bgColorChoice, setBgColorChoice] = useState('#FFFFFF');

  // Sidebar Graphics: Photo & QR
  const [showLogo, setShowLogo] = useState(false);
  const [logoImageObj, setLogoImageObj] = useState(null);

  const [showQr, setShowQr] = useState(false);
  const [qrMode, setQrMode] = useState('upload'); // 'upload' or 'text'
  const [qrImageObj, setQrImageObj] = useState(null);
  const [qrText, setQrText] = useState('https://company.com');
  const [qrCanvasElement, setQrCanvasElement] = useState(null);

  // Edit Row States
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

  // Preview States
  const [previewSide, setPreviewSide] = useState('front');
  const [previewItem, setPreviewItem] = useState(plates[0]);

  // Queue & Transmission States
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [globalStatus, setGlobalStatus] = useState('Ready for deployment');
  const [waitingForGestureIdx, setWaitingForGestureIdx] = useState(null);

  const canvasRef = useRef(null);

  // Helper: Text Case Formatter (UPPERCASE vs Proper Case)
  const formatTextCase = (str) => {
    if (!str) return '';
    const clean = String(str).trim();
    if (textCaseChoice === 'uppercase') {
      return clean.toUpperCase();
    }
    return clean.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // QR Canvas Generator
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
        width: 150, // 👈 120 se badha kar 150 kiya
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

  // 1. High Resolution Canvas Renderer
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

    // Large Photo (140x175)

    const photoWidth = 140;
    const photoHeight = 175;
    const photoX = 20;
    const photoY = 25;

    if (showLogo && logoImageObj) {
      try {
        ctx.save();
        ctx.strokeStyle = txtColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4);
        ctx.drawImage(logoImageObj, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
      } catch (err) { }
    }

    // QR Size ko 120 se badha kar 150x150 kiya
    const qrSize = 150;
    const qrX = 800 - qrSize - 20; // Screen ke right edge se 35px padding
    const qrY = 30; // Top se photo ke barabar alignment (30px)

    if (showQr) {
      try {
        if (qrMode === 'upload' && qrImageObj) {
          ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
        } else if (qrMode === 'text' && qrCanvasElement) {
          ctx.drawImage(qrCanvasElement, qrX, qrY, qrSize, qrSize);
        }
      } catch (err) { }
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
    let MAX_WIDTH = 740;

    if (hasLeftGraphic && hasRightGraphic) {
      MAX_WIDTH = 420;
      textCenterX = 400;
    } else if (hasLeftGraphic) {
      MAX_WIDTH = 560;
      textCenterX = 490;
    } else if (hasRightGraphic) {
      MAX_WIDTH = 560;
      textCenterX = 310;
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
      // Auto-Fit Calculation:
      if (!subText) {
        // Agar subtitle nahi hai: Single short word (jaise Rahul) ke liye 170px tak bada font
        if (nameLines.length === 1) {
          nameFontSize = cleanName.length <= 6 ? 170 : 135;
        } else {
          nameFontSize = 85;
        }
      } else {
        // Agar subtitle/designation maujood hai
        nameFontSize = nameLines.length > 1 ? 68 : 95;
        subFontSize = 38;
      }
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

  // 2. Pure Color Clamping Payload Generator
  const renderSingleScreenBytes = (sideItem) => {
    const WIDTH = 800;
    const HEIGHT = 480;
    const TOTAL_PIXELS = WIDTH * HEIGHT;
    const PHOTO = { x: 20, y: 25, w: 140, h: 175 };

    const getColorCode = (hex) => {
      const normalized = (hex || '').trim().toUpperCase();
      if (normalized === '#D32F2F') return 3;
      if (normalized === '#FBC02D') return 2;
      if (normalized === '#FFFFFF') return 1;
      return 0;
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

        // QR Code Zone check (Right-top corner: 150x150 + margin)
        const isPureBlack = (r < 60 && g < 60 && b < 60);
        if (showQr && (x >= 800 - 190) && (y <= 190)) {
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

  // 3. Excel Parser
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
          alert('Excel sheet is empty!');
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

          return {
            id: Date.now() + idx,
            frontName: fName,
            frontDesignation: fDesig,
            frontProject: fProj,
            backName: bName,
            backDesignation: bDesig,
            backProject: bProj,
            mac: devMac.toUpperCase(),
            status: 'Pending'
          };
        }).filter((item) => item.frontName.length > 0);

        if (formatted.length === 0) {
          alert('Could not detect Employee Name column in Excel file.');
          return;
        }

        setPlates(formatted);
        setPreviewItem(formatted[0]);
        setGlobalStatus(`Loaded ${formatted.length} plates successfully.`);
      } catch (err) {
        alert('File read error: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Add Single Entry
  const handleAddPlate = () => {
    if (!newFrontName.trim()) return;

    const newPlate = {
      id: Date.now(),
      frontName: newFrontName.trim(),
      frontDesignation: newFrontDesignation.trim(),
      frontProject: newFrontProject.trim(),
      backName: syncBothSides ? newFrontName.trim() : (newBackName.trim() || newFrontName.trim()),
      backDesignation: syncBothSides ? newFrontDesignation.trim() : newBackDesignation.trim(),
      backProject: syncBothSides ? newFrontProject.trim() : newBackProject.trim(),
      mac: newMac.trim().toUpperCase(),
      status: 'Pending'
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

  // Dedicated Pair Handler
  const handlePairNewDevice = async () => {
    try {
      setGlobalStatus('Scanning for ESL devices... Select plate to pair.');
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'DDS' },
          { namePrefix: 'ESL' }
        ],
        optionalServices: [SERVICE_UUID]
      });

      const devName = device.name || 'DDS-Device';

      setPlates((prev) => {
        const targetIdx = prev.findIndex((p) => !p.mac || p.mac.trim() === '' || !deviceMap[p.mac]);
        if (targetIdx !== -1) {
          const targetMac = prev[targetIdx].mac || devName;

          setDeviceMap((dMap) => ({
            ...dMap,
            [targetMac.toUpperCase()]: device,
            [device.id]: device
          }));

          localStorage.setItem(`ble_mac_${targetMac.toUpperCase()}`, device.id);
          setGlobalStatus(`Device "${devName}" paired & locked to ${targetMac}.`);

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
    const data = {
      frontName: plate.frontName,
      frontDesignation: plate.frontDesignation,
      frontProject: plate.frontProject,
      backName: plate.backName,
      backDesignation: plate.backDesignation,
      backProject: plate.backProject,
      mac: plate.mac
    };
    setEditFormData(data);
    setPreviewItem(plate);
  };

  const handleEditFieldChange = (field, value) => {
    const updatedForm = { ...editFormData, [field]: value };
    setEditFormData(updatedForm);
    setPreviewItem({ ...previewItem, ...updatedForm });
  };

  const handleSaveEdit = (id) => {
    setPlates((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...editFormData, status: 'Pending' } : p
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

  // Transmission Engine
  const updateSingleDevice = async (plate, index) => {
    setActiveIdx(index);
    setPreviewItem(plate);
    const targetMac = (plate.mac || '').trim().toUpperCase();
    setGlobalStatus(`Updating [${index + 1}/${plates.length}]: "${plate.frontName}" | MAC: ${targetMac}...`);

    setPlates((prev) =>
      prev.map((p, i) => (i === index ? { ...p, status: 'Connecting...' } : p))
    );

    let device = null;
    let server = null;

    try {
      if (deviceMap[targetMac]) {
        device = deviceMap[targetMac];
      }

      if (!device && navigator.bluetooth && navigator.bluetooth.getDevices) {
        try {
          const knownDevices = await navigator.bluetooth.getDevices();
          const savedId = localStorage.getItem(`ble_mac_${targetMac}`);

          if (savedId) {
            device = knownDevices.find((d) => d.id === savedId);
          }
          if (!device && knownDevices[index]) {
            device = knownDevices[index];
          }
        } catch (e) { }
      }

      if (!device) {
        device = await navigator.bluetooth.requestDevice({
          filters: [
            { namePrefix: 'DDS' },
            { namePrefix: 'ESL' }
          ],
          optionalServices: [SERVICE_UUID]
        });

        if (targetMac) {
          setDeviceMap((dMap) => ({ ...dMap, [targetMac]: device }));
          localStorage.setItem(`ble_mac_${targetMac}`, device.id);
        }
      }

      if (device.gatt && device.gatt.connected) {
        try {
          await device.gatt.disconnect();
          await new Promise((r) => setTimeout(r, 400));
        } catch (e) { }
      }

      try {
        server = await device.gatt.connect();
      } catch (connErr) {
        await new Promise((r) => setTimeout(r, 1000));
        server = await device.gatt.connect();
      }

      if (!server || !server.connected) {
        throw new Error('Device BLE radio asleep or out of range.');
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

      await new Promise((r) => setTimeout(r, 1200));

      if (device.gatt && device.gatt.connected) {
        await device.gatt.disconnect();
      }

      await new Promise((r) => setTimeout(r, 800));

      setPlates((prev) =>
        prev.map((p, i) => (i === index ? { ...p, status: 'Updated' } : p))
      );
      return true;

    } catch (err) {
      console.error(`Error on device ${index}:`, err);
      if (device?.gatt?.connected) {
        try {
          await device.gatt.disconnect();
        } catch (dcErr) { }
      }
      setPlates((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, status: `Failed: ${err.message}` } : p
        )
      );
      return false;
    }
  };

  // Queue Handlers
  const triggerNextBatchItem = async (index) => {
    setWaitingForGestureIdx(null);
    const success = await updateSingleDevice(plates[index], index);

    if (success) {
      const nextIdx = plates.findIndex((p, i) => i > index && p.status !== 'Updated');
      if (nextIdx !== -1) {
        setWaitingForGestureIdx(nextIdx);
        setGlobalStatus(`Ready for [${nextIdx + 1}/${plates.length}]: "${plates[nextIdx].frontName}" (MAC: ${plates[nextIdx].mac}). Press SPACEBAR.`);
      } else {
        setIsQueueRunning(false);
        setActiveIdx(-1);
        setGlobalStatus('All plates in queue updated successfully!');
      }
    } else {
      setIsQueueRunning(false);
      setActiveIdx(-1);
    }
  };

  const runSequentialQueue = async () => {
    setIsQueueRunning(true);
    const firstPendingIdx = plates.findIndex((p) => p.status !== 'Updated');

    if (firstPendingIdx !== -1) {
      await triggerNextBatchItem(firstPendingIdx);
    } else {
      setIsQueueRunning(false);
      setGlobalStatus('All nameplates are already marked as Updated.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.code === 'Space' && waitingForGestureIdx !== null) {
        e.preventDefault();
        triggerNextBatchItem(waitingForGestureIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForGestureIdx, plates]);

  return (

    <div style={{ maxWidth: '1280px', margin: '0 auto', fontFamily: 'Segoe UI, Roboto, sans-serif', padding: '8px 16px 20px 16px' }}>

      {/* Centered Title Header with Absolute Right Badge */}



{/* 
      <div style={{
        background: '#b71c1c',
        color: '#fff',
        padding: '18px 24px',
        borderRadius: '8px',
        position: 'relative',
        textAlign: 'center',
        marginBottom: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', letterSpacing: '0.5px', fontWeight: 'bold' }}>
          ESL Gateway - Automated Nameplate System
        </h2>
        <small style={{ color: '#ffcdd2', fontSize: '13px', display: 'block' }}>
          Hardware: ESL 7.50 DDS (Dual-Sided 192KB Pipeline)
        </small>

        <span style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          background: 'rgba(255,255,255,0.25)',
          padding: '6px 14px',
          borderRadius: '16px',
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          MERN & BLE
        </span>
      </div> */}


      {/* Responsive Header Box (Pure Inline CSS - No External CSS Needed) */}
      <div style={{
        background: '#b71c1c',
        color: '#ffffff',
        padding: '18px 24px',
        borderRadius: '8px',
        position: 'relative',
        textAlign: 'center',
        marginBottom: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', letterSpacing: '0.5px', fontWeight: 'bold' }}>
          ESL Gateway - Automated Nameplate System
        </h2>
        <small style={{ color: '#ffcdd2', fontSize: '13px', display: 'block' }}>
          Hardware: ESL 7.50 DDS (Dual-Sided 192KB Pipeline)
        </small>

        {/* Right Corner: MERN & BLE Badge + Sign Out Button */}
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            fontSize: '12px',
            background: 'rgba(255, 255, 255, 0.25)',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            MERN & BLE
          </span>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign out of ESL Gateway"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '9px 20px',
                borderRadius: '22px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#b71c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              Sign Out ⎋
            </button>
          )}
        </div>
      </div>



      

      {/* Global Status Alert */}
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

      {/* Spacebar Action Banner */}
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
              👉 Next Device Ready: "{plates[waitingForGestureIdx].frontName}"
            </span>
            <small style={{ color: '#455a64' }}>
              Item #{waitingForGestureIdx + 1} of {plates.length} | Target MAC: <strong>{plates[waitingForGestureIdx].mac}</strong>
            </small>
          </div>

          <button
            type="button"
            onClick={() => triggerNextBatchItem(waitingForGestureIdx)}
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
            Update Next (Press SPACEBAR)
          </button>
        </div>
      )}

      {/* 2-Column Responsive Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ======================================================== */}
        {/* ◀ LEFT SIDEBAR: ALL FORMATTING & GRAPHICS CONTROLS */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Card 1: Text & Style Formatting */}
          <div style={{ background: '#fff', border: '1px solid #dcdcdc', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#b71c1c', borderBottom: '2px solid #ffebee', paddingBottom: '6px' }}>
              🎨 Text & Display Style
            </h3>

            {/* Letter Case */}
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

            {/* Bold & Font Size in one row */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '10px', marginBottom: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                  Style:
                </label>
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
                  <option value="auto">Auto-Fit (Smart Full Screen)</option>
                  <option value="60">60 px</option>
                  <option value="75">75 px</option>
                  <option value="90">90 px</option>
                  <option value="110">110 px</option>
                  <option value="125">125 px</option>
                  <option value="145">145 px (Large)</option>
                  <option value="165">165 px (X-Large)</option>
                  <option value="190">190 px (Jumbo Single Name)</option>
                </select>
              </div>
            </div>

            {/* Text Color */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                Text Color:
              </label>
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

            {/* Background Color */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                Background Color:
              </label>
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

          {/* Card 3: QR Code Generator */}
          <div style={{ background: '#f9fbe7', border: '1px solid #c0ca33', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🏁 QR Code (Top-Right: 150x150)
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
                onChange={handleQrUpload}
                disabled={!showQr}
                style={{ width: '100%', fontSize: '12px' }}
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

        {/* ======================================================== */}
        {/* ▶ RIGHT MAIN AREA: INPUTS, LIVE PREVIEW & TABLE */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Top Inputs: Excel Upload & Single Add */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '16px' }}>

            <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#222' }}>1. Upload Excel / CSV</h3>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
                Auto-Detects: Employee Name, Designation, Project, MAC
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

            {/* <small style={{ color: '#777', display: 'block', marginBottom: '10px' }}>
              Viewing: <strong>{previewSide.toUpperCase()}</strong> | Name: <strong>{formatTextCase(previewSide === 'front' ? previewItem?.frontName : previewItem?.backName)}</strong> |
              Target MAC: <strong>{previewItem?.mac || 'Unassigned'}</strong>
            </small> */}

            <div style={{ display: 'inline-block', border: '2px solid #444', borderRadius: '4px', background: '#fff', maxWidth: '640px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>

          {/* Deployment Queue Table */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '14px 18px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Deployment Queue ({plates.length} Plates)</span>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>



                <button
                  type="button"
                  onClick={handleApplyMasterToAll}
                  disabled={isQueueRunning || plates.length <= 1}
                  style={{
                    background: plates.length > 1 ? '#ff9800' : '#e0e0e0',
                    color: plates.length > 1 ? '#fff' : '#9e9e9e',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: plates.length > 1 && !isQueueRunning ? 'pointer' : 'not-allowed',
                    boxShadow: plates.length > 1 ? '0 2px 4px rgba(255, 152, 0, 0.2)' : 'none'
                  }}
                >
                  Sync Row 1 to All
                </button>




                {/* Clear Button: Sirf tabhi active hoga jab 1 se zyada plates hon */}
                <button
                  type="button"
                  onClick={handleClearQueue}
                  disabled={isQueueRunning || plates.length <= 1}
                  style={{
                    background: plates.length > 1 ? '#d32f2f' : '#e0e0e0',
                    color: plates.length > 1 ? '#fff' : '#9e9e9e',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: plates.length > 1 && !isQueueRunning ? 'pointer' : 'not-allowed',
                    boxShadow: plates.length > 1 ? '0 2px 4px rgba(211, 47, 47, 0.2)' : 'none'
                  }}
                >
                  Clear Added Plates
                </button>










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

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                              onClick={() => handleSaveEdit(plate.id)}
                              style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{ background: '#757575', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
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
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSingleDevice(plate, idx);
                              }}
                              disabled={isQueueRunning}
                              style={{ background: '#008000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Update
                            </button>

                            {/* Row Delete Button (Row 1 / ID 1 ke liye hide/disable rahega) */}
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePlate(plate.id);
                                }}
                                disabled={isQueueRunning}
                                title="Delete this row"
                                style={{
                                  background: '#b71c1c',
                                  color: '#fff',
                                  border: '1px solid #d32f2f',
                                  padding: '5px 8px',
                                  borderRadius: '14px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                Delete
                              </button>
                            )}








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