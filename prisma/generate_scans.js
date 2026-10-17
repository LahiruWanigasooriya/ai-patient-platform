const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'medical_scans');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. John Doe - Chest X-Ray with Cardiomegaly
const johnXraySvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 900' width='800' height='900' style='background-color:#05070a; font-family: monospace;'>
  <defs>
    <radialGradient id='lungFieldL' cx='35%' cy='45%' r='40%'>
      <stop offset='0%' stop-color='#1a2430' stop-opacity='0.9'/>
      <stop offset='70%' stop-color='#0f1720' stop-opacity='0.7'/>
      <stop offset='100%' stop-color='#05070a' stop-opacity='0.3'/>
    </radialGradient>
    <radialGradient id='lungFieldR' cx='65%' cy='45%' r='40%'>
      <stop offset='0%' stop-color='#1a2430' stop-opacity='0.9'/>
      <stop offset='70%' stop-color='#0f1720' stop-opacity='0.7'/>
      <stop offset='100%' stop-color='#05070a' stop-opacity='0.3'/>
    </radialGradient>
  </defs>

  <!-- Film base border -->
  <rect x='10' y='10' width='780' height='880' rx='8' fill='#090d12' stroke='#1e293b' stroke-width='2'/>

  <!-- Radiograph Header -->
  <text x='35' y='45' fill='#94a3b8' font-size='14' font-weight='bold'>HOSPITAL RADIOLOGY DEPT • DIGITAL RADIOGRAPHY (CR)</text>
  <text x='35' y='68' fill='#64748b' font-size='12'>PT: DOE, JOHN | ID: #10084 | AGE: 45 M | PROJ: CHEST PA ERECT</text>
  <text x='35' y='88' fill='#64748b' font-size='11'>DATE: 2026-10-15 08:42 | kVp: 120 | mAs: 4.0 | EXP INDEX: 1840</text>
  <circle cx='740' cy='55' r='18' fill='#0f172a' stroke='#38bdf8' stroke-width='1.5'/>
  <text x='734' y='61' fill='#38bdf8' font-size='18' font-weight='bold'>R</text>

  <!-- Spine / Vertebral Column -->
  <path d='M400,100 L400,850' stroke='#475569' stroke-width='32' opacity='0.3' stroke-dasharray='14,4'/>

  <!-- Clavicles -->
  <path d='M395,160 Q260,150 180,185' stroke='#94a3b8' stroke-width='14' fill='none' stroke-linecap='round' opacity='0.75'/>
  <path d='M405,160 Q540,150 620,185' stroke='#94a3b8' stroke-width='14' fill='none' stroke-linecap='round' opacity='0.75'/>

  <!-- Rib Cage Outline (Bilateral) -->
  <g stroke='#64748b' stroke-width='9' fill='none' opacity='0.55' stroke-linecap='round'>
    <!-- Right Ribs (Viewer Left) -->
    <path d='M380,210 Q240,200 170,290 Q240,360 380,330'/>
    <path d='M380,270 Q220,270 150,380 Q220,440 380,410'/>
    <path d='M380,340 Q210,340 140,460 Q210,530 380,490'/>
    <path d='M380,410 Q200,410 135,540 Q210,610 380,570'/>
    <path d='M380,480 Q190,490 130,620 Q200,680 380,640'/>
    <path d='M380,560 Q180,570 130,690 Q200,740 380,710'/>

    <!-- Left Ribs (Viewer Right) -->
    <path d='M420,210 Q560,200 630,290 Q560,360 420,330'/>
    <path d='M420,270 Q580,270 650,380 Q580,440 420,410'/>
    <path d='M420,340 Q590,340 660,460 Q590,530 420,490'/>
    <path d='M420,410 Q600,410 665,540 Q590,610 420,570'/>
    <path d='M420,480 Q610,490 670,620 Q600,680 420,640'/>
    <path d='M420,560 Q620,570 670,690 Q600,740 420,710'/>
  </g>

  <!-- Lungs (Radiolucent dark lung fields) -->
  <path d='M375,180 C270,180 160,260 160,540 C160,680 200,770 260,780 C320,770 375,690 375,540 Z' fill='url(#lungFieldL)'/>
  <path d='M425,180 C530,180 640,260 640,540 C640,680 600,770 540,780 C480,770 425,690 425,540 Z' fill='url(#lungFieldR)'/>

  <!-- Bronchovascular Markings -->
  <g stroke='#334155' stroke-width='2' opacity='0.7' fill='none'>
    <path d='M380,360 Q320,380 260,430 M380,370 Q300,420 250,510 M380,380 Q320,460 270,590'/>
    <path d='M420,360 Q480,380 540,430 M420,370 Q500,420 550,510 M420,380 Q480,460 530,590'/>
  </g>

  <!-- Prominent Aortic Knob -->
  <ellipse cx='435' cy='280' rx='42' ry='32' fill='#64748b' opacity='0.65'/>

  <!-- CARDIOMEGALY (Enlarged Cardiac Shadow) -->
  <path d='M395,290 C340,360 305,480 325,580 C335,630 380,720 440,740 C520,745 615,700 625,610 C635,530 550,430 460,370 Z'
        fill='#94a3b8' opacity='0.75' stroke='#cbd5e1' stroke-width='2'/>

  <!-- Cardiothoracic Ratio Measurement Indicator Overlays -->
  <line x1='325' y1='620' x2='625' y2='620' stroke='#ef4444' stroke-width='2.5' stroke-dasharray='6,3'/>
  <circle cx='325' cy='620' r='4' fill='#ef4444'/>
  <circle cx='625' cy='620' r='4' fill='#ef4444'/>
  <text x='430' y='610' fill='#ef4444' font-size='13' font-weight='bold'>Cardiac Width: 300mm</text>

  <line x1='155' y1='730' x2='645' y2='730' stroke='#38bdf8' stroke-width='2' stroke-dasharray='6,3'/>
  <circle cx='155' cy='730' r='3.5' fill='#38bdf8'/>
  <circle cx='645' cy='730' r='3.5' fill='#38bdf8'/>
  <text x='355' y='722' fill='#38bdf8' font-size='12' font-weight='bold'>Thoracic Width: 490mm (CTR = 0.61 • Cardiomegaly)</text>

  <!-- Diaphragm & Costophrenic Angles -->
  <path d='M130,760 Q260,700 390,750' stroke='#64748b' stroke-width='10' fill='none' opacity='0.7'/>
  <path d='M410,750 Q540,730 670,760' stroke='#64748b' stroke-width='10' fill='none' opacity='0.7'/>

  <!-- Radiology Annotation Watermarks -->
  <rect x='30' y='810' width='420' height='55' rx='6' fill='#0f172a' stroke='#334155'/>
  <text x='45' y='832' fill='#f87171' font-size='12' font-weight='bold'>[FINDING] Marked Cardiomegaly with LV configuration</text>
  <text x='45' y='850' fill='#94a3b8' font-size='11'>Pulmonary venous hypertension / vascular cephalization noted.</text>
