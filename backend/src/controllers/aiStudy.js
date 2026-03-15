const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const CourseResource = require('../models/CourseResource');
const StudyQuiz = require('../models/StudyQuiz');
const ErrorResponse = require('../utils/ErrorResponse');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary for direct access
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize table
StudyQuiz.initTable().catch(err => console.error('Failed to init study_quizzes table:', err));

// @desc    Generate a Quiz from a PDF resource
// @route   POST /api/v1/ai/generate-quiz/:resourceId
// @access  Private
exports.generateQuizFromResource = async (req, res, next) => {
    try {
        const { resourceId } = req.params;
        const resource = await CourseResource.findById(resourceId);

        if (!resource) {
            return next(new ErrorResponse('Course resource data not found in system', 404));
        }

        // Check if it's a PDF
        if (!resource.file_name.toLowerCase().endsWith('.pdf')) {
            return next(new ErrorResponse('Only PDF resources are supported for AI Quiz generation', 400));
        }

        // 1. Get PDF Buffer (Handle Local vs Cloudinary)
        let dataBuffer;

        if (resource.file_path.startsWith('http')) {
            try {
                // Extract the public_id from the Cloudinary URL
                const urlParts = resource.file_path.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                if (uploadIndex === -1) throw new Error('Could not parse Cloudinary URL');

                const resourceType = urlParts[uploadIndex - 1]; // 'image' or 'raw'

                // Skip version segment if present
                const afterUpload = /^v\d+$/.test(urlParts[uploadIndex + 1])
                    ? urlParts.slice(uploadIndex + 2)
                    : urlParts.slice(uploadIndex + 1);

                const pathWithExt = afterUpload.join('/');
                const publicId = pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
                const extension = pathWithExt.substring(pathWithExt.lastIndexOf('.') + 1);

                // Use the Cloudinary Download API with Basic Auth (works with Strict Transformations)
                const downloadApiUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/download`;
                const basicAuth = Buffer.from(
                    `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`
                ).toString('base64');

                const params = new URLSearchParams({
                    public_id: publicId,
                    format: extension,
                    resource_type: resourceType,
                    type: 'upload'
                });

                const response = await fetch(`${downloadApiUrl}?${params.toString()}`, {
                    headers: { 'Authorization': 'Basic ' + basicAuth }
                });

                if (!response.ok) {
                    throw new Error(`Cloudinary download failed: ${response.statusText} (${response.status})`);
                }

                const arrayBuffer = await response.arrayBuffer();
                dataBuffer = Buffer.from(arrayBuffer);
            } catch (fetchErr) {
                console.error('Remote fetch error:', fetchErr);
                return next(new ErrorResponse(`Failed to download resource from cloud storage: ${fetchErr.message}`, 500));
            }
        } else {
            // Construct absolute path for local file
            console.log('Reading local PDF:', resource.file_path);
            let cleanPath = resource.file_path;
            if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
            
            let filePath = path.join(__dirname, '..', '..', 'public', cleanPath);
            
            if (!fs.existsSync(filePath)) {
                // Try fallback
                const fallbackPath = path.join(__dirname, '..', '..', cleanPath);
                if (fs.existsSync(fallbackPath)) {
                    filePath = fallbackPath;
                } else {
                    return next(new ErrorResponse('Physical resource file not found on server', 404));
                }
            }
            dataBuffer = fs.readFileSync(filePath);
        }

        // 2. Extract Text from PDF
        const data = await pdf(dataBuffer);
        const extractedText = data.text;

        if (!extractedText || extractedText.trim().length < 50) {
            return next(new ErrorResponse('Could not extract enough text from the PDF to generate a quiz', 400));
        }

        // 2. Send to Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a Professor at UPF (Université Privée de Fès). Based on the following extracted text from a course material, generate a 5-question multiple choice quiz to help students study.
        
        Return the result as a raw JSON object with this exact structure:
        {
          "quiz_title": "string",
          "questions": [
            {
              "question": "string",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer_index": 0,
              "explanation": "Brief explanation why this is the correct answer"
            }
          ]
        }

        IMPORTANT: Return ONLY the JSON object. Do not enclose it in markdown code blocks.

        Extracted Course Text:
        ---
        ${extractedText.substring(0, 5000)} // Limit to first 5000 chars to save tokens/stay stable
        ---
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let quizData;
        try {
            // Clean the response (Gemini sometimes adds ```json ... ```)
            const jsonStr = responseText.includes('```')
                ? responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] || responseText
                : responseText;

            quizData = JSON.parse(jsonStr.trim());
        } catch (parseErr) {
            console.error('Gemini JSON Parse Error:', parseErr, 'Raw response:', responseText);
            // Fallback: try to find anything between { and }
            const match = responseText.match(/\{[\s\S]*\}/);
            if (match) {
                quizData = JSON.parse(match[0]);
            } else {
                throw new Error('AI returned an invalid response format');
            }
        }

        res.status(200).json({
            success: true,
            data: quizData
        });

    } catch (err) {
        console.error('AI Study Error Detailed:', {
            message: err.message,
            stack: err.stack,
            resourceId: req.params.resourceId
        });
        res.status(500).json({
            success: false,
            error: err.message, // INTERCEPTOR LOOKS FOR THIS
            message: 'AI Study Error: ' + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc    Save Quiz Result
// @route   POST /api/v1/ai-study/save-result
// @access  Private
exports.saveQuizResult = async (req, res, next) => {
    try {
        const { resourceId, quizData, score, totalQuestions, answers, timeSpent } = req.body;

        const quiz = await StudyQuiz.create({
            student_id: req.user.id,
            resource_id: resourceId,
            quiz_data: quizData,
            score,
            total_questions: totalQuestions,
            answers,
            time_spent: timeSpent
        });

        res.status(201).json({
            success: true,
            data: quiz
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Study History for current student
// @route   GET /api/v1/ai-study/history
// @access  Private
exports.getStudyHistory = async (req, res, next) => {
    try {
        const history = await StudyQuiz.findByStudent(req.user.id);
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        next(err);
    }
};
