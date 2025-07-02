const express = require('express');
const router = express.Router();
const QCM = require('../models/QCM');

const { protect, authorize } = require('../middlewares/authMiddleware');

// Create QCM
router.post('/', protect, authorize(['teacher']), async (req, res) => {
  try {
    const { 
      formationId, 
      title, 
      description, 
      questions, 
      timeLimit, 
      students, 
      startDate, 
      endDate,
      showResults,
      allowRetake 
    } = req.body;
    
    const qcm = new QCM({
      teacherId: req.user._id,
      formationId,
      title,
      description,
      questions,
      timeLimit,
      students,
      startDate,
      endDate,
      showResults: showResults !== undefined ? showResults : true,
      allowRetake: allowRetake !== undefined ? allowRetake : false,
      isActive: true
    });

    await qcm.save();
    await qcm.populate('formationId', 'title');
    await qcm.populate('students', 'name lastname');
    
    res.status(201).json(qcm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get QCMs by teacher
router.get('/my-qcms', protect, authorize(['teacher']), async (req, res) => {
  try {
    const qcms = await QCM.find({ teacherId: req.user._id })
      .populate('formationId', 'title')
      .populate('students', 'name lastname')
      .sort({ createdAt: -1 });
    res.json(qcms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available QCMs for student
router.get('/available', protect, authorize(['student']), async (req, res) => {
  try {
    const now = new Date();
    
    const qcms = await QCM.find({ 
      students: req.user._id,
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })
      .populate('formationId', 'title')
      .populate('teacherId', 'name lastname')
      .select('-questions.correctAnswer') // Hide correct answers
      .sort({ createdAt: -1 });
    
    res.json(qcms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get QCMs for student (including completed ones)
router.get('/student/my-qcms', protect, authorize(['student']), async (req, res) => {
  try {
    const qcms = await QCM.find({ students: req.user._id })
      .populate('formationId', 'title')
      .populate('teacherId', 'name lastname')
      .select('-questions.correctAnswer') // Hide correct answers
      .sort({ createdAt: -1 });
    res.json(qcms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get QCM by ID (for taking test)
router.get('/:id', protect, authorize(['student', 'teacher']), async (req, res) => {
  try {
    let qcm;
    
    if (req.user.role === 'teacher') {
      qcm = await QCM.findById(req.params.id)
        .populate('formationId', 'title')
        .populate('teacherId', 'name lastname')
        .populate('students', 'name lastname');
    } else {
      qcm = await QCM.findById(req.params.id)
        .populate('formationId', 'title')
        .populate('teacherId', 'name lastname')
        .select('-questions.correctAnswer'); // Hide correct answers for students
    }
    
    if (!qcm) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    // Check access permissions
    if (req.user.role === 'student') {
      if (!qcm.students.some(s => s._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'teacher') {
      if (qcm.teacherId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(qcm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit QCM answers
router.post('/:id/submit', protect, authorize(['student']), async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const qcm = await QCM.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    // Check if student is allowed to take this QCM
    if (!qcm.students.some(s => s._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if QCM is still available
    const now = new Date();
    if (qcm.endDate && now > qcm.endDate) {
      return res.status(400).json({ message: 'QCM has expired' });
    }

    // Check if student already submitted (and retakes are not allowed)
    const existingResult = qcm.results.find(r => r.studentId.toString() === req.user._id.toString());
    if (existingResult && !qcm.allowRetake) {
      return res.status(400).json({ message: 'QCM already submitted' });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = qcm.questions.length;
    
    answers.forEach((answer, index) => {
      if (index < qcm.questions.length) {
        const question = qcm.questions[index];
        if (question.type === 'multiple_choice' || question.type === 'true_false') {
          if (answer.answer === question.correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === 'short_answer') {
          // For short answers, do a case-insensitive comparison
          const correctAnswer = question.correctAnswer.toString().toLowerCase().trim();
          const studentAnswer = answer.answer.toString().toLowerCase().trim();
          if (studentAnswer === correctAnswer) {
            correctAnswers++;
          }
        }
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const result = {
      studentId: req.user._id,
      answers: answers.map(a => a.answer),
      score,
      correctAnswers,
      totalQuestions,
      timeSpent: timeSpent || 0,
      submittedAt: new Date()
    };

    // Remove existing result if retake is allowed
    if (existingResult && qcm.allowRetake) {
      qcm.results = qcm.results.filter(r => r.studentId.toString() !== req.user._id.toString());
    }

    qcm.results.push(result);
    await qcm.save();

    res.json({ 
      score, 
      correctAnswers, 
      totalQuestions, 
      timeSpent: result.timeSpent,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get QCM results (teacher only)
router.get('/:id/results', protect, authorize(['teacher']), async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id)
      .populate('results.studentId', 'name lastname');
    
    if (!qcm || qcm.teacherId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    res.json(qcm.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's QCM results
router.get('/my-results', protect, authorize(['student']), async (req, res) => {
  try {
    const qcms = await QCM.find({ 
      students: req.user._id,
      'results.studentId': req.user._id
    })
      .populate('formationId', 'title')
      .populate('teacherId', 'name lastname')
      .select('title description results formationId teacherId showResults');

    const results = [];
    
    qcms.forEach(qcm => {
      const studentResult = qcm.results.find(r => r.studentId.toString() === req.user._id.toString());
      if (studentResult && qcm.showResults) {
        results.push({
          _id: studentResult._id,
          qcm: {
            _id: qcm._id,
            title: qcm.title,
            description: qcm.description,
            formationId: qcm.formationId,
            teacherId: qcm.teacherId,
            questions: { length: qcm.questions?.length || 0 }
          },
          score: studentResult.score,
          correctAnswers: studentResult.correctAnswers,
          totalQuestions: studentResult.totalQuestions,
          timeSpent: studentResult.timeSpent,
          submittedAt: studentResult.submittedAt
        });
      }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's specific QCM result
router.get('/:id/my-result', protect, authorize(['student']), async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id)
      .populate('formationId', 'title')
      .populate('teacherId', 'name lastname');
    
    if (!qcm) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    const result = qcm.results.find(r => r.studentId.toString() === req.user._id.toString());
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (!qcm.showResults) {
      return res.status(403).json({ message: 'Results are not available for viewing' });
    }

    res.json({
      _id: result._id,
      qcm: {
        _id: qcm._id,
        title: qcm.title,
        description: qcm.description,
        formationId: qcm.formationId,
        teacherId: qcm.teacherId,
        questions: { length: qcm.questions?.length || 0 }
      },
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      timeSpent: result.timeSpent,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update QCM
router.put('/:id', protect, authorize(['teacher']), async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id);
    
    if (!qcm || qcm.teacherId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    const { 
      title, 
      description, 
      questions, 
      timeLimit, 
      students, 
      startDate, 
      endDate,
      showResults,
      allowRetake,
      isActive 
    } = req.body;

    // Update fields
    if (title !== undefined) qcm.title = title;
    if (description !== undefined) qcm.description = description;
    if (questions !== undefined) qcm.questions = questions;
    if (timeLimit !== undefined) qcm.timeLimit = timeLimit;
    if (students !== undefined) qcm.students = students;
    if (startDate !== undefined) qcm.startDate = startDate;
    if (endDate !== undefined) qcm.endDate = endDate;
    if (showResults !== undefined) qcm.showResults = showResults;
    if (allowRetake !== undefined) qcm.allowRetake = allowRetake;
    if (isActive !== undefined) qcm.isActive = isActive;
    
    qcm.updatedAt = new Date();
    await qcm.save();

    await qcm.populate('formationId', 'title');
    await qcm.populate('students', 'name lastname');

    res.json(qcm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete QCM
router.delete('/:id', protect, authorize(['teacher']), async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id);
    
    if (!qcm || qcm.teacherId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    await QCM.findByIdAndDelete(req.params.id);
    res.json({ message: 'QCM deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get QCM statistics for teacher
router.get('/:id/statistics', protect, authorize(['teacher']), async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id)
      .populate('results.studentId', 'name lastname');
    
    if (!qcm || qcm.teacherId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'QCM not found' });
    }

    const totalStudents = qcm.students.length;
    const completedStudents = qcm.results.length;
    const averageScore = qcm.results.length > 0 
      ? Math.round(qcm.results.reduce((sum, r) => sum + r.score, 0) / qcm.results.length)
      : 0;
    
    const scoreDistribution = {
      excellent: qcm.results.filter(r => r.score >= 90).length,
      good: qcm.results.filter(r => r.score >= 70 && r.score < 90).length,
      average: qcm.results.filter(r => r.score >= 50 && r.score < 70).length,
      poor: qcm.results.filter(r => r.score < 50).length
    };

    res.json({
      totalStudents,
      completedStudents,
      pendingStudents: totalStudents - completedStudents,
      averageScore,
      scoreDistribution,
      completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

