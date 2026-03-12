"use client";

import { useState, useEffect } from "react";
import SquadBrowser from "@/components/mission-control/SquadBrowser";
import ChatPanel from "@/components/mission-control/ChatPanel";

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

export default function MissionControlPage() {
  const [squads, setSquads] = useState<SquadInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load squads on mount
  useEffect(() => {
    fetch("/api/mission-control/squads")
      .then((res) => res.json())
      .then((data) => {
        setSquads(data.squads || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const activeAgentKey =
    activeSquadId && activeAgent
      ? `${activeSquadId}/${activeAgent.id}`
      : null;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <div className="text-center">
          <p className="text-3xl mb-3 animate-pulse">🎛️</p>
          <p className="text-sm" style={{ color: "#8892a4" }}>
            A carregar squads...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* Sidebar — Desktop: always visible, Mobile: overlay */}

      {/* Desktop sidebar */}
      <div
        className="hidden lg:block w-80 border-r shrink-0"
        style={{ borderColor: "#1a2035" }}
      >
        <SquadBrowser
          squads={squads}
          activeAgentKey={activeAgentKey}
          onSelectAgent={(squadId, agent) => {
            setActiveSquadId(squadId);
            setActiveAgent(agent);
          }}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative w-80 max-w-[85vw] h-full">
            <SquadBrowser
              squads={squads}
              activeAgentKey={activeAgentKey}
              onSelectAgent={(squadId, agent) => {
                setActiveSquadId(squadId);
                setActiveAgent(agent);
                setSidebarOpen(false);
              }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <div className="flex-1 min-w-0">
        <ChatPanel
          squadId={activeSquadId}
          agent={activeAgent}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
