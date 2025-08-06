// positions en px (pour prototype). On pourra plus tard convertir en % pour responsive.
export const MAP_NODES = [
  { id: 1, x: 80,  y: 60,  label: "Start",    type: "start",  difficulty: "easy",   next: [2,3],  reward: { pts: 0 } },
  { id: 2, x: 260, y: 60,  label: "Bridge",   type: "mini",   difficulty: "easy",   next: [4],    reward: { pts: 10, item: "clé" } },
  { id: 3, x: 260, y: 180, label: "Cave",     type: "mini",   difficulty: "hard",   next: [4,5], reward: { pts: 20 } },
  { id: 4, x: 460, y: 110, label: "Village",  type: "mini",   difficulty: "normal", next: [6],    reward: { pts: 15 } },
  { id: 5, x: 460, y: 230, label: "Mountain", type: "mini",   difficulty: "hard",   next: [6],    reward: { pts: 30, item: "amulette" } },
  { id: 6, x: 660, y: 140, label: "Temple",   type: "boss",   difficulty: "hard",   next: [],     reward: { pts: 100 } },
];