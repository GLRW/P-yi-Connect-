import Svg, { Rect } from 'react-native-svg';

// Motif de QR code dérivé du code du bon (illustratif). En production : vrai QR
// encodant l'identifiant signé du bon, scanné par le vendeur pour valider le retrait.
export function QR({ code, taille = 104 }: { code: string; taille?: number }) {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const cases: { x: number; y: number }[] = [];
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const repere = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    if (!repere && rnd() > 0.52) cases.push({ x, y });
  }
  const finder = (x: number, y: number) => [
    <Rect key={'a' + x + y} x={x} y={y} width={7} height={7} fill="#111" />,
    <Rect key={'b' + x + y} x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />,
    <Rect key={'c' + x + y} x={x + 2} y={y + 2} width={3} height={3} fill="#111" />,
  ];
  return (
    <Svg width={taille} height={taille} viewBox="-1 -1 23 23" accessibilityLabel={'QR code du bon ' + code}>
      <Rect x={-1} y={-1} width={23} height={23} fill="#fff" />
      {cases.map((k) => <Rect key={k.x + '-' + k.y} x={k.x} y={k.y} width={1} height={1} fill="#111" />)}
      {finder(0, 0)}{finder(14, 0)}{finder(0, 14)}
    </Svg>
  );
}
