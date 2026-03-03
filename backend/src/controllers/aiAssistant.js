const { GoogleGenerativeAI } = require('@google/generative-ai');
const Schedule = require('../models/Schedule');
const Finance = require('../models/Finance');
const Absence = require('../models/Absence');
const Grade = require('../models/Grade');
const Certificate = require('../models/Certificate');
const Task = require('../models/Task');
const { query } = require('../config/db');

// @desc    Chat with AI Assistant
// @route   POST /api/v1/ai/chat
// @access  Private
exports.chatWithAssistant = async (req, res, next) => {
    try {
        const { message } = req.body;
        const user = req.user;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'AI Service is not configured. Please add GEMINI_API_KEY to .env'
            });
        }

        // 1. Gather Context (RAG - Retrieval)
        let context = "";

        if (user.role_name === 'STUDENT') {
            // Get Student Details
            const studentRes = await query('SELECT * FROM students WHERE user_id = $1', [user.id]);
            const student = studentRes.rows[0];

            if (student) {
                // Fetch All Data in parallel for speed
                const [schedules, profiles, absencesRes, grades, certs] = await Promise.all([
                    Schedule.findAllByClass(student.class_id),
                    Finance.getStudentProfiles({ studentId: student.id }),
                    query('SELECT COUNT(*) FROM student_attendance WHERE student_id = $1 AND status = \'ABSENT\'', [student.id]),
                    Grade.findByStudent(student.id),
                    Certificate.findByStudent(student.id)
                ]);

                context = `
                User Identity: Student named ${student.first_name} ${student.last_name}.
                Class: ${student.class_id}.
                Academic Data:
                - Schedule: ${JSON.stringify(schedules)}
                - Financial Status: ${JSON.stringify(profiles[0] || 'No profile')}
                - Total Absences: ${absencesRes.rows[0].count}
                - Recent Grades: ${JSON.stringify(grades.slice(0, 5))}
                - Certificate History: ${JSON.stringify(certs)}

                University Policy on Certificates:
                - There are two main types of documents a student can request:
                    1. Academic Certificates: Enrollment Certificates (ENROLLMENT) or Grade Transcripts. 
                       RULE: Enrollment certificates are ONLY approved if 'remaining_balance' is 0 or less (fully paid).
                    2. Payment History: A financial document showing all payments made and the current balance.
                       RULE: Any student can request this at any time to see their transaction history.
                - Process: If they ask about either, tell them their eligibility and guide them to the 'Certificates' section in the sidebar.
                `;
            }
        } else if (user.role_name === 'PROFESSOR') {
            // Get Professor Details
            const professorRes = await query('SELECT * FROM employees WHERE user_id = $1', [user.id]);
            const prof = professorRes.rows[0];

            if (prof) {
                const schedules = await Schedule.findAllByProfessor(prof.id);
                context = `
                User Identity: Professor named ${prof.first_name} ${prof.last_name}.
                Academic Data:
                - Your Schedule: ${JSON.stringify(schedules)}
                `;
            }
        }

        // 2. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const now = new Date();
        const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
        const currentTime = now.toLocaleString();

        const prompt = `
        You are the Smart UPF Assistant, a helpful and professional AI secretary for the UPF (Université Privée de Fès).
        Use the following context about the user to answer their question. If the information is not in the context, say you don't know or ask them to contact the administration.
        Keep your answers concise, friendly, and in the language the user speaks (French, English, or Arabic).

        System Information:
        - Current Date & Time: ${currentTime}
        - Today is: ${currentDay}

        User Context:
        ${context}

        Capabilities:
        - If the user asks you to remind them of something or create a task (e.g., "Remind me to study", "Add a task for my exam"), you can do it.
        - To create a task, add this EXACT line at the VERY END of your response: [ACTION:CREATE_TASK][TITLE:Task Title][DUE:YYYY-MM-DD]
        - Title should be short. Due date should be a valid date based on the system time. If no date is given, use tomorrow.

        Student/User Question:
        "${message}"
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // 3. Handle Actions (Function Calling)
        if (responseText.includes('[ACTION:CREATE_TASK]')) {
            try {
                const titleMatch = responseText.match(/\[TITLE:(.*?)\]/);
                const dueMatch = responseText.match(/\[DUE:(.*?)\]/);

                const title = titleMatch ? titleMatch[1] : "New Task from AI";
                const dueDate = dueMatch ? dueMatch[1] : new Date(Date.now() + 86400000).toISOString().split('T')[0];

                await Task.create({
                    title,
                    description: `Automatically created by AI Assistant at user request: "${message}"`,
                    status: 'TODO',
                    priority: 'MEDIUM',
                    category: 'PERSONAL',
                    due_date: dueDate,
                    assigned_to: user.id,
                    created_by: user.id
                });

                // Clean up the response text so the user doesn't see the tags
                responseText = responseText.replace(/\[ACTION:.*?\]|\[TITLE:.*?\]|\[DUE:.*?\]/g, '').trim();
                responseText += `\n\n✅ Done! I've added "${title}" to your tasks list for ${dueDate}.`;
            } catch (taskErr) {
                console.error('Task Action Error:', taskErr);
            }
        }

        res.status(200).json({
            success: true,
            data: responseText
        });

    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to process AI request. ' + err.message
        });
    }
};
