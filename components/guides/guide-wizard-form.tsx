"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { SeoCharCounter } from "@/components/guides/seo-char-counter";
import {
  applyPresetToForm,
  getPresetsForType,
  getPreviewUrl,
  type GuideType,
} from "@/lib/guide-presets";
import {
  recomputeSlugFromForm,
  recomputeTitleFromForm,
  type GuideStepId,
} from "@/lib/guide-workflow";
import type { GuideCreatorState } from "@/hooks/use-guide-creator";
import {
  canCompletePipeline,
  canRetryImageGeneration,
} from "@/lib/page-pipeline";
import type { Page } from "@/types/api";

function StepButton({
  label,
  onClick,
  disabled,
  loading,
  done,
  error,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  done?: boolean;
  error?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={done ? "secondary" : error ? "destructive" : "default"}
      className="w-full justify-start gap-2"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}

export function GuideWizardForm({
  creator,
  existingPage,
  siteId,
}: {
  creator: GuideCreatorState;
  existingPage: Page | undefined;
  siteId: string;
}) {
  const {
    form,
    setForm,
    ids,
    stepStatus,
    page,
    published,
    executeStep,
    pollStatus,
    resumeExistingPage,
  } = creator;

  const duplicatePage = existingPage;

  const presets = getPresetsForType(form.guideType);

  function handleTypeChange(type: GuideType) {
    const list = getPresetsForType(type);
    const preset = list[0];
    if (!preset) return;
    const applied = applyPresetToForm(preset);
    setForm({ ...applied, siteId: form.siteId });
  }

  function handlePresetChange(key: string) {
    const preset = presets.find((p) => p.key === key);
    if (!preset) return;
    const applied = applyPresetToForm(preset);
    setForm({ ...applied, siteId: form.siteId });
  }

  function handleFieldChange(
    field: keyof typeof form,
    value: string | number | boolean,
  ) {
    const next = { ...form, [field]: value } as typeof form;
    if (field === "country" || field === "city" || field === "guideType") {
      next.slug = recomputeSlugFromForm(next);
      next.title = recomputeTitleFromForm(next);
    }
    setForm(next);
  }

  const currentPage = page ?? duplicatePage;
  const canCreatePage =
    !!ids.keywordId &&
    stepStatus.createKeyword === "success" &&
    (!duplicatePage || creator.resumedExisting);
  const canGenerate = !!ids.pageId && stepStatus.createPage === "success";
  const canPublish =
    !!ids.pageId &&
    (currentPage?.pipelineStatus === "READY" ||
      currentPage?.pipelineStatus === "PARTIALLY_COMPLETED");
  const showComplete =
    currentPage && canCompletePipeline(currentPage);
  const showRetryImage =
    currentPage && canRetryImageGeneration(currentPage);

  async function runStep(step: GuideStepId) {
    if (step === "generateContent") {
      await executeStep("generateContent");
    } else {
      await executeStep(step);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Guide wizard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Guide type</Label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="guideType"
                checked={form.guideType === "city"}
                onChange={() => handleTypeChange("city")}
                className="accent-primary"
              />
              City guide (Template A2)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="guideType"
                checked={form.guideType === "country"}
                onChange={() => handleTypeChange("country")}
                className="accent-primary"
              />
              Country guide (Template A)
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preset</Label>
          <Select value={form.presetKey} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {duplicatePage && !creator.resumedExisting && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Page already exists for this slug</p>
                <p className="text-muted-foreground">
                  Page #{duplicatePage.id} —{" "}
                  <StatusBadge
                    status={duplicatePage.pipelineStatus}
                    kind="pipeline"
                  />
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    resumeExistingPage(String(duplicatePage.id))
                  }
                >
                  Resume existing page
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          <div className="space-y-1">
            <Label htmlFor="country">Country slug</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => handleFieldChange("country", e.target.value)}
            />
          </div>

          {form.guideType === "city" && (
            <div className="space-y-1">
              <Label htmlFor="city">City slug</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              value={form.keyword}
              onChange={(e) => handleFieldChange("keyword", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">Page slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => handleFieldChange("slug", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Title (H1)</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="metaTitle">metaTitle</Label>
            <Input
              id="metaTitle"
              value={form.metaTitle}
              onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
            />
            <SeoCharCounter
              value={form.metaTitle}
              min={30}
              max={65}
              label="SEO title length"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="metaDescription">metaDescription</Label>
            <Textarea
              id="metaDescription"
              rows={3}
              value={form.metaDescription}
              onChange={(e) =>
                handleFieldChange("metaDescription", e.target.value)
              }
            />
            <SeoCharCounter
              value={form.metaDescription}
              min={80}
              max={165}
              label="SEO description length"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="siteId">siteId</Label>
              <Input
                id="siteId"
                type="number"
                value={form.siteId}
                onChange={(e) =>
                  handleFieldChange("siteId", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="priority">priority</Label>
              <Input
                id="priority"
                type="number"
                value={form.priority}
                onChange={(e) =>
                  handleFieldChange("priority", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">Pipeline options</p>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.resetCheckpoint}
              onCheckedChange={(v) =>
                setForm({ resetCheckpoint: v === true })
              }
            />
            Reset checkpoint on generate
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.autoPoll}
              onCheckedChange={(v) => setForm({ autoPoll: v === true })}
            />
            Auto-poll pipeline (every 10s)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.autoPublish}
              onCheckedChange={(v) => setForm({ autoPublish: v === true })}
            />
            Auto-publish when READY
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Workflow steps</p>
          <StepButton
            label="1. Create Keyword"
            onClick={() => runStep("createKeyword")}
            loading={stepStatus.createKeyword === "loading"}
            done={stepStatus.createKeyword === "success"}
            error={stepStatus.createKeyword === "error"}
            disabled={!!duplicatePage && !creator.resumedExisting}
          />
          <StepButton
            label="2. Create Page"
            onClick={() => runStep("createPage")}
            loading={stepStatus.createPage === "loading"}
            done={stepStatus.createPage === "success"}
            error={stepStatus.createPage === "error"}
            disabled={!canCreatePage}
          />
          <StepButton
            label="3. Start Generation"
            onClick={() => runStep("generateContent")}
            loading={stepStatus.generateContent === "loading"}
            done={
              stepStatus.generateContent === "success" &&
              currentPage?.pipelineStatus !== "PENDING"
            }
            error={stepStatus.generateContent === "error"}
            disabled={!canGenerate}
          />
          <StepButton
            label="4. Poll Status"
            onClick={() => pollStatus()}
            disabled={!ids.pageId}
          />
          {showComplete && (
            <StepButton
              label="5. Complete Pipeline"
              onClick={() => runStep("completePipeline")}
              loading={stepStatus.completePipeline === "loading"}
              done={stepStatus.completePipeline === "success"}
              error={stepStatus.completePipeline === "error"}
            />
          )}
          {showRetryImage && (
            <StepButton
              label="Retry Image"
              onClick={() => runStep("retryImage")}
              loading={stepStatus.retryImage === "loading"}
              done={stepStatus.retryImage === "success"}
              error={stepStatus.retryImage === "error"}
            />
          )}
          <StepButton
            label="Patch Meta (SEO fix)"
            onClick={() => runStep("patchMeta")}
            loading={stepStatus.patchMeta === "loading"}
            done={stepStatus.patchMeta === "success"}
            error={stepStatus.patchMeta === "error"}
            disabled={!ids.pageId}
          />
          <StepButton
            label="6. Publish"
            onClick={() => runStep("publish")}
            loading={stepStatus.publish === "loading"}
            done={stepStatus.publish === "success" || published}
            error={stepStatus.publish === "error"}
            disabled={!canPublish}
          />
          {(published || currentPage?.status === "PUBLISHED") && (
            <Button variant="outline" className="w-full gap-2" asChild>
              <a
                href={getPreviewUrl(form.siteId, form.slug)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Preview live page
              </a>
            </Button>
          )}
          {ids.pageId && (
            <Button variant="ghost" className="w-full" asChild>
              <Link href={`/sites/${siteId}/pages/${ids.pageId}`}>
                Open page detail →
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
