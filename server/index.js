const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Live Poll Hub Server is Running! 🚀</h1><p>You can now connect the frontend to this URL.</p>');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

// In-memory data store
const polls = {};
// Structure:
// polls[pollId] = {
//   id: pollId,
//   title: string,
//   createdAt: timestamp,
//   questions: [], // Array of question objects
//   currentQuestionIndex: -1, // -1 means no question active
//   students: {}, // studentId -> { name }
//   results: {} // questionIndex -> { optionId -> count }
// }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // TEACHER EVENTS
    socket.on('create_poll', ({ title }, callback) => {
        const pollId = Math.random().toString(36).substr(2, 6).toUpperCase();
        polls[pollId] = {
            id: pollId,
            title: title,
            createdAt: Date.now(),
            questions: [],
            currentQuestionIndex: -1,
            students: {},
            results: {}
        };
        socket.join(pollId); // Teacher joins the poll room as "admin" effectively
        callback({ pollId });
        console.log(`Poll created: ${pollId}`);
    });

    socket.on('get_poll_data', ({ pollId }, callback) => {
        const poll = polls[pollId];
        if (poll) {
            // Calculate aggregate results for current question
            // This is a simple pass-through for now
            callback({ poll });
        } else {
            callback({ error: 'Poll not found' });
        }
    });

    socket.on('submit_question', ({ pollId, question }, callback) => {
        const poll = polls[pollId];
        if (!poll) return;

        // Add question
        poll.questions.push(question);
        poll.currentQuestionIndex = poll.questions.length - 1;

        // Initialize results for this question
        poll.results[poll.currentQuestionIndex] = {};
        question.options.forEach((opt, idx) => {
            poll.results[poll.currentQuestionIndex][idx] = 0;
        });

        // Broadcast new question to all students in room
        io.to(pollId).emit('new_question', { question, questionIndex: poll.currentQuestionIndex });

        // Update teacher view
        io.to(pollId).emit('poll_updated', { poll });

        if (callback) callback({ success: true });
    });

    socket.on('set_active_question', ({ pollId, questionIndex }, callback) => {
        const poll = polls[pollId];
        if (poll && poll.questions[questionIndex]) {
            poll.currentQuestionIndex = questionIndex;

            // Broadcast update to everyone (students will see the new active question)
            io.to(pollId).emit('poll_updated', { poll });

            if (callback) callback({ success: true });
        } else {
            if (callback) callback({ success: false, error: 'Invalid question index' });
        }
    });

    socket.on('close_poll', ({ pollId }) => {
        // Optional: Close poll logic
    });


    // STUDENT EVENTS
    socket.on('join_poll', ({ pollId, name }, callback) => {
        const poll = polls[pollId];
        if (poll) {
            socket.join(pollId);
            poll.students[socket.id] = { name };

            // Send current state to student
            callback({
                success: true,
                title: poll.title,
                currentQuestion: poll.currentQuestionIndex >= 0 ? poll.questions[poll.currentQuestionIndex] : null,
                currentQuestionIndex: poll.currentQuestionIndex
            });

            // Notify teacher
            io.to(pollId).emit('student_joined', { count: Object.keys(poll.students).length });
            io.to(pollId).emit('poll_updated', { poll });
        } else {
            callback({ success: false, error: 'Poll not found' });
        }
    });

    socket.on('submit_answer', ({ pollId, questionIndex, optionIndex }) => {
        const poll = polls[pollId];
        if (poll && poll.currentQuestionIndex === questionIndex) {
            if (!poll.results[questionIndex]) poll.results[questionIndex] = {};
            if (!poll.results[questionIndex][optionIndex]) poll.results[questionIndex][optionIndex] = 0;

            poll.results[questionIndex][optionIndex]++;

            // Send updated results to everyone (or just teacher)
            // For now, let's send to everyone so students see live results? 
            // Requirement: "View live polling results after submission"
            io.to(pollId).emit('results_update', {
                questionIndex,
                results: poll.results[questionIndex]
            });

            // Also update full poll data for teacher
            io.to(pollId).emit('poll_updated', { poll });
        }
    });

    socket.on('remove_student', ({ pollId, studentId }) => {
        const poll = polls[pollId];
        if (poll && poll.students[studentId]) {
            delete poll.students[studentId];
            // Notify everyone (or just teacher and specific student)
            io.to(pollId).emit('student_kicked', { studentId });
            io.to(pollId).emit('poll_updated', { poll });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Logic to remove student from poll if needed, but for now persistent until server restart
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

