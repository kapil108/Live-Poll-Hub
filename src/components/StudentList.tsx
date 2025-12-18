import { Student, Answer, Question } from '@/types/poll';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserX, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { socket } from '@/lib/socket';

interface StudentListProps {
  students: Student[];
  answers: Answer[];
  activeQuestion: Question | null;
  pollId: string;
}

export const StudentList = ({ students, answers, activeQuestion, pollId }: StudentListProps) => {
  const { toast } = useToast();
  const activeStudents = students.filter(s => s.is_active);

  const hasAnswered = (studentId: string) => {
    if (!activeQuestion) return false;
    return answers.some(a => a.student_id === studentId && a.question_id === activeQuestion.id);
  };

  const removeStudent = (studentId: string, studentName: string) => {
    socket.emit('remove_student', { pollId, studentId });
    toast({ title: `${studentName} has been removed` });
  };

  if (activeStudents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Waiting for students to join...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">Students ({activeStudents.length})</h4>
        {activeQuestion && (
          <span className="text-sm text-muted-foreground">
            {answers.filter(a => a.question_id === activeQuestion.id).length}/{activeStudents.length} answered
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {activeStudents.map((student) => {
          const answered = hasAnswered(student.session_id || student.id); // Handling session ID vs socket ID
          return (
            <div
              key={student.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                answered ? "bg-success/10 border border-success/20" : "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  answered ? "gradient-success text-white" : "bg-muted text-muted-foreground"
                )}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground">{student.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {activeQuestion && (
                  answered ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                  )
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeStudent(student.id, student.name)}
                >
                  <UserX className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
