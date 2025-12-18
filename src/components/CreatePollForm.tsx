import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CreatePollFormProps {
  pollId: string;
  onCreateQuestion: (question: { question_text: string; options: string[]; correct_option: number | null }) => void;
  canCreateQuestion: boolean;
}

export const CreatePollForm = ({ pollId, onCreateQuestion, canCreateQuestion }: CreatePollFormProps) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      if (correctOption === index) setCorrectOption(null);
      if (correctOption !== null && correctOption > index) setCorrectOption(correctOption - 1);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast({ title: 'Please enter a question', variant: 'destructive' });
      return;
    }

    const filledOptions = options.filter(o => o.trim());
    if (filledOptions.length < 2) {
      toast({ title: 'Please add at least 2 options', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      await onCreateQuestion({
        question_text: questionText.trim(),
        options: filledOptions,
        correct_option: correctOption !== null && options[correctOption].trim() ? correctOption : null,
      });

      setQuestionText('');
      setOptions(['', '']);
      setCorrectOption(null);
      toast({ title: 'Question created successfully!' });
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Failed to create question',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Question</label>
        <Input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question..."
          className="text-lg"
          disabled={!canCreateQuestion}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Options</label>
          <span className="text-xs text-muted-foreground">Select the correct answer (optional)</span>
        </div>

        {options.map((option, index) => (
          <div key={index} className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setCorrectOption(correctOption === index ? null : index)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors border-2",
                correctOption === index
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
              )}
              title="Mark as correct answer"
            >
              {correctOption === index ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-sm">{String.fromCharCode(65 + index)}</span>}
            </button>

            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              disabled={!canCreateQuestion}
              className={cn(correctOption === index && "border-green-500 ring-green-500/20")}
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
                disabled={!canCreateQuestion}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}

        {options.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="w-full"
            disabled={!canCreateQuestion}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        )}
      </div>

      <Button
        type="submit"
        disabled={creating || !canCreateQuestion}
        className="w-full"
        size="lg"
      >
        {creating ? 'Creating...' : 'Create Question'}
      </Button>

      {!canCreateQuestion && (
        <p className="text-center text-sm text-muted-foreground">
          Wait for all students to answer the current question before creating a new one.
        </p>
      )}
    </form>
  );
};
