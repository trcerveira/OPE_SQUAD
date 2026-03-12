"use client";

import { useState } from "react";
import AgentCard from "./AgentCard";

interface AgentInfo {
  id: string;
  file: string;
  name: string;
  icon: string;
  tier: string;
  specialty: string;
  isOrchestrator: boolean;
}

interface SquadInfo {
  id: string;
  name: string;
  icon: string;
  purpose: string;
  agents: AgentInfo[];
}

interface SquadBrowserProps {
  squads: SquadInfo[];
  activeAgentKey: string | null;
  onSelectAgent: (squadId: string, agent: AgentInfo) => void;
  onClose?: () => void;
}

export default function SquadBrowser({
  squads,
  activeAgentKey,
  onSelectAgent,
  onClose,
}: SquadBrowserProps) {
  const [expandedSquad, setExpandedSquad] = useState<string | null>(
    squads[0]?.id || null
  );
  const [search, setSearch] = useState("");

  const filteredSquads = squads
    .map((squad) => ({
      ...squad,
      agents: squad.agents.filter(
        (a) =>
          !search ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.specialty.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((squad) => squad.agents.length > 0);

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "#1a2035" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎛️</span>
          <span
            className="text-sm font-bold tracking-wide"
            style={{ color: "var(--text)" }}
          >
            SQUADS
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded hover:opacity-80"
            style={{ color: "#8892a4" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <input
          type="text"
          placeholder="Procurar agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "var(--surface)",
            color: "var(--text)",
            border: "1px solid #2a3555",
          }}
        />
      </div>

      {/* Squad List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredSquads.map((squad) => {
          const isExpanded = expandedSquad === squad.id;

          return (
            <div key={squad.id} className="mb-1">
              {/* Squad Header */}
              <button
                onClick={() =>
                  setExpandedSquad(isExpanded ? null : squad.id)
                }
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:opacity-90 transition-all"
                style={{
                  backgroundColor: isExpanded ? "var(--surface)" : "transparent",
                }}
              >
                <span className="text-sm">{squad.icon}</span>
                <span
                  className="text-xs font-semibold flex-1"
                  style={{ color: "var(--text)" }}
                >
                  {squad.name}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--accent)15",
                    color: "var(--accent)",
                  }}
                >
                  {squad.agents.length}
                </span>
                <span
                  className="text-xs transition-transform"
                  style={{
                    color: "#8892a4",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  ▸
                </span>
              </button>

              {/* Agents */}
              {isExpanded && (
                <div className="ml-2 mt-1 space-y-0.5">
                  {/* Orchestrator first, then by tier */}
                  {squad.agents
                    .sort((a, b) => {
                      if (a.isOrchestrator && !b.isOrchestrator) return -1;
                      if (!a.isOrchestrator && b.isOrchestrator) return 1;
                      return a.tier.localeCompare(b.tier);
                    })
                    .map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        isActive={
                          activeAgentKey === `${squad.id}/${agent.id}`
                        }
                        onClick={() => onSelectAgent(squad.id, agent)}
                      />
                    ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredSquads.length === 0 && (
          <p
            className="text-center text-sm py-8"
            style={{ color: "#8892a4" }}
          >
            Nenhum agent encontrado
          </p>
        )}
      </div>
    </div>
  );
}
