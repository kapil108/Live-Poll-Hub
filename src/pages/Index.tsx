import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { socket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'student' | 'teacher' | null;

const Index = () => {
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState<'role-selection' | 'details'>('role-selection');

  // Student State
  const [joinCode, setJoinCode] = useState('');

  // Teacher State
  const [pollTitle, setPollTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  // Removed Auth hook as we are doing simple role based access without persistent auth for this assignment

  const handleContinue = () => {
    if (role) setStep('details');
  };

  const createPoll = () => {
    if (!pollTitle.trim()) {
      toast({ title: 'Please enter a poll title', variant: 'destructive' });
      return;
    }

    setCreating(true);

    // Connect if not already connected
    if (!socket.connected) socket.connect();

    socket.emit('create_poll', { title: pollTitle.trim() }, (response: { pollId: string }) => {
      setCreating(false);
      if (response.pollId) {
        // In a real app we might want to store 'teacher' role in session/context
        // for now, we just navigate
        navigate(`/teacher/${response.pollId}`);
      } else {
        toast({ title: 'Failed to create poll', variant: 'destructive' });
      }
    });
  };

  const joinPoll = () => {
    if (!joinCode.trim()) {
      toast({ title: 'Please enter a code', variant: 'destructive' });
      return;
    }
    navigate(`/student/${joinCode.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">

      <div className="w-full max-w-4xl mx-auto space-y-8 animate-slide-up">

        {/* Logo/Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground mb-6 shadow-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Intervue Poll</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {step === 'role-selection' ? 'Welcome to the Live Polling System' : "Let's Get Started"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {step === 'role-selection'
              ? 'Please select the role that best describes you to begin using the live polling system'
              : role === 'teacher'
                ? 'Create a new poll to engage your students.'
                : 'Enter the code provided by your teacher to join.'}
          </p>
        </div>

        {step === 'role-selection' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button
                onClick={() => setRole('student')}
                className={cn(
                  "p-8 rounded-2xl border-2 text-left transition-all duration-200 outline-none",
                  role === 'student'
                    ? "border-primary bg-primary/5 shadow-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <Users className={cn("w-8 h-8 mb-4", role === 'student' ? "text-primary" : "text-foreground")} />
                <h3 className="text-xl font-bold mb-2">I'm a Student</h3>
                <p className="text-muted-foreground text-sm">
                  Join a live poll, submit answers, and see how your responses compare with your classmates.
                </p>
              </button>

              <button
                onClick={() => setRole('teacher')}
                className={cn(
                  "p-8 rounded-2xl border-2 text-left transition-all duration-200 outline-none",
                  role === 'teacher'
                    ? "border-primary bg-primary/5 shadow-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <GraduationCap className={cn("w-8 h-8 mb-4", role === 'teacher' ? "text-primary" : "text-foreground")} />
                <h3 className="text-xl font-bold mb-2">I'm a Teacher</h3>
                <p className="text-muted-foreground text-sm">
                  Create polls, ask questions, and monitor your students' responses in real-time.
                </p>
              </button>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="w-48 text-lg h-12 rounded-full shadow-primary hover:shadow-lg transition-all"
                onClick={handleContinue}
                disabled={!role}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border space-y-6">
              {role === 'teacher' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Poll Title</label>
                    <Input
                      value={pollTitle}
                      onChange={(e) => setPollTitle(e.target.value)}
                      placeholder="e.g. Science Quiz"
                      className="h-12 bg-muted/50"
                      onKeyDown={(e) => e.key === 'Enter' && createPoll()}
                    />
                  </div>
                  <Button
                    onClick={createPoll}
                    className="w-full h-12 text-lg"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Poll'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Poll Code</label>
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="e.g. 123e4567..."
                      className="h-12 bg-muted/50"
                      onKeyDown={(e) => e.key === 'Enter' && joinPoll()}
                    />
                  </div>
                  <Button
                    onClick={joinPoll}
                    className="w-full h-12 text-lg"
                  >
                    Join Poll
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep('role-selection')}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default Index;