</svg>`;

// 2. John Doe - 12-Lead ECG Strip showing Left Ventricular Hypertrophy
const johnEcgSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 650' width='1000' height='650' style='background-color:#fff5f5; font-family: monospace;'>
  <defs>
    <pattern id='ecgMinor' width='10' height='10' patternUnits='userSpaceOnUse'>
      <path d='M 10 0 L 0 0 0 10' fill='none' stroke='#fecdd3' stroke-width='0.5'/>
    </pattern>
    <pattern id='ecgMajor' width='50' height='50' patternUnits='userSpaceOnUse'>
      <rect width='50' height='50' fill='url(#ecgMinor)'/>
      <path d='M 50 0 L 0 0 0 50' fill='none' stroke='#f43f5e' stroke-width='1.2' opacity='0.7'/>
    </pattern>
  </defs>

  <!-- Background Grid -->
  <rect width='1000' height='650' fill='url(#ecgMajor)'/>

  <!-- Top Metadata Header -->
  <rect x='15' y='10' width='970' height='55' rx='4' fill='#ffffff' stroke='#e11d48' stroke-width='1.5' opacity='0.95'/>
  <text x='30' y='32' fill='#0f172a' font-size='13' font-weight='bold'>MEDINTEL 12-LEAD DIAGNOSTIC ELECTROCARDIOGRAM (ECG)</text>
  <text x='30' y='50' fill='#475569' font-size='11'>PATIENT: DOE, JOHN | ID: 1 | HR: 88 BPM | PR: 168ms | QRS: 114ms | QT/QTc: 412/480ms | P-R-T AXES: 52 / -15 / 164</text>
  <text x='740' y='32' fill='#be123c' font-size='12' font-weight='bold'>SPEED: 25 mm/s • GAIN: 10 mm/mV</text>
  <text x='740' y='50' fill='#be123c' font-size='11' font-weight='bold'>CRITERIA: SOKOLOW-LYON LVH POSITIVE (48mm)</text>

  <!-- Calibration Pulses (10mm/mV) -->
  <path d='M 25 150 L 35 150 L 35 100 L 55 100 L 55 150 L 65 150' stroke='#0f172a' stroke-width='2' fill='none'/>
  <path d='M 25 300 L 35 300 L 35 250 L 55 250 L 55 300 L 65 300' stroke='#0f172a' stroke-width='2' fill='none'/>
  <path d='M 25 450 L 35 450 L 35 400 L 55 400 L 55 450 L 65 450' stroke='#0f172a' stroke-width='2' fill='none'/>

  <!-- LEAD I -->
  <text x='70' y='95' fill='#9f1239' font-size='14' font-weight='bold'>LEAD I</text>
  <path d='M 70 150 Q 85 145 95 150 L 105 153 L 115 150 L 122 170 L 132 80 L 140 165 L 148 150 Q 170 165 195 150 L 235 150
           Q 250 145 260 150 L 270 153 L 280 150 L 287 170 L 297 80 L 305 165 L 313 150 Q 335 165 360 150 L 400 150
           Q 415 145 425 150 L 435 153 L 445 150 L 452 170 L 462 80 L 470 165 L 478 150 Q 500 165 525 150 L 550 150'
        stroke='#0f172a' stroke-width='2.2' fill='none' stroke-linecap='round'/>

  <!-- LEAD V1 (Deep S Wave - 28mm) -->
  <text x='570' y='95' fill='#9f1239' font-size='14' font-weight='bold'>LEAD V1 (Deep S Wave: 28mm)</text>
  <path d='M 570 150 Q 585 146 595 150 L 602 144 L 608 150 L 612 140 L 620 260 L 626 150 Q 640 160 660 150 L 710 150
           Q 725 146 735 150 L 742 144 L 748 150 L 752 140 L 760 260 L 766 150 Q 780 160 800 150 L 850 150
           Q 865 146 875 150 L 882 144 L 888 150 L 892 140 L 900 260 L 906 150 Q 920 160 940 150 L 980 150'
        stroke='#0f172a' stroke-width='2.2' fill='none' stroke-linecap='round'/>

  <!-- LEAD II -->
  <text x='70' y='245' fill='#9f1239' font-size='14' font-weight='bold'>LEAD II</text>
  <path d='M 70 300 Q 85 292 95 300 L 105 304 L 115 300 L 120 310 L 130 220 L 138 315 L 145 300 Q 170 290 195 300 L 235 300
           Q 250 292 260 300 L 270 304 L 280 300 L 285 310 L 295 220 L 303 315 L 310 300 Q 335 290 360 300 L 400 300
           Q 415 292 425 300 L 435 304 L 445 300 L 450 310 L 460 220 L 468 315 L 475 300 Q 500 290 525 300 L 550 300'
        stroke='#0f172a' stroke-width='2.2' fill='none' stroke-linecap='round'/>

  <!-- LEAD V5 (Tall R Wave - 20mm + T-wave Inversion Strain) -->
  <text x='570' y='245' fill='#9f1239' font-size='14' font-weight='bold'>LEAD V5 (Tall R: 20mm + LV Strain Pattern)</text>
  <path d='M 570 300 Q 585 294 595 300 L 602 304 L 608 300 L 614 315 L 624 180 L 632 310 L 640 300 Q 660 325 685 300 L 725 300
           Q 740 294 750 300 L 757 304 L 763 300 L 769 315 L 779 180 L 787 310 L 795 300 Q 815 325 840 300 L 880 300
           Q 895 294 905 300 L 912 304 L 918 300 L 924 315 L 934 180 L 942 310 L 950 300 Q 970 325 990 300'
        stroke='#0f172a' stroke-width='2.2' fill='none' stroke-linecap='round'/>

  <!-- Continuous Rhythm Strip II -->
  <rect x='15' y='480' width='970' height='155' rx='4' fill='#ffffff' opacity='0.85' stroke='#fda4af'/>
  <text x='25' y='505' fill='#881337' font-size='13' font-weight='bold'>CONTINUOUS RHYTHM STRIP II (SINUS RHYTHM • LVH WITH REPOLARIZATION ABNORMALITY)</text>
  <path d='M 25 580 Q 45 570 60 580 L 75 585 L 85 580 L 92 600 L 102 470 L 112 595 L 120 580 Q 145 605 175 580 L 225 580
           Q 245 570 260 580 L 275 585 L 285 580 L 292 600 L 302 470 L 312 595 L 320 580 Q 345 605 375 580 L 425 580
           Q 445 570 460 580 L 475 585 L 485 580 L 492 600 L 502 470 L 512 595 L 520 580 Q 545 605 575 580 L 625 580
           Q 645 570 660 580 L 675 585 L 685 580 L 692 600 L 702 470 L 712 595 L 720 580 Q 745 605 775 580 L 825 580
           Q 845 570 860 580 L 875 585 L 885 580 L 892 600 L 902 470 L 912 595 L 920 580 Q 945 605 975 580'
        stroke='#0f172a' stroke-width='2.4' fill='none' stroke-linecap='round'/>
</svg>`;

