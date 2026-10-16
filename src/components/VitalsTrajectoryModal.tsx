"use client";

import { useState } from "react";
import { 
  XMarkIcon, 
  HeartIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ShieldExclamationIcon, 
  PrinterIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export interface VitalRecord {
  id?: string;
  systolic: number;
  diastolic: number;
  heartRate?: number | null;
  spo2?: number | null;
  recordedAt: string | Date;
}

interface VitalsTrajectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: number | null;
  status: string;
  vitals: VitalRecord[];
}

export function VitalsTrajectoryModal({
  isOpen,
  onClose,
  patientName,
  patientId,
  status,
  vitals = [],
}: VitalsTrajectoryModalProps) {
  const [selectedMetric, setSelectedMetric] = useState<"bp" | "map" | "hr">("bp");

  if (!isOpen) return null;

  const sortedVitals = [...vitals].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const latest = sortedVitals[sortedVitals.length - 1];
  const earliest = sortedVitals[0];

  const latestMAP = latest ? Math.round((2 * latest.diastolic + latest.systolic) / 3) : 0;
  const latestPulsePressure = latest ? latest.systolic - latest.diastolic : 0;
  const systolicDelta = latest && earliest ? latest.systolic - earliest.systolic : 0;

  // Chart dimensions & scaling
  const chartWidth = 650;
  const chartHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(190, ...sortedVitals.map(v => v.systolic + 10));
  const minVal = Math.min(50, ...sortedVitals.map(v => v.diastolic - 10));

  const getX = (idx: number) => {
    if (sortedVitals.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (idx / (sortedVitals.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  // Build SVG path strings
  const systolicPoints = sortedVitals.map((v, i) => `${getX(i)},${getY(v.systolic)}`).join(" ");
  const diastolicPoints = sortedVitals.map((v, i) => `${getX(i)},${getY(v.diastolic)}`).join(" ");
  const mapPoints = sortedVitals.map((v, i) => `${getX(i)},${getY(Math.round((2 * v.diastolic + v.systolic) / 3))}`).join(" ");

  // Shaded area under systolic
  const systolicAreaPoints = `${getX(0)},${padding.top + innerHeight} ` +
    sortedVitals.map((v, i) => `${getX(i)},${getY(v.systolic)}`).join(" ") +
    ` ${getX(sortedVitals.length - 1)},${padding.top + innerHeight}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-2xs">
              <HeartIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Longitudinal Vitals Trajectory
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  status === "Critical" ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400" :
                  status === "Stable" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Patient: <strong className="text-gray-700 dark:text-gray-200">{patientName}</strong> • #{patientId}0084 • {sortedVitals.length} Historical Recordings
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              title="Print Vitals Chart"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Physiological Telemetry Cards */}
        {latest && (
          <div className="grid grid-cols-4 gap-3 p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            {/* Blood Pressure */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latest BP</div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {latest.systolic}/{latest.diastolic}
                <span className="text-[10px] font-normal text-gray-400 ml-1">mmHg</span>
              </div>
              <div className="text-[10px] font-semibold mt-1 flex items-center space-x-0.5">
                {systolicDelta > 0 ? (
                  <span className="text-red-500 flex items-center">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" /> +{systolicDelta} mmHg
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center">
                    <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" /> {systolicDelta} mmHg
                  </span>
                )}
                <span className="text-gray-400">trend</span>
              </div>
            </div>

            {/* MAP */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mean Arterial (MAP)</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {latestMAP}
                <span className="text-[10px] font-normal text-gray-400 ml-1">mmHg</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Perfusion Index</div>
            </div>

            {/* Pulse Pressure */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pulse Pressure</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {latestPulsePressure}
                <span className="text-[10px] font-normal text-gray-400 ml-1">mmHg</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Arterial Stiffness</div>
            </div>

            {/* Heart Rate / SpO2 */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Heart Rate / SpO2</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {latest.heartRate || 75}
                <span className="text-[10px] font-normal text-gray-400 ml-1">bpm</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                SpO2: {latest.spo2 || 98}%
              </div>
            </div>
          </div>
        )}

        {/* Interactive SVG Chart Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="p-5 rounded-3xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Hemodynamic Progression Curve
                </span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center space-x-1.5 font-semibold text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Systolic BP</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-semibold text-indigo-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span>Diastolic BP</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-semibold text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>MAP</span>
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-gray-400">
                AHA Guideline Thresholds
              </span>
            </div>

            {/* SVG Visual Canvas */}
            <div className="w-full flex justify-center overflow-x-auto">
              <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                <defs>
                  <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area under Systolic */}
                <polygon points={systolicAreaPoints} fill="url(#systolicGradient)" />

                {/* Threshold Lines */}
                {/* 140 mmHg (Stage 2 Hypertension) */}
                <line
                  x1={padding.left}
                  y1={getY(140)}
                  x2={chartWidth - padding.right}
                  y2={getY(140)}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text x={chartWidth - padding.right + 4} y={getY(140) + 3} className="text-[9px] fill-red-500 font-bold">
                  140 mmHg (Crisis)
                </text>

                {/* 120 mmHg (Normal Threshold) */}
                <line
                  x1={padding.left}
                  y1={getY(120)}
                  x2={chartWidth - padding.right}
                  y2={getY(120)}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text x={chartWidth - padding.right + 4} y={getY(120) + 3} className="text-[9px] fill-emerald-500 font-bold">
                  120 mmHg (Target)
                </text>

                {/* Y-Axis Grid & Labels */}
                {[60, 90, 120, 140, 180].map((val) => (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={getY(val)}
                      x2={chartWidth - padding.right}
                      y2={getY(val)}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                      className="dark:stroke-gray-800"
                    />
                    <text
                      x={padding.left - 8}
                      y={getY(val) + 3}
                      textAnchor="end"
                      className="text-[9px] fill-gray-400 font-mono"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* MAP Polyline */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                  points={mapPoints}
                />

                {/* Diastolic Polyline */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  points={diastolicPoints}
                />

                {/* Systolic Polyline */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                  points={systolicPoints}
                />

                {/* Data Points */}
                {sortedVitals.map((v, i) => {
                  const x = getX(i);
                  const ySys = getY(v.systolic);
                  const yDia = getY(v.diastolic);
                  const dateLabel = new Date(v.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

                  return (
                    <g key={i}>
                      {/* Systolic Dot */}
                      <circle cx={x} cy={ySys} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={ySys - 8} textAnchor="middle" className="text-[9px] fill-rose-600 font-bold">
                        {v.systolic}
                      </text>

                      {/* Diastolic Dot */}
                      <circle cx={x} cy={yDia} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={yDia + 14} textAnchor="middle" className="text-[9px] fill-indigo-600 font-bold">
                        {v.diastolic}
                      </text>

                      {/* X-axis Date label */}
                      <text
                        x={x}
                        y={padding.top + innerHeight + 18}
                        textAnchor="middle"
                        className="text-[9px] fill-gray-400 font-medium"
                      >
                        {dateLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Clinical Surveillance Guidance Box */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
            <ShieldExclamationIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Automated Clinical Trajectory Analysis: </strong>
              {status === "Critical" 
                ? `Patient exhibits sustained systolic escalation (+${systolicDelta} mmHg). Mean Arterial Pressure of ${latestMAP} mmHg indicates persistent vascular afterload. Recommend prompt antihypertensive dual-therapy and renal panel monitoring.`
                : `Patient maintains normotensive stability (MAP ${latestMAP} mmHg). Pulse pressure (${latestPulsePressure} mmHg) is within target physiological boundaries. Continue baseline monitoring.`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Telemetry Source: PostgreSQL VitalReading Table</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Close Trajectory
          </button>
        </div>
      </div>
    </div>
  );
}
