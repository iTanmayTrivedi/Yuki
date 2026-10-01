import { useState } from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  {
    japanese: "お疲れ様です",
    romaji: "Otsukaresama desu",
    prompt: "What does this say to a colleague?",
    choices: ["Thanks for your hard work", "Good morning", "Please excuse me"],
    answer: 0,
    detail: "A warm acknowledgement of someone’s effort, often heard at work.",
  },
  {
    japanese: "いただきます",
    romaji: "Itadakimasu",
    prompt: "When would you say this?",
    choices: ["Before a meal", "Before leaving home", "When meeting someone"],
    answer: 0,
    detail: "Said before eating to express gratitude for the meal.",
  },
  {
    japanese: "よろしくお願いします",
    romaji: "Yoroshiku onegaishimasu",
    prompt: "Which is the closest meaning?",
    choices: ["I look forward to working with you", "I am running late", "I would like the bill"],
    answer: 0,
    detail: "A versatile expression of goodwill when starting a relationship or request.",
  },
] as const;

export function JapaneseMiniQuiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = QUESTIONS[index];
  const complete = index === QUESTIONS.length;

  const choose = (choice: number) => {
    if (selected !== null || !question) return;
    setSelected(choice);
    if (choice === question.answer) setScore((current) => current + 1);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
  };

  return (
    <section className="border-y border-border py-4" aria-label="Japanese mini quiz">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <h3 className="text-[10px] font-semibold uppercase">Japanese mini quiz</h3>
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground">{complete ? "Complete" : `${index + 1} / ${QUESTIONS.length}`}</span>
      </div>

      {complete ? (
        <div className="pt-3">
          <p className="font-serif text-xl italic">よくできました！</p>
          <p className="mt-1 text-xs text-muted-foreground">You got {score} of {QUESTIONS.length} right.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={restart}>
            <RotateCcw aria-hidden="true" /> Play again
          </Button>
        </div>
      ) : question ? (
        <div className="pt-3">
          <p className="font-jp text-xl leading-relaxed">{question.japanese}</p>
          <p className="text-[11px] text-muted-foreground">{question.romaji}</p>
          <p className="mt-3 text-xs font-medium">{question.prompt}</p>
          <div className="mt-2 grid gap-1.5">
            {question.choices.map((choice, choiceIndex) => (
              <Button
                key={choice}
                type="button"
                variant="outline"
                size="sm"
                disabled={selected !== null}
                onClick={() => choose(choiceIndex)}
                aria-pressed={selected === choiceIndex}
                className={`h-auto min-h-8 justify-start whitespace-normal py-1.5 text-left text-[11px] disabled:opacity-100 ${selected !== null && choiceIndex === question.answer ? "border-primary bg-primary/10 text-primary" : selected === choiceIndex ? "border-destructive bg-destructive/5 text-destructive" : ""}`}
              >
                {choice}
              </Button>
            ))}
          </div>
          {selected !== null && (
            <div className="mt-3" aria-live="polite">
              <p className="text-xs font-semibold text-primary">{selected === question.answer ? "Nice work!" : "Not quite — try the next one."}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{question.detail}</p>
              <Button variant="ghost" size="sm" className="mt-1 -ml-2 text-primary" onClick={() => { setIndex((current) => current + 1); setSelected(null); }}>
                {index === QUESTIONS.length - 1 ? "See results" : "Next phrase"} <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}