// 3. Jane Smith - Normal Chest X-Ray
const janeXraySvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 900' width='800' height='900' style='background-color:#05070a; font-family: monospace;'>
  <defs>
    <radialGradient id='janeLungFieldL' cx='35%' cy='45%' r='40%'>
      <stop offset='0%' stop-color='#1e293b' stop-opacity='0.95'/>
      <stop offset='70%' stop-color='#0f172a' stop-opacity='0.75'/>
      <stop offset='100%' stop-color='#05070a' stop-opacity='0.3'/>
    </radialGradient>
    <radialGradient id='janeLungFieldR' cx='65%' cy='45%' r='40%'>
      <stop offset='0%' stop-color='#1e293b' stop-opacity='0.95'/>
      <stop offset='70%' stop-color='#0f172a' stop-opacity='0.75'/>
      <stop offset='100%' stop-color='#05070a' stop-opacity='0.3'/>
    </radialGradient>
  </defs>

  <rect x='10' y='10' width='780' height='880' rx='8' fill='#090d12' stroke='#1e293b' stroke-width='2'/>

  <!-- Header -->
  <text x='35' y='45' fill='#94a3b8' font-size='14' font-weight='bold'>HOSPITAL RADIOLOGY DEPT • DIGITAL RADIOGRAPHY (CR)</text>
  <text x='35' y='68' fill='#64748b' font-size='12'>PT: SMITH, JANE | ID: #10085 | AGE: 32 F | PROJ: CHEST PA ERECT</text>
  <text x='35' y='88' fill='#64748b' font-size='11'>DATE: 2026-10-14 10:15 | kVp: 110 | mAs: 3.2 | EXP INDEX: 1650</text>
  <circle cx='740' cy='55' r='18' fill='#0f172a' stroke='#10b981' stroke-width='1.5'/>
  <text x='734' y='61' fill='#10b981' font-size='18' font-weight='bold'>R</text>

  <!-- Vertebral Column -->
  <path d='M400,100 L400,850' stroke='#475569' stroke-width='28' opacity='0.25' stroke-dasharray='14,4'/>

  <!-- Clavicles -->
  <path d='M395,165 Q280,155 190,190' stroke='#94a3b8' stroke-width='12' fill='none' stroke-linecap='round' opacity='0.75'/>
  <path d='M405,165 Q520,155 610,190' stroke='#94a3b8' stroke-width='12' fill='none' stroke-linecap='round' opacity='0.75'/>

  <!-- Ribs (Symmetric, Normal) -->
  <g stroke='#64748b' stroke-width='8' fill='none' opacity='0.5' stroke-linecap='round'>
    <path d='M380,210 Q240,200 180,285 Q250,350 380,320'/>
    <path d='M380,270 Q230,265 160,370 Q230,430 380,400'/>
    <path d='M380,340 Q220,335 150,450 Q220,520 380,480'/>
    <path d='M380,410 Q210,405 145,530 Q220,600 380,560'/>
    <path d='M380,480 Q200,480 140,610 Q210,670 380,630'/>

    <path d='M420,210 Q560,200 620,285 Q550,350 420,320'/>
    <path d='M420,270 Q570,265 640,370 Q570,430 420,400'/>
    <path d='M420,340 Q580,335 650,450 Q580,520 420,480'/>
    <path d='M420,410 Q590,405 655,530 Q580,600 420,560'/>
    <path d='M420,480 Q600,480 660,610 Q590,670 420,630'/>
  </g>

  <!-- Clear Lung Fields -->
  <path d='M375,185 C275,185 170,265 170,540 C170,680 205,775 265,785 C325,775 375,690 375,540 Z' fill='url(#janeLungFieldL)'/>
  <path d='M425,185 C525,185 630,265 630,540 C630,680 595,775 535,785 C475,775 425,690 425,540 Z' fill='url(#janeLungFieldR)'/>

  <!-- Normal Cardiac Silhouette (CTR = 0.44 • Normal < 0.50) -->
  <path d='M395,310 C365,370 350,470 365,560 C375,620 410,710 450,730 C510,735 560,680 565,600 C570,530 515,440 450,380 Z'
        fill='#94a3b8' opacity='0.7' stroke='#cbd5e1' stroke-width='1.8'/>

  <!-- Sharp Costophrenic Angles -->
  <path d='M140,760 Q265,705 390,750' stroke='#64748b' stroke-width='9' fill='none' opacity='0.7'/>
  <path d='M410,750 Q535,715 660,760' stroke='#64748b' stroke-width='9' fill='none' opacity='0.7'/>

  <circle cx='155' cy='755' r='14' fill='none' stroke='#10b981' stroke-width='2' stroke-dasharray='3,2'/>
  <text x='70' y='790' fill='#10b981' font-size='11' font-weight='bold'>Sharp Costophrenic Angle</text>

  <!-- Bottom Annotation -->
  <rect x='30' y='810' width='420' height='55' rx='6' fill='#0f172a' stroke='#334155'/>
  <text x='45' y='832' fill='#10b981' font-size='12' font-weight='bold'>[IMPRESSION] Normal Chest Radiograph</text>
  <text x='45' y='850' fill='#94a3b8' font-size='11'>Clear lungs bilaterally. Normal cardiac size (CTR: 0.44). No effusion.</text>
