// src/components/adventure/MapNode.jsx
import React from "react";
import { motion } from "framer-motion";

export default function MapNode({ node, visited, onClick, isCurrent }) {
  const size = 56;
  const baseStyle = {
    position: "absolute",
    left: node.x - size / 2,
    top: node.y - size / 2,
    width: size,
    height: size,
    zIndex: isCurrent ? 30 : (visited ? 20 : 10),
  };

  return (
    <motion.div
      style={baseStyle}
      initial={false}
      animate={isCurrent ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={isCurrent ? { duration: 1.2, repeat: Infinity } : {}}
      className={`rounded-full flex flex-col items-center justify-center text-xs font-medium cursor-pointer select-none shadow-sm`}
      onClick={() => onClick(node)}
      title={`${node.label} — ${node.difficulty}`}
    >
      <div className={`w-full h-full flex flex-col items-center justify-center rounded-full
        ${isCurrent ? "bg-indigo-600 text-white" : visited ? "bg-green-200 text-black" : "bg-white text-black border border-gray-300"}`}>
        <div className="text-[12px] leading-none">{node.label}</div>
        <div className="text-[9px] text-gray-600">{node.difficulty}</div>
      </div>
    </motion.div>
  );
}