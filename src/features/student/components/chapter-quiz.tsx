"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { submitQuizAttemptAction } from "@/features/student/actions/quiz";
import type { PlayerQuiz, PlayerLatestAttempt } from "@/features/student/queries/player";
import type { QuizResult } from "@/features/student/actions/quiz";

// ── Results view ─────────────────────────────────────────────────────────────

function QuizResults({
  quiz,
  result,
  onRetake,
}: {
  quiz: PlayerQuiz;
  result: QuizResult;
  onRetake: () => void;
}) {
  const passed = result.passed;

  return (
    <div className="space-y-5">
      {/* Score banner */}
      <div
        className={`flex items-center gap-4 rounded-xl p-5 ${
          passed
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {passed ? (
          <Trophy className="size-8 shrink-0" />
        ) : (
          <XCircle className="size-8 shrink-0" />
        )}
        <div>
          <p className="text-xl font-bold">{result.score}%</p>
          <p className="text-sm font-medium">
            {passed
              ? `Passed! Required ${quiz.passMark}%.`
              : `Not passed. Required ${quiz.passMark}% — try again.`}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto shrink-0"
          onClick={onRetake}
        >
          <RotateCcw className="size-3.5" />
          Retake
        </Button>
      </div>

      {/* Per-question feedback */}
      <ul className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const res = result.results.find((r) => r.questionId === q.id);
          const isCorrect = res?.selectedOptionId === res?.correctOptionId;

          return (
            <li key={q.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
                <p className="text-sm font-medium">
                  {idx + 1}. {q.body}
                </p>
              </div>
              <ul className="ml-6 space-y-1">
                {q.options.map((opt) => {
                  const isSelected = opt.id === res?.selectedOptionId;
                  const isCorrectOpt = opt.id === res?.correctOptionId;
                  return (
                    <li
                      key={opt.id}
                      className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${
                        isCorrectOpt
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : isSelected && !isCorrectOpt
                            ? "bg-destructive/10 text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isCorrectOpt ? (
                        <CheckCircle2 className="size-3.5 shrink-0" />
                      ) : isSelected ? (
                        <XCircle className="size-3.5 shrink-0" />
                      ) : (
                        <span className="size-3.5 shrink-0" />
                      )}
                      {opt.body}
                      {isCorrectOpt && (
                        <span className="ml-auto text-xs font-semibold">Correct</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Quiz form ─────────────────────────────────────────────────────────────────

function QuizForm({
  quiz,
  onComplete,
}: {
  quiz: PlayerQuiz;
  onComplete: (result: QuizResult) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const allAnswered = quiz.questions.every((q) => selected[q.id]);

  function handleSubmit() {
    const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    startTransition(async () => {
      const res = await submitQuizAttemptAction(quiz.id, answers);
      if ("error" in res) { toast.error(res.error); return; }
      onComplete(res);
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Pass mark: {quiz.passMark}% · {quiz.questions.length} question
        {quiz.questions.length !== 1 ? "s" : ""}
      </p>

      <ul className="space-y-5">
        {quiz.questions.map((q, idx) => (
          <li key={q.id} className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">
              {idx + 1}. {q.body}
            </p>
            <ul className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = selected[q.id] === opt.id;
                return (
                  <li key={opt.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5 font-medium"
                          : "hover:border-muted-foreground/40 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        checked={isSelected}
                        onChange={() =>
                          setSelected((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                        className="accent-primary"
                      />
                      {opt.body}
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        disabled={!allAnswered || isPending}
        onClick={handleSubmit}
      >
        {isPending ? "Submitting…" : "Submit quiz"}
      </Button>
      {!allAnswered && (
        <p className="text-center text-xs text-muted-foreground">
          Answer all questions to submit.
        </p>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface ChapterQuizProps {
  quiz: PlayerQuiz;
  latestAttempt: PlayerLatestAttempt | null;
}

export function ChapterQuiz({ quiz, latestAttempt }: ChapterQuizProps) {
  const [result, setResult] = useState<QuizResult | null>(
    latestAttempt
      ? { score: latestAttempt.score, passed: latestAttempt.passed, results: [] }
      : null,
  );
  const [retaking, setRetaking] = useState(false);

  if (quiz.questions.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No questions added yet.
      </p>
    );
  }

  // Show last attempt summary (no per-question detail — answers not stored client-side)
  if (result && !retaking) {
    const showDetail = result.results.length > 0;

    if (showDetail) {
      return (
        <QuizResults
          quiz={quiz}
          result={result}
          onRetake={() => { setResult(null); setRetaking(true); }}
        />
      );
    }

    // Previous attempt loaded from server (no detail available)
    return (
      <div className="space-y-4">
        <div
          className={`flex items-center gap-4 rounded-xl p-5 ${
            result.passed
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {result.passed ? (
            <Trophy className="size-8 shrink-0" />
          ) : (
            <XCircle className="size-8 shrink-0" />
          )}
          <div>
            <p className="text-xl font-bold">{result.score}%</p>
            <p className="text-sm font-medium">
              {result.passed ? "Passed" : `Not passed — required ${quiz.passMark}%`}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto shrink-0"
            onClick={() => { setResult(null); setRetaking(true); }}
          >
            <RotateCcw className="size-3.5" />
            Retake
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Retake the quiz to see per-question feedback.
        </p>
      </div>
    );
  }

  return (
    <QuizForm
      quiz={quiz}
      onComplete={(r) => { setResult(r); setRetaking(false); }}
    />
  );
}
