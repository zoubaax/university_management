const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const Room = require('../models/Room');
const Module = require('../models/Module');
const ErrorResponse = require('../utils/ErrorResponse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { query } = require('../config/db');

/**
 * @desc    Generate an AI-powered schedule for a class
 * @route   POST /api/v1/schedules/generate/:classId
 * @access  Private (Managers)
 */
exports.generateSchedule = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const { apply = false } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return next(new ErrorResponse('AI Service not configured', 500));
        }

        // 1. Gather all necessary data
        const academicClass = await Class.findById(classId);
        if (!academicClass) return next(new ErrorResponse('Class not found', 404));

        const [classModules, departmentRooms, allSchedules] = await Promise.all([
            Module.getClassModules(classId),
            Room.findByDepartment(academicClass.department_id),
            query(`SELECT s.*, c.name as class_name FROM schedules s JOIN classes c ON s.class_id = c.id`)
        ]);

        if (classModules.length === 0) {
            return next(new ErrorResponse('This class has no modules assigned yet', 400));
        }

        // 2. Format constraints for AI
        // We only care about schedules that overlap with our rooms or our professors
        const professorIds = classModules.map(m => m.professor_id).filter(Boolean);
        const roomNames = departmentRooms.map(r => r.name);

        const relevantConflicts = allSchedules.rows.filter(s =>
            (s.class_id !== classId) && // Only conflicts with OTHER classes
            (roomNames.includes(s.room) || professorIds.includes(s.professor_id))
        );

        const prompt = `
        As a University Academic Registrar, generate a fixed weekly schedule for class "${academicClass.name}".
        
        UNIVERSITY RULES:
        - Work days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
        - Time Slots: MORNING (8:30-12:00) and AFTERNOON (14:30-18:00).
        - Max sessions per class per day: 2 (1 Morning, 1 Afternoon).
        
        WEEKLY MODULE REQUIREMENTS (Strictly use these UUIDs):
        ${classModules.map(m => `- ${m.module_name}: Needs ${m.hours_per_week}h/week (~${Math.ceil(m.hours_per_week / 3.5)} sessions). 
          Module ID: ${m.module_id}
          Professor ID: ${m.professor_id}`).join('\n')}
        
        AVAILABLE DEPARTMENT ROOMS:
        ${departmentRooms.map(r => `- ${r.name} (${r.type}, Cap: ${r.capacity})`).join('\n')}
        
        HARD CONSTRAINTS (FORBIDDEN SLOTS - DO NOT USE):
        ${relevantConflicts.map(s => `- Room ${s.room} is BUSY on ${s.day_of_week} ${s.slot_type}.
        - Professor ${s.professor_id} is BUSY on ${s.day_of_week} ${s.slot_type}.`).join('\n')}

        TASK:
        Create a balanced schedule for "${academicClass.name}". 
        - Strictly use the Module IDs and Professor IDs provided above.
        - Use ONLY the provided Room names.
        - Ensure no professor teaches two classes at once.
        - Spread sessions across the week.
        
        OUTPUT FORMAT:
        Return ONLY a JSON array of objects with this structure, no other text:
        [{ "day_of_week": "Monday", "slot_type": "MORNING", "module_id": "uuid", "professor_id": "uuid", "room": "ROOM_NAME" }]
        `;

        // 3. Call AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelName = "gemini-2.5-flash";
        console.log(`AI Instance created. Model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean and parse result (more robust regex extraction)
        let suggestedSchedules;
        try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            const cleanedJson = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, '').trim();
            suggestedSchedules = JSON.parse(cleanedJson);
            console.log(`Successfully parsed ${suggestedSchedules?.length || 0} suggested slots.`);
        } catch (e) {
            console.error('AI JSON Parsing Error:', e.message);
            console.error('Raw problematic response:', responseText);
            return next(new ErrorResponse('AI failed to generate a valid schedule structure. Please try again.', 500));
        }

        if (!suggestedSchedules || suggestedSchedules.length === 0) {
            return next(new ErrorResponse('AI generated zero slots. Please try different rooms or check professor availability.', 400));
        }

        // 4. Auto-Apply if requested
        if (apply && Array.isArray(suggestedSchedules)) {
            console.log(`Applying ${suggestedSchedules.length} slots to class ${classId}...`);

            // Safety: Only delete if AI gave us suggestions
            await query('DELETE FROM schedules WHERE class_id = $1', [classId]);

            let successCount = 0;
            for (const slot of suggestedSchedules) {
                try {
                    await Schedule.upsert({
                        class_id: classId,
                        module_id: slot.module_id,
                        professor_id: slot.professor_id,
                        day_of_week: slot.day_of_week,
                        slot_type: slot.slot_type,
                        room: slot.room
                    });
                    successCount++;
                } catch (upsertErr) {
                    console.error(`Failed to assign slot: ${slot.day_of_week} ${slot.slot_type}. Error: ${upsertErr.message}`);
                }
            }
            console.log(`Class schedule update complete. Applied ${successCount}/${suggestedSchedules.length} slots.`);

            if (successCount === 0 && suggestedSchedules.length > 0) {
                return next(new ErrorResponse('All suggested slots had conflicts. Schedule was cleared but no new slots were applied.', 409));
            }
        }

        res.status(200).json({
            success: true,
            data: suggestedSchedules,
            applied: apply
        });

    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get schedules for a class
 * @route   GET /api/v1/schedules/class/:classId
 * @access  Private
 */
exports.getClassSchedules = async (req, res, next) => {
    try {
        const schedules = await Schedule.findAllByClass(req.params.classId);
        res.status(200).json({ success: true, count: schedules.length, data: schedules });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get schedules for a professor
 * @route   GET /api/v1/schedules/professor/:professorId
 * @access  Private
 */
exports.getProfessorSchedules = async (req, res, next) => {
    try {
        const schedules = await Schedule.findAllByProfessor(req.params.professorId);
        res.status(200).json({ success: true, count: schedules.length, data: schedules });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create or Update a schedule slot
 * @route   POST /api/v1/schedules
 * @access  Private (SuperAdmin, RespDept)
 */
exports.upsertSchedule = async (req, res, next) => {
    try {
        // Find class to check department isolation
        const academicClass = await Class.findById(req.body.class_id);
        if (!academicClass) {
            return next(new ErrorResponse('Class not found', 404));
        }

        // Department Isolation
        if ((req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT') &&
            academicClass.department_id !== req.user.department_id) {
            return next(new ErrorResponse('You can only manage schedules for your own department', 403));
        }

        const schedule = await Schedule.upsert(req.body);

        // NOTIFICATION LOGIC
        try {
            const Notification = require('../models/Notification');

            // Find all students in this class
            const studentsResult = await query(
                `SELECT user_id FROM students WHERE class_id = $1`,
                [req.body.class_id]
            );
            const userIds = studentsResult.rows.map(s => s.user_id);

            // Get module name
            const modResult = await query('SELECT name FROM modules WHERE id = $1', [req.body.module_id]);
            const moduleName = modResult.rows[0]?.name || 'Course';

            if (userIds.length > 0) {
                // Bulk create notifications using our createBulk helper
                const notifications = userIds.map(uid => ({
                    user_id: uid,
                    type: 'general',
                    title: 'Schedule Update',
                    message: `Schedule updated for ${moduleName} on ${req.body.day_of_week}`,
                    link: '/timetable',
                    related_id: schedule.id
                }));

                await Notification.createBulk(notifications);
            }
        } catch (error) {
            console.error('Notification error:', error);
        }

        res.status(200).json({ success: true, data: schedule });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete a schedule slot
 * @route   DELETE /api/v1/schedules/:id
 * @access  Private (SuperAdmin, RespDept)
 */
exports.deleteSchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return next(new ErrorResponse('Schedule not found', 404));
        }

        // Department Isolation
        if ((req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT') &&
            schedule.department_id !== req.user.department_id) {
            return next(new ErrorResponse('You can only delete schedules for your own department', 403));
        }

        await Schedule.delete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Check room availability
 * @route   GET /api/v1/schedules/check-room?room=FSI1&day=Monday&slot=MORNING&classId=xxx
 * @access  Private
 */
exports.checkRoomAvailability = async (req, res, next) => {
    try {
        const { room, day, slot, classId } = req.query;

        if (!room || !day || !slot) {
            return next(new ErrorResponse('Room, day, and slot are required', 400));
        }

        const result = await Schedule.checkAvailability(room, day, slot, classId || null);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};
