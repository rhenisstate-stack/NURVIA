"use client";

import * as React from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Layers,
  Palette,
  Type,
  SquareDashed,
  Layout,
  Sparkles,
  ArrowRight,
  Send,
  Trash2,
  Search,
} from "lucide-react";

export default function DesignSystemShowcasePage() {
  const [inputText, setInputText] = React.useState("");
  const [progressVal, setProgressVal] = React.useState(68);
  const [btnLoading, setBtnLoading] = React.useState(false);

  const colorSwatches = [
    { name: "Crisp Eucalyptus Slate", hex: "#F4F7F6", token: "--background", text: "text-slate-800", bg: "bg-[#F4F7F6]" },
    { name: "Deep Slate Blue", hex: "#1E293B", token: "--brand-navy / --foreground", text: "text-white", bg: "bg-[#1E293B]" },
    { name: "Deep Sea Teal", hex: "#0A5C66", token: "--primary / --brand-teal", text: "text-white", bg: "bg-[#0A5C66]" },
    { name: "Deep Sea Teal (Hover)", hex: "#084A52", token: "--primary-hover / --brand-teal-dark", text: "text-white", bg: "bg-[#084A52]" },
    { name: "Slate Mist (Secondary)", hex: "#E2E8F0", token: "--secondary-surface", text: "text-slate-800", bg: "bg-[#E2E8F0]" },
    { name: "Warm Ochre Gold (Accent)", hex: "#D97706", token: "--warning / --accent", text: "text-white", bg: "bg-[#D97706]" },
    { name: "Fresh Mint Green (Success)", hex: "#059669", token: "--success / --correct-answer", text: "text-white", bg: "bg-[#059669]" },
    { name: "Accessible Red (Error)", hex: "#BE123C", token: "--error / --incorrect-answer", text: "text-white", bg: "bg-[#BE123C]" },
    { name: "Informational Teal", hex: "#0A5C66", token: "--info", text: "text-white", bg: "bg-[#0A5C66]" },
    { name: "Subtle Border", hex: "#D8E2DF", token: "--border", text: "text-slate-800", bg: "bg-[#D8E2DF]" },
  ];

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Title */}
        <div className="border-b border-border pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Phase 1 Foundation Specification
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
            NURVIA Design System & Component Showcase
          </h1>
          <p className="text-sm text-foreground-secondary max-w-2xl">
            Live interactive documentation of brand primitives, design tokens, typography scale, UI variants, and accessibility verification.
          </p>
        </div>

        {/* 1. Brand Logo Primitives */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-teal" />
            <h2 className="font-brand text-xl font-bold text-foreground">
              1. Brand Vectors & Logo Variations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <Logo size="lg" variant="full" withLink={false} />
              <div className="text-xs text-foreground-muted font-medium">
                Primary Horizontal Lockup with Slogan
              </div>
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <Logo size="lg" variant="compact" withLink={false} />
              <div className="text-xs text-foreground-muted font-medium">
                Compact Wordmark Lockup
              </div>
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <Logo size="lg" variant="symbol" withLink={false} />
              <div className="text-xs text-foreground-muted font-medium">
                Geometric Learning Path Symbol
              </div>
            </Card>
          </div>
        </section>

        {/* 2. Color Palette & Tokens */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-teal" />
            <h2 className="font-brand text-xl font-bold text-foreground">
              2. Color System & Semantic Tokens
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {colorSwatches.map((color) => (
              <div key={color.name} className="rounded-xl border border-border overflow-hidden bg-surface shadow-xs">
                <div className={`h-20 ${color.bg} ${color.text} p-3 flex flex-col justify-end text-xs font-mono font-bold`}>
                  {color.hex}
                </div>
                <div className="p-3 space-y-0.5">
                  <div className="font-brand font-bold text-xs text-foreground">{color.name}</div>
                  <div className="text-[10px] text-foreground-muted font-mono">{color.token}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Typography Hierarchy */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-brand-teal" />
            <h2 className="font-brand text-xl font-bold text-foreground">
              3. Typography Hierarchy (Plus Jakarta Sans + Inter)
            </h2>
          </div>

          <Card className="p-6 space-y-6">
            <div className="border-b border-border pb-4">
              <div className="text-[11px] font-mono text-foreground-muted uppercase">Display · 48px · Bold</div>
              <div className="font-brand text-4xl sm:text-5xl font-extrabold text-foreground">
                Your Path to Nursing Confidence
              </div>
            </div>

            <div className="border-b border-border pb-4">
              <div className="text-[11px] font-mono text-foreground-muted uppercase">Heading 1 · 36px · Bold</div>
              <h1 className="font-brand text-3xl font-bold text-foreground">
                Clinical Judgment & NGN Assessments
              </h1>
            </div>

            <div className="border-b border-border pb-4">
              <div className="text-[11px] font-mono text-foreground-muted uppercase">Heading 2 · 28px · Bold</div>
              <h2 className="font-brand text-2xl font-bold text-foreground">
                Comprehensive Predictor & Licensure Practice
              </h2>
            </div>

            <div className="border-b border-border pb-4">
              <div className="text-[11px] font-mono text-foreground-muted uppercase">Body & Clinical Rationale · 16px · Regular</div>
              <p className="font-ui text-base text-foreground-secondary leading-relaxed">
                Hypokalemia significantly increases the risk of ventricular cardiac dysrhythmias. When evaluating client cues, immediately prioritize respiratory stability and serum electrolyte parameters.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono text-foreground-muted uppercase">Caption / Microcopy · 12px · Medium</div>
              <p className="font-ui text-xs text-foreground-muted">
                WCAG 2.2 AA compliant contrast verified against Soft Cloud (#F4F7F9) and Pure White (#FFFFFF).
              </p>
            </div>
          </Card>
        </section>

        {/* 4. Interactive Button Primitives */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <SquareDashed className="w-5 h-5 text-brand-teal" />
            <h2 className="font-brand text-xl font-bold text-foreground">
              4. Interactive Buttons & State Variants
            </h2>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground-secondary">Variants:</div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline Action</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="destructive">Destructive Action</Button>
                <Button variant="link">Inline Link Action</Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground-secondary">Sizes & States:</div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (32px)</Button>
                <Button size="md">Medium (40px)</Button>
                <Button size="lg">Large (48px)</Button>
                <Button
                  isLoading={btnLoading}
                  onClick={() => {
                    setBtnLoading(true);
                    setTimeout(() => setBtnLoading(false), 2000);
                  }}
                >
                  {btnLoading ? "Processing..." : "Click to Test Loading"}
                </Button>
                <Button disabled>Disabled State</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. Badges & Semantic Feedback */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-teal" />
            <h2 className="font-brand text-xl font-bold text-foreground">
              5. Badges & Semantic Status Indicators
            </h2>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="teal">Intelligent Teal (Brand)</Badge>
              <Badge variant="default">Default Neutral</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success (88% Passed)</Badge>
              <Badge variant="warning">Warning (Due Today)</Badge>
              <Badge variant="destructive">Critical Low</Badge>
              <Badge variant="info">Info / Guide</Badge>
            </div>
          </Card>
        </section>

        {/* 6. Form Controls & Progress */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-brand-teal" />
            <h2 className="font-brand text-xl font-bold text-foreground">
              6. Inputs, Feedback & Progress
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <CardTitle className="text-base">Input Field Variations</CardTitle>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Default Search / Text Input</label>
                  <Input
                    placeholder="Enter examination topic..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Error Validation State</label>
                  <Input placeholder="Invalid input example" error defaultValue="incorrect_format" />
                  <span className="text-[11px] text-semantic-error mt-1 block">
                    Please provide a valid nursing calculation value.
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <CardTitle className="text-base">Progress Indicators</CardTitle>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Clinical Reasoning Readiness</span>
                    <span>{progressVal}%</span>
                  </div>
                  <Progress value={progressVal} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setProgressVal(Math.max(0, progressVal - 10))}>
                    -10%
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setProgressVal(Math.min(100, progressVal + 10))}>
                    +10%
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
