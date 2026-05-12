"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addQuestionAction,
  createQuizAction,
  deleteQuestionAction,
  deleteQuizAction,
  updatePassMarkAction,
} from "@/features/instructor/actions/quiz";
import type { ChapterQuiz } from "@/features/instructor/queries/quiz";

// ── Add Question Form ────────────────────────────────────────────────────────

const emptyOption = () => ({ body: "", isCorrect: false });

function AddQuestionForm({
  quizId,
  courseId,
  chapterId,
  onDone,
}: {
  quizId: string;
  courseId: string;
  chapterId: string;
  onDone: () => void;
}) {
  const [body, setBody] = useState("");
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [isPending, startTransition] = useTransition();

  function markCorrect(idx: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  }

  function updateOption(idx: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, body: value } : o)));
  }

  function addOption() {
    if (options.length < 4) setOptions((prev) => [...prev, emptyOption()]);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return prev[idx]?.isCorrect ? next.map((o) => ({ ...o, isCorrect: false })) : next;
    });
  }

  function handleSubmit() {
    const filled = options.filter((o) => o.body.trim());
    if (!body.trim()) { toast.error("Question text is required."); return; }
    if (filled.length < 2) { toast.error("At least 2 options are required."); return; }
    if (!filled.some((o) => o.isCorrect)) { toast.error("Mark one option as correct."); return; }

    startTransition(async () => {
      const res = await addQuestionAction(
        quizId,
        courseId,
        chapterId,
        body.trim(),
        filled.map((o, i) => ({ body: o.body.trim(), isCorrect: o.isCorrect, position: i + 1 })),
      );
      if ("error" in res) { toast.error(res.error); return; }
      toast.success("Question added.");
      setBody("");
      setOptions([emptyOption(), emptyOption()]);
      onDone();
    });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-1.5">
        <Label>Question</Label>
        <Textarea
          placeholder="e.g. What does JSX stand for?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>
          Options{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (click circle to mark correct)
          </span>
        </Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markCorrect(idx)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-emerald-500"
              title={opt.isCorrect ? "Correct answer" : "Mark as correct"}
            >
              {opt.isCorrect ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
            <Input
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              value={opt.body}
              onChange={(e) => updateOption(idx, e.target.value)}
              className="flex-1"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
        {options.length < 4 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="size-3" /> Add option
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Saving…" : "Save question"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Quiz Manager ─────────────────────────────────────────────────────────────

interface QuizManagerProps {
  chapterId: string;
  courseId: string;
  quiz: ChapterQuiz | null;
}

export function QuizManager({ chapterId, courseId, quiz }: QuizManagerProps) {
  const [passMark, setPassMark] = useState(String(quiz?.passMark ?? 70));
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const res = await createQuizAction(chapterId, courseId);
      if ("error" in res) toast.error(res.error);
    });
  }

  function handleUpdatePassMark() {
    if (!quiz) return;
    const val = parseInt(passMark, 10);
    if (isNaN(val) || val < 1 || val > 100) {
      toast.error("Pass mark must be between 1 and 100.");
      return;
    }
    startTransition(async () => {
      const res = await updatePassMarkAction(quiz.id, val, courseId, chapterId);
      if ("error" in res) toast.error(res.error);
      else toast.success("Pass mark updated.");
    });
  }

  function handleDeleteQuestion(questionId: string) {
    startTransition(async () => {
      const res = await deleteQuestionAction(questionId, courseId, chapterId);
      if ("error" in res) toast.error(res.error);
      else toast.success("Question removed.");
    });
  }

  function handleDeleteQuiz() {
    if (!quiz) return;
    if (!confirm("Delete this quiz and all its questions? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteQuizAction(quiz.id, courseId, chapterId);
      if ("error" in res) toast.error(res.error);
    });
  }

  // No quiz yet
  if (!quiz) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed py-10 text-center">
        <p className="text-sm text-muted-foreground">No quiz for this chapter yet.</p>
        <Button size="sm" disabled={isPending} onClick={handleCreate}>
          <Plus className="size-4" />
          {isPending ? "Creating…" : "Create quiz"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Pass mark + delete quiz */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="passMark">Pass mark (%)</Label>
          <div className="flex gap-2">
            <Input
              id="passMark"
              type="number"
              min={1}
              max={100}
              className="w-24"
              value={passMark}
              onChange={(e) => setPassMark(e.target.value)}
            />
            <Button size="sm" variant="outline" disabled={isPending} onClick={handleUpdatePassMark}>
              Save
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={handleDeleteQuiz}
        >
          <Trash2 className="size-4" />
          Delete quiz
        </Button>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {quiz.questions.length === 0 && !showAddForm && (
          <p className="text-sm text-muted-foreground">No questions yet — add one below.</p>
        )}

        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-sm font-semibold text-muted-foreground">
                {idx + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{q.body}</p>
                <ul className="mt-2 space-y-1">
                  {q.options.map((opt) => (
                    <li key={opt.id} className="flex items-center gap-2 text-sm">
                      {opt.isCorrect ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="size-3.5 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          opt.isCorrect
                            ? "font-medium text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {opt.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                disabled={isPending}
                className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {showAddForm ? (
          <AddQuestionForm
            quizId={quiz.id}
            courseId={courseId}
            chapterId={chapterId}
            onDone={() => setShowAddForm(false)}
          />
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="size-4" />
            Add question
          </Button>
        )}
      </div>
    </div>
  );
}
