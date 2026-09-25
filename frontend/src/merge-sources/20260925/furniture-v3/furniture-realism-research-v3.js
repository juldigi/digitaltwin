export const FURNITURE_REALISM_RESEARCH_VERSION_V3='FRR-V3-2026-09-25';
export const REALISM_POLICY_V3=Object.freeze({
 status:'INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT',
 rule:'Never claim field-accurate furniture identity, quantity, position, brand, safety compliance or inventory without plant evidence.',
 placement:'Room/function aware; no random scatter; preserve doors, operator travel, maintenance access, machine service envelopes and egress.',
 appearance:'Real manufacturing vocabulary, believable scale, construction logic, restrained wear and physically plausible materials.',
 animation:'Furniture is static unless the real object has a legitimate movable element; no decorative motion.'
});

export const V3_REFERENCE_LEDGER=Object.freeze([
 {id:'XRITE_JUDGE_QC',category:'QC',source:'X-Rite Judge QC',url:'https://www.xrite.com/judge-qc',verified:{depthM:.535,widthM:.685,heightM:.545,viewingDepthM:.635,viewingWidthM:.47,viewingHeightM:.38},use:'QC viewing booth envelope and light-source/control-panel vocabulary'},
 {id:'RUBBERMAID_FULL_HOUSEKEEPING',category:'JANITOR',source:'Rubbermaid Commercial Full Size Housekeeping Cart',url:'https://www.rubbermaidcommercial.com/cleaning/housekeeping-carts-accessories/full-size-housekeeping-cart/',verified:{lengthM:1.585,widthM:.6198,heightM:1.2446},use:'housekeeping cart envelope, shelves, bag support and maneuvering footprint'},
 {id:'ELKAY_ESS25202',category:'JANITOR',source:'Elkay ESS25202 service sink',url:'https://www.elkay.com/products/sinks/installation-type/wall/ess25202',verified:{lengthM:.635,widthM:.4953,bowlDepthM:.3048,backsplashM:.3048,drainM:.0889,gauge:14,material:'Type 304 stainless steel'},use:'janitor/service sink construction'},
 {id:'MECALUX_SELECTIVE_RACK',category:'WAREHOUSE',source:'Interlake Mecalux selective pallet rack',url:'https://www.interlakemecalux.com/warehouse-racking/pallet-racking',verified:{uprightFrame:'2 posts + horizontal/diagonal struts',postSlotPitchIn:2,beam:'roll formed with welded endplates',lock:'spring/piston safety lock',base:'footplate + floor anchor'},use:'rack construction vocabulary, not plant rack engineering'},
 {id:'CROWN_PTH',category:'MATERIAL_HANDLING',source:'Crown PTH pallet truck family',url:'https://www.crown.com/content/dam/crown/pdfs/apac/brochures/pallet-truck-pth50-brochure-GB.pdf',verified:{forkLengthClassM:[.795,1.15],forkWidthM:.16,steerWheelDiaM:.18,loadWheelDiaM:.074},use:'manual pallet jack proportion vocabulary'},
 {id:'OSHA_CHAIR',category:'OFFICE',source:'OSHA Computer Workstations - Chairs',url:'https://www.osha.gov/etools/computer-workstations/components/chairs',verified:{features:['lumbar support','five-leg base','casters appropriate to flooring','adjustable seat/back/arms']},use:'task chair functional vocabulary, not brand identity'}
]);

export const V3_ASSET_DETAIL_CONTRACT=Object.freeze({
 TASK_CHAIR:['seat pan with front waterfall radius','back shell + upholstered/mesh inner panel','lumbar cue','two arm assemblies','gas lift','five-star base','5 caster forks','10 wheel halves or equivalent dual-wheel cue','height lever','grounded tire contact'],
 DESK:['worktop thickness','edge band cue','leg/frame system','modesty panel only where applicable','cable grommet','under-desk cable tray','power/data drop reference','mobile pedestal with drawer gaps','leveling feet'],
 MFP:['distinct base','paper cassettes','output bay','scanner bed','lid/ADF','operator panel','ventilation slots','caster/foot cue'],
 LOCKER:['thin sheet carcass','individual doors','hinges','recessed/padlock handle vocabulary','top/bottom ventilation','number plate','internal shelf/hook','plinth/legs','bench separate from locker'],
 WORKBENCH:['thick top','steel frame','drawer/cabinet module','leg cross-member','leveling feet','back/peg board','bench vise with fixed/moving jaw and handle','power strip reference where appropriate'],
 QC_BENCH:['chemically neutral/light surface','storage','sample trays','instrument zone','task illumination/light booth','stool/seat','cable/service management'],
 PALLET_RACK:['upright frame','horizontal + diagonal bracing','footplates','anchors','front/rear beams','endplate/lock cue','deck/support bars only if selected','upright protector where aisle-facing'],
 PALLET_LOAD:['real pallet board/stringer/block vocabulary','load layers','edge/corner protector','strap','semi-transparent wrap','identification label'],
 PALLET_JACK:['fork pair','fork heel/chassis','load wheels','steering wheel','hydraulic body','tiller stem','control handle','ground clearance'],
 JANITOR_SINK:['bowl cavity','rolled rim','backsplash','drain opening','P-trap cue','wall hanger/bracket','faucet/service spout','hot/cold valves'],
 HOUSEKEEPING_CART:['molded or steel chassis','shelves','vertical uprights','bag frame','push handle','small supply caddy','tool clips','4 casters','bumper cue'],
 TOILET_CUBICLE:['partition panels','door','hinges','latch/indicator','feet/pilasters','clear floor gap','door swing logic'],
 PACKING_STATION:['work surface','frame','under-shelf','upper shelf/rail','carton/tape/paper holder cues','label/scanner position','power strip','foot/leveler'],
 SAFETY_ACCESSORY:['mounting hardware','support or bracket','high-visibility but restrained color','realistic thickness','no floating decals']
});

