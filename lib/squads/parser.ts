import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// ============================================================
// Squad Parser — reads squad configs and agent files from disk
// Used by Mission Control to list squads and load agent personas
// ============================================================

export interface AgentInfo {
  id: string;
  file: string;
  name: string;
  icon: string;
  tier: string;
  specialty: string;
  isOrchestrator: boolean;
}

export interface SquadInfo {
  id: string;
  name: string;
  icon: string;
  purpose: string;
  agents: AgentInfo[];
}

// Slug from filename: "ann-handley.md" → "ann-handley"
function slugFromFile(filename: string): string {
  return path.basename(filename, ".md");
}

// Human-readable name from slug: "ann-handley" → "Ann Handley"
function nameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Extract metadata from agent .md first lines (Ícone, Archetype, Tom)
function parseAgentMetadata(content: string): {
  icon: string;
  archetype: string;
  tone: string;
} {
  const iconMatch = content.match(/^\*\*[ÍI]cone:\*\*\s*(.+)/m);
  const archetypeMatch = content.match(/^\*\*Archetype:\*\*\s*(.+)/m);
  const toneMatch = content.match(/^\*\*Tom:\*\*\s*(.+)/m);

  return {
    icon: iconMatch?.[1]?.trim() || "🤖",
    archetype: archetypeMatch?.[1]?.trim() || "",
    tone: toneMatch?.[1]?.trim() || "",
  };
}

// Parse a config.yaml with the "minds" format (content-squad style)
function parseMindsFormat(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  squadId: string
): AgentInfo[] {
  const agents: AgentInfo[] = [];
  const agentsSection = config?.agents;
  if (!agentsSection) return agents;

  // Orchestrator
  if (agentsSection.orchestrator) {
    const orch = agentsSection.orchestrator;
    if (typeof orch === "object" && orch.file) {
      agents.push({
        id: slugFromFile(orch.file),
        file: orch.file,
        name: nameFromSlug(slugFromFile(orch.file)),
        icon: orch.icon || "🎯",
        tier: "chief",
        specialty: orch.role || "Squad Orchestrator",
        isOrchestrator: true,
      });
    }
  }

  // Minds array
  if (Array.isArray(agentsSection.minds)) {
    for (const mind of agentsSection.minds) {
      if (typeof mind === "object" && mind.file) {
        agents.push({
          id: slugFromFile(mind.file),
          file: mind.file,
          name: mind.name || nameFromSlug(slugFromFile(mind.file)),
          icon: mind.icon || "🤖",
          tier: String(mind.tier ?? "1"),
          specialty: mind.specialty || "",
          isOrchestrator: false,
        });
      }
    }
  }

  return agents;
}

// Parse a config.yaml with the simple format (saas-dev-squad style)
function parseSimpleFormat(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  squadId: string,
  squadDir: string
): AgentInfo[] {
  const agents: AgentInfo[] = [];
  const agentsSection = config?.agents;
  if (!agentsSection) return agents;

  const tierMap: Record<string, string[]> = {
    orchestrator: [],
    tier_0: [],
    tier_1: [],
    tier_2: [],
  };

  // Collect agent names from each tier
  for (const [tierKey, tierValue] of Object.entries(agentsSection)) {
    if (Array.isArray(tierValue)) {
      const tier = tierKey === "orchestrator" ? "chief" : tierKey.replace("_", " ");
      for (const agentName of tierValue) {
        if (typeof agentName === "string") {
          const file = `agents/${agentName}.md`;
          const filePath = path.join(squadDir, file);

          let icon = "🤖";
          let specialty = "";

          // Try to read agent file for metadata
          try {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, "utf-8");
              const meta = parseAgentMetadata(content);
              icon = meta.icon;
              specialty = meta.archetype || meta.tone;
            }
          } catch {
            // Ignore read errors
          }

          agents.push({
            id: agentName,
            file,
            name: nameFromSlug(agentName),
            icon,
            tier: tierKey === "orchestrator" ? "chief" : tierKey.replace("tier_", ""),
            specialty,
            isOrchestrator: tierKey === "orchestrator",
          });
        }
      }
    }
  }

  return agents;
}

// Get all squads from the squads/ directory
export function getAllSquads(): SquadInfo[] {
  const squadsDir = path.join(process.cwd(), "squads");

  if (!fs.existsSync(squadsDir)) {
    return [];
  }

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  const squads: SquadInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const configPath = path.join(squadsDir, entry.name, "config.yaml");
    if (!fs.existsSync(configPath)) continue;

    try {
      const configContent = fs.readFileSync(configPath, "utf-8");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = yaml.load(configContent) as any;

      const squadId = entry.name;
      const squadConfig = config?.squad || config;
      const squadDir = path.join(squadsDir, entry.name);

      // Detect format: has "minds" array → minds format, else simple
      const hasMinds = config?.agents?.minds && Array.isArray(config.agents.minds);

      const agents = hasMinds
        ? parseMindsFormat(config, squadId)
        : parseSimpleFormat(config, squadId, squadDir);

      // Get icon from orchestrator or first agent
      const orchestrator = agents.find((a) => a.isOrchestrator);
      const squadIcon = orchestrator?.icon || agents[0]?.icon || "📦";

      squads.push({
        id: squadId,
        name: squadConfig?.name || nameFromSlug(squadId),
        icon: squadIcon,
        purpose: squadConfig?.purpose || "",
        agents,
      });
    } catch (error) {
      console.error(`Error parsing squad ${entry.name}:`, error);
    }
  }

  // Sort by name
  squads.sort((a, b) => a.name.localeCompare(b.name));

  return squads;
}

// Get the full system prompt for an agent (entire .md file content)
export function getAgentSystemPrompt(
  squadId: string,
  agentId: string
): string | null {
  const squadsDir = path.join(process.cwd(), "squads");

  // Try common file paths
  const possiblePaths = [
    path.join(squadsDir, squadId, "agents", `${agentId}.md`),
    path.join(squadsDir, squadId, `agents/${agentId}.md`),
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8");
      }
    } catch {
      // Try next path
    }
  }

  return null;
}
