const { GoogleGenerativeAI } = require('@google/generative-ai');
const Schedule = require('../models/Schedule');
const Finance = require('../models/Finance');
const Absence = require('../models/Absence');
const Grade = require('../models/Grade');
const Certificate = require('../models/Certificate');
const Task = require('../models/Task');
const Department = require('../models/Department');
const CafeteriaItem = require('../models/CafeteriaItem');
const CafeteriaWallet = require('../models/CafeteriaWallet');
const CafeteriaOrder = require('../models/CafeteriaOrder');
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
        } else if (user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') {
            // Get Department Head Details
            const employeeRes = await query('SELECT * FROM employees WHERE user_id = $1', [user.id]);
            const head = employeeRes.rows[0];

            if (head && head.department_id) {
                const dept = await Department.findById(head.department_id);
                // Fetch stats for the department
                const studentCountRes = await query(`
                    SELECT COUNT(*) FROM students s 
                    JOIN specialities spec ON s.speciality_id = spec.id 
                    WHERE spec.department_id = $1`, [head.department_id]);

                const pendingCertsRes = await query(`
                    SELECT COUNT(*) FROM certificate_requests cr
                    JOIN students s ON cr.student_id = s.id
                    JOIN specialities spec ON s.speciality_id = spec.id
                    WHERE spec.department_id = $1 AND cr.status = 'PENDING'`, [head.department_id]);

                context = `
                User Identity: Department Head (${user.role_name}) named ${head.first_name} ${head.last_name}.
                Department Info: ${dept ? dept.name : 'Unknown Department'}.
                Administrative Context:
                - Total Students in your Department: ${studentCountRes.rows[0].count}
                - Pending Certificate Requests to process: ${pendingCertsRes.rows[0].count}
                
                Policy for Department Heads:
                - You can ask about the number of students or pending certificates.
                - You should remind them to check the "Certificates" section to approve pending requests.
                `;
            }
        }

        // 1b. Cafeteria Context (For all users)
        try {
            const [availableMeals, userWallet] = await Promise.all([
                CafeteriaItem.findAll({ is_available: true }),
                CafeteriaWallet.getByUserId(user.id)
            ]);

            context += `
            Cafeteria Context:
            - Current Balance: ${userWallet.balance} DH.
            - Available Menu: ${JSON.stringify(availableMeals.map(m => ({ id: m.id, name: m.name, price: m.price, category: m.category })))}
            
            Cafeteria Policy:
            - Users can order food via this chat if they have enough balance.
            - If they want to order, confirm the item and quantity.
            `;
        } catch (cafErr) {
            console.error('Cafeteria Context Error:', cafErr);
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

        STRICT FORMATTING RULES:
        1. When providing a schedule, ALWAYS use this exact style:
           Hello [User Name]! Here is your schedule for today, [Day of Week]:
           - HH:MM - HH:MM: [Course Name] in [Room] with Professor [Professor Name]
        
        2. Use these specific time slots:
           - MORNING: 08:30 - 10:30
           - AFTERNOON: 14:00 - 16:00
        
        3. Do NOT use blocks like "* **MORNING:**". Use bullet points as shown above.
        
        4. Greet the user by their full name as provided in "User Identity" (e.g., "Hello ZOUBAA MOHAMMED!").

        System Information:
        - Current Date & Time: ${currentTime}
        - Today is: ${currentDay}

        User Context:
        ${context}

        - If the user asks you to remind them of something or create a task (e.g., "Remind me to study", "Add a task for my exam"), you can do it.
        - To create a task, add this EXACT line at the VERY END of your response: [ACTION:CREATE_TASK][TITLE:Task Title][DUE:YYYY-MM-DD]
        - Title should be short. Due date should be a valid date based on the system time. If no date is given, use tomorrow.

        - If the user wants to order food from the cafeteria, and has enough balance, you can do it.
        - To place an order, add this EXACT line at the VERY END of your response: [ACTION:ORDER_FOOD][ITEM_ID:ItemUUID][QTY:Number]
        - Confirm the total price in your message. If balance is insufficient, tell them.

        Student/User Question:
        "${message}"
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // 3. Handle Actions (Function Calling)
        let balanceUpdated = false;

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

        if (responseText.includes('[ACTION:ORDER_FOOD]')) {
            try {
                const idMatch = responseText.match(/\[ITEM_ID:(.*?)\]/);
                const qtyMatch = responseText.match(/\[QTY:(\d+)\]/); // Improved regex to catch numbers only

                const itemId = idMatch ? idMatch[1].trim() : null;
                const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;

                if (itemId) {
                    const item = await CafeteriaItem.findById(itemId);
                    if (item) {
                        const total = parseFloat(item.price) * qty;

                        // Ensure wallet exists before deduction
                        await CafeteriaWallet.getByUserId(user.id);

                        // Deduct and Create Order
                        await CafeteriaWallet.deduct(user.id, total);
                        balanceUpdated = true;

                        const order = await CafeteriaOrder.create({
                            user_id: user.id,
                            items: [{
                                item_id: item.id,
                                quantity: qty,
                                unit_price: item.price,
                                subtotal: total
                            }],
                            total_amount: total,
                            status: 'PENDING'
                        });

                        // Clean up response
                        responseText = responseText.replace(/\[ACTION:.*?\]|\[ITEM_ID:.*?\]|\[QTY:.*?\]/g, '').trim();

                        // If Gemini got the price/qty wrong in its text, we correct it based on real logic
                        if (!responseText.includes(total.toString())) {
                            responseText += `\n\n✅ Order Placed! I've deducted ${total.toFixed(2)} DH from your cafeteria wallet for ${qty} ${item.name}(s).`;
                        } else {
                            responseText += `\n\n✅ Order Confirmed! I'll notify you when it's ready.`;
                        }
                    }
                }
            } catch (orderErr) {
                console.error('AI Order Error:', orderErr);
                responseText = responseText.replace(/\[ACTION:.*?\]|\[ITEM_ID:.*?\]|\[QTY:.*?\]/g, '').trim();
                responseText += `\n\n❌ Error placing order: ${orderErr.message}`;
            }
        }

        res.status(200).json({
            success: true,
            data: responseText,
            balance_updated: balanceUpdated
        });

    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to process AI request. ' + err.message
        });
    }
};
