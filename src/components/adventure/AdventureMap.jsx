// src/components/adventure/AdventureMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { MAP_NODES } from "./adventureData";
import MapNode from "./MapNode";
import { motion, AnimatePresence } from "framer-motion";
import LogicGame from "../LogicGame";
import MemoryGame from "../MemoryGame";
import PuzzleGame from "../PuzzleGame";
import { useTranslation } from "react-i18next";

/**
 * Prototype amélioré du mode aventure
 * - avatar animé (se déplace vers node)
 * - dialogues courts avant défi
 * - score & inventory
 * - modal jeu qui passe difficulty et onComplete
 *
 * IMPORTANT:
 * - Les composants LogicGame/MemoryGame/PuzzleGame doivent appeler `props.onComplete(success, meta)` quand le défi est fini.
 * - Si ce n'est pas encore le cas, il y a des boutons "Simuler succès/échec" dans la modal.
 */

export default function AdventureMap() {
  const { t } = useTranslation();

  const saved = typeof window !== "undefined" ? localStorage.getItem("adventure_progress_v2") : null;
  const parsed = saved ? JSON.parse(saved) : null;
  const startNode = parsed?.currentNode ?? MAP_NODES[0].id;

  const [currentNodeId, setCurrentNodeId] = useState(startNode);
  const [visited, setVisited] = useState(new Set([startNode]));
  const [selectedNode, setSelectedNode] = useState(null);
  const [openGame, setOpenGame] = useState(false);
  const [gameType, setGameType] = useState(null);
  const [score, setScore] = useState(parsed?.score ?? 0);
  const [inventory, setInventory] = useState(parsed?.inventory ?? []);
  const [dialog, setDialog] = useState(null);

  // avatar pos
  const [avatarPos, setAvatarPos] = useState(() => {
    const start = MAP_NODES.find((n) => n.id === startNode);
    return { x: start.x, y: start.y };
  });

  // save progress
  useEffect(() => {
    localStorage.setItem("adventure_progress_v2", JSON.stringify({
      currentNode: currentNodeId,
      score,
      inventory
    }));
  }, [currentNodeId, score, inventory]);

  function getNode(id) { return MAP_NODES.find(n => n.id === id); }

  // when currentNode changes, move avatar visually
  useEffect(() => {
    const n = getNode(currentNodeId);
    if (n) {
      setAvatarPos({ x: n.x, y: n.y });
    }
  }, [currentNodeId]);

  function handleNodeClick(node) {
    setSelectedNode(node);
    // show a short dialog / context
    setDialog(`${t("you_arrive")} ${node.label}. ${t("choose_action")}`);
  }

  function launchChallenge(node) {
    // determine game type by difficulty and type
    let chosen;
    if (node.type === "boss") chosen = "puzzle";
    else {
      if (node.difficulty === "easy") chosen = "memory";
      else if (node.difficulty === "normal") chosen = "logic";
      else chosen = "puzzle";
    }
    setGameType(chosen);
    setOpenGame(true);
    setDialog(null);
  }

  // called when a mini-game ends (either from the game component via props.onComplete, or from simulation buttons)
  function onChallengeComplete(success = false, meta = {}) {
    setOpenGame(false);
    if (success && selectedNode) {
      // award points/items based on node.reward
      const reward = selectedNode.reward ?? {};
      if (reward.pts) setScore((s) => s + reward.pts);
      if (reward.item) setInventory((inv) => Array.from(new Set([...inv, reward.item])));

      setVisited((prev) => new Set(prev).add(selectedNode.id));

      // advance to a random next node or stay if none
      const nexts = selectedNode.next;
      if (nexts && nexts.length > 0) {
        const pick = nexts[Math.floor(Math.random() * nexts.length)];
        setCurrentNodeId(pick);
      } else {
        // reached end - show victory dialog
        setDialog(t("victory_reached"));
      }
    } else {
      // failure -> small penalty / dialog
      setDialog(t("try_again_or_choose"));
    }

    // cleanup
    setSelectedNode(null);
    setGameType(null);
  }

  // wrapper to render correct game component and pass onComplete + difficulty
  function renderGameComponent() {
    const node = selectedNode;
    const difficulty = node?.difficulty || "normal";
    const onCompleteProp = (success, meta = {}) => onChallengeComplete(success, meta);

    if (!gameType) return null;

    if (gameType === "logic") {
      // LogicGame should accept onComplete & difficulty
      return <LogicGame onComplete={onCompleteProp} difficulty={difficulty} />;
    }
    if (gameType === "memory") {
      return <MemoryGame onComplete={onCompleteProp} difficulty={difficulty} />;
    }
    if (gameType === "puzzle") {
      return <PuzzleGame onComplete={onCompleteProp} difficulty={difficulty} />;
    }
    return <div>Unknown game</div>;
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">{t("adventure_mode")}</h2>

      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow p-4" style={{ width: 760, height: 320 }}>
        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {MAP_NODES.map(n =>
            n.next.map(toId => {
              const to = getNode(toId);
              if (!to) return null;
              return (
                <line
                  key={`${n.id}-${to.id}`}
                  x1={n.x} y1={n.y}
                  x2={to.x} y2={to.y}
                  stroke="#cbd5e1"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {MAP_NODES.map(node => (
          <MapNode
            key={node.id}
            node={node}
            visited={visited.has(node.id)}
            isCurrent={node.id === currentNodeId}
            onClick={handleNodeClick}
          />
        ))}

        {/* Avatar */}
        <motion.div
          style={{ position: "absolute", zIndex: 50 }}
          animate={{ left: avatarPos.x - 18, top: avatarPos.y - 46 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow">
            <span style={{ fontSize: 14 }}>🧭</span>
          </div>
        </motion.div>
      </div>

      {/* Side info */}
      <div className="w-full max-w-3xl flex gap-4">
        <div className="bg-white p-4 rounded shadow w-1/3">
          <h4 className="font-semibold">{t("current_position")}</h4>
          <p className="text-sm text-gray-600">{getNode(currentNodeId).label} — {getNode(currentNodeId).difficulty}</p>

          <div className="mt-3">
            <div className="text-sm">{t("score")}: <span className="font-mono">{score}</span></div>
            <div className="text-sm mt-2">{t("inventory")}:</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {inventory.length === 0 ? <span className="text-sm text-gray-400">{t("no_items")}</span> :
                inventory.map(it => <div key={it} className="px-2 py-1 bg-gray-100 rounded text-sm">{it}</div>)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow w-2/3">
          <h4 className="font-semibold">{t("selection")}</h4>
          {selectedNode ? (
            <>
              <p className="text-sm">{selectedNode.label} — {selectedNode.difficulty}</p>
              <p className="text-sm text-gray-600 mt-1">{t("node_type")}: {selectedNode.type}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => launchChallenge(selectedNode)} className="px-3 py-2 bg-indigo-600 text-white rounded">{t("launch_challenge")}</button>
                <button onClick={() => setSelectedNode(null)} className="px-3 py-2 border rounded">{t("close")}</button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">{t("click_node")}</p>
          )}

          {dialog && <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">{dialog}</div>}
        </div>
      </div>

      {/* Modal game */}
      <AnimatePresence>
        {openGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{t("challenge_at")}: {selectedNode?.label}</h3>
                <button onClick={() => setOpenGame(false)} className="text-gray-500">✕</button>
              </div>

              <div className="mt-4">
                {/* Pass difficulty and onComplete to game component */}
                {renderGameComponent()}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {/* For testing if your mini-game does not yet call onComplete */}
                <button onClick={() => onChallengeComplete(true)} className="px-3 py-2 bg-green-600 text-white rounded">{t("simulate_success")}</button>
                <button onClick={() => onChallengeComplete(false)} className="px-3 py-2 bg-red-200 rounded">{t("simulate_failure")}</button>
                <button onClick={() => setOpenGame(false)} className="px-3 py-2 border rounded">{t("close")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
