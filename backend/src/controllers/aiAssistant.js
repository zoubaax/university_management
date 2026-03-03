const { GoogleGenerativeAI } = require('@google/generative-ai');
const Schedule = require('../models/Schedule');
const Finance = require('../models/Finance');
const Absence = require('../models/Absence');
const Grade = require('../models/Grade');
const Certificate = require('../models/Certificate');
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
                - Students can request Enrollment Certificates (ENROLLMENT).
                - IMPORTANT RULE: Enrollment certificates are ONLY approved if the 'remaining_balance' in Financial Status is 0 (fully paid).
                - Process: If they ask to request one, tell them if they are eligible (based on balance) and tell them to go to the 'Certificates' section in the sidebar.
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

        Student/User Question:
        "${message}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

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
