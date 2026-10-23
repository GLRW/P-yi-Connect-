import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { couleur?: string; taille?: number; epais?: number };
const base = ({ couleur = '#111', taille = 22, epais = 2 }: P) => ({ width: taille, height: taille, viewBox: '0 0 24 24', fill: 'none', stroke: couleur, strokeWidth: epais, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const IcAccueil = (p: P) => <Svg {...base(p)}><Path d="M3 11l9-7 9 7v9H3z" /></Svg>;
export const IcCarte = (p: P) => <Svg {...base(p)}><Path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><Circle cx={12} cy={9} r={2.5} /></Svg>;
export const IcBons = (p: P) => <Svg {...base(p)}><Path d="M4 4h16v16l-4-2-4 2-4-2-4 2z" /><Path d="M8 9h8M8 13h5" /></Svg>;
export const IcMessages = (p: P) => <Svg {...base(p)}><Path d="M4 5h16v11H9l-5 4z" /></Svg>;
export const IcArrivage = (p: P) => <Svg {...base(p)}><Path d="M4 7h16M4 12h16M4 17h10" /></Svg>;
export const IcCompte = (p: P) => <Svg {...base(p)}><Circle cx={12} cy={8} r={4} /><Path d="M4 21a8 8 0 0 1 16 0" /></Svg>;
export const IcLoupe = (p: P) => <Svg {...base(p)}><Circle cx={11} cy={11} r={7} /><Path d="M20 20l-3.5-3.5" /></Svg>;
export const IcVerrou = (p: P) => <Svg {...base(p)}><Rect x={5} y={11} width={14} height={9} rx={2} /><Path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>;
export const IcEnvoyer = (p: P) => <Svg {...base(p)}><Path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const IcPhoto = (p: P) => <Svg {...base(p)}><Path d="M4 8h3l2-3h6l2 3h3v11H4z" /><Circle cx={12} cy={13} r={3.5} /></Svg>;
export const IcMicro = (p: P) => <Svg {...base(p)}><Rect x={9} y={3} width={6} height={11} rx={3} /><Path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Svg>;
export const IcDirect = (p: P) => <Svg {...base(p)}><Circle cx={12} cy={12} r={3} /><Path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9" /></Svg>;
