/**
 * CAD Model & Engineering Drawing Analyzer Service
 * Extracts manufacturing features, operations sequence, cutting tools,
 * and machinery requirements, and subordinates them to drawing callouts.
 */

// Preset machine part blueprints with high-precision technical specifications and drawing SVG/metadata
export const SAMPLE_CAD_DRAWINGS = [
  {
    id: 'shaft-precision-drive',
    title: 'Stepped Transmission Drive Shaft',
    drawingNo: 'ITV-DWG-7081-REV-C',
    partCategory: 'Turned Component / Shaft',
    material: 'Alloy Steel EN24 (4340 Quenched & Tempered)',
    rawStockSize: 'Ø55 mm x 220 mm Round Bar',
    netWeight: '2.45 kg',
    primaryTolerance: 'ISO 2768-mK / Bearing Journals h6',
    drawingSvg: `<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0b192c; font-family: 'Courier New', monospace;">
      <!-- Grid Lines -->
      <defs>
        <pattern id="grid-shaft" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#162c46" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-shaft)"/>

      <!-- Blueprint Border & Title Block -->
      <rect x="20" y="20" width="760" height="440" fill="none" stroke="#486581" stroke-width="2"/>
      <rect x="520" y="380" width="260" height="80" fill="#0f2744" stroke="#486581" stroke-width="1.5"/>
      <text x="530" y="400" fill="#9fb3c8" font-size="11" font-weight="bold">DWG NO: ITV-DWG-7081-REV-C</text>
      <text x="530" y="420" fill="#ffffff" font-size="12" font-weight="bold">DRIVE SHAFT - TRANSMISSION</text>
      <text x="530" y="440" fill="#627d98" font-size="10">MATL: EN24 / 4340 | QTY: 50 | SCL 1:2</text>
      <text x="530" y="452" fill="#e12d39" font-size="9">ITTOVA PRECISION SOURCING VAULT</text>

      <!-- Centerline -->
      <line x1="60" y1="230" x2="740" y2="230" stroke="#f0b429" stroke-width="1.2" stroke-dasharray="14,4,3,4"/>

      <!-- Shaft Geometry -->
      <!-- Left Step 1: Threaded End M24x1.5 -->
      <rect x="100" y="200" width="70" height="60" fill="#1b3a5b" stroke="#62b0e8" stroke-width="2"/>
      <line x1="100" y1="205" x2="170" y2="205" stroke="#9fb3c8" stroke-dasharray="3,3"/>
      <line x1="100" y1="255" x2="170" y2="255" stroke="#9fb3c8" stroke-dasharray="3,3"/>

      <!-- Left Step 2: Bearing Seat Ø35h6 -->
      <rect x="170" y="180" width="90" height="100" fill="#1e446d" stroke="#62b0e8" stroke-width="2"/>

      <!-- Step 3: Main Central Hub Ø50mm with Keyway -->
      <rect x="260" y="160" width="180" height="140" fill="#245080" stroke="#62b0e8" stroke-width="2"/>
      <!-- Keyway Slot representation -->
      <rect x="300" y="160" width="90" height="15" fill="#0b192c" stroke="#f0b429" stroke-width="1.5"/>
      <circle cx="300" cy="167" r="7.5" fill="#0b192c" stroke="#f0b429"/>
      <circle cx="390" cy="167" r="7.5" fill="#0b192c" stroke="#f0b429"/>

      <!-- Step 4: Second Bearing Seat Ø45h6 -->
      <rect x="440" y="170" width="110" height="120" fill="#1e446d" stroke="#62b0e8" stroke-width="2"/>

      <!-- Step 5: Output Drive Journal Ø30mm with Chamfer -->
      <polygon points="550,190 640,190 645,195 645,265 640,270 550,270" fill="#1b3a5b" stroke="#62b0e8" stroke-width="2"/>

      <!-- 60° Center Holes on Both Ends -->
      <polygon points="100,225 110,230 100,235" fill="#0b192c" stroke="#f0b429" stroke-width="1.2"/>
      <polygon points="645,225 635,230 645,235" fill="#0b192c" stroke="#f0b429" stroke-width="1.2"/>

      <!-- Dimension Lines & Annotations -->
      <!-- Dim M24 -->
      <line x1="135" y1="160" x2="135" y2="195" stroke="#9fb3c8" stroke-width="1" marker-end="url(#arrow)"/>
      <text x="110" y="152" fill="#bcccdc" font-size="11">M24 x 1.5 - 6g</text>

      <!-- Dim Ø35h6 -->
      <line x1="215" y1="130" x2="215" y2="175" stroke="#9fb3c8" stroke-width="1"/>
      <text x="185" y="122" fill="#62b0e8" font-size="11" font-weight="bold">Ø35h6 (+0/-0.016)</text>

      <!-- Dim Keyway -->
      <text x="310" y="145" fill="#f0b429" font-size="10" font-weight="bold">KEYWAY 8H9 x 40L</text>

      <!-- Dim Main Hub Ø50 -->
      <text x="320" y="325" fill="#bcccdc" font-size="11">Ø50 ±0.05</text>

      <!-- Dim Ø45h6 -->
      <line x1="495" y1="130" x2="495" y2="165" stroke="#9fb3c8" stroke-width="1"/>
      <text x="465" y="122" fill="#62b0e8" font-size="11" font-weight="bold">Ø45h6 (Grind)</text>

      <!-- Overall Length 200mm -->
      <line x1="100" y1="350" x2="645" y2="350" stroke="#9fb3c8" stroke-width="1.2"/>
      <line x1="100" y1="340" x2="100" y2="360" stroke="#9fb3c8" stroke-width="1.2"/>
      <line x1="645" y1="340" x2="645" y2="360" stroke="#9fb3c8" stroke-width="1.2"/>
      <text x="350" y="370" fill="#ffffff" font-size="12" font-weight="bold">OAL = 200 ±0.1</text>
    </svg>`,
    presetData: {
      partName: 'Stepped Transmission Drive Shaft',
      drawingNumber: 'ITV-DWG-7081-REV-C',
      material: 'Alloy Steel EN24 (4340 Quenched & Tempered, 28-32 HRC)',
      rawStock: 'Ø55 mm x 220 mm Bright Cold Drawn Round Bar',
      dimensions: 'Ø50 mm Max OD x 200 mm Length',
      criticalTolerances: ['Ø35h6 (+0.000 / -0.016 mm)', 'Ø45h6 (+0.000 / -0.016 mm)', 'Runout TIR < 0.008 mm', 'Surface Finish Ra 0.4 µm'],
      operations: [
        {
          opNumber: 'OP 10',
          name: 'Raw Material Sawing & Facing',
          stage: 'Stock Preparation & Datum Facing',
          machine: 'Horizontal Metal Band Saw & Manual Engine Lathe',
          machineCategory: 'Turning',
          tooling: 'Bi-metal Band Saw Blade 4/6 TPI; CNMG 120408 Carbide Insert for Facing',
          fixturing: 'Heavy Duty 3-Jaw Self-Centering Chuck with stock stop',
          cuttingParams: { speed: '160 m/min', rpm: '950 RPM', feed: '0.20 mm/rev', doc: '2.0 mm' },
          inspectionTool: 'Digital Vernier Caliper (0-300mm), Dial Height Gauge',
          estimatedCycleTimeSec: 180,
          subordinatedDrawingRef: {
            balloonId: 'B1',
            balloonNumber: 1,
            feature: 'Datum A Face & Center Drilling 60° (Left End)',
            tolerance: 'Facing flatness 0.02 mm, Center Depth 5.5mm',
            calloutLocation: { xPercent: 12, yPercent: 48 }
          }
        },
        {
          opNumber: 'OP 20',
          name: 'CNC Rough & Semi-Finish Turning (Setup 1)',
          stage: 'Primary Turning',
          machine: 'CNC Turning Center (2-Axis, Fanuc/Siemens, 4000 RPM, 8-Station Turret)',
          machineCategory: 'Turning',
          tooling: 'CNMG 120408 Carbide Insert (Roughing OD), WNMG 080404 (Semi-finishing steps)',
          fixturing: '3-Jaw Hydraulic Chuck with soft jaws bored to Ø55mm + Revolving Tailstock Center 60°',
          cuttingParams: { speed: '210 m/min', rpm: '1400-1800 RPM', feed: '0.25 mm/rev', doc: '1.5 mm' },
          inspectionTool: 'Outside Micrometer (25-50mm, 50-75mm) ±0.001mm resolution',
          estimatedCycleTimeSec: 260,
          subordinatedDrawingRef: {
            balloonId: 'B2',
            balloonNumber: 2,
            feature: 'Outer Stepped Diameters Ø50mm Hub, Ø45.3mm Grinding Stock',
            tolerance: 'Leave 0.3mm grinding allowance on bearing journals; general OD ±0.05 mm',
            calloutLocation: { xPercent: 41, yPercent: 35 }
          }
        },
        {
          opNumber: 'OP 30',
          name: 'CNC Threading & Relief Grooving',
          stage: 'Thread Single-Point Turning',
          machine: 'CNC Turning Center (Equipped with synchronized spindle threading encoder)',
          machineCategory: 'Turning',
          tooling: '16ER 1.5 ISO 60° Laydown Threading Insert; 3mm Neutral Grooving Tool for thread relief',
          fixturing: 'Same Setup 1 (Headstock Chuck + Tailstock center)',
          cuttingParams: { speed: '140 m/min', rpm: '1200 RPM', feed: '1.5 mm/pitch', doc: '8 multi-pass depth profile' },
          inspectionTool: 'M24 x 1.5 6g Thread Ring Gauge (Go / No-Go), Optical Profile Projector',
          estimatedCycleTimeSec: 140,
          subordinatedDrawingRef: {
            balloonId: 'B3',
            balloonNumber: 3,
            feature: 'External Thread M24 x 1.5 - 6g with 3x1mm DIN 76-A Thread Runout Groove',
            tolerance: 'Class 6g Thread Pitch Diameter tolerance, Chamfer 1.5x45°',
            calloutLocation: { xPercent: 17, yPercent: 32 }
          }
        },
        {
          opNumber: 'OP 40',
          name: 'CNC Vertical Milling - Keyway Slotting',
          stage: 'Secondary Milling',
          machine: '3-Axis Vertical Machining Center (BT40, 10,000 RPM Spindle)',
          machineCategory: 'Milling',
          tooling: 'Ø8.0 mm 3-Flute Solid Carbide Center-Cutting Keyway Slot Drill (TiAlN Coated)',
          fixturing: 'Precision Modular Milling Vise with precision V-Block jaws holding Ø50mm shaft axis parallel',
          cuttingParams: { speed: '120 m/min', rpm: '4770 RPM', feed: '380 mm/min', doc: '0.8 mm per pass (Z-trochoidal)' },
          inspectionTool: 'Keyway Width Caliper Gauge 8H9 (+0.036 / -0.000 mm), Depth Micrometer',
          estimatedCycleTimeSec: 195,
          subordinatedDrawingRef: {
            balloonId: 'B4',
            balloonNumber: 4,
            feature: 'Parallel Keyway DIN 6885 Form A (8H9 width x 4.0mm depth x 40mm length)',
            tolerance: 'Width 8H9 (+0.036 / 0.000 mm), Symmetry within 0.03 mm to shaft axis',
            calloutLocation: { xPercent: 44, yPercent: 28 }
          }
        },
        {
          opNumber: 'OP 50',
          name: 'CNC Cylindrical Grinding - Bearing Seats',
          stage: 'Precision Finishing',
          machine: 'CNC Cylindrical External Grinder (Marposs In-Process Sizing Gauge)',
          machineCategory: 'Grinding',
          tooling: 'Vitrified CBN Wheel 400x50x127mm B126; Coolant: Synthetic water-soluble emulsion 8%',
          fixturing: 'Mounted Between Dead Centers with driving dog and pneumatic tailstock',
          cuttingParams: { speed: '35 m/s wheel speed', rpm: '180 RPM workhead', feed: '0.004 mm/rev infeed', doc: '0.002 mm spark-out' },
          inspectionTool: 'Digital Snap Micrometer 0-50mm (0.0005mm), Taylor Hobson Roundness Tester',
          estimatedCycleTimeSec: 320,
          subordinatedDrawingRef: {
            balloonId: 'B5',
            balloonNumber: 5,
            feature: 'Precision Bearing Seats Ø35h6 & Ø45h6 (Cylindrical Surface)',
            tolerance: 'Ø35h6 (+0.000 / -0.016 mm), Ø45h6 (+0.000 / -0.016 mm), Surface Finish Ra 0.4 µm',
            calloutLocation: { xPercent: 64, yPercent: 26 }
          }
        },
        {
          opNumber: 'OP 60',
          name: 'Deburring, Ultrasonic Wash & CMM Inspection',
          stage: 'Quality Control & Metrology Sign-Off',
          machine: 'Coordinate Measuring Machine (Zeiss / Mitutoyo CNC CMM, Renishaw SP25M Probe)',
          machineCategory: 'Inspection',
          tooling: 'Ceramic deburring hand tool; 3mm Ruby Ball Stylus; Demagnetizer; Anti-rust dip',
          fixturing: 'Kinematic 3-Point CMM Support Fixture with magnetic clamps',
          cuttingParams: { speed: 'N/A', rpm: 'N/A', feed: 'N/A', doc: 'N/A' },
          inspectionTool: 'Full 3D CMM Geometric & True Position Inspection Report (FRP / PDF output)',
          estimatedCycleTimeSec: 210,
          subordinatedDrawingRef: {
            balloonId: 'B6',
            balloonNumber: 6,
            feature: 'Overall Runout, Bearing Seat Concentricity & Length Verifications',
            tolerance: 'Total Indicator Reading (TIR) < 0.008 mm, Perpendicularity to Datum A < 0.01 mm',
            calloutLocation: { xPercent: 78, yPercent: 44 }
          }
        }
      ],
      machinesSummary: [
        {
          machineName: 'CNC Turning Center (2-Axis)',
          requiredSpecs: 'Min 250mm swing, 450mm bed travel, 4000 RPM spindle, 8-station hydraulic turret with threading sync',
          operationsPerformed: ['OP 20 (Rough/Finish Turning)', 'OP 30 (Threading & Relief)'],
          suitabilityScore: '98% match with ITTOVA Precision Turning Vendors'
        },
        {
          machineName: '3-Axis Vertical Machining Center (VMC)',
          requiredSpecs: 'BT40 Spindle, Min 8000 RPM, 600x400mm X/Y travel, high pressure coolant for keyway slotting',
          operationsPerformed: ['OP 40 (Keyway Slot Milling)'],
          suitabilityScore: '95% match with ITTOVA Milling Network'
        },
        {
          machineName: 'CNC Cylindrical External Grinder',
          requiredSpecs: 'Between centers capacity 300mm, CBN/Corundum wheel, in-process electronic sizing gauge (±0.001mm)',
          operationsPerformed: ['OP 50 (Bearing Journal Grinding)'],
          suitabilityScore: '92% match with Specialized ITTOVA Finishing Grinders'
        },
        {
          machineName: 'CNC Coordinate Measuring Machine (CMM)',
          requiredSpecs: 'Volumetric accuracy 1.5 + L/350 µm, scanning probe head, calibration certificate within 12 months',
          operationsPerformed: ['OP 60 (Final Geometric & Runout Sign-off)'],
          suitabilityScore: '100% ITTOVA IGI / QA Verified'
        }
      ],
      toolingSummary: [
        { toolCategory: 'Turning Insert', toolCode: 'CNMG 120408-PM', coating: 'CVD TiCN+Al2O3', purpose: 'Rough OD turning on alloy steel' },
        { toolCategory: 'Finishing Insert', toolCode: 'WNMG 080404-NF', coating: 'PVD TiAlN', purpose: 'Semi-finish steps and chamfer contours' },
        { toolCategory: 'Threading Insert', toolCode: '16ER 1.5 ISO', coating: 'PVD TiAlN', purpose: 'M24x1.5 single point metric external thread' },
        { toolCategory: 'Grooving Insert', toolCode: 'N123G2-0300-0003-GM', coating: 'Carbide Grade 1125', purpose: 'DIN 76-A thread undercuts and snap-ring relief' },
        { toolCategory: 'Milling Cutter', toolCode: '4-Flute Ø8mm Solid Carbide Endmill', coating: 'AlCrN Nano-composite', purpose: 'Keyway slot milling with tight 8H9 width' },
        { toolCategory: 'Grinding Wheel', toolCode: 'Vitrified CBN B126 V240', coating: 'Superabrasive CBN', purpose: 'Cylindrical grinding to h6 tolerance (Ra 0.4 µm)' },
        { toolCategory: 'Inspection Gauges', toolCode: 'M24x1.5 6g Ring Gauges & 25-50mm Micrometer', coating: 'Tool Steel / Carbide Faced', purpose: 'In-process manual quality checks' }
      ],
      dfmRecommendations: [
        'Shaft shoulders have a transition radius R0.6mm specified. Ensure cutting insert nose radius does not exceed R0.4mm to prevent interference with bearing inner race seating.',
        'M24x1.5 thread under-cut relief groove conforms to DIN 76-A, allowing the mating locknut to seat flush without thread jamming.',
        'Keyway depth is 4.0mm on Ø50 hub. Single-pass cutting is discouraged due to tool deflection; 5-step Z-level ramp path is programmed in CAM for maximum accuracy.',
        'Hardened EN24 (28-32 HRC) exhibits slight residual stress. Post-rough turning stress-relief rest of 30 minutes before finish cylindrical grinding guarantees zero dimensional drift.'
      ]
    }
  },
  {
    id: 'flange-hydraulic-manifold',
    title: 'Hydraulic Flanged Valve Manifold Block',
    drawingNo: 'ITV-DWG-5044-REV-B',
    partCategory: 'Prismatic Milling / Manifold Block',
    material: 'Aircraft Aluminum 6061-T6 (Ultrasonic Inspected)',
    rawStockSize: '120 mm x 120 mm x 60 mm Billet Block',
    netWeight: '1.82 kg',
    primaryTolerance: 'ISO 2768-mK / Cavity Bores H7',
    drawingSvg: `<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#091e3a; font-family: 'Courier New', monospace;">
      <defs>
        <pattern id="grid-flange" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#13315c" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-flange)"/>

      <!-- Blueprint Outer Border & Title Block -->
      <rect x="20" y="20" width="760" height="440" fill="none" stroke="#486581" stroke-width="2"/>
      <rect x="520" y="380" width="260" height="80" fill="#0f2744" stroke="#486581" stroke-width="1.5"/>
      <text x="530" y="400" fill="#9fb3c8" font-size="11" font-weight="bold">DWG NO: ITV-DWG-5044-REV-B</text>
      <text x="530" y="420" fill="#ffffff" font-size="12" font-weight="bold">FLANGED VALVE MANIFOLD</text>
      <text x="530" y="440" fill="#627d98" font-size="10">MATL: AL 6061-T6 | QTY: 25 | SCL 1:1</text>
      <text x="530" y="452" fill="#e12d39" font-size="9">ITTOVA PRECISION SOURCING VAULT</text>

      <!-- Centerlines -->
      <line x1="160" y1="220" x2="480" y2="220" stroke="#f0b429" stroke-width="1.2" stroke-dasharray="14,4,3,4"/>
      <line x1="320" y1="60" x2="320" y2="380" stroke="#f0b429" stroke-width="1.2" stroke-dasharray="14,4,3,4"/>

      <!-- Main Manifold Square Flange Profile -->
      <rect x="180" y="80" width="280" height="280" rx="14" fill="#173a63" stroke="#62b0e8" stroke-width="2.5"/>

      <!-- Central Cavity Bore Ø60mm -->
      <circle cx="320" cy="220" r="60" fill="#091e3a" stroke="#62b0e8" stroke-width="2"/>
      <!-- Internal Counterbore Ø40H7 -->
      <circle cx="320" cy="220" r="40" fill="#0f2b4e" stroke="#f0b429" stroke-width="1.5" stroke-dasharray="6,3"/>

      <!-- Circular O-Ring Face Groove Ø85mm (3.2mm width) -->
      <circle cx="320" cy="220" r="85" fill="none" stroke="#f0b429" stroke-width="3"/>
      <circle cx="320" cy="220" r="88.2" fill="none" stroke="#62b0e8" stroke-width="1"/>

      <!-- Pitch Circle Diameter (PCD) for 4 Bolt Holes: Ø140mm -->
      <circle cx="320" cy="220" r="105" fill="none" stroke="#9fb3c8" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- 4x M8 Bolt Holes on PCD -->
      <circle cx="320" cy="115" r="7" fill="#091e3a" stroke="#ffffff" stroke-width="1.8"/>
      <circle cx="320" cy="115" r="9.5" fill="none" stroke="#f0b429" stroke-width="1" stroke-dasharray="3,2"/>

      <circle cx="425" cy="220" r="7" fill="#091e3a" stroke="#ffffff" stroke-width="1.8"/>
      <circle cx="425" cy="220" r="9.5" fill="none" stroke="#f0b429" stroke-width="1" stroke-dasharray="3,2"/>

      <circle cx="320" cy="325" r="7" fill="#091e3a" stroke="#ffffff" stroke-width="1.8"/>
      <circle cx="320" cy="325" r="9.5" fill="none" stroke="#f0b429" stroke-width="1" stroke-dasharray="3,2"/>

      <circle cx="215" cy="220" r="7" fill="#091e3a" stroke="#ffffff" stroke-width="1.8"/>
      <circle cx="215" cy="220" r="9.5" fill="none" stroke="#f0b429" stroke-width="1" stroke-dasharray="3,2"/>

      <!-- Side Port View (Cross Section Projection) -->
      <rect x="520" y="140" width="120" height="160" fill="#173a63" stroke="#62b0e8" stroke-width="2"/>
      <line x1="520" y1="220" x2="640" y2="220" stroke="#f0b429" stroke-width="1" stroke-dasharray="6,3"/>
      <!-- NPT 1/4 Port Callout -->
      <polygon points="640,205 600,210 600,230 640,235" fill="#091e3a" stroke="#f0b429" stroke-width="1.2"/>
      <text x="560" y="270" fill="#bcccdc" font-size="10">1/4"-18 NPT PORT</text>

      <!-- Annotations -->
      <text x="210" y="65" fill="#bcccdc" font-size="11">4x Ø9.0 THRU C'BORE Ø14x9DP</text>
      <text x="340" y="190" fill="#f0b429" font-size="11" font-weight="bold">O-RING GROOVE W=3.2 DP=2.4</text>
      <text x="260" y="225" fill="#62b0e8" font-size="11" font-weight="bold">BORE Ø40H7</text>
      <text x="190" y="380" fill="#9fb3c8" font-size="11">4x M8-6H EQ SP ON PCD Ø140</text>
    </svg>`,
    presetData: {
      partName: 'Hydraulic Flanged Valve Manifold Block',
      drawingNumber: 'ITV-DWG-5044-REV-B',
      material: 'Aluminum 6061-T6 (Extruded or Billet, Stress Relieved)',
      rawStock: '120 mm x 120 mm x 65 mm Saw-cut Billet Block',
      dimensions: '115 mm x 115 mm x 58 mm Finished Block',
      criticalTolerances: ['Bore Ø40H7 (+0.025 / -0.000 mm)', 'O-Ring Groove Depth 2.40 ±0.05 mm', 'Face Flatness 0.015 mm', 'PCD Positional Tolerance 0.05 mm True Position'],
      operations: [
        {
          opNumber: 'OP 10',
          name: 'VMC Setup 1 - Face Mill Top Datum A & Profile Clean',
          stage: 'Roughing & Datum Preparation',
          machine: '3-Axis Vertical Machining Center (BT40, 12,000 RPM Spindle)',
          machineCategory: 'Milling',
          tooling: 'Ø50 mm 45° Face Mill with SEET 12T3 Carbide Inserts for Aluminum (Polished / DLC)',
          fixturing: 'Pneumatic 6" Precision Milling Vise holding on 4mm stock bite with serrated hard jaws',
          cuttingParams: { speed: '800 m/min', rpm: '5100 RPM', feed: '1500 mm/min', doc: '1.5 mm' },
          inspectionTool: 'Digital Dial Indicator on granite table (Face Flatness check < 0.015 mm)',
          estimatedCycleTimeSec: 150,
          subordinatedDrawingRef: {
            balloonId: 'B1',
            balloonNumber: 1,
            feature: 'Top Face Mating Surface (Datum A)',
            tolerance: 'Surface Flatness 0.015 mm, Surface Finish Ra 0.8 µm',
            calloutLocation: { xPercent: 28, yPercent: 18 }
          }
        },
        {
          opNumber: 'OP 20',
          name: 'High-Speed Circular Milling - O-Ring Face Groove',
          stage: 'Precision Feature Milling',
          machine: '3-Axis Vertical Machining Center (High-precision interpolation)',
          machineCategory: 'Milling',
          tooling: 'Ø3.0 mm 2-Flute Solid Carbide DLC-Coated Micro Endmill (Corner Radius R0.2mm)',
          fixturing: 'Same Setup 1 (Vise Clamping)',
          cuttingParams: { speed: '320 m/min', rpm: '12,000 RPM', feed: '720 mm/min', doc: '0.4 mm axial step-down' },
          inspectionTool: 'Optical Depth Micrometer & Surface Roughness Tester (Target Ra 0.4 µm in groove)',
          estimatedCycleTimeSec: 190,
          subordinatedDrawingRef: {
            balloonId: 'B2',
            balloonNumber: 2,
            feature: 'Circular Face Seal O-Ring Groove (Ø85mm ID, Width 3.2mm, Depth 2.4mm)',
            tolerance: 'Depth 2.40 ±0.05 mm, Width 3.20 ±0.04 mm, Ra 0.4 µm (zero radial tool marks)',
            calloutLocation: { xPercent: 43, yPercent: 42 }
          }
        },
        {
          opNumber: 'OP 30',
          name: 'Cavity Pocketing & Precision Boring Ø40H7',
          stage: 'Precision Boring',
          machine: '3-Axis Vertical Machining Center (Micro-Adjustable Boring Head)',
          machineCategory: 'Milling',
          tooling: 'Ø16 mm 3-Flute Roughing End Mill; Wohlhaupter / Big Kaiser Digital Precision Boring Head with CCGT insert',
          fixturing: 'Same Setup 1 (Vise Clamping)',
          cuttingParams: { speed: '450 m/min', rpm: '3580 RPM (Boring: 1800 RPM)', feed: '0.08 mm/rev', doc: '0.2 mm finish cut' },
          inspectionTool: 'Three-Point Internal Micrometer (35-42mm) & Three-Point Bore Gauge (0.001mm)',
          estimatedCycleTimeSec: 240,
          subordinatedDrawingRef: {
            balloonId: 'B3',
            balloonNumber: 3,
            feature: 'Central Internal Valve Spool Bore Ø40H7 (+0.025 / -0.000 mm)',
            tolerance: 'Ø40H7 (+0.025 / -0.000 mm), Cylindricity within 0.008 mm, Ra 0.4 µm',
            calloutLocation: { xPercent: 39, yPercent: 49 }
          }
        },
        {
          opNumber: 'OP 40',
          name: 'Spot Drilling, Drilling & Rigid Tapping 4x M8 Flange Holes',
          stage: 'Hole Making & Threading',
          machine: '3-Axis Vertical Machining Center (Rigid Tapping Synchro spindle)',
          machineCategory: 'Drilling',
          tooling: '90° NC Spotting Drill Ø10mm; Ø6.8 mm TiN Coated Carbide Drill; M8x1.25 Spiral Flute Tap for Aluminum',
          fixturing: 'Same Setup 1 (Vise Clamping)',
          cuttingParams: { speed: '120 m/min drill / 25 m/min tap', rpm: '5600 RPM drill / 995 RPM tap', feed: '0.12 mm/rev drill / 1.25 mm/pitch tap', doc: 'Full depth 22mm' },
          inspectionTool: 'M8x1.25 6H Thread Plug Gauge (Go / No-Go), Vernier Caliper for PCD position',
          estimatedCycleTimeSec: 165,
          subordinatedDrawingRef: {
            balloonId: 'B4',
            balloonNumber: 4,
            feature: '4x M8-6H Threaded Mounting Holes Equally Spaced on PCD Ø140mm',
            tolerance: 'True Position Ø0.08 mm at MMC to Datums A and B, Thread Depth 18mm Min',
            calloutLocation: { xPercent: 54, yPercent: 24 }
          }
        },
        {
          opNumber: 'OP 50',
          name: 'VMC Setup 2 - Flip Part & Drill/Tap Side Port 1/4" NPT',
          stage: 'Secondary Setup & Porting',
          machine: '3-Axis Vertical Machining Center (or 4th Axis Rotary Table)',
          machineCategory: 'Milling',
          tooling: '7/16" (11.1mm) Taper Drill; 1/4"-18 NPT Taper Pipe Tap (HSS-E Nitride Coated)',
          fixturing: 'Part clamped on machined soft jaws locating on Datum A face & precision side stop',
          cuttingParams: { speed: '20 m/min', rpm: '570 RPM', feed: 'Taper synchronization', doc: 'Threaded to L1 gauge depth' },
          inspectionTool: '1/4"-18 NPT L1 Working Thread Plug Gauge (Flush ±1 turn tolerance)',
          estimatedCycleTimeSec: 190,
          subordinatedDrawingRef: {
            balloonId: 'B5',
            balloonNumber: 5,
            feature: 'Auxiliary Fluid Pressure Port 1/4"-18 NPT Pipe Thread',
            tolerance: 'Pressure rated 250 Bar, Taper concentric to internal cross-drilled gallery',
            calloutLocation: { xPercent: 72, yPercent: 46 }
          }
        },
        {
          opNumber: 'OP 60',
          name: 'Manual Deburring, High-Pressure Flush & CMM / Air Decay Leak Test',
          stage: 'Inspection & Pressure Verification',
          machine: 'Pneumatic Pressure Decay Leak Tester + CNC CMM (Mitutoyo Crysta-Apex)',
          machineCategory: 'Inspection',
          tooling: 'NOGA Hand Deburr Blades; Microscope for intersection burr inspection; Nitrogen Leak Test Rig',
          fixturing: 'Modular leak test sealing plate with calibrated O-rings clamped at 15 Nm',
          cuttingParams: { speed: 'N/A', rpm: 'N/A', feed: 'N/A', doc: 'N/A' },
          inspectionTool: 'Differential Pressure Decay Leak Tester (Zero bubble decay at 15 Bar for 60s); Full CMM Report',
          estimatedCycleTimeSec: 240,
          subordinatedDrawingRef: {
            balloonId: 'B6',
            balloonNumber: 6,
            feature: 'Internal Fluid Gallery Integrity & Cleanliness (Zero Chips / Burrs)',
            tolerance: 'Zero cross-contamination burrs; ISO 4406 Cleanliness Level 16/14/11',
            calloutLocation: { xPercent: 58, yPercent: 54 }
          }
        }
      ],
      machinesSummary: [
        {
          machineName: '3-Axis Vertical Machining Center (VMC)',
          requiredSpecs: 'Min 10,000 RPM spindle, BT40 / HSK-A63 taper, rigid tapping sync, X/Y travel > 500x400mm, flood coolant',
          operationsPerformed: ['OP 10 (Datum Face)', 'OP 20 (O-Ring Groove)', 'OP 30 (Cavity Bore Ø40H7)', 'OP 40 (PCD Holes)', 'OP 50 (NPT Port)'],
          suitabilityScore: '99% match with ITTOVA High-Precision Milling Vendors'
        },
        {
          machineName: 'Digital Precision Boring Head Unit',
          requiredSpecs: 'Micron-level dial graduation (0.001mm), balanced body for 4000 RPM, Wohlhaupter or Big Kaiser',
          operationsPerformed: ['OP 30 (H7 Spool Bore Finishing)'],
          suitabilityScore: '94% match with Qualified Toolroom Machinists'
        },
        {
          machineName: 'Hydrostatic / Pneumatic Leak Testing Station',
          requiredSpecs: 'Calibrated digital pressure transducer (0-300 Bar), dry nitrogen regulator, calibrated test fixture',
          operationsPerformed: ['OP 60 (Pressure Decay Leak Testing)'],
          suitabilityScore: '90% ITTOVA Certified Hydraulic Assembly Centers'
        }
      ],
      toolingSummary: [
        { toolCategory: 'Face Mill', toolCode: 'Ø50mm SEET 12T3-AL', coating: 'Diamond-like Carbon (DLC)', purpose: 'High speed face milling of aluminum manifold' },
        { toolCategory: 'Micro Endmill', toolCode: 'Ø3.0mm 2-Flute Carbide', coating: 'Mirror Polished Flute', purpose: 'Mirror finish O-ring groove without burrs' },
        { toolCategory: 'Rough Endmill', toolCode: 'Ø16mm 3-Flute Rougher', coating: 'TiB2 (Titanium Diboride)', purpose: 'Deep central cavity pocketing' },
        { toolCategory: 'Boring Tool', toolCode: 'Precision Boring Head + CCGT 060202', coating: 'Uncoated Polished Carbide', purpose: 'Fine boring of internal valve spool Ø40H7' },
        { toolCategory: 'Thread Tap', toolCode: 'M8x1.25 Spiral Flute DIN 371', coating: 'TiCN Coated HSS-E-PM', purpose: 'Blind hole tapping on flange PCD' },
        { toolCategory: 'Pipe Tap', toolCode: '1/4"-18 NPT Interrupted Thread', coating: 'Steam Oxide HSS', purpose: 'Hydraulic pressure port sealing threads' },
        { toolCategory: 'Gauges', toolCode: 'Ø40H7 Plug Gauge & 1/4 NPT L1 Plug', coating: 'Hardened Tool Steel 62 HRC', purpose: 'Shop floor dimensional conformity' }
      ],
      dfmRecommendations: [
        'Central cavity bore tolerance H7 (+0.025 / -0.000) requires a dwell at the bottom of the boring stroke to avoid tapers and chatter marks.',
        'O-ring groove must have smooth entry radiuses (R0.2mm max) to avoid tearing the elastomeric seal during hydraulic valve assembly.',
        'Cross-drilled fluid galleries intersect internal passages at 90°. Thermal deburring (TEM) or manual boroscope inspection is recommended to eliminate loose metal burrs.',
        'Anodizing note: If Type II or Type III hard anodizing is specified, allow 0.015mm per surface for oxide growth on the Ø40H7 bore or mask the internal bore.'
      ]
    }
  },
  {
    id: 'spur-gear-precision',
    title: 'Precision Hardened Spur Gear',
    drawingNo: 'ITV-DWG-3290-REV-A',
    partCategory: 'Gear / Hobbed & Ground Component',
    material: '20MnCr5 Case Hardening Steel (EN 10084)',
    rawStockSize: 'Ø140 mm x 48 mm Forged Disc Blank',
    netWeight: '3.6 kg',
    primaryTolerance: 'DIN 3962 Grade 6 / Bore H7',
    drawingSvg: `<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#091a2e; font-family: 'Courier New', monospace;">
      <defs>
        <pattern id="grid-gear" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#122540" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-gear)"/>

      <!-- Blueprint Border & Title Block -->
      <rect x="20" y="20" width="760" height="440" fill="none" stroke="#486581" stroke-width="2"/>
      <rect x="520" y="380" width="260" height="80" fill="#0f2744" stroke="#486581" stroke-width="1.5"/>
      <text x="530" y="400" fill="#9fb3c8" font-size="11" font-weight="bold">DWG NO: ITV-DWG-3290-REV-A</text>
      <text x="530" y="420" fill="#ffffff" font-size="12" font-weight="bold">SPUR GEAR – MODULE 2.5</text>
      <text x="530" y="440" fill="#627d98" font-size="10">MATL: 20MnCr5 | QTY: 100 | SCL 1:1</text>
      <text x="530" y="452" fill="#e12d39" font-size="9">ITTOVA PRECISION SOURCING VAULT</text>

      <!-- Centerlines -->
      <line x1="100" y1="220" x2="480" y2="220" stroke="#f0b429" stroke-width="1.2" stroke-dasharray="14,4,3,4"/>
      <line x1="290" y1="50" x2="290" y2="400" stroke="#f0b429" stroke-width="1.2" stroke-dasharray="14,4,3,4"/>

      <!-- Gear Outer Profile (Addendum Circle) -->
      <circle cx="290" cy="220" r="132" fill="none" stroke="#62b0e8" stroke-width="2.5"/>
      <!-- Pitch Circle -->
      <circle cx="290" cy="220" r="120" fill="none" stroke="#9fb3c8" stroke-width="1.2" stroke-dasharray="8,4"/>
      <!-- Root Circle (Dedendum) -->
      <circle cx="290" cy="220" r="106" fill="#12263e" stroke="#62b0e8" stroke-width="1.5"/>

      <!-- Gear Tooth Representations (12 teeth visible in top view) -->
      <line x1="290" y1="88" x2="290" y2="106" stroke="#62b0e8" stroke-width="3"/>
      <line x1="350" y1="100" x2="342" y2="118" stroke="#62b0e8" stroke-width="3"/>
      <line x1="398" y1="142" x2="385" y2="155" stroke="#62b0e8" stroke-width="3"/>
      <line x1="418" y1="202" x2="402" y2="206" stroke="#62b0e8" stroke-width="3"/>
      <line x1="398" y1="298" x2="385" y2="285" stroke="#62b0e8" stroke-width="3"/>
      <line x1="350" y1="340" x2="342" y2="322" stroke="#62b0e8" stroke-width="3"/>
      <line x1="290" y1="352" x2="290" y2="334" stroke="#62b0e8" stroke-width="3"/>
      <line x1="230" y1="340" x2="238" y2="322" stroke="#62b0e8" stroke-width="3"/>
      <line x1="182" y1="298" x2="195" y2="285" stroke="#62b0e8" stroke-width="3"/>
      <line x1="162" y1="202" x2="178" y2="206" stroke="#62b0e8" stroke-width="3"/>
      <line x1="182" y1="142" x2="195" y2="155" stroke="#62b0e8" stroke-width="3"/>
      <line x1="230" y1="100" x2="238" y2="118" stroke="#62b0e8" stroke-width="3"/>

      <!-- Central Bore Ø35H7 -->
      <circle cx="290" cy="220" r="35" fill="#091a2e" stroke="#f0b429" stroke-width="2"/>
      <!-- Keyway in bore -->
      <rect x="280" y="185" width="20" height="8" fill="#091a2e" stroke="#f0b429" stroke-width="1.5"/>

      <!-- Right Side Section View -->
      <rect x="540" y="120" width="140" height="200" fill="#12263e" stroke="#62b0e8" stroke-width="2"/>
      <line x1="540" y1="220" x2="680" y2="220" stroke="#f0b429" stroke-width="1" stroke-dasharray="6,3"/>
      <!-- Teeth Profile on Section -->
      <line x1="540" y1="124" x2="540" y2="316" stroke="#62b0e8" stroke-width="2.5"/>
      <line x1="680" y1="124" x2="680" y2="316" stroke="#62b0e8" stroke-width="2.5"/>
      <!-- Hub boss -->
      <rect x="570" y="185" width="80" height="70" fill="#091a2e" stroke="#f0b429" stroke-width="1.5"/>
      <text x="580" y="224" fill="#f0b429" font-size="9" font-weight="bold">BORE Ø35H7</text>

      <!-- Annotations -->
      <text x="140" y="62" fill="#62b0e8" font-size="11" font-weight="bold">Z = 48T | Mod 2.5 | PA 20°</text>
      <text x="290" y="56" fill="#bcccdc" font-size="10">TIP Ø132 | PCD Ø120 | ROOT Ø106</text>
      <text x="260" y="390" fill="#bcccdc" font-size="10">FACEWIDTH = 40 mm ±0.05</text>
      <text x="540" y="362" fill="#9fb3c8" font-size="10">CASE DEPTH 0.8-1.2mm | 58-62 HRC</text>
      <text x="540" y="108" fill="#e12d39" font-size="10" font-weight="bold">DIN 3962 GRADE 6</text>
    </svg>`,
    presetData: {
      partName: 'Precision Hardened Spur Gear (Module 2.5, 48 Teeth)',
      drawingNumber: 'ITV-DWG-3290-REV-A',
      material: '20MnCr5 Case Hardening Steel (EN 10084, Carburizing Grade)',
      rawStock: 'Ø140 mm x 48 mm Forged & Normalized Disc Blank',
      dimensions: 'Ø132 mm Tip OD x 40 mm Face Width',
      criticalTolerances: ['Profile Tolerance fα ≤ 7 µm (DIN 3962 Gr.6)', 'Lead Tolerance fβ ≤ 6 µm', 'Bore Ø35H7 (+0.025 / -0.000 mm)', 'Surface Hardness 58-62 HRC, Case Depth 0.8-1.2 mm'],
      operations: [
        {
          opNumber: 'OP 10',
          name: 'CNC Turning – Datum Faces, OD & Bore Roughing',
          stage: 'Stock Preparation & Turning',
          machine: 'CNC Turning Center (2-Axis, 350mm Swing, 4000 RPM Spindle)',
          machineCategory: 'Turning',
          tooling: 'CNMG 120408 Roughing Insert (CVD TiCN); CCMT 060204 Finishing Insert; Ø34.7mm Carbide Boring Bar',
          fixturing: '6-Jaw Self-Centering Chuck (Soft Jaws, Ø140mm gripping) + Face Driver',
          cuttingParams: { speed: '200 m/min', rpm: '1100-1400 RPM', feed: '0.22 mm/rev', doc: '1.5 mm' },
          inspectionTool: 'Outside Micrometer 125-150mm; Three-Point Bore Gauge 35mm ±0.001mm',
          estimatedCycleTimeSec: 220,
          subordinatedDrawingRef: {
            balloonId: 'B1',
            balloonNumber: 1,
            feature: 'Datum Faces & Bore Ø34.7mm (Grinding Stock 0.3mm)',
            tolerance: 'Bore concentricity ≤ 0.02mm, Face parallelism ≤ 0.01mm',
            calloutLocation: { xPercent: 36, yPercent: 46 }
          }
        },
        {
          opNumber: 'OP 20',
          name: 'CNC Gear Hobbing – 48T Module 2.5 Involute Teeth',
          stage: 'Primary Gear Cutting',
          machine: 'CNC Gear Hobbing Machine (6-Axis, Max Mod 6, Climb Hobbing)',
          machineCategory: 'Milling',
          tooling: 'Module 2.5 Hob Cutter (AA Class, TiAlN Coated, 3 Starts, Ø80mm OD); Arbor Ø32mm',
          fixturing: 'Expanding Mandrel located on bore Ø34.7mm + Hydraulic Clamping on Face',
          cuttingParams: { speed: '120 m/min', rpm: '475 RPM (Hob)', feed: '2.0 mm/WPC (axial)', doc: 'Full depth single pass (climb)' },
          inspectionTool: 'Gear Roll Tester (Master Gear Check); Span Measurement W3 = 18.52 ±0.015mm over 3 teeth',
          estimatedCycleTimeSec: 340,
          subordinatedDrawingRef: {
            balloonId: 'B2',
            balloonNumber: 2,
            feature: 'Involute Tooth Profile Z=48, Mod 2.5, Pressure Angle 20°',
            tolerance: 'Profile tolerance fα ≤ 12 µm (pre-grind), Pitch variation fp ≤ 14 µm',
            calloutLocation: { xPercent: 24, yPercent: 22 }
          }
        },
        {
          opNumber: 'OP 30',
          name: 'Keyway Broaching – Internal Keyway 10H9 x 5mm Deep',
          stage: 'Secondary Machining',
          machine: 'Vertical Hydraulic Broaching Press (10-Ton, 800mm Stroke)',
          machineCategory: 'Milling',
          tooling: '10mm HSS-PM Keyway Broach Set (Push Type, 20 Progressive Teeth, TiN Coated)',
          fixturing: 'Broaching Adapter Plate locating on face + bore pilot bushing',
          cuttingParams: { speed: '6 m/min (linear)', rpm: 'N/A', feed: '0.04 mm/tooth rise', doc: 'Full depth single pass' },
          inspectionTool: 'Keyway Width Gauge 10H9 (+0.036 / -0.000mm); Keyway Symmetry Gauge',
          estimatedCycleTimeSec: 90,
          subordinatedDrawingRef: {
            balloonId: 'B3',
            balloonNumber: 3,
            feature: 'Internal Keyway 10H9 x 5.0mm Depth x 40mm Length (DIN 6885)',
            tolerance: 'Width 10H9 (+0.036/0.000mm), Symmetry ±0.03mm to bore axis',
            calloutLocation: { xPercent: 35, yPercent: 38 }
          }
        },
        {
          opNumber: 'OP 40',
          name: 'Case Carburizing & Quench Hardening',
          stage: 'Heat Treatment',
          machine: 'Sealed Quench Atmosphere Furnace (Endothermic Gas, Carbon Potential Controlled)',
          machineCategory: 'Finishing',
          tooling: 'Endothermic Gas (CO/H2/N2 mix); Quench Oil ISO VG 22 at 80°C; Tempering Furnace 180°C',
          fixturing: 'Heat treat basket with anti-distortion spacers between gears; bore plugged with ceramic sleeve',
          cuttingParams: { speed: 'N/A', rpm: 'N/A', feed: 'N/A', doc: 'Carb. Temp 920°C / 6 hrs → Oil Quench → Temper 180°C / 2 hrs' },
          inspectionTool: 'Rockwell Hardness Tester (HRC 58-62 surface); Micro-Vickers Traverse for case depth profile',
          estimatedCycleTimeSec: 480,
          subordinatedDrawingRef: {
            balloonId: 'B4',
            balloonNumber: 4,
            feature: 'Full Surface Case Hardening (Teeth, OD & Faces)',
            tolerance: 'Surface HRC 58-62, Effective Case Depth (ECD) 0.8-1.2mm at 550 HV',
            calloutLocation: { xPercent: 55, yPercent: 18 }
          }
        },
        {
          opNumber: 'OP 50',
          name: 'CNC Internal Cylindrical Grinding – Bore Ø35H7',
          stage: 'Precision Bore Finishing',
          machine: 'CNC Internal Grinding Machine (Studer / Okuma, High-Speed ID Spindle 60,000 RPM)',
          machineCategory: 'Grinding',
          tooling: 'CBN Internal Grinding Wheel Ø25 x 30mm (B126 Vitrified Bond); Synthetic Coolant 6%',
          fixturing: 'Magnetic Diaphragm Chuck locating on gear OD + Face reference',
          cuttingParams: { speed: '50 m/s wheel', rpm: '55,000 RPM wheel / 200 RPM workpiece', feed: '0.003 mm/rev infeed', doc: '0.002 mm spark-out' },
          inspectionTool: 'Air Bore Gauge Ø35H7 (±0.001mm); Roundness Tester (Target ≤ 0.003mm)',
          estimatedCycleTimeSec: 250,
          subordinatedDrawingRef: {
            balloonId: 'B5',
            balloonNumber: 5,
            feature: 'Internal Bore Ø35H7 (+0.025 / -0.000mm) After Hardening',
            tolerance: 'Ø35H7, Roundness ≤ 0.003mm, Ra 0.4 µm, Perpendicularity to Face Datum ≤ 0.005mm',
            calloutLocation: { xPercent: 73, yPercent: 44 }
          }
        },
        {
          opNumber: 'OP 60',
          name: 'CNC Gear Profile Grinding – DIN 3962 Grade 6 Finish',
          stage: 'Precision Tooth Finishing',
          machine: 'CNC Gear Profile/Form Grinding Machine (Kapp-Niles / Reishauer, Continuous Generating Grind)',
          machineCategory: 'Grinding',
          tooling: 'Threaded CBN Grinding Worm (Module 2.5 Profile, Vitrified Bond, Auto-Dressing)',
          fixturing: 'Precision Expanding Mandrel on ground bore Ø35H7 + Hydraulic Tailstock',
          cuttingParams: { speed: '63 m/s wheel', rpm: '4200 RPM worm / 88 RPM workpiece', feed: '0.02 mm/stroke infeed', doc: '0.06 mm stock per flank' },
          inspectionTool: 'CNC Gear Inspection Center (Klingelnberg P40 / Gleason 300GMS) – Full DIN 3962 Tolerance Chart',
          estimatedCycleTimeSec: 380,
          subordinatedDrawingRef: {
            balloonId: 'B6',
            balloonNumber: 6,
            feature: 'Involute Tooth Profile & Lead Accuracy (All 48 Teeth)',
            tolerance: 'fα ≤ 7 µm, fβ ≤ 6 µm, Fp ≤ 18 µm, Ra 0.4 µm flank finish',
            calloutLocation: { xPercent: 18, yPercent: 58 }
          }
        },
        {
          opNumber: 'OP 70',
          name: 'Deburring, Wash, CMM Final & Gear Chart Sign-Off',
          stage: 'Quality Control & Metrology',
          machine: 'CNC Gear Measurement Center (Klingelnberg / Gleason) + CMM',
          machineCategory: 'Inspection',
          tooling: 'Ceramic Deburring Tool; Ultrasonic Parts Washer; Desiccant Rust Preventive Dip',
          fixturing: 'Gear Inspection Mandrel (Class AA) expanding on bore Ø35H7',
          cuttingParams: { speed: 'N/A', rpm: 'N/A', feed: 'N/A', doc: 'N/A' },
          inspectionTool: 'Full Gear Chart (Profile, Lead, Pitch, Runout per DIN 3962); Bore CMM Report; Hardness Certificate',
          estimatedCycleTimeSec: 270,
          subordinatedDrawingRef: {
            balloonId: 'B7',
            balloonNumber: 7,
            feature: 'Complete Gear Geometry & Material Property Verification',
            tolerance: 'DIN 3962 Grade 6 Compliance, Bore Concentricity TIR ≤ 0.008mm, Hardness Certificate',
            calloutLocation: { xPercent: 80, yPercent: 32 }
          }
        }
      ],
      machinesSummary: [
        {
          machineName: 'CNC Turning Center (2-Axis)',
          requiredSpecs: '350mm swing, 4000 RPM, 6-jaw chuck for disc blanks, boring bar capability',
          operationsPerformed: ['OP 10 (Turning Datum Faces & Bore Roughing)'],
          suitabilityScore: '97% match with ITTOVA Precision Turning Vendors'
        },
        {
          machineName: 'CNC Gear Hobbing Machine (6-Axis)',
          requiredSpecs: 'Max module 6, climb hobbing, auto-indexing, CNC dresser, 150mm max workpiece OD',
          operationsPerformed: ['OP 20 (48T Module 2.5 Involute Hobbing)'],
          suitabilityScore: '88% match with ITTOVA Gear Cutting Specialists'
        },
        {
          machineName: 'Sealed Quench Heat Treatment Furnace',
          requiredSpecs: 'Endothermic atmosphere, carbon potential ±0.05%, oil quench tank, tempering furnace',
          operationsPerformed: ['OP 40 (Case Carburizing & Quench Hardening)'],
          suitabilityScore: '91% ITTOVA Certified Heat Treatment Centers'
        },
        {
          machineName: 'CNC Gear Profile Grinding Machine',
          requiredSpecs: 'Continuous generating grind, CBN worm wheel, auto-dress, integrated gear inspection probe',
          operationsPerformed: ['OP 60 (DIN 3962 Grade 6 Finish Grinding)'],
          suitabilityScore: '85% match with Elite ITTOVA Gear Finishing Network'
        },
        {
          machineName: 'CNC Gear Inspection Center',
          requiredSpecs: 'Profile, lead, pitch, runout measurement per DIN 3962; export charts to PDF',
          operationsPerformed: ['OP 70 (Full Gear Chart & Quality Sign-Off)'],
          suitabilityScore: '100% ITTOVA IGI Metrology Verified'
        }
      ],
      toolingSummary: [
        { toolCategory: 'Turning Insert', toolCode: 'CNMG 120408-PM (OD Rough)', coating: 'CVD TiCN+Al2O3', purpose: 'Rough turning disc blank OD and faces' },
        { toolCategory: 'Boring Bar', toolCode: 'Ø34.7mm Carbide Boring Bar', coating: 'PVD TiAlN', purpose: 'Internal bore rough-to-semi-finish for grinding stock' },
        { toolCategory: 'Gear Hob', toolCode: 'Module 2.5 Hob (AA Class, 3 Starts)', coating: 'TiAlN Nano', purpose: 'Involute tooth generation by hobbing process' },
        { toolCategory: 'Broach Set', toolCode: '10mm HSS-PM Keyway Broach (Push)', coating: 'TiN', purpose: 'Internal keyway 10H9 single-pass broaching' },
        { toolCategory: 'Grinding Wheel', toolCode: 'CBN ID Wheel Ø25mm B126 Vit.', coating: 'Vitrified CBN', purpose: 'Post-hardening bore grinding to H7' },
        { toolCategory: 'Gear Grinding Worm', toolCode: 'Threaded CBN Worm (Mod 2.5)', coating: 'Vitrified CBN Superabrasive', purpose: 'Continuous generating tooth profile grinding' },
        { toolCategory: 'Inspection Mandrel', toolCode: 'Class AA Expanding Mandrel Ø35mm', coating: 'Hardened Tool Steel', purpose: 'Gear inspection datum for measurement center' }
      ],
      dfmRecommendations: [
        'Tooth root fillet radius must be ≥ 0.38 mm (full-radius hob protuberance recommended) to prevent fatigue crack initiation under cyclic loading.',
        'Bore grinding stock of 0.3mm (Ø34.7mm pre-hardened → Ø35.0 H7 post-grind) is optimal for case carburized 20MnCr5 to avoid grind burn.',
        'Case depth spec 0.8-1.2mm at tooth mid-height. Carbon masking paste on bore ID and keyway surfaces is recommended to maintain machinability for post-hardening grinding.',
        'Anti-distortion spacers between gears in heat treatment basket reduce quench distortion to < 0.02mm runout, minimizing gear grinding stock removal.'
      ]
    }
  }
];

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MAX_DRAWING_BYTES = 8 * 1024 * 1024;
const ALLOWED_DRAWING_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeDrawingUpload(imageBase64, mimeType) {
  if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
    throw httpError(400, 'A drawing file is required.');
  }

  let data = imageBase64.trim();
  let declaredMimeType = mimeType;
  const dataUrl = /^data:([^;,]+);base64,([\s\S]*)$/i.exec(data);
  if (dataUrl) {
    if (declaredMimeType && declaredMimeType !== dataUrl[1]) {
      throw httpError(400, 'The drawing file type does not match its content type.');
    }
    declaredMimeType = dataUrl[1];
    data = dataUrl[2];
  }

  if (!ALLOWED_DRAWING_TYPES.has(declaredMimeType)) {
    throw httpError(400, 'Upload a PNG, JPG, WEBP, or PDF engineering drawing.');
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data) || data.length % 4 === 1) {
    throw httpError(400, 'The drawing file is not valid base64 data.');
  }
  if (data.length > Math.ceil(MAX_DRAWING_BYTES / 3) * 4 + 4) {
    throw httpError(413, 'Drawing files must be 8 MB or smaller.');
  }

  const bytes = Buffer.from(data, 'base64');
  if (bytes.length === 0) throw httpError(400, 'The drawing file is empty.');
  if (bytes.length > MAX_DRAWING_BYTES) throw httpError(413, 'Drawing files must be 8 MB or smaller.');

  const isPdf = bytes.subarray(0, 5).toString('ascii') === '%PDF-';
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  const signatureMatches = declaredMimeType === 'application/pdf' ? isPdf
    : declaredMimeType === 'image/png' ? isPng
      : declaredMimeType === 'image/jpeg' ? isJpeg
        : isWebp;

  if (!signatureMatches) throw httpError(400, 'The drawing file contents do not match the selected file type.');

  return { imageBase64: data, mimeType: declaredMimeType };
}

