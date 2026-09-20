import React, { useState, useEffect, useRef } from "react";
import { Globe, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { LocationGeoProfile } from "../types";

interface ParsedPath {
  id: string; 
  name: string; 
  d: string;
}

interface WorldMapProps {
  darkMode: boolean;
  onMapClick: (coords: { lat: number; lng: number }) => void;
  selectedProfile: LocationGeoProfile | null;
  loading: boolean;
  selectedCoords: { lat: number; lng: number } | null;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  onRadiusChangeEnd: () => void;
}

export default function WorldMap({
  darkMode,
  onMapClick,
  selectedProfile,
  loading,
  selectedCoords,
  radiusKm,
  setRadiusKm,
  onRadiusChangeEnd
}: WorldMapProps) {
  const [mapPaths, setMapPaths] = useState<ParsedPath[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);

  // In-map zoom and pan state (strictly confined to map container)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const lastProcessedTimeRef = useRef<number>(0);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch world background SVG from jsdelivr
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/@highcharts/map-collection@1.1.3/custom/world.svg")
      .then((res) => {
        if (!res.ok) throw new Error("SVG map fetch failed");
        return res.text();
      })
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = doc.querySelectorAll("path");

        const parsed: ParsedPath[] = Array.from(paths)
          .map((p) => {
            const hcKeyClass = p.getAttribute("class") || "";
            const keyMatch = hcKeyClass.match(/highcharts-key-([a-z2-9]+)/i);
            const id = (keyMatch ? keyMatch[1] : p.getAttribute("id") || p.getAttribute("data-id") || "").toUpperCase();
            
            return {
              id: id,
              name: p.getAttribute("name") || p.getAttribute("data-name") || id,
              d: p.getAttribute("d") || "",
            };
          })
          .filter((p) => p.d && p.id && p.id.length <= 3 && p.id !== "KEY");

        setMapPaths(parsed);
        setLoadingMap(false);
      })
      .catch((err) => {
        console.error("Failed to load map background graphics:", err);
        setLoadingMap(false);
      });
  }, []);

  const getSvgCoordinates = (lat: number, lng: number) => {
    // Fitted linear regression equations matching Highcharts equidistant cylindrical custom world map
    const x = 1.9018 * lng + 338.5973;
    const y = -1.9940 * lat + 212.6994;
    return { x, y };
  };

  const processCoordFromClientPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();

    // Click relative to the bounding box of the SVG element on screen
    const clickX = clientX - svgRect.left;
    const clickY = clientY - svgRect.top;

    // Target coordinate space is viewBox bounds 0 0 700 340
    const viewBoxWidth = 700;
    const viewBoxHeight = 340;

    const svgAspect = viewBoxWidth / viewBoxHeight;
    const containerAspect = svgRect.width / svgRect.height;

    let baseScale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspect > svgAspect) {
      baseScale = svgRect.height / viewBoxHeight;
      const renderedWidth = viewBoxWidth * baseScale;
      offsetX = (svgRect.width - renderedWidth) / 2;
    } else {
      baseScale = svgRect.width / viewBoxWidth;
      const renderedHeight = viewBoxHeight * baseScale;
      offsetY = (svgRect.height - renderedHeight) / 2;
    }

    // Adjust for SVG transform: translate(panOffset.x, panOffset.y) scale(zoomLevel)
    // with transform-origin at viewBox center (350, 170)
    const rawSvgX = (clickX - offsetX) / baseScale;
    const rawSvgY = (clickY - offsetY) / baseScale;

    // Inverse transform from zoom and pan
    const centerX = 350;
    const centerY = 170;
    const xOnMap = (rawSvgX - panOffset.x - centerX) / zoomLevel + centerX;
    const yOnMap = (rawSvgY - panOffset.y - centerY) / zoomLevel + centerY;

    // Precise linear back-projection formula to physical coordinates
    const lng = (xOnMap - 338.5973) / 1.9018;
    const lat = (yOnMap - 212.6994) / -1.9940;

    const clampedLng = Math.max(-180, Math.min(180, lng));
    const clampedLat = Math.max(-90, Math.min(90, lat));

    onMapClick({ lat: clampedLat, lng: clampedLng });
  };

  // Click & Touch Handlers with Drag Detection & Mobile Tap Recognition
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    didDragRef.current = false;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const deltaX = e.clientX - pointerDownPosRef.current.x;
    const deltaY = e.clientY - pointerDownPosRef.current.y;
    const dist = Math.hypot(deltaX, deltaY);

    // Only count as intentional pan if zoomed in AND finger moved more than 16px (mobile touch-slop)
    if (zoomLevel > 1 && dist > 16) {
      didDragRef.current = true;
      const maxPanX = 250 * (zoomLevel - 1);
      const maxPanY = 150 * (zoomLevel - 1);
      const newX = Math.max(-maxPanX, Math.min(maxPanX, e.clientX - startPanRef.current.x));
      const newY = Math.max(-maxPanY, Math.min(maxPanY, e.clientY - startPanRef.current.y));
      setPanOffset({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    const deltaX = e.clientX - pointerDownPosRef.current.x;
    const deltaY = e.clientY - pointerDownPosRef.current.y;
    const dist = Math.hypot(deltaX, deltaY);
    const duration = Date.now() - pointerDownPosRef.current.time;

    // It's a tap if zoomLevel is 1, or if finger didn't exceed drag threshold, or short tap
    if (!didDragRef.current || zoomLevel === 1 || (dist < 18 && duration < 600)) {
      lastProcessedTimeRef.current = Date.now();
      processCoordFromClientPoint(e.clientX, e.clientY);
    }
  };

  const handlePointerCancel = () => {
    setIsPanning(false);
  };

  // Fallback direct DOM click handler for mobile WebView where pointerup might be synthesized
  const handleClick = (e: React.MouseEvent) => {
    if (Date.now() - lastProcessedTimeRef.current < 450) return; // Ignore if already processed by pointerup
    lastProcessedTimeRef.current = Date.now();
    processCoordFromClientPoint(e.clientX, e.clientY);
  };

  // In-box wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoomLevel((prev) => {
      const next = Math.max(1, Math.min(4, Number((prev + delta).toFixed(2))));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // In-box Multi-touch Pinch zoom handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoomLevel;
      didDragRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = dist / pinchStartDistRef.current;
      const nextZoom = Math.max(1, Math.min(4, Number((pinchStartZoomRef.current * scaleFactor).toFixed(2))));
      setZoomLevel(nextZoom);
      if (nextZoom === 1) setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(4, Number((prev + 0.5).toFixed(2))));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(2)));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col w-full aspect-[700/340] max-w-7xl max-h-[380px] md:max-h-[440px] lg:max-h-[500px] xl:max-h-[550px] mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50 select-none touch-none"
    >
      {/* Interactive In-Box Zoom Controls */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <button
          onClick={zoomIn}
          disabled={zoomLevel >= 4}
          title="Zoom In Map"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          disabled={zoomLevel <= 1}
          title="Zoom Out Map"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        {(zoomLevel > 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
          <button
            onClick={resetView}
            title="Reset Map View"
            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Map Canvas */}
      <div 
        className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
      >
        {/* Quick Region Jump Chips for Mobile/Touch Ease */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 overflow-x-auto max-w-[calc(100%-110px)] p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm scrollbar-none">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-1 whitespace-nowrap hidden sm:inline">Scan:</span>
          {[
            { label: "🇿🇦 South Africa", lat: -30.55, lng: 22.93 },
            { label: "🇪🇬 Egypt", lat: 26.82, lng: 30.80 },
            { label: "🇯🇵 Japan", lat: 36.20, lng: 138.25 },
            { label: "🇬🇧 UK", lat: 55.37, lng: -3.43 },
            { label: "🇺🇸 USA", lat: 37.09, lng: -95.71 },
            { label: "🇧🇷 Brazil", lat: -14.23, lng: -51.92 },
            { label: "🇮🇳 India", lat: 20.59, lng: 78.96 },
            { label: "🇦🇺 Australia", lat: -25.27, lng: 133.77 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={(e) => {
                e.stopPropagation();
                lastProcessedTimeRef.current = Date.now();
                onMapClick({ lat: preset.lat, lng: preset.lng });
              }}
              className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
        {/* Floating Scan Radius HUD / Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-20 flex flex-wrap items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-md text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">250 km Radar Scan</span>
            {selectedCoords ? (
              <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px] hidden sm:inline">
                [{selectedCoords.lat.toFixed(2)}°, {selectedCoords.lng.toFixed(2)}°]
              </span>
            ) : (
              <span className="text-slate-400 text-[10px] hidden sm:inline">
                Click map to scan
              </span>
            )}
          </div>

          {/* Quick Radius Presets */}
          {setRadiusKm && (
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
              {[150, 250, 500].map((r) => (
                <button
                  key={r}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRadiusKm(r);
                    if (onRadiusChangeEnd) onRadiusChangeEnd();
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    (radiusKm || 250) === r
                      ? "bg-emerald-500 text-white font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={`Scan within ${r} km radius`}
                >
                  {r}km
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingMap ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 font-display text-slate-500">
            <Globe className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm">Loading dynamic geographic projection...</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 700 340"
            className="w-full h-full select-none"
            id="world_svg_container"
          >
            <g
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
              style={{ transformOrigin: "350px 170px", transition: isPanning ? "none" : "transform 0.15s ease-out" }}
            >
              {/* Landmass Paths styled with overlapping strokes to hide all national borders and create a seamless terrain */}
              <g id="landmass_group">
                {mapPaths.map((region) => {
                  const landColor = darkMode ? "#1e293b" : "#e2e8f0";
                  return (
                    <path
                      key={region.id || Math.random().toString()}
                      d={region.d}
                      className="transition-all duration-150 cursor-pointer opacity-100"
                      stroke={landColor} 
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      fill={landColor}
                      id={region.id ? `map_path_${region.id.toLowerCase()}` : undefined}
                    />
                  );
                })}
              </g>

              {/* 250KM SCANNING RADAR OVERLAY & ACTIVE SONAR EMITTER */}
              {selectedCoords && (() => {
                const { x, y } = getSvgCoordinates(selectedCoords.lat, selectedCoords.lng);
                const effectiveRadius = radiusKm || 250;
                // Equirectangular projection scale: 1 deg lat = 111.139 km, y scale = -1.9940
                const ry = Math.max(3.5, (effectiveRadius / 111.139) * 1.9940);
                const cosLat = Math.max(0.18, Math.cos((selectedCoords.lat * Math.PI) / 180));
                const rx = Math.max(3.5, (effectiveRadius / (111.139 * cosLat)) * 1.9018);

                return (
                  <g id="vicinity_overlay_group" className="pointer-events-none">
                    <g transform={`translate(${x}, ${y})`}>
                      {/* Translucent 250km Radar Scanning Field */}
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={rx}
                        ry={ry}
                        fill="rgba(16, 185, 129, 0.12)"
                        stroke="#10b981"
                        strokeWidth="0.8"
                        strokeDasharray="2.5 1.5"
                        className="animate-pulse"
                      />

                      {/* Concentric sonar scan rings */}
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={rx * 0.55}
                        ry={ry * 0.55}
                        fill="none"
                        stroke="rgba(52, 211, 153, 0.4)"
                        strokeWidth="0.5"
                        strokeDasharray="1.5 1.5"
                      />

                      {/* Pulse sonar wave */}
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={rx * 0.85}
                        ry={ry * 0.85}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.6)"
                        strokeWidth="0.75"
                      />

                      {/* Radar sweep arm line */}
                      <line
                        x1="0"
                        y1="0"
                        x2={rx * 0.95}
                        y2="0"
                        stroke="rgba(52, 211, 153, 0.85)"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                      />

                      {/* Pinned position center beacon */}
                      <circle cx="0" cy="0" r="12" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" style={{ animationDuration: "2s" }} />
                      <circle cx="0" cy="0" r="4.2" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" className="shadow" />

                      {/* HUD overlay badge in SVG */}
                      <g transform={`translate(${rx + 2}, -2)`}>
                        <rect x="-1" y="-5.5" width="48" height="11" rx="2.5" fill="#0f172a" fillOpacity="0.88" stroke="#10b981" strokeWidth="0.5" />
                        <text x="23" y="2" textAnchor="middle" fill="#34d399" fontSize="5.5" fontWeight="bold" fontFamily="monospace">
                          {effectiveRadius}km Scan
                        </text>
                      </g>
                    </g>
                  </g>
                );
              })()}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
