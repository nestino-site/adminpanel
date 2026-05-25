"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildStepBody,
  mergeStepBody,
  resolvePath,
  STEP_DEFINITIONS,
  type GuideFormState,
  type GuideStepId,
  type WorkflowIds,
} from "@/lib/guide-workflow";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

const JSON_TABS: { id: GuideStepId; tab: string }[] = [
  { id: "createKeyword", tab: "keywords" },
  { id: "createPage", tab: "pages" },
  { id: "generateContent", tab: "generate" },
  { id: "patchMeta", tab: "patch" },
  { id: "completePipeline", tab: "complete" },
  { id: "publish", tab: "publish" },
];

function stringifyBody(body: unknown) {
  return JSON.stringify(body, null, 2);
}

export function GuideJsonEditor({
  form,
  ids,
  jsonOverrides,
  onOverrideChange,
  activeStep,
  onActiveStepChange,
}: {
  form: GuideFormState;
  ids: WorkflowIds;
  jsonOverrides: Partial<Record<GuideStepId, unknown>>;
  onOverrideChange: (step: GuideStepId, value: unknown, syncForm?: boolean) => void;
  activeStep: GuideStepId;
  onActiveStepChange: (step: GuideStepId) => void;
}) {
  const mergedBodies = useMemo(() => {
    const result: Record<GuideStepId, unknown> = {} as Record<
      GuideStepId,
      unknown
    >;
    for (const { id } of JSON_TABS) {
      result[id] = mergeStepBody(id, form, ids, jsonOverrides[id]);
    }
    return result;
  }, [form, ids, jsonOverrides]);

  const [editorValues, setEditorValues] = useState<Record<string, string>>({});
  const [parseErrors, setParseErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const { id } of JSON_TABS) {
      next[id] = stringifyBody(mergedBodies[id]);
    }
    setEditorValues((prev) => {
      const updated = { ...prev };
      for (const { id } of JSON_TABS) {
        const override = jsonOverrides[id];
        if (!override) {
          updated[id] = next[id];
        }
      }
      return updated;
    });
  }, [mergedBodies, jsonOverrides]);

  const handleEditorChange = useCallback(
    (step: GuideStepId, value: string | undefined) => {
      const text = value ?? "";
      setEditorValues((prev) => ({ ...prev, [step]: text }));

      try {
        const parsed = JSON.parse(text) as unknown;
        setParseErrors((prev) => {
          const next = { ...prev };
          delete next[step];
          return next;
        });
        onOverrideChange(step, parsed, true);
      } catch {
        setParseErrors((prev) => ({ ...prev, [step]: "Invalid JSON" }));
      }
    },
    [onOverrideChange],
  );

  const activeDef = STEP_DEFINITIONS[activeStep];
  const activePath = resolvePath(
    activeStep,
    ids.pageId,
    activeStep === "generateContent" ? form.resetCheckpoint : undefined,
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Request bodies</CardTitle>
        <p className="font-mono text-xs text-muted-foreground">
          {activeDef.method} {activePath}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs
          value={JSON_TABS.find((t) => t.id === activeStep)?.tab ?? "keywords"}
          onValueChange={(tab) => {
            const found = JSON_TABS.find((t) => t.tab === tab);
            if (found) onActiveStepChange(found.id);
          }}
        >
          <TabsList className="mb-3 flex h-auto flex-wrap gap-1">
            {JSON_TABS.map(({ id, tab }) => (
              <TabsTrigger key={tab} value={tab} className="text-xs">
                {tab}
                {parseErrors[id] && (
                  <span className="ml-1 text-destructive">!</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {JSON_TABS.map(({ id, tab }) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="overflow-hidden rounded-md border">
                <MonacoEditor
                  height="320px"
                  language="json"
                  theme="vs-dark"
                  value={editorValues[id] ?? stringifyBody(buildStepBody(id, form, ids))}
                  onChange={(v) => handleEditorChange(id, v)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              {parseErrors[id] && (
                <p className="mt-2 text-xs text-destructive">{parseErrors[id]}</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
