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

  // Click & Touch Handlers with Drag Detection
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    didDragRef.current = false;
    startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const deltaX = e.clientX - startPanRef.current.x - panOffset.x;
    const deltaY = e.clientY - startPanRef.current.y - panOffset.y;
    
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      didDragRef.current = true;
    }

    if (zoomLevel > 1) {
      // Pan limits based on current zoom
      const maxPanX = 250 * (zoomLevel - 1);
      const maxPanY = 150 * (zoomLevel - 1);
      const newX = Math.max(-maxPanX, Math.min(maxPanX, e.clientX - startPanRef.current.x));
      const newY = Math.max(-maxPanY, Math.min(maxPanY, e.clientY - startPanRef.current.y));
      setPanOffset({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!didDragRef.current) {
      processCoordFromClientPoint(e.clientX, e.clientY);
    }
    setIsPanning(false);
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
      className="flex flex-col w-full aspect-[700/340] max-w-5xl max-h-[360px] md:max-h-[400px] lg:max-h-[450px] xl:max-h-[490px] mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50 select-none touch-none"
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
        className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
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

              {/* TRANSLUCENT VICINITY CIRCLE OVERLAY & DECORATIVE TARGETING RETICLE */}
              {selectedCoords && (() => {
                const { x, y } = getSvgCoordinates(selectedCoords.lat, selectedCoords.lng);
                return (
                  <g id="vicinity_overlay_group" className="pointer-events-none">
                    {/* Centered locator glowing beacon */}
                    <g transform={`translate(${x}, ${y})`}>
                      <circle cx="0" cy="0" r="14" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" style={{ animationDuration: "1.8s" }} />
                      <circle cx="0" cy="0" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="shadow" />
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
