// Response of the Factory's Business Intake & Ecosystem Onboarding API (POST /intake/analyze).
// Mirrors Agent_POSGMO/posgmo-factory/agents/business_intake/schema.py.

export type EvidenceItem = { kind: string; claim: string; source?: string | null };

export type Basis = "verified" | "inferred" | "unknown";
export type Decision = "REUSE" | "CONFIGURE" | "EXTEND" | "CREATE" | "INVESTIGATE" | "NOT_APPLICABLE";
export type LayerStatus = "AVAILABLE" | "PARTIAL" | "MISSING" | "UNKNOWN";
export type Readiness =
  | "READY"
  | "READY_WITH_CONFIGURATION"
  | "READY_AFTER_EXTENSION"
  | "NEEDS_BUSINESS_CLARIFICATION"
  | "NEEDS_REPOSITORY_INVESTIGATION"
  | "NEEDS_BOTH";

export type BusinessAnalysis = {
  summary: string;
  businessType: string;
  placement: { application: string; asCompany: boolean; explanation: string };
  onboarding: string;
  workflow: { step: string; basis: Basis }[];
  requiredCapabilities: { capability: string; basis: Basis; decision: Decision }[];
  existingCapabilities: {
    capability: string; evidence: string; mobile: LayerStatus; web: LayerStatus;
    backend: LayerStatus; database: LayerStatus; configurationRequired: string;
  }[];
  configuration: { capability: string; setting: string; why: string }[];
  extend: { capability: string; existing: string; extension: string; reason: string; affectedAreas: string[] }[];
  create: { capability: string; suggestedModule: string; whyNotReuse: string; scope: string; layers: string[] }[];
  investigate: { capability: string; knownEvidence: string; unknowns: string; inspect: string; possibleOutcomes: string }[];
  notApplicable: { capability: string; reason: string }[];
  businessQuestions: string[];
  mobileExperience: string;
  webExperience: string;
  infrastructure: {
    newWebsite: boolean; newMobileApp: boolean; newBackend: boolean;
    newDatabase: boolean; newDeployment: boolean; newHosting: boolean; explanation: string;
  };
  risks: string[];
  companyIsolation: string;
  onboardingReadiness: Readiness;
  onboardingPlan: string[];
  developmentRequests: { type: "EXTEND_CAPABILITY" | "NEW_CAPABILITY"; request: string }[];
  factoryRecommendation: string;
};

export type IntakeResponse =
  | {
      status: "ok";
      need: { transcript: string; request?: string };
      evidence: {
        candidates?: { name: string; evidenceLevel: string; readiness?: Record<string, string> }[];
        verifiedFacts: EvidenceItem[];
        assumptions: EvidenceItem[];
      };
      analysis: BusinessAnalysis;
      /** The business's website, when one was given: what was read, or why it couldn't be. */
      website?: { url: string; title?: string; error?: string } | null;
      cached?: boolean;
      /** Tokens this answer used (0 when it came from the cache). */
      usage?: { tokens: number };
    }
  | { status: "needs_clarification"; need: { transcript: string }; question: string; cached?: boolean; usage?: { tokens: number } };
