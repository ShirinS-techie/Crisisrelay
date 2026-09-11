"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { checklistsByCrisis, triageByCrisis } from "@/lib/seedData";

export default function TriageTab() {
  const { crisis, lowBandwidth } = useStore();
  const checklist = checklistsByCrisis[crisis];
  const tree = triageByCrisis[crisis];

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [stepId, setStepId] = useState("start");
  const [resultAdvice, setResultAdvice] = useState<string | null>(null);

  const storageKey = `crisisrelay-checklist-${crisis}`;

  useEffect(() => {
    setStepId("start");
    setResultAdvice(null);
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crisis]);

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* localStorage unavailable — state still updates in-memory */
    }
  }

  const step = tree[stepId];
  const doneCount = Object.values(checked).filter(Boolean).length;

  function answer(yes: boolean) {
    if (!step) return;
    const advice = yes ? step.yesAdvice : step.noAdvice;
    const nextId = yes ? step.yesNext : step.noNext;
    if (advice) {
      setResultAdvice(advice);
    }
    if (nextId) {
      setStepId(nextId);
    }
  }

  function restart() {
    setStepId("start");
    setResultAdvice(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted mb-2">
          Step-by-Step Triage
        </h3>
        <div
          className={`rounded-lg p-4 border ${
            lowBandwidth ? "no-glass" : "bg-surface/60 border-borderline"
          }`}
        >
          {!resultAdvice ? (
            <>
              <p className="text-sm mb-3">{step.prompt}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => answer(true)}
                  className="flex-1 py-2 rounded-md bg-flood/15 text-flood border border-flood/30 text-sm font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => answer(false)}
                  className="flex-1 py-2 rounded-md bg-surface2 border border-borderline text-sm font-medium"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed">{resultAdvice}</p>
              <button
                onClick={restart}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-borderline text-muted"
              >
                <RotateCcw size={13} /> Restart triage
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted">
            Survival Checklist
          </h3>
          <span className="text-xs text-muted font-mono">
            {doneCount}/{checklist.length}
          </span>
        </div>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.id}>
              <label
                className={`flex items-start gap-2.5 rounded-lg p-3 border cursor-pointer text-sm ${
                  lowBandwidth ? "no-glass" : "bg-surface/60 border-borderline"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 accent-flood"
                />
                <span className={checked[item.id] ? "line-through text-muted" : ""}>
                  {item.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
