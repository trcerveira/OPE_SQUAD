"use client";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    icon: string;
    tier: string;
    specialty: string;
    isOrchestrator: boolean;
  };
  isActive: boolean;
  onClick: () => void;
}

const tierColors: Record<string, string> = {
  chief: "#BFD64B",
  "0": "#60A5FA",
  "1": "#A78BFA",
  "2": "#F97316",
};

export default function AgentCard({ agent, isActive, onClick }: AgentCardProps) {
  const tierColor = tierColors[agent.tier] || "#8892a4";
  const tierLabel = agent.isOrchestrator ? "Chief" : `T${agent.tier}`;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3"
      style={{
        backgroundColor: isActive ? "var(--accent)15" : "transparent",
        border: isActive
          ? "1px solid var(--accent)44"
          : "1px solid transparent",
      }}
    >
      {/* Icon */}
      <span className="text-lg shrink-0">{agent.icon}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium truncate"
            style={{ color: isActive ? "var(--accent)" : "var(--text)" }}
          >
            {agent.name}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
            style={{
              backgroundColor: `${tierColor}20`,
              color: tierColor,
              border: `1px solid ${tierColor}40`,
            }}
          >
            {tierLabel}
          </span>
        </div>
        {agent.specialty && (
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "#8892a4" }}
          >
            {agent.specialty}
          </p>
        )}
      </div>
    </button>
  );
}