export const V3_ROOM_MICRODETAILS=Object.freeze({
 ADMIN_OFFICE:['dual-level cable management','desk phone/headset option','document tray','waste bin','clock','small filing/credenza','visitor chairs face desk'],
 PPIC_OFFICE:['planning board','production schedule board','MFP','document sort cubbies','workstation','archive storage'],
 SUPERVISOR_OFFICE:['workstation','visitor chairs','credenza','small meeting surface','planning board'],
 MEETING:['table power module','presentation board/screen','cable floorbox reference','chairs aligned to table','small credenza'],
 QC_SAMPLE:['Judge-QC-class light booth','sample cabinets','sample trays','instrument bench','stool','status/hold board','label shelves'],
 INCOMING_QC:['inspection bench','sampling trolley','hold/release status board','sample storage','instrument side table'],
 PDS_PREPRESS_OFFICE:['flat-file drawers','plate/document vertical storage','operator workstation','proof inspection surface'],
 PREPRESS:['A-frame plate rack','cassette rack','light inspection table','operator desk','plate trolley'],
 WORKSHOP:['heavy workbench','vise','shadow board','mobile tool cart','heavy cabinet','small-parts bins','lubricant/chemical reference only if evidenced'],
 MAINTENANCE:['workbench','shadow board','drawer cabinet','lockable cabinet','mobile cart','maintenance log holder','spares bins'],
 SPAREPART_WAREHOUSE:['bin picking wall','drawer cabinet','shelving/rack','location labels','clear picking aisle','parts cart'],
 PANTRY:['base/wall cabinets','worktop','sink','faucet','refrigerator','microwave shelf','water dispenser','break table/chairs','waste bin'],
 LOCKER_CHANGE:['ventilated lockers','numbering','bench','shoe rack','coat hooks','clear changing aisle'],
 PRAYER_ROOM:['shoe rack','low bench','prayer mats','wall clock','minimal storage; no office clutter'],
 TOILET:['cubicle partitions','toilet','vanity/basin','faucet','mirror','soap','tissue','hand-dry/towel/waste','floor drain','exhaust grille'],
 JANITOR:['service sink','chemical shelf','housekeeping cart','mop/broom tool rack','PPE hook','floor drain','no office furniture'],
 ELECTRICAL:['insulating-mat visual reference','drawing/document holder','maintenance cabinet outside panel clearances','no flammable storage unless evidenced'],
 FIRE_PUMP_ROOM:['maintenance cabinet','log/document station','small tool board only','preserve equipment access'],
 BROKE_WASTE_ROOM:['wheeled bins','segregation station','platform trolley','washdown/housekeeping support','clear maneuvering space'],
 DISPATCH_LOADING:['packing station','pallet jack','platform trolley','wheel chock station','dock bumper','guardrail','shipping document point'],
 RMS:['selective rack vocabulary','wrapped paperboard pallets','reel cradle','floor scale','pallet jack','material status board','pedestrian barrier','corner/upright protection'],
 FINISHED_GOODS:['wrapped carton loads','pallet jack','stretch wrapper','shipping document/label station','staging zone markings'],
 PRODUCTION:['line-side WIP trolley/pallet','waste bin','status board','mobile QC trolley','housekeeping point','machine service zone remains empty'],
 EXTERIOR:['weatherproof bins','bollards','hose reel cabinet','dock accessories','no arbitrary garden furniture']
});

export const V3_QUALITY_GATES=Object.freeze({
 minVisibleConstructionFeaturesPerLargeAsset:5,
 minMaterialFamiliesPerRoom:3,
 maxFurnitureScaleDeviationFromReference:0.18,
 minDoorApproachDepthM:1.0,
 minPrimaryCirculationM:.9,
 minChairPullbackM:.72,
 minWallGapForMobileFurnitureM:.04,
 floorPenetrationToleranceM:.015,
 floatingToleranceM:.012,
 maxDuplicateSemanticSamePositionM:.12,
 noAssetInsideMachineServiceClearance:true,
 noRandomDecorativeMotion:true,
 noUnverifiedBrandMarking:true
});