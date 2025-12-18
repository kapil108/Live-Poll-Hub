import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoll } from '@/hooks/usePoll';
import { QuestionCard } from '@/components/QuestionCard';
import { PollResults } from '@/components/PollResults';
import { Chat } from '@/components/Chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { socket } from '@/lib/socket';

const StudentView = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // We use usePoll to get the current state of the poll (active question, etc.)
  const { poll, activeQuestion, answers, loading } = usePoll(pollId || null);

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null); // This will be the socket ID or session ID
  const [joining, setJoining] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());

  // Check if student has answered current question
  useEffect(() => {
    if (!studentId || !activeQuestion) {
      setShowResults(false);
      return;
    }

    // Check if we have a local record of answering this question
    const hasAnsweredCurrent = answeredQuestionIds.has(activeQuestion.id);

    setShowResults(hasAnsweredCurrent);
  }, [studentId, activeQuestion, answeredQuestionIds]);

  const joinPoll = () => {
    if (!studentName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }

    setJoining(true);

    if (!socket.connected) socket.connect();

    socket.emit('join_poll', { pollId, name: studentName.trim() }, (response: any) => {
      setJoining(false);
      if (response.success) {
        setStudentId(socket.id);
        toast({ title: `Welcome, ${studentName}!` });
      } else {
        toast({ title: response.error || 'Failed to join poll', variant: 'destructive' });
      }
    });
  };

  const submitAnswer = async (optionIndex: number) => {
    if (!studentId || !activeQuestion) return;

    socket.emit('submit_answer', { pollId, questionIndex: parseInt(activeQuestion.id), optionIndex });

    setAnsweredQuestionIds(prev => new Set(prev).add(activeQuestion.id));
    setShowResults(true);
    toast({ title: 'Answer submitted!' });
  };

  const handleTimeUp = () => {
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-card rounded-2xl p-8 shadow-lg border border-border max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-4">Poll not found</h2>
          <p className="text-muted-foreground mb-6">This poll may have ended or the code is incorrect.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Join screen
  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-secondary flex items-center justify-center shadow-secondary">
                <span className="text-3xl">👋</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Join Poll</h1>
              <p className="text-muted-foreground">{poll.title}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Name</label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name..."
                  className="h-12"
                  onKeyDown={(e) => e.key === 'Enter' && joinPoll()}
                />
              </div>
              <Button
                onClick={joinPoll}
                disabled={joining}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                {joining ? 'Joining...' : 'Join Poll'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{poll.title}</h1>
              <p className="text-sm text-muted-foreground">Welcome, {studentName}!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
          {!activeQuestion ? (
            <div className="text-center py-12 animate-scale-in">
              <div className="w-fit mx-auto mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold mb-4">
                  <Sparkles className="w-3 h-3" />
                  Intervue Poll
                </div>

                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-6">Wait for the teacher to ask questions..</h3>
            </div>
          ) : showResults ? (
            <div className="space-y-6">
              <div className="text-center font-semibold mb-4 text-green-600">You have answered!</div>
              <PollResults question={activeQuestion} answers={answers} />
              <div className="text-center pt-4">
                <p className="text-muted-foreground font-medium">Wait for the teacher to ask a new question..</p>
              </div>
            </div>
          ) : (
            <QuestionCard
              question={activeQuestion}
              timeLimit={poll.time_limit_seconds}
              onSubmit={submitAnswer}
              hasAnswered={answeredQuestionIds.has(activeQuestion.id)}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>
      </div>

      <Chat
        pollId={pollId!}
        senderName={studentName}
        senderId={studentId}
      />
    </div>
  );
};

export default StudentView;
