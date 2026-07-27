import Notice from '../models/Notice.js';

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
export const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (Admin, Principal)
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, category, date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide notice title and content' });
    }

    const newNotice = new Notice({
      title,
      content,
      category: category || 'General',
      date: date || Date.now(),
    });

    const savedNotice = await newNotice.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('notice_created', savedNotice);
    }

    res.status(201).json({ success: true, message: 'Notice created successfully', notice: savedNotice });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin, Principal)
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await notice.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.emit('notice_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
