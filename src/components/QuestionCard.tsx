import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/poll';
import { cn } from '@/lib/utils';
import { Timer } from './Timer';

interface QuestionCardProps {
  question: Question;
  timeLimit: number;
  onSubmit: (optionIndex: number) => Promise<void>;
  hasAnswered: boolean;
  onTimeUp: () => void;
}

export const QuestionCard = ({ 
  question, 
  timeLimit, 
  onSubmit, 
  hasAnswered,
  onTimeUp 
}: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    setSubmitting(true);
    try {
      await onSubmit(selectedOption);
    } finally {
      setSubmitting(false);
    }
  };

  if (hasAnswered) {
    return (
      <div className="text-center py-12 animate-scale-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-success flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Answer Submitted!</h3>
        <p className="text-muted-foreground">Waiting for results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {question.question_text}
          </h2>
          <p className="text-muted-foreground">Select your answer</p>
        </div>
        <Timer 
          startedAt={question.started_at} 
          durationSeconds={timeLimit} 
          onTimeUp={onTimeUp}
        />
      </div>

      <div className="grid gap-4">
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedOption === index ? "option-selected" : "option"}
            size="lg"
            className={cn(
              "w-full h-auto py-5 px-6 text-left justify-start text-lg font-medium",
              "transition-all duration-200"
            )}
            onClick={() => setSelectedOption(index)}
          >
            <span className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold shrink-0",
              selectedOption === index 
                ? "bg-white/20 text-white" 
                : "bg-muted text-muted-foreground"
            )}>
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selectedOption === null || submitting}
        size="xl"
        className="w-full"
      >
        {submitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </div>
  );
};
