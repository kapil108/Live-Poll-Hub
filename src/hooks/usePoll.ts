import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { Poll, Question, Student, Answer } from '@/types/poll';

export const usePoll = (pollId: string | null) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]); // This might be aggregate data now
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pollId) {
      setLoading(false);
      return;
    }

    // Ensure connection
    if (!socket.connected) socket.connect();

    const handlePollUpdate = (data: { poll: any }) => {
      console.log('Poll updated:', data.poll);
      try {
        const p = data.poll;
        if (!p) {
          console.warn('Received poll update without poll data');
          return;
        }

        setPoll({
          id: p.id,
          title: p.title,
          created_by: 'teacher', // mocked
          created_at: new Date(p.createdAt || Date.now()).toISOString(),
          is_active: true,
          time_limit_seconds: 60 // default or from server
        });

        // Map server questions to frontend type
        const mappedQuestions = (p.questions || []).map((q: any, i: number) => ({
          id: i.toString(), // server might just use index or we need genereted IDs
          poll_id: p.id,
          question_text: q.question_text || '',
          options: q.options || [],
          correct_option: q.correct_option,
          created_at: new Date().toISOString(),
          is_active: i === p.currentQuestionIndex,
          started_at: i === p.currentQuestionIndex ? new Date().toISOString() : null
        }));
        setQuestions(mappedQuestions);

        const active = mappedQuestions.find((q: any) => q.is_active);
        setActiveQuestion(active || null);

        // Answers/Results
        // Server sends 'results' object: { questionIndex: { optionIndex: count } }
        const fakeAnswers: Answer[] = [];
        if (p.results) {
          Object.entries(p.results).forEach(([qIdx, res]: [string, any]) => {
            if (!res) return;
            Object.entries(res).forEach(([optIdx, count]: [string, any]) => {
              if (typeof count !== 'number') return;
              for (let k = 0; k < count; k++) {
                fakeAnswers.push({
                  id: `${qIdx}-${optIdx}-${k}`,
                  question_id: qIdx,
                  student_id: `fake-${k}`,
                  selected_option: parseInt(optIdx),
                  created_at: new Date().toISOString()
                });
              }
            });
          });
        }
        setAnswers(fakeAnswers);

        // Students
        const mappedStudents = Object.entries(p.students || {}).map(([id, s]: [string, any]) => ({
          id: id,
          poll_id: p.id,
          name: s?.name || 'Unknown',
          joined_at: new Date().toISOString(),
          is_active: true,
          session_id: id,
          created_at: new Date().toISOString()
        }));
        setStudents(mappedStudents);

        setLoading(false);
      } catch (err) {
        console.error('Error processing poll update:', err);
        // Avoid getting stuck in loading state even if data is bad
        setLoading(false);
      }
    };

    socket.emit('get_poll_data', { pollId }, (response: any) => {
      if (response.poll) {
        handlePollUpdate(response);
      } else {
        // Poll might not exist yet if we are creating it, but usually this is called after creation
        setLoading(false);
      }
    });

    socket.on('poll_updated', handlePollUpdate);
    socket.on('new_question', (data) => {
      // Handled by poll_updated usually, but we could optimize
    });

    // Join logic is handled in components usually

    return () => {
      socket.off('poll_updated', handlePollUpdate);
    };
  }, [pollId]);

  return {
    poll,
    questions,
    students,
    answers,
    activeQuestion,
    loading,
    setActiveQuestion, // Use this for local optimistic updates if needed
  };
};
