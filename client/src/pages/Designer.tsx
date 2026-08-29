import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { jsPDF } from "jspdf";
import {
  Armchair,
  Box,
  CircleDot,
  Download,
  Droplets,
  FileText,
  Flower2,
  Gauge,
  Globe2,
  Grid3X3,
  Layers3,
  Lightbulb,
  Link2,
  Map as MapIcon,
  Maximize2,
  MousePointer2,
  PencilRuler,
  Plus,
  Ruler,
  Save,
  Share2,
  Sprout,
  Trash2,
  TreePine,
  Waves,
  X,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PlatformShell } from "@/components/PlatformShell";

type DesignMode = "landscape" | "irrigation";
type ViewMode = "2d" | "3d";
type Tool = "select" | "measure";
type ElementKind =
  | "tree"
  | "shrub"
  | "flower"
  | "bench"
  | "fountain"
  | "path"
  | "sprinkler"
  | "dripLine"
  | "pump"
  | "tank"
  | "valve"
  | "light";
type Point = { x: number; y: number };
type DesignElement = Point & { id: string; kind: ElementKind; quantity: number; rotation: number };
type Measurement = { id: string; start: Point; end: Point; distance: number };
type SavedProject = {
  id: string;
  title: string;
  updatedAt: string;
  mode: DesignMode;
  siteWidth: string;
  siteLength: string;
  elements: DesignElement[];
  measurements: Measurement[];
};

type LibraryItem = {
  kind: ElementKind;
  group: "landscape" | "irrigation" | "decor";
  ar: string;
  en: string;
  unitAr: string;
  unitEn: string;
  defaultQuantity: number;
  unitCost: number;
  color: string;
  icon: LucideIcon;
};

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 420;
const STORAGE_KEY = "al-qadri-designer-projects";

const LIBRARY: LibraryItem[] = [
  { kind: "tree", group: "landscape", ar: "شجرة", en: "Tree", unitAr: "شتلة", unitEn: "plant", defaultQuantity: 1, unitCost: 15, color: "#3d8a4d", icon: TreePine },
  { kind: "shrub", group: "landscape", ar: "شجيرة", en: "Shrub", unitAr: "نبتة", unitEn: "plant", defaultQuantity: 1, unitCost: 6, color: "#73a943", icon: Sprout },
  { kind: "flower", group: "landscape", ar: "زهور", en: "Flower bed", unitAr: "م²", unitEn: "m²", defaultQuantity: 4, unitCost: 3, color: "#d98c9e", icon: Flower2 },
  { kind: "bench", group: "decor", ar: "مقعد", en: "Bench", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 45, color: "#8c6f52", icon: Armchair },
  { kind: "fountain", group: "decor", ar: "نافورة", en: "Fountain", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 250, color: "#35a7c9", icon: Waves },
  { kind: "path", group: "landscape", ar: "ممر", en: "Path", unitAr: "م²", unitEn: "m²", defaultQuantity: 8, unitCost: 1, color: "#aaa58d", icon: MapIcon },
  { kind: "sprinkler", group: "irrigation", ar: "رشاش", en: "Sprinkler", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 12, color: "#3989b1", icon: CircleDot },
  { kind: "dripLine", group: "irrigation", ar: "خط تنقيط", en: "Drip line", unitAr: "متر", unitEn: "m", defaultQuantity: 10, unitCost: 0.8, color: "#2d8fa4", icon: Droplets },
  { kind: "pump", group: "irrigation", ar: "مضخة", en: "Pump", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 180, color: "#52697b", icon: Gauge },
  { kind: "tank", group: "irrigation", ar: "خزان", en: "Water tank", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 220, color: "#477b91", icon: Box },
  { kind: "valve", group: "irrigation", ar: "محبس", en: "Valve", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 8, color: "#6a8290", icon: Layers3 },
  { kind: "light", group: "decor", ar: "إنارة", en: "Garden light", unitAr: "قطعة", unitEn: "pcs", defaultQuantity: 1, unitCost: 9, color: "#e3b553", icon: Lightbulb },
];

const defaultElements: DesignElement[] = [
  { id: "tree-1", kind: "tree", x: 110, y: 105, quantity: 1, rotation: 0 },
  { id: "tree-2", kind: "tree", x: 500, y: 100, quantity: 1, rotation: 0 },
  { id: "shrub-1", kind: "shrub", x: 180, y: 315, quantity: 1, rotation: 0 },
  { id: "fountain-1", kind: "fountain", x: 315, y: 210, quantity: 1, rotation: 0 },
  { id: "path-1", kind: "path", x: 450, y: 275, quantity: 8, rotation: -18 },
];

function makeId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function libraryItem(kind: ElementKind) {
  return LIBRARY.find(item => item.kind === kind) || LIBRARY[0];
}

function labelFor(kind: ElementKind, language: "ar" | "en") {
  const item = libraryItem(kind);
  return language === "ar" ? item.ar : item.en;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character] || character);
}