function asText(value, fallback = 'Not specified') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asTextList(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()) : [];
}

function normalizeAnalysisResult(result) {
  if (!result || typeof result !== 'object' || !Array.isArray(result.operations) || result.operations.length === 0) {
    throw httpError(502, 'The vision model did not return a usable manufacturing analysis. Please retry with a clearer drawing.');
  }

  const operations = result.operations.map((operation, index) => {
    if (!operation || typeof operation !== 'object') {
      throw httpError(502, 'The vision model returned an incomplete manufacturing analysis. Please retry.');
    }

    const drawingRef = operation.subordinatedDrawingRef && typeof operation.subordinatedDrawingRef === 'object'
      ? operation.subordinatedDrawingRef
      : null;
    const callout = drawingRef?.calloutLocation && typeof drawingRef.calloutLocation === 'object'
      ? drawingRef.calloutLocation
      : null;
    const coordinate = value => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : null;
    };
    const cycleTime = Number(operation.estimatedCycleTimeSec);
    const cuttingParams = operation.cuttingParams && typeof operation.cuttingParams === 'object'
      ? operation.cuttingParams
      : {};

    return {
      opNumber: asText(operation.opNumber, `OP ${(index + 1) * 10}`),
      name: asText(operation.name, 'Manufacturing operation'),
      stage: asText(operation.stage, 'Process step'),
      machine: asText(operation.machine),
      machineCategory: asText(operation.machineCategory, 'Other'),
      tooling: asText(operation.tooling),
      fixturing: asText(operation.fixturing),
      cuttingParams: {
        speed: asText(cuttingParams.speed, ''),
        rpm: asText(cuttingParams.rpm, ''),
        feed: asText(cuttingParams.feed, ''),
        doc: asText(cuttingParams.doc, '')
      },
      inspectionTool: asText(operation.inspectionTool),
      estimatedCycleTimeSec: Number.isFinite(cycleTime) && cycleTime >= 0 ? cycleTime : 0,
      subordinatedDrawingRef: drawingRef ? {
        balloonId: asText(drawingRef.balloonId, `B${index + 1}`),
        balloonNumber: Number.isFinite(Number(drawingRef.balloonNumber)) ? Number(drawingRef.balloonNumber) : index + 1,
        feature: asText(drawingRef.feature),
        tolerance: asText(drawingRef.tolerance, ''),
        calloutLocation: callout ? {
          xPercent: coordinate(callout.xPercent),
          yPercent: coordinate(callout.yPercent)
        } : null
      } : null
    };
  });

  return {
    partName: asText(result.partName, 'Uploaded engineering drawing'),
    drawingNumber: asText(result.drawingNumber, 'Uploaded drawing'),
    material: asText(result.material),
    rawStock: asText(result.rawStock),
    dimensions: asText(result.dimensions),
    criticalTolerances: asTextList(result.criticalTolerances),
    operations,
    machinesSummary: Array.isArray(result.machinesSummary) ? result.machinesSummary
      .filter(machine => machine && typeof machine === 'object')
      .map(machine => ({
        machineName: asText(machine.machineName),
        requiredSpecs: asText(machine.requiredSpecs),
        operationsPerformed: asTextList(machine.operationsPerformed),
        suitabilityScore: asText(machine.suitabilityScore, '')
      })) : [],
    toolingSummary: Array.isArray(result.toolingSummary) ? result.toolingSummary
      .filter(tool => tool && typeof tool === 'object')
      .map(tool => ({
        toolCategory: asText(tool.toolCategory),
        toolCode: asText(tool.toolCode),
        coating: asText(tool.coating, ''),
        purpose: asText(tool.purpose)
      })) : [],
    dfmRecommendations: asTextList(result.dfmRecommendations)
  };
}

