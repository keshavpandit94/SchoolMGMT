import Event from '../models/Event.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ fullDate: -1 });
    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin, Principal)
export const createEvent = async (req, res, next) => {
  try {
    const { title, desc, date, fullDate, type } = req.body;
    if (!title || !desc || !date || !type) {
      return res.status(400).json({ success: false, message: 'Please provide event title, desc, date string, and type' });
    }

    const newEvent = new Event({
      title,
      desc,
      date,
      fullDate: fullDate || Date.now(),
      type,
    });

    const savedEvent = await newEvent.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('event_created', savedEvent);
    }

    res.status(201).json({ success: true, message: 'Event created successfully', event: savedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin, Principal)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.emit('event_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};