function elementSvg(element: DesignElement) {
  const item = libraryItem(element.kind);
  const quantity = element.quantity > 1 ? `<text x="0" y="34" text-anchor="middle" font-size="12" font-family="Arial" font-weight="700" fill="#35530e">×${element.quantity}</text>` : "";
  let shape = "";
  switch (element.kind) {
    case "tree":
      shape = `<rect x="-4" y="5" width="8" height="28" rx="3" fill="#80572d"/><circle cx="0" cy="-10" r="27" fill="#3d8a4d"/><circle cx="-16" cy="0" r="18" fill="#5ea84d"/><circle cx="15" cy="1" r="17" fill="#2f7841"/>`;
      break;
    case "shrub":
      shape = `<circle cx="0" cy="0" r="23" fill="#73a943"/><circle cx="-11" cy="-7" r="14" fill="#8abb58"/><circle cx="13" cy="-5" r="13" fill="#5d963b"/>`;
      break;
    case "flower":
      shape = `<circle cx="0" cy="0" r="22" fill="#cce49a"/>${[-12, 0, 12].map((x, index) => `<circle cx="${x}" cy="${index % 2 ? 8 : -6}" r="5" fill="${index % 2 ? "#d86f92" : "#f2b45a"}"/>`).join("")}`;
      break;
    case "bench":
      shape = `<rect x="-28" y="-12" width="56" height="9" rx="3" fill="#8c6f52"/><rect x="-26" y="0" width="52" height="7" rx="3" fill="#9e805f"/><path d="M-19 7L-23 22M19 7L23 22" stroke="#4c5a53" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case "fountain":
      shape = `<ellipse cx="0" cy="12" rx="37" ry="16" fill="#4d9fb8"/><ellipse cx="0" cy="8" rx="29" ry="11" fill="#8ed9e1"/><path d="M0 6C0-9-3-18 0-31C4-18 1-9 0 6" fill="#55bede"/><circle cx="0" cy="-32" r="4" fill="#67d2e8"/>`;
      break;
    case "path":
      shape = `<rect x="-45" y="-9" width="90" height="18" rx="8" fill="#aaa58d"/><path d="M-29 0H29" stroke="#d6d0ae" stroke-width="2" stroke-dasharray="6 7"/>`;
      break;
    case "sprinkler":
      shape = `<circle cx="0" cy="0" r="7" fill="#3989b1"/><path d="M0-10C0-38-24-35-25-18M10-4C35-18 42 7 24 17M-8-4C-29-18-42 8-23 17" fill="none" stroke="#61c5dc" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case "dripLine":
      shape = `<path d="M-42 0C-20-16 20 16 42 0" fill="none" stroke="#2d8fa4" stroke-width="7" stroke-linecap="round"/><circle cx="-22" cy="-5" r="3" fill="#b0edf1"/><circle cx="0" cy="4" r="3" fill="#b0edf1"/><circle cx="22" cy="5" r="3" fill="#b0edf1"/>`;
      break;
    case "pump":
      shape = `<rect x="-25" y="-20" width="50" height="40" rx="8" fill="#52697b"/><circle cx="0" cy="0" r="12" fill="#d0e1e4"/><path d="M0-8L7 0L0 8L-7 0Z" fill="#3989b1"/>`;
      break;
    case "tank":
      shape = `<ellipse cx="0" cy="-18" rx="22" ry="8" fill="#72b8c8"/><rect x="-22" y="-18" width="44" height="36" fill="#477b91"/><ellipse cx="0" cy="18" rx="22" ry="8" fill="#37687c"/><path d="M-4-26V-39H9" stroke="#52697b" stroke-width="5" fill="none"/>`;
      break;
    case "valve":
      shape = `<path d="M0-22L22 0L0 22L-22 0Z" fill="#6a8290"/><circle cx="0" cy="0" r="7" fill="#d5e4e5"/><path d="M-30 0H30" stroke="#6a8290" stroke-width="5"/>`;
      break;
    case "light":
      shape = `<path d="M-8 5H8L5 25H-5Z" fill="#637451"/><circle cx="0" cy="-5" r="17" fill="#f3ca62" opacity=".36"/><circle cx="0" cy="-5" r="7" fill="#f8d96f"/>`;
      break;
  }
  return `<g transform="translate(${element.x} ${element.y}) rotate(${element.rotation})">${shape}${quantity}</g>`;
}

function buildSvg(title: string, elements: DesignElement[], measurements: Measurement[]) {
  const measurementSvg = measurements.map(measurement => `<g><line x1="${measurement.start.x}" y1="${measurement.start.y}" x2="${measurement.end.x}" y2="${measurement.end.y}" stroke="#c46d4b" stroke-width="2" stroke-dasharray="7 5"/><circle cx="${measurement.start.x}" cy="${measurement.start.y}" r="4" fill="#c46d4b"/><circle cx="${measurement.end.x}" cy="${measurement.end.y}" r="4" fill="#c46d4b"/><text x="${(measurement.start.x + measurement.end.x) / 2}" y="${(measurement.start.y + measurement.end.y) / 2 - 8}" text-anchor="middle" font-size="12" font-family="Arial" font-weight="700" fill="#9b4c31">${measurement.distance.toFixed(1)} m</text></g>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"><defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#dfe9d4" stroke-width="1"/></pattern><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f8fcf2"/><stop offset="1" stop-color="#eaf3dc"/></linearGradient></defs><rect width="600" height="420" fill="url(#bg)"/><rect width="600" height="420" fill="url(#grid)"/><rect x="12" y="12" width="576" height="396" rx="22" fill="none" stroke="#a9c58e" stroke-width="3"/><text x="28" y="38" font-size="14" font-family="Arial" font-weight="700" fill="#35530e">${escapeXml(title)}</text>${elements.map(elementSvg).join("")}${measurementSvg}</svg>`;
}

function readSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as SavedProject[] : [];
  } catch {
    return [];
  }
}

