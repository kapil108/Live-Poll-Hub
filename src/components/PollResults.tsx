import { useMemo } from 'react';
import { Question, Answer } from '@/types/poll';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PollResultsProps {
  question: Question;
  answers: Answer[];
  showAnimation?: boolean;
}

const OPTION_COLORS = [
  'gradient-primary',
  'gradient-secondary',
  'gradient-accent',
  'gradient-success',
];

export const PollResults = ({ question, answers, showAnimation = true }: PollResultsProps) => {
  const results = useMemo(() => {
    const questionAnswers = answers.filter(a => a.question_id === question.id);
    const total = questionAnswers.length;

    return question.options.map((option, index) => {
      const count = questionAnswers.filter(a => a.selected_option === index).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { option, count, percentage, index };
    });
  }, [question, answers]);

  const totalAnswers = answers.filter(a => a.question_id === question.id).length;
  const maxPercentage = Math.max(...results.map(r => r.percentage));

  return (
    <div className={cn("space-y-6", showAnimation && "animate-slide-up")}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">{question.question_text}</h3>
        <p className="text-muted-foreground">
          {totalAnswers} {totalAnswers === 1 ? 'response' : 'responses'}
        </p>
      </div>

      <div className="space-y-4">
        {results.map(({ option, count, percentage, index }) => {
          const isCorrect = question.correct_option === index;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium text-foreground", isCorrect && "text-green-600 dark:text-green-400")}>
                    {option}
                  </span>
                  {isCorrect && (
                    <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 mr-1" />
                      Correct Answer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{count} votes</span>
                  <span className={cn(
                    "font-bold text-lg min-w-[60px] text-right",
                    percentage === maxPercentage && percentage > 0 ? "text-primary" : "text-foreground"
                  )}>
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="h-12 bg-muted rounded-lg overflow-hidden relative">
                <div
                  className={cn(
                    "h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-4",
                    OPTION_COLORS[index % OPTION_COLORS.length],
                    showAnimation && "animate-count"
                  )}
                  style={{
                    width: showAnimation ? `${percentage}%` : `${percentage}%`,
                    minWidth: percentage > 0 ? '2rem' : '0'
                  }}
                >
                  {percentage >= 15 && (
                    <span className="text-white font-semibold text-sm">{percentage}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