/** Analyze a supplied drawing, or return clearly labeled sample preset data. */
export async function analyzeCadDrawing({ imageBase64, mimeType = 'image/png', presetId, partHint, materialHint }) {
  if (presetId) {
    const preset = SAMPLE_CAD_DRAWINGS.find(item => item.id === presetId);
    if (!preset) throw httpError(404, 'The selected sample drawing was not found.');
    return {
      source: 'sample-preset',
      modelUsed: 'Sample engineering plan',
      analysis: preset.presetData,
      drawingSvg: preset.drawingSvg,
      drawingTitle: preset.title,
      drawingNo: preset.drawingNo,
      timestamp: new Date().toISOString(),
      notice: 'Sample engineering data. This plan is not an analysis of an uploaded drawing.'
    };
  }

  const upload = normalizeDrawingUpload(imageBase64, mimeType);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API;
  if (!apiKey) {
    throw httpError(503, 'Uploaded drawing analysis is not configured. Set GEMINI_API_KEY on the server to enable it.');
  }

  const result = await callGeminiVisionAnalysis({
    apiKey,
    ...upload,
    partHint: typeof partHint === 'string' ? partHint.slice(0, 200) : '',
    materialHint: typeof materialHint === 'string' ? materialHint.slice(0, 200) : ''
  });

  return {
    source: 'gemini-vision',
    modelUsed: GEMINI_MODEL,
    analysis: normalizeAnalysisResult(result),
    timestamp: new Date().toISOString(),
    notice: 'AI-generated estimate. Confirm all dimensions, tolerances, tooling, and process choices against the controlled engineering drawing before production.'
  };
}

