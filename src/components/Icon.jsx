import {
  Flame, Waves, CloudRain, Tornado, Mountain, Snowflake, CloudLightning,
  Zap, Wind, Thermometer, CloudSnow, Haze, Sun,
  Home, Building2, DollarSign, ClipboardList, Lock, MapPin, BarChart3, Lightbulb,
  Heart, HeartCrack, Brain, Eye, Bone, Dna, Microscope, Pill, Hospital,
  Stethoscope, Activity,
  Camera, ArrowRight, ArrowLeft, X, Check, ChevronUp, ChevronDown, Menu, Sparkles,
  AlertTriangle, CircleCheck, ShieldAlert,
  Users, Map, Bug, Wheat, Hammer, Ribbon, Hand, ArrowUp, ArrowDown,
  Droplets, Puzzle, Dumbbell, Flower2, Droplet, Atom, Car, Moon, Globe,
  Mic, MicOff, Volume2, Loader2,
  Star,
} from 'lucide-react'

const ICON_MAP = {
  // Weather / Disasters
  '\u{1F525}': Flame, '\u{1F30A}': Waves, '\u{1F327}\uFE0F': CloudRain,
  '\u{1F32A}\uFE0F': Tornado, '\u{1F3D4}\uFE0F': Mountain, '\u{2744}\uFE0F': Snowflake,
  '\u{26C8}\uFE0F': CloudLightning, '\u26A1': Zap, '\u{1F300}': Wind,
  '\u{1F321}\uFE0F': Thermometer, '\u{1F328}\uFE0F': CloudSnow, '\u{1FAA8}': Mountain,

  // Health conditions
  '\u{1FA78}': Droplets, '\u2764\uFE0F': Heart, '\u{1FA7A}': Stethoscope,
  '\u{1F9E0}': Brain, '\u{1FAC1}': Activity, '\u{1F980}': Microscope,
  '\u{1F49B}': Ribbon, '\u{1F535}': Microscope, '\u{1F9EC}': Dna,
  '\u{1F9B4}': Bone, '\u{1F494}': HeartCrack, '\u{1F98B}': Flower2,
  '\u{1F397}\uFE0F': Ribbon, '\u{1F52C}': Microscope, '\u{1F9E9}': Puzzle,
  '\u{1F932}': Hand, '\u{1F4A8}': Wind, '\u{1FAD8}': Droplet,
  '\u{1F4AA}': Dumbbell, '\u{1F441}\uFE0F': Eye,

  // Location factors
  '\u{1F5FA}\uFE0F': Map, '\u2622\uFE0F': Atom, '\u{1F99F}': Bug,
  '\u{1F32B}\uFE0F': Haze, '\u2600\uFE0F': Sun, '\u26CF\uFE0F': Hammer,
  '\u{1F33E}': Wheat,

  // UI elements
  '\u{1F4F8}': Camera, '\u{1F4F7}': Camera, '\u2192': ArrowRight,
  '\u2715': X, '\u26A0\uFE0F': AlertTriangle, '\u2705': CircleCheck,
  '\u2713': Check, '\u25B2': ChevronUp, '\u25BC': ChevronDown,
  '\u2630': Menu, '\u{1F3E0}': Home, '\u{1F3E2}': Building2,
  '\u2726': Sparkles, '\u{1F4B8}': DollarSign, '\u{1F4CB}': ClipboardList,
  '\u{1F512}': Lock, '\u{1F4CD}': MapPin,
  '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}': Users,
  '\u{1F4CA}': BarChart3, '\u{1F4A1}': Lightbulb,
  '\u2191': ArrowUp, '\u2193': ArrowDown,
  '\u{1F48A}': Pill, '\u{1F3E5}': Hospital,
  '\u{1FA7A}': Stethoscope,

  // Named aliases (for direct use)
  flame: Flame, waves: Waves, tornado: Tornado, mountain: Mountain,
  snowflake: Snowflake, lightning: CloudLightning, zap: Zap, wind: Wind,
  thermometer: Thermometer, hail: CloudSnow, rain: CloudRain, hurricane: Wind,
  home: Home, building: Building2, dollar: DollarSign, clipboard: ClipboardList,
  lock: Lock, pin: MapPin, chart: BarChart3, lightbulb: Lightbulb,
  heart: Heart, brain: Brain, eye: Eye, bone: Bone, dna: Dna,
  microscope: Microscope, stethoscope: Stethoscope, pill: Pill, hospital: Hospital,
  camera: Camera, arrowRight: ArrowRight, x: X, check: Check,
  chevronUp: ChevronUp, chevronDown: ChevronDown, menu: Menu,
  sparkles: Sparkles, warning: AlertTriangle, checkCircle: CircleCheck,
  users: Users, map: Map, bug: Bug, wheat: Wheat, hammer: Hammer,
  ribbon: Ribbon, hand: Hand, sun: Sun, haze: Haze, atom: Atom,
  droplets: Droplets, droplet: Droplet, puzzle: Puzzle, dumbbell: Dumbbell,
  flower: Flower2, activity: Activity, arrowUp: ArrowUp, arrowDown: ArrowDown,
  heartCrack: HeartCrack, shieldAlert: ShieldAlert,
  star: Star, car: Car, moon: Moon, arrowLeft: ArrowLeft, globe: Globe,
  mic: Mic, micOff: MicOff, volume: Volume2, loader: Loader2,
}

export default function Icon({ name, size = 20, className = '', style = {}, ...props }) {
  const IconComponent = ICON_MAP[name]
  if (!IconComponent) return <span className={className} style={style}>{name}</span>
  return <IconComponent size={size} className={className} style={style} {...props} />
}