</svg>`;

// 4. Jane Smith - Diagnostic Lab Sheet with Allergy Markers
const janeLabSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 800' width='900' height='800' style='background-color:#ffffff; font-family: sans-serif;'>
  <!-- Document Border -->
  <rect x='15' y='15' width='870' height='770' rx='6' fill='#f8fafc' stroke='#cbd5e1' stroke-width='2'/>

  <!-- Header -->
  <rect x='15' y='15' width='870' height='75' rx='6' fill='#0f172a'/>
  <text x='40' y='50' fill='#ffffff' font-size='20' font-weight='bold'>METROPOLITAN CLINICAL LABORATORY REPORT</text>
  <text x='40' y='74' fill='#94a3b8' font-size='13'>ACCREDITED COLLEGE OF AMERICAN PATHOLOGISTS (CAP) #84920</text>

  <!-- Patient Banner -->
  <rect x='35' y='110' width='830' height='70' rx='6' fill='#f1f5f9' stroke='#e2e8f0'/>
  <text x='55' y='135' fill='#1e293b' font-size='13'><strong>Patient:</strong> SMITH, JANE</text>
  <text x='250' y='135' fill='#1e293b' font-size='13'><strong>ID:</strong> #10085</text>
  <text x='380' y='135' fill='#1e293b' font-size='13'><strong>DOB / Age:</strong> 1994-04-12 (32 yrs)</text>
  <text x='620' y='135' fill='#1e293b' font-size='13'><strong>Sex:</strong> Female</text>
  <text x='55' y='162' fill='#1e293b' font-size='13'><strong>Ordering Physician:</strong> Dr. Gregory House, MD</text>
  <text x='380' y='162' fill='#1e293b' font-size='13'><strong>Collected:</strong> 2026-10-14 07:30</text>
  <text x='620' y='162' fill='#1e293b' font-size='13'><strong>Status:</strong> Final Verified</text>

  <!-- Table 1: Immunological Allergy Cross-Reactivity Panel -->
  <text x='35' y='215' fill='#b91c1c' font-size='16' font-weight='bold'>ALLERGEN-SPECIFIC IgE SCREENING &amp; HYPERSENSITIVITY</text>
  <rect x='35' y='230' width='830' height='120' rx='4' fill='#fef2f2' stroke='#fca5a5'/>
  <text x='50' y='255' fill='#991b1b' font-size='12' font-weight='bold'>TEST COMPONENT</text>
  <text x='300' y='255' fill='#991b1b' font-size='12' font-weight='bold'>MEASURED LEVEL</text>
  <text x='480' y='255' fill='#991b1b' font-size='12' font-weight='bold'>REFERENCE RANGE</text>
  <text x='680' y='255' fill='#991b1b' font-size='12' font-weight='bold'>FLAG / CLASS</text>

  <line x1='35' y1='265' x2='865' y2='265' stroke='#fca5a5' stroke-width='1'/>
  <text x='50' y='290' fill='#7f1d1d' font-size='13' font-weight='bold'>Penicilloyl G (c1) Specific IgE</text>
  <text x='300' y='290' fill='#b91c1c' font-size='13' font-weight='bold'>18.4 kU/L</text>
  <text x='480' y='290' fill='#475569' font-size='13'>&lt; 0.35 kU/L</text>
  <text x='680' y='290' fill='#b91c1c' font-size='13' font-weight='bold'>HIGH (Class IV)</text>

  <text x='50' y='325' fill='#7f1d1d' font-size='13' font-weight='bold'>Penicilloyl V (c2) Specific IgE</text>
  <text x='300' y='325' fill='#b91c1c' font-size='13' font-weight='bold'>14.1 kU/L</text>
  <text x='480' y='325' fill='#475569' font-size='13'>&lt; 0.35 kU/L</text>
  <text x='680' y='325' fill='#b91c1c' font-size='13' font-weight='bold'>HIGH (Class III)</text>

  <!-- Table 2: Complete Blood Count & Chemistry -->
  <text x='35' y='390' fill='#0f172a' font-size='16' font-weight='bold'>COMPREHENSIVE METABOLIC &amp; HEMATOLOGIC PANEL</text>
  <rect x='35' y='405' width='830' height='260' rx='4' fill='#ffffff' stroke='#e2e8f0'/>
  
  <rect x='35' y='405' width='830' height='30' fill='#f8fafc'/>
  <text x='50' y='425' fill='#475569' font-size='12' font-weight='bold'>ANALYTE</text>
  <text x='300' y='425' fill='#475569' font-size='12' font-weight='bold'>VALUE</text>
  <text x='480' y='425' fill='#475569' font-size='12' font-weight='bold'>REFERENCE RANGE</text>
  <text x='680' y='425' fill='#475569' font-size='12' font-weight='bold'>STATUS</text>

  <g font-size='13' fill='#334155'>
    <text x='50' y='460'>White Blood Cells (WBC)</text> <text x='300' y='460'>6.4 x10^3/uL</text> <text x='480' y='460'>4.5 - 11.0</text> <text x='680' y='460' fill='#16a34a' font-weight='bold'>NORMAL</text>
    <text x='50' y='495'>Hemoglobin (Hgb)</text> <text x='300' y='495'>13.8 g/dL</text> <text x='480' y='495'>12.0 - 15.5</text> <text x='680' y='495' fill='#16a34a' font-weight='bold'>NORMAL</text>
    <text x='50' y='530'>Platelets</text> <text x='300' y='530'>260 x10^3/uL</text> <text x='480' y='530'>150 - 450</text> <text x='680' y='530' fill='#16a34a' font-weight='bold'>NORMAL</text>
    <text x='50' y='565'>Serum Creatinine</text> <text x='300' y='565'>0.82 mg/dL</text> <text x='480' y='565'>0.50 - 1.10</text> <text x='680' y='565' fill='#16a34a' font-weight='bold'>NORMAL</text>
    <text x='50' y='600'>Estimated GFR (eGFR)</text> <text x='300' y='600'>&gt; 90 mL/min/1.73m2</text> <text x='480' y='600'>&gt; 60</text> <text x='680' y='600' fill='#16a34a' font-weight='bold'>OPTIMAL</text>
    <text x='50' y='635'>Potassium (K+)</text> <text x='300' y='635'>4.2 mmol/L</text> <text x='480' y='635'>3.5 - 5.0</text> <text x='680' y='635' fill='#16a34a' font-weight='bold'>NORMAL</text>
  </g>

  <!-- Footer Callout -->
  <rect x='35' y='690' width='830' height='75' rx='6' fill='#fef2f2' stroke='#ef4444' stroke-width='1.5'/>
  <text x='55' y='715' fill='#b91c1c' font-size='13' font-weight='bold'>CLINICAL PATHOLOGIST ALERT: SEVERE PENICILLIN HYPERSENSITIVITY CONFIRMED</text>
  <text x='55' y='738' fill='#7f1d1d' font-size='12'>Elevated IgE titers to major antigenic determinants c1/c2. High risk of anaphylaxis. Contraindicate all Beta-Lactam antibiotics.</text>
</svg>`;

fs.writeFileSync(path.join(targetDir, 'john_doe_chest_xray.svg'), johnXraySvg);
fs.writeFileSync(path.join(targetDir, 'john_doe_ecg_strip.svg'), johnEcgSvg);
fs.writeFileSync(path.join(targetDir, 'jane_smith_chest_xray.svg'), janeXraySvg);
fs.writeFileSync(path.join(targetDir, 'jane_smith_lab_panel.svg'), janeLabSvg);
console.log('Successfully created all 4 clinical medical scan visual assets in public/medical_scans!');