/**
 * Call Gemini Vision with structured CAM / Process Planning Prompt
 */
async function callGeminiVisionAnalysis({ apiKey, imageBase64, mimeType, partHint, materialHint }) {
  const prompt = `You are a Senior CAM Process Planner, CNC Manufacturing Engineer, and Precision Machine Shop Estimator for ITTOVA Precision Sourcing.
Analyze the provided 2D engineering CAD drawing / blueprint or part geometry image carefully.

Deconstruct the part into its complete manufacturing lifecycle and respond ONLY with a valid JSON object matching the following structure:
{
  "partName": "string - descriptive name of the component",
  "drawingNumber": "string - drawing number or generated identifier",
  "material": "string - identified or recommended raw material specification (e.g. AISI 4140, AL 6061-T6, SS316L)",
  "rawStock": "string - raw material stock shape and dimensions (e.g. Ø60mm x 250mm Bar or 150x150x80mm Billet)",
  "dimensions": "string - overall bounding box or major diameters and length",
  "criticalTolerances": ["array of critical tolerances identified in the drawing"],
  "operations": [
    {
      "opNumber": "string, e.g. OP 10, OP 20",
      "name": "string - concise operation title",
      "stage": "string - setup / phase description",
      "machine": "string - exact CNC machine tool type and specifications",
      "machineCategory": "string - one of 'Turning', 'Milling', 'Drilling', 'Grinding', 'EDM', 'Inspection', 'Welding', 'Finishing'",
      "tooling": "string - exact cutting tool, insert grade/code, holder, or cutter diameter",
      "fixturing": "string - chuck, vise, soft jaws, fixture, or clamping setup",
      "cuttingParams": {
        "speed": "string with units, e.g. 180 m/min",
        "rpm": "string with units, e.g. 1200 RPM",
        "feed": "string with units, e.g. 0.2 mm/rev",
        "doc": "string with units, e.g. 1.5 mm"
      },
      "inspectionTool": "string - measuring instrument (e.g. Micrometer, Bore Gauge, CMM)",
      "estimatedCycleTimeSec": 180,
      "subordinatedDrawingRef": {
        "balloonId": "string, e.g. B1, B2, B3",
        "balloonNumber": 1,
        "feature": "string - geometric feature name corresponding to this drawing callout",
        "tolerance": "string - specific tolerance or surface finish requirement on drawing",
        "calloutLocation": {
          "xPercent": 35,
          "yPercent": 40
        }
      }
    }
  ],
  "machinesSummary": [
    {
      "machineName": "string - name of the required machine",
      "requiredSpecs": "string - required spindle speed, power, travels, and accuracy grade",
      "operationsPerformed": ["array of op numbers performed on this machine"],
      "suitabilityScore": "string - vendor match percentage"
    }
  ],
  "toolingSummary": [
    {
      "toolCategory": "string",
      "toolCode": "string",
      "coating": "string",
      "purpose": "string"
    }
  ],
  "dfmRecommendations": [
    "array of strings containing actionable design-for-manufacturing insights, corner radius recommendations, clamping stability suggestions, or cost reduction notes"
  ]
}

Part hint (if provided): ${partHint || 'None'}
Material hint (if provided): ${materialHint || 'None'}

Be extremely thorough, technical, and accurate. Make sure each operation clearly subordinates to a drawing feature with balloonId B1, B2, B3... and plausible relative percentage coordinates (xPercent: 10-90, yPercent: 10-90) so it can be visually pinned on the drawing.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      await res.text().catch(() => '');
      console.warn(`[cad-analyzer] Gemini API returned HTTP ${res.status}.`);
      throw httpError(502, 'The drawing could not be analyzed by the vision service. Please try again later.');
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Empty response text from Gemini');

    return JSON.parse(candidateText);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw httpError(504, 'Drawing analysis took too long. Try a smaller or clearer drawing.');
    }
    if (err.statusCode) throw err;
    throw httpError(502, 'The vision service returned an invalid response. Please try again later.');
  }
}