function pointFromEvent(event: ReactPointerEvent<SVGSVGElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH, 18, CANVAS_WIDTH - 18),
    y: clamp(((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT, 18, CANVAS_HEIGHT - 18),
  };
}

function distanceInMeters(start: Point, end: Point, width: number, length: number) {
  return Math.hypot((end.x - start.x) * width / CANVAS_WIDTH, (end.y - start.y) * length / CANVAS_HEIGHT);
}

export default function Designer() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [mode, setMode] = useState<DesignMode>("landscape");
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [tool, setTool] = useState<Tool>("select");
  const [libraryGroup, setLibraryGroup] = useState<LibraryItem["group"]>("landscape");
  const [title, setTitle] = useState(isArabic ? "تصميم حديقة جديدة" : "New garden design");
  const [siteWidth, setSiteWidth] = useState("30");
  const [siteLength, setSiteLength] = useState("20");
  const [elements, setElements] = useState<DesignElement[]>(defaultElements);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [measureStart, setMeasureStart] = useState<Point | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(readSavedProjects);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sharedMode, setSharedMode] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  const widthMeters = Math.max(1, Number(siteWidth) || 30);
  const lengthMeters = Math.max(1, Number(siteLength) || 20);
  const area = widthMeters * lengthMeters;
  const selected = elements.find(element => element.id === selectedId);
  const filteredLibrary = LIBRARY.filter(item => item.group === libraryGroup);

  const materialRows = useMemo(() => {
    const quantities = new Map<ElementKind, number>();
    elements.forEach(element => quantities.set(element.kind, (quantities.get(element.kind) || 0) + element.quantity));
    return Array.from(quantities.entries()).map(([kind, quantity]) => {
      const item = libraryItem(kind);
      return { kind, quantity, item, total: quantity * item.unitCost };
    });
  }, [elements]);
  const estimatedCost = materialRows.reduce((sum, row) => sum + row.total, 0);
  const plantCount = elements.filter(element => ["tree", "shrub", "flower"].includes(element.kind)).reduce((sum, element) => sum + element.quantity, 0);
  const irrigationCount = elements.filter(element => ["sprinkler", "dripLine", "pump", "tank", "valve"].includes(element.kind)).reduce((sum, element) => sum + element.quantity, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProjects));
  }, [savedProjects]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#share=")) return;
    try {
      const shared = JSON.parse(decodeURIComponent(window.atob(hash.slice(7)))) as SavedProject;
      if (shared?.elements && Array.isArray(shared.elements)) {
        setTitle(shared.title || (isArabic ? "تصميم مشترك" : "Shared design"));
        setMode(shared.mode || "landscape");
        setSiteWidth(shared.siteWidth || "30");
        setSiteLength(shared.siteLength || "20");
        setElements(shared.elements);
        setMeasurements(shared.measurements || []);
        setSharedMode(true);
        toast.success(isArabic ? "تم فتح التصميم المشترك" : "Shared design opened");
      }
    } catch {
      toast.error(isArabic ? "رابط المشاركة غير صالح" : "This share link is not valid");
    }
  }, [isArabic]);

  const addElement = (kind: ElementKind, point: Point = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }) => {
    const item = libraryItem(kind);
    const element: DesignElement = { id: makeId(kind), kind, x: point.x, y: point.y, quantity: item.defaultQuantity, rotation: 0 };
    setElements(previous => [...previous, element]);
    setSelectedId(element.id);
  };

  const handleDrop = (event: React.DragEvent<SVGSVGElement>) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/x-qadri-element") as ElementKind;
    if (kind) addElement(kind, pointFromEvent(event as unknown as ReactPointerEvent<SVGSVGElement>));
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tool !== "measure") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: clamp(((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH, 18, CANVAS_WIDTH - 18), y: clamp(((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT, 18, CANVAS_HEIGHT - 18) };
    if (!measureStart) {
      setMeasureStart(point);
      toast.info(isArabic ? "اختر النقطة الثانية لإكمال القياس" : "Choose the second point to finish measuring");
      return;
    }
    const measurement = { id: makeId("measure"), start: measureStart, end: point, distance: distanceInMeters(measureStart, point, widthMeters, lengthMeters) };
    setMeasurements(previous => [...previous, measurement]);
    setMeasureStart(null);
  };

  const handleElementPointerDown = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    event.stopPropagation();
    if (tool === "measure" || sharedMode) return;
    setSelectedId(id);
    setDraggingId(id);
    event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingId || tool === "measure" || sharedMode) return;
    const point = pointFromEvent(event);
    setElements(previous => previous.map(element => element.id === draggingId ? { ...element, x: point.x, y: point.y } : element));
  };

  const handleCanvasPointerUp = () => setDraggingId(null);

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(previous => previous.filter(element => element.id !== selectedId));
    setSelectedId(null);
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setMeasureStart(null);
  };

  const autoDistribute = () => {
    if (mode === "landscape") {
      const generated: DesignElement[] = [
        ...[110, 250, 490].map((x, index) => ({ id: makeId(`tree-auto-${index}`), kind: "tree" as const, x, y: 90 + (index % 2) * 32, quantity: 1, rotation: 0 })),
        ...[150, 300, 450].map((x, index) => ({ id: makeId(`flower-auto-${index}`), kind: "flower" as const, x, y: 340 - (index % 2) * 20, quantity: 4, rotation: 0 })),
      ];
      setElements(previous => [...previous, ...generated]);
      toast.success(isArabic ? "تم توزيع النباتات تلقائيًا" : "Plants distributed automatically");
      return;
    }
    const generated: DesignElement[] = [
      ...[130, 300, 470].map((x, index) => ({ id: makeId(`sprinkler-auto-${index}`), kind: "sprinkler" as const, x, y: 125, quantity: 1, rotation: 0 })),
      ...[150, 300, 450].map((x, index) => ({ id: makeId(`drip-auto-${index}`), kind: "dripLine" as const, x, y: 270 + index * 42, quantity: Math.max(8, Math.round(widthMeters / 3)), rotation: 0 })),
    ];
    setElements(previous => [...previous, ...generated]);
    toast.success(isArabic ? "تم توزيع عناصر الشبكة تلقائيًا" : "Irrigation elements distributed automatically");
  };

  const saveProject = () => {
    const project: SavedProject = { id: currentProjectId || makeId("project"), title: title.trim() || (isArabic ? "مشروع بلا عنوان" : "Untitled project"), updatedAt: new Date().toISOString(), mode, siteWidth, siteLength, elements, measurements };
    setCurrentProjectId(project.id);
    setSavedProjects(previous => [project, ...previous.filter(item => item.id !== project.id)].slice(0, 12));
    toast.success(isArabic ? "تم حفظ التصميم على هذا الجهاز" : "Design saved on this device");
  };

  const loadProject = (project: SavedProject) => {
    setCurrentProjectId(project.id);
    setTitle(project.title);
    setMode(project.mode);
    setSiteWidth(project.siteWidth);
    setSiteLength(project.siteLength);
    setElements(project.elements);
    setMeasurements(project.measurements || []);
    setSharedMode(false);
    toast.success(isArabic ? "تم فتح المشروع" : "Project opened");
  };

  const newProject = () => {
    setCurrentProjectId(null);
    setSharedMode(false);
    setTitle(isArabic ? "تصميم حديقة جديدة" : "New garden design");
    setMode("landscape");
    setElements(defaultElements);
    setMeasurements([]);
    setSelectedId(null);
    setMeasureStart(null);
  };

  const shareProject = async () => {
    const project: SavedProject = { id: currentProjectId || makeId("shared"), title, updatedAt: new Date().toISOString(), mode, siteWidth, siteLength, elements, measurements };
    const encoded = window.btoa(encodeURIComponent(JSON.stringify(project)));
    const shareUrl = `${window.location.origin}/designer#share=${encoded}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(isArabic ? "تم نسخ رابط المشاركة" : "Share link copied");
    } catch {
      window.prompt(isArabic ? "انسخ رابط المشاركة" : "Copy the share link", shareUrl);
    }
  };

  const svgToPng = async () => {
    const svg = buildSvg(title, elements, measurements);
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    image.src = url;
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not render design")); });
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1120;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    context.fillStyle = "#f7faf2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/png");
  };

  const exportPng = async () => {
    try {
      const dataUrl = await svgToPng();
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${title.replace(/\s+/g, "-") || "qadri-design"}.png`;
      link.click();
      toast.success(isArabic ? "تم تنزيل PNG" : "PNG downloaded");
    } catch {
      toast.error(isArabic ? "تعذر تصدير PNG" : "PNG export failed");
    }
  };

  const exportPdf = async () => {
    try {
      const dataUrl = await svgToPng();
      const documentPdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      documentPdf.setTextColor(53, 83, 14);
      documentPdf.setFontSize(18);
      documentPdf.text("Al-Qadri Landscape & Irrigation Design", 14, 15);
      documentPdf.setFontSize(10);
      documentPdf.setTextColor(90, 105, 78);
      documentPdf.text(`Project: ${title || "Untitled"}`, 14, 22);
      documentPdf.text(`Type: ${mode === "landscape" ? "Landscape plan" : "Irrigation plan"}`, 14, 28);
      documentPdf.text(`Site: ${widthMeters}m x ${lengthMeters}m = ${area.toFixed(1)} m2`, 14, 34);
      documentPdf.addImage(dataUrl, "PNG", 14, 42, 174, 122);
      documentPdf.setTextColor(45, 61, 31);
      documentPdf.setFontSize(12);
      documentPdf.text("Technical summary", 202, 48);
      documentPdf.setFontSize(10);
      documentPdf.text(`Plants / softscape: ${plantCount}`, 202, 58);
      documentPdf.text(`Irrigation items: ${irrigationCount}`, 202, 66);
      documentPdf.text(`Measured lines: ${measurements.length}`, 202, 74);
      documentPdf.text(`Estimated materials: ${estimatedCost.toFixed(0)}`, 202, 82);
      documentPdf.setFontSize(12);
      documentPdf.text("Materials & quantities", 202, 98);
      documentPdf.setFontSize(9);
      materialRows.slice(0, 12).forEach((row, index) => documentPdf.text(`${index + 1}. ${row.item.en}: ${row.quantity} ${row.item.unitEn}`, 202, 107 + index * 7));
      documentPdf.setFontSize(8);
      documentPdf.setTextColor(105, 116, 91);
      documentPdf.text("Preliminary design for discussion and site verification before execution.", 14, 190);
      documentPdf.save(`${title.replace(/\s+/g, "-") || "qadri-design"}.pdf`);
      toast.success(isArabic ? "تم تنزيل التقرير PDF" : "PDF report downloaded");
    } catch {
      toast.error(isArabic ? "تعذر تصدير PDF" : "PDF export failed");
    }
  };

  const renderElement = (element: DesignElement) => {
    const item = libraryItem(element.kind);
    const isSelected = element.id === selectedId;
    const label = isArabic ? item.ar : item.en;
    return <g key={element.id} transform={`translate(${element.x} ${element.y}) rotate(${element.rotation})`} onPointerDown={event => handleElementPointerDown(event, element.id)} className={cn(tool === "select" && !sharedMode ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair")}><title>{label}</title>{element.kind === "tree" && <><rect x="-4" y="5" width="8" height="28" rx="3" fill="#80572d" /><circle cx="0" cy="-10" r="27" fill="#3d8a4d" /><circle cx="-16" cy="0" r="18" fill="#5ea84d" /><circle cx="15" cy="1" r="17" fill="#2f7841" /></>}{element.kind === "shrub" && <><circle cx="0" cy="0" r="23" fill="#73a943" /><circle cx="-11" cy="-7" r="14" fill="#8abb58" /><circle cx="13" cy="-5" r="13" fill="#5d963b" /></>}{element.kind === "flower" && <><circle cx="0" cy="0" r="22" fill="#cce49a" />{[-12, 0, 12].map((x, index) => <circle key={x} cx={x} cy={index % 2 ? 8 : -6} r="5" fill={index % 2 ? "#d86f92" : "#f2b45a"} />)}</>}{element.kind === "bench" && <><rect x="-28" y="-12" width="56" height="9" rx="3" fill="#8c6f52" /><rect x="-26" y="0" width="52" height="7" rx="3" fill="#9e805f" /><path d="M-19 7L-23 22M19 7L23 22" stroke="#4c5a53" strokeWidth="4" strokeLinecap="round" /></>}{element.kind === "fountain" && <><ellipse cx="0" cy="12" rx="37" ry="16" fill="#4d9fb8" /><ellipse cx="0" cy="8" rx="29" ry="11" fill="#8ed9e1" /><path d="M0 6C0-9-3-18 0-31C4-18 1-9 0 6" fill="#55bede" /><circle cx="0" cy="-32" r="4" fill="#67d2e8" /></>}{element.kind === "path" && <><rect x="-45" y="-9" width="90" height="18" rx="8" fill="#aaa58d" /><path d="M-29 0H29" stroke="#d6d0ae" strokeWidth="2" strokeDasharray="6 7" /></>}{element.kind === "sprinkler" && <><circle cx="0" cy="0" r="7" fill="#3989b1" /><path d="M0-10C0-38-24-35-25-18M10-4C35-18 42 7 24 17M-8-4C-29-18-42 8-23 17" fill="none" stroke="#61c5dc" strokeWidth="3" strokeLinecap="round" /></>}{element.kind === "dripLine" && <><path d="M-42 0C-20-16 20 16 42 0" fill="none" stroke="#2d8fa4" strokeWidth="7" strokeLinecap="round" /><circle cx="-22" cy="-5" r="3" fill="#b0edf1" /><circle cx="0" cy="4" r="3" fill="#b0edf1" /><circle cx="22" cy="5" r="3" fill="#b0edf1" /></>}{element.kind === "pump" && <><rect x="-25" y="-20" width="50" height="40" rx="8" fill="#52697b" /><circle cx="0" cy="0" r="12" fill="#d0e1e4" /><path d="M0-8L7 0L0 8L-7 0Z" fill="#3989b1" /></>}{element.kind === "tank" && <><ellipse cx="0" cy="-18" rx="22" ry="8" fill="#72b8c8" /><rect x="-22" y="-18" width="44" height="36" fill="#477b91" /><ellipse cx="0" cy="18" rx="22" ry="8" fill="#37687c" /><path d="M-4-26V-39H9" stroke="#52697b" strokeWidth="5" fill="none" /></>}{element.kind === "valve" && <><path d="M0-22L22 0L0 22L-22 0Z" fill="#6a8290" /><circle cx="0" cy="0" r="7" fill="#d5e4e5" /><path d="M-30 0H30" stroke="#6a8290" strokeWidth="5" /></>}{element.kind === "light" && <><path d="M-8 5H8L5 25H-5Z" fill="#637451" /><circle cx="0" cy="-5" r="17" fill="#f3ca62" opacity=".36" /><circle cx="0" cy="-5" r="7" fill="#f8d96f" /></>}{element.quantity > 1 && <text x="0" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill="#35530e">×{element.quantity}</text>}{isSelected && <circle cx="0" cy="0" r="40" fill="none" stroke="#35530e" strokeWidth="2" strokeDasharray="5 5" />}</g>;
  };

  return <PlatformShell title={isArabic ? "مصمم اللاندسكيب والري" : "Landscape & irrigation designer"} eyebrow={isArabic ? "حوّل فكرة الأرض إلى مخطط قابل للنقاش والقياس." : "Turn a site idea into a measurable, discussable plan."}><main className="container py-6 sm:py-8"><section className="mb-5 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-4 shadow-[0_12px_30px_rgba(48,67,22,.05)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex min-w-0 flex-1 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf4e5] text-[#35530e]"><PencilRuler className="size-5" /></span><div className="min-w-0 flex-1"><Label htmlFor="designer-title" className="text-xs font-bold text-[#718062]">{isArabic ? "اسم المشروع" : "Project name"}</Label><Input id="designer-title" value={title} onChange={event => setTitle(event.target.value)} className="mt-1 h-10 max-w-xl rounded-xl border-transparent bg-[#f7f9f4] text-lg font-bold text-[#314617] focus:border-[#9fbe7c]" /></div></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl bg-[#f2f6ec] p-1"><button type="button" onClick={() => setMode("landscape")} className={cn("rounded-lg px-3 py-2 text-xs font-bold transition", mode === "landscape" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>{isArabic ? "لاندسكيب" : "Landscape"}</button><button type="button" onClick={() => setMode("irrigation")} className={cn("rounded-lg px-3 py-2 text-xs font-bold transition", mode === "irrigation" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>{isArabic ? "شبكة ري" : "Irrigation"}</button></div><Button onClick={newProject} variant="outline" className="h-10 rounded-xl border-[#c8d7b7] text-[#496327]"><Plus className="size-4" />{isArabic ? "جديد" : "New"}</Button><Button onClick={saveProject} disabled={sharedMode} className="h-10 rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Save className="size-4" />{isArabic ? "حفظ" : "Save"}</Button><Button onClick={shareProject} className="h-10 rounded-xl bg-[#e9f2df] text-[#35530e] hover:bg-[#dcebc9]"><Share2 className="size-4" />{isArabic ? "مشاركة" : "Share"}</Button></div></div></section>

    <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_290px]"><aside className="order-2 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-4 shadow-[0_12px_30px_rgba(48,67,22,.05)] xl:order-1"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "المكتبة" : "LIBRARY"}</p><h2 className="mt-1 text-lg font-bold text-[#314617]">{isArabic ? "اسحب وأفلت" : "Drag & drop"}</h2></div><Grid3X3 className="size-5 text-[#7b9c4b]" /></div><div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-[#f2f6ec] p-1"><button type="button" onClick={() => setLibraryGroup("landscape")} className={cn("rounded-lg px-1 py-2 text-[10px] font-bold", libraryGroup === "landscape" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>{isArabic ? "نبات" : "Plants"}</button><button type="button" onClick={() => setLibraryGroup("irrigation")} className={cn("rounded-lg px-1 py-2 text-[10px] font-bold", libraryGroup === "irrigation" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>{isArabic ? "ري" : "Irrigation"}</button><button type="button" onClick={() => setLibraryGroup("decor")} className={cn("rounded-lg px-1 py-2 text-[10px] font-bold", libraryGroup === "decor" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>{isArabic ? "ديكور" : "Decor"}</button></div><div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-1">{filteredLibrary.map(item => { const Icon = item.icon; return <button key={item.kind} type="button" draggable={!sharedMode} onClick={() => !sharedMode && addElement(item.kind)} onDragStart={event => event.dataTransfer.setData("application/x-qadri-element", item.kind)} className="group flex items-center gap-2 rounded-xl border border-transparent bg-[#f8faf5] p-2 text-start transition hover:border-[#bcd3a1] hover:bg-[#f1f7e9]" title={isArabic ? "اسحب إلى اللوحة أو اضغط للإضافة" : "Drag to canvas or click to add"}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#527a36] shadow-sm"><Icon className="size-4" /></span><span className="min-w-0"><strong className="block truncate text-xs text-[#425627]">{isArabic ? item.ar : item.en}</strong><small className="text-[10px] text-[#839078]">{isArabic ? item.unitAr : item.unitEn}</small></span></button>; })}</div><div className="mt-4 rounded-xl border border-dashed border-[#c4d7ad] bg-[#f8fbf4] p-3 text-center text-[11px] leading-5 text-[#718062]"><MousePointer2 className="mx-auto mb-1 size-4 text-[#789b4d]" />{isArabic ? "اسحب أي عنصر إلى اللوحة، أو اضغط عليه لإضافته في المنتصف." : "Drag an item onto the canvas, or click to place it in the center."}</div></aside>

      <section className="order-1 min-w-0 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-3 shadow-[0_12px_30px_rgba(48,67,22,.05)] sm:p-4 xl:order-2"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#35530e]/8 pb-3"><div className="flex items-center gap-1 rounded-xl bg-[#f2f6ec] p-1"><button type="button" onClick={() => setTool("select")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold", tool === "select" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}><MousePointer2 className="size-3.5" />{isArabic ? "تحرير" : "Edit"}</button><button type="button" onClick={() => { setTool("measure"); setMeasureStart(null); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold", tool === "measure" ? "bg-white text-[#9b4c31] shadow-sm" : "text-[#718062]")}><Ruler className="size-3.5" />{isArabic ? "قياس" : "Measure"}</button></div><div className="flex flex-wrap items-center gap-2"><Button onClick={autoDistribute} disabled={sharedMode} variant="outline" className="h-9 rounded-xl border-[#c8d7b7] text-xs text-[#496327]"><Waves className="size-3.5" />{isArabic ? "توزيع تلقائي" : "Auto distribute"}</Button><div className="flex rounded-xl bg-[#f2f6ec] p-1"><button type="button" onClick={() => setViewMode("2d")} className={cn("px-3 py-1.5 text-xs font-bold rounded-lg", viewMode === "2d" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>2D</button><button type="button" onClick={() => setViewMode("3d")} className={cn("px-3 py-1.5 text-xs font-bold rounded-lg", viewMode === "3d" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718062]")}>3D</button></div></div></div><div className="mt-3 overflow-hidden rounded-[1.3rem] bg-[#eaf2df] p-2 sm:p-4"><div className={cn("relative mx-auto max-w-[900px] overflow-hidden rounded-[1rem] bg-white shadow-[0_16px_34px_rgba(52,78,29,.14)] transition-transform duration-500", viewMode === "3d" && "[transform:perspective(1200px)_rotateX(9deg)_rotateZ(-1deg)]")}><svg ref={canvasRef} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="block aspect-[10/7] h-auto w-full touch-none" onClick={handleCanvasClick} onDrop={handleDrop} onDragOver={event => event.preventDefault()} onPointerMove={handleCanvasPointerMove} onPointerUp={handleCanvasPointerUp} onPointerLeave={handleCanvasPointerUp}><defs><pattern id="editor-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#dfe9d4" strokeWidth="1" /></pattern><linearGradient id="editor-bg" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f8fcf2" /><stop offset="1" stopColor="#eaf3dc" /></linearGradient></defs><rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#editor-bg)" /><rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#editor-grid)" /><rect x="12" y="12" width="576" height="396" rx="22" fill="none" stroke="#a9c58e" strokeWidth="3" /><text x="28" y="38" fontSize="14" fontWeight="700" fill="#35530e">{title}</text>{measurements.map(measurement => <g key={measurement.id}><line x1={measurement.start.x} y1={measurement.start.y} x2={measurement.end.x} y2={measurement.end.y} stroke="#c46d4b" strokeWidth="2" strokeDasharray="7 5" /><circle cx={measurement.start.x} cy={measurement.start.y} r="4" fill="#c46d4b" /><circle cx={measurement.end.x} cy={measurement.end.y} r="4" fill="#c46d4b" /><text x={(measurement.start.x + measurement.end.x) / 2} y={(measurement.start.y + measurement.end.y) / 2 - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="#9b4c31">{measurement.distance.toFixed(1)} m</text></g>)}{measureStart && <circle cx={measureStart.x} cy={measureStart.y} r="7" fill="#c46d4b" opacity=".7" />}{elements.map(renderElement)}</svg></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#718062]"><span className="flex items-center gap-1.5"><Maximize2 className="size-3.5" />{isArabic ? `مقياس تقريبي · ${widthMeters}م × ${lengthMeters}م` : `Approx. scale · ${widthMeters}m × ${lengthMeters}m`}</span><span>{sharedMode ? (isArabic ? "وضع المعاينة المشتركة" : "Shared preview mode") : tool === "measure" ? (isArabic ? "انقر نقطتين لقياس المسافة" : "Click two points to measure") : (isArabic ? "اسحب العناصر لتغيير مواقعها" : "Drag elements to reposition")}</span></div></section>

      <aside className="order-3 space-y-5"><section className="rounded-[1.6rem] border border-[#35530e]/10 bg-white p-4 shadow-[0_12px_30px_rgba(48,67,22,.05)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "خصائص الموقع" : "SITE PROPERTIES"}</p><h2 className="mt-1 text-lg font-bold text-[#314617]">{isArabic ? "المساحة والملخص" : "Area & summary"}</h2></div><MapIcon className="size-5 text-[#789b4d]" /></div><div className="mt-4 grid grid-cols-2 gap-2"><div><Label className="text-[11px] text-[#718062]">{isArabic ? "العرض (م)" : "Width (m)"}</Label><Input type="number" min="1" value={siteWidth} onChange={event => setSiteWidth(event.target.value)} className="mt-1 h-9 rounded-lg" /></div><div><Label className="text-[11px] text-[#718062]">{isArabic ? "الطول (م)" : "Length (m)"}</Label><Input type="number" min="1" value={siteLength} onChange={event => setSiteLength(event.target.value)} className="mt-1 h-9 rounded-lg" /></div></div><div className="mt-4 grid grid-cols-2 gap-2"><Stat label={isArabic ? "المساحة" : "Area"} value={`${area.toFixed(0)} m²`} /><Stat label={isArabic ? "العناصر" : "Elements"} value={`${elements.length}`} /><Stat label={isArabic ? "النباتات" : "Plants"} value={`${plantCount}`} /><Stat label={isArabic ? "الري" : "Irrigation"} value={`${irrigationCount}`} /></div></section><section className="rounded-[1.6rem] border border-[#35530e]/10 bg-white p-4 shadow-[0_12px_30px_rgba(48,67,22,.05)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "المواد والكميات" : "MATERIALS"}</p><h2 className="mt-1 text-lg font-bold text-[#314617]">{isArabic ? "تقدير أولي" : "Initial estimate"}</h2></div><FileText className="size-5 text-[#789b4d]" /></div><div className="mt-4 space-y-2">{materialRows.length ? materialRows.slice(0, 6).map(row => <div key={row.kind} className="flex items-center justify-between gap-2 rounded-lg bg-[#f7f9f4] px-2.5 py-2"><span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.item.color }} /><span className="truncate text-xs font-semibold text-[#536147]">{isArabic ? row.item.ar : row.item.en}</span></span><span className="shrink-0 text-xs font-bold text-[#35530e]">{row.quantity} {isArabic ? row.item.unitAr : row.item.unitEn}</span></div>) : <p className="text-sm text-[#718062]">{isArabic ? "أضف عناصر إلى المخطط." : "Add elements to the plan."}</p>}</div><div className="mt-3 flex items-center justify-between border-t border-[#35530e]/8 pt-3 text-sm"><span className="font-bold text-[#718062]">{isArabic ? "تقدير المواد" : "Materials estimate"}</span><strong className="text-[#35530e]">{estimatedCost.toFixed(0)}</strong></div></section><section className="rounded-[1.6rem] border border-[#35530e]/10 bg-white p-4 shadow-[0_12px_30px_rgba(48,67,22,.05)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "الأدوات" : "TOOLS"}</p><h2 className="mt-1 text-lg font-bold text-[#314617]">{isArabic ? "تصدير ومشاركة" : "Export & share"}</h2></div><Download className="size-5 text-[#789b4d]" /></div><div className="mt-4 grid grid-cols-2 gap-2"><Button onClick={exportPng} variant="outline" className="h-10 rounded-xl border-[#c8d7b7] text-xs text-[#496327]"><Download className="size-3.5" />PNG</Button><Button onClick={exportPdf} variant="outline" className="h-10 rounded-xl border-[#c8d7b7] text-xs text-[#496327]"><FileText className="size-3.5" />PDF</Button></div><Button onClick={shareProject} className="mt-2 h-10 w-full rounded-xl bg-[#edf4e5] text-xs font-bold text-[#35530e] hover:bg-[#e2eed4]"><Link2 className="size-3.5" />{isArabic ? "نسخ رابط المشاركة" : "Copy share link"}</Button><p className="mt-3 text-[11px] leading-5 text-[#849078]">{isArabic ? "الرابط يحمل نسخة من المخطط لسهولة المراجعة مع فريق التنفيذ أو العميل." : "The link carries a snapshot of the plan for review with a client or execution team."}</p></section><section className="rounded-[1.6rem] border border-[#35530e]/10 bg-white p-4 shadow-[0_12px_30px_rgba(48,67,22,.05)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "مشاريعي" : "MY PROJECTS"}</p><h2 className="mt-1 text-lg font-bold text-[#314617]">{isArabic ? "العودة لاحقًا" : "Return later"}</h2></div><Save className="size-5 text-[#789b4d]" /></div><div className="mt-3 space-y-2">{savedProjects.slice(0, 4).map(project => <button key={project.id} type="button" onClick={() => loadProject(project)} className="flex w-full items-center justify-between gap-2 rounded-lg bg-[#f7f9f4] px-3 py-2 text-start hover:bg-[#eef5e5]"><span className="min-w-0"><strong className="block truncate text-xs text-[#4d612d]">{project.title}</strong><small className="text-[10px] text-[#869376]">{new Date(project.updatedAt).toLocaleDateString(isArabic ? "ar-JO" : "en-US")}</small></span><span className="text-[10px] font-bold text-[#6b8844]">{project.mode === "landscape" ? "2D" : "IR"}</span></button>)}{!savedProjects.length && <p className="rounded-lg border border-dashed border-[#c4d7ad] p-3 text-center text-xs text-[#718062]">{isArabic ? "لم تحفظ مشاريع بعد." : "No saved projects yet."}</p>}</div></section>{selected && !sharedMode && <section className="rounded-[1.6rem] border border-[#e8cdbf] bg-[#fffaf7] p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#ad6a4d]">{isArabic ? "العنصر المحدد" : "SELECTED ITEM"}</p><h2 className="mt-1 text-lg font-bold text-[#70482f]">{labelFor(selected.kind, language)}</h2></div><button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-1 text-[#a46a4d] hover:bg-white"><X className="size-4" /></button></div><div className="mt-3 flex items-end gap-2"><div className="flex-1"><Label className="text-[11px] text-[#876a58]">{isArabic ? "الكمية" : "Quantity"}</Label><Input type="number" min="1" value={selected.quantity} onChange={event => { const quantity = Math.max(1, Number(event.target.value) || 1); setElements(previous => previous.map(element => element.id === selected.id ? { ...element, quantity } : element)); }} className="mt-1 h-9 rounded-lg border-[#e6cfc2] bg-white" /></div><Button onClick={deleteSelected} variant="outline" className="h-9 rounded-lg border-[#e5bba9] text-[#a25638]"><Trash2 className="size-3.5" />{isArabic ? "حذف" : "Delete"}</Button></div></section>}</aside></div><section className="mt-5 grid gap-3 rounded-[1.4rem] border border-[#e8d5a9] bg-[#fffaf0] p-4 text-xs leading-6 text-[#806436] sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className="grid size-9 place-items-center rounded-xl bg-white text-[#a27b33]"><Globe2 className="size-4" /></span><p>{isArabic ? "المخطط تفاعلي وإرشادي؛ ثبّت مناسيب الموقع، مصادر المياه، الضغوط، التربة، ومسارات الخدمات مع مختص قبل التنفيذ." : "This interactive plan is preliminary; verify levels, water source, pressure, soil, and service routes with a specialist before execution."}</p><Button onClick={exportPdf} className="h-9 rounded-lg bg-[#9a752f] text-white hover:bg-[#805f24]"><FileText className="size-3.5" />{isArabic ? "تقرير فني" : "Technical report"}</Button></section></main></PlatformShell>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f7f9f4] p-2.5"><span className="block text-[10px] text-[#829073]">{label}</span><strong className="mt-1 block text-sm text-[#35530e]">{value}</strong></div>;
}
