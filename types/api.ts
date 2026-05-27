export type PlatformRole = "ADMIN";

export type PageStatus = "DRAFT" | "PUBLISHED" | "NEEDS_UPDATE" | "ARCHIVED";
export type PipelineStatus =
  | "PENDING"
  | "GENERATING"
  | "VALIDATING"
  | "ANALYZING"
  | "GEO_SCORING"
  | "REWRITING"
  | "IMAGE_GENERATING"
  | "SEO_CHECKING"
  | "READY"
  | "FAILED"
  | "PARTIALLY_COMPLETED"
  | "SKIPPED_STEP";

export type IdeaStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_REVISION";

export type TaskStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type SubjectStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: PlatformRole;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}

export interface Site {
  id: string;
  name: string;
  domain: string;
  defaultLanguage?: string;
  languages?: string[];
  timezone?: string;
  status?: string;
  gscProperty?: string;
  ga4PropertyId?: string;
  publishWebhookUrl?: string;
  autoPublish?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSiteResponse {
  site: Site;
  contentApiKey: string;
}

export interface RotateKeyResponse {
  siteId: string;
  contentApiKey: string;
  contentApiKeyCreatedAt: string;
}

export interface SiteConfig {
  id?: string;
  siteId: string;
  runtimeConfig?: {
    enableAnalysis?: boolean;
    enableRewrite?: boolean;
    enableImageGeneration?: boolean;
    enableSeoCheck?: boolean;
    maxRetries?: number;
    qualityThreshold?: number;
  };
  qualityThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  contentType?: string;
  requiredSections?: Record<string, unknown>;
  headingStructure?: Record<string, unknown>;
  seoRules?: Record<string, unknown>;
  faqStructure?: Record<string, unknown>;
  ctaPlacement?: string;
  internalLinkingRules?: Record<string, unknown>;
  formattingInstructions?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  siteId: string;
  templateId?: string;
  title: string;
  description?: string;
  primaryKeywords: string[];
  secondaryKeywords?: string[];
  searchIntent?: string;
  language?: string;
  country?: string;
  city?: string;
  seoGoal?: string;
  contentCountTarget?: number;
  hallucinationSensitivity?: string;
  riskCategory?: string;
  requiresFactualValidation?: boolean;
  strictReviewMode?: boolean;
  status: SubjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentIdea {
  id: string;
  subjectId?: string;
  title: string;
  slug?: string;
  targetKeyword?: string;
  metaDescription?: string;
  searchIntent?: string;
  outline?: Record<string, unknown>;
  headings?: string[];
  faqSuggestions?: unknown[];
  internalLinkingSuggestions?: string[];
  contentType?: string;
  confidenceScore?: number;
  hallucinationRiskScore?: number;
  status: IdeaStatus;
  reviewNotes?: string;
  generatedBy?: string;
  generatedModel?: string;
  createdAt?: string;
  subject?: Subject;
}

export interface IdeaTask {
  id: string;
  ideaId?: string;
  subjectId?: string;
  pageId?: string;
  status: TaskStatus;
  createdAt?: string;
}

export interface Keyword {
  id: string;
  siteId: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  status?: string;
  intent?: string;
  priority?: number;
  targetUrl?: string;
  createdAt?: string;
}

export interface CreateKeywordBody {
  siteId: number;
  keyword: string;
  language?: "EN";
  intent?: "COMMERCIAL";
  priority?: number;
  targetUrl?: string;
}

export interface CreatePageBody {
  siteId: number;
  keywordId: number;
  slug: string;
  language?: "EN";
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export type InternalLinkingAuditStatus = "approved" | "needs_fix";

export interface InternalLinkingAudit {
  status: InternalLinkingAuditStatus;
  details: string;
}

export interface AuditResult {
  approved: boolean;
  eeat_score: number;
  critical_errors: string;
  seo_and_ux_recommendations: string;
  internal_linking_audit: InternalLinkingAudit;
}

export interface SeoCheckIssues {
  issues: string[];
  googleChecklist?: Record<string, boolean>;
}

export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  status: PageStatus;
  pipelineStatus: PipelineStatus;
  language?: string;
  rawDraft?: string;
  finalContent?: string;
  generatedImageBase64?: string;
  generatedImageCdnUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  seoScore?: number;
  seoCheckScore?: number;
  seoCheckPassed?: boolean;
  seoCheckIssues?: SeoCheckIssues;
  contentAuditResult?: AuditResult;
  geoScore?: number;
  publishedAt?: string;
  errorLog?: string;
  createdAt?: string;
  updatedAt?: string;
  keywords?: Keyword[];
}

export interface RetryImageGenerationResponse {
  pageId: number;
  contentTaskId: number;
  resumedFrom: string;
  checkpointLastStep: string;
}

export interface RegenerateHeroImageCdnResult {
  pageId: number;
  uploaded: boolean;
  cdnUrl?: string | null;
  skippedReason?: string | null;
}

export interface RegenerateHeroImageResponse {
  pageId: number;
  imagePrompt: string;
  generatedImageBase64: boolean;
  previousCdnUrlCleared: boolean;
  cdn: RegenerateHeroImageCdnResult | null;
}

export type CompletePipelineFromStep =
  | "seo_check"
  | "internal_linking"
  | "final_geo_schema";

export interface CompletePipelineResponse {
  pageId: number;
  contentTaskId: number;
  resumedFrom: string;
  checkpointLastStep: string;
  skippedSteps: string[];
}

export interface ContentTask {
  id: string | number;
  siteId?: string | number;
  pageId?: string | number;
  status: TaskStatus;
  type?: string;
  currentStep?: string;
  attempts?: number;
  errorLog?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface PublishResult {
  published: boolean;
  webhookFired?: boolean;
  webhookStatus?: number;
  skippedReason?: string;
}

export interface ContentPreview {
  version: string;
  status: string;
  draft?: string | null;
  finalContent?: string | null;
  analysis?: {
    seoScore?: number;
    readabilityScore?: number;
    intentMatch?: number;
    contentDepth?: number;
    redundancyScore?: number;
    gaps?: string[];
  };
  meta?: {
    pipelineStatus?: PipelineStatus;
    pipelineVersion?: number;
    cost?: number;
    modelUsed?: string;
    completedSteps?: string[];
    skippedSteps?: string[];
  };
}

export interface GenerateIdeasResponse {
  jobQueued: boolean;
  subjectId: string;
  count: number;
}

export interface SeoMetric {
  id?: string;
  siteId: string;
  pageId?: string;
  date: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  position?: number;
}
