import SchoolSetting from '../models/SchoolSetting.js';

// Helper to check if current time is within [startTime, endTime]
export const checkWindowActive = (startTimeStr, endTimeStr) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const [startH, startM] = (startTimeStr || '08:00').split(':').map(Number);
  const [endH, endM] = (endTimeStr || '10:00').split(':').map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  const isWindowOpen = currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
  const isCutoffPassed = currentTotalMinutes > endTotalMinutes;

  return { isWindowOpen, isCutoffPassed, currentTotalMinutes, startTotalMinutes, endTotalMinutes };
};

// @desc    Get current attendance window timings & active status
// @route   GET /api/settings/attendance-window
// @access  Public / Private
export const getAttendanceWindowSettings = async (req, res, next) => {
  try {
    let setting = await SchoolSetting.findOne({ key: 'attendance_window' });

    if (!setting) {
      setting = await SchoolSetting.create({
        key: 'attendance_window',
        startTime: '08:00',
        endTime: '10:00',
        autoAbsentCutoff: true,
      });
    }

    const windowStatus = checkWindowActive(setting.startTime, setting.endTime);

    res.status(200).json({
      success: true,
      settings: {
        startTime: setting.startTime,
        endTime: setting.endTime,
        autoAbsentCutoff: setting.autoAbsentCutoff,
        isWindowOpen: windowStatus.isWindowOpen,
        isCutoffPassed: windowStatus.isCutoffPassed,
        serverTime: new Date().toLocaleTimeString('en-US', { hour12: true }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance window timings (Admin & Principal only)
// @route   POST /api/settings/attendance-window
// @access  Private (Admin, Principal)
export const updateAttendanceWindowSettings = async (req, res, next) => {
  try {
    const { startTime, endTime, autoAbsentCutoff } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide both Start Time and End Time (e.g. 08:00 to 10:00)' });
    }

    let setting = await SchoolSetting.findOne({ key: 'attendance_window' });
    if (!setting) {
      setting = new SchoolSetting({ key: 'attendance_window' });
    }

    setting.startTime = startTime;
    setting.endTime = endTime;
    if (autoAbsentCutoff !== undefined) setting.autoAbsentCutoff = autoAbsentCutoff;
    if (req.user) setting.updatedBy = req.user._id;

    await setting.save();

    const windowStatus = checkWindowActive(setting.startTime, setting.endTime);

    const io = req.app.get('io');
    if (io) {
      io.emit('settings_updated', {
        startTime: setting.startTime,
        endTime: setting.endTime,
        isWindowOpen: windowStatus.isWindowOpen,
        isCutoffPassed: windowStatus.isCutoffPassed,
      });
    }

    res.status(200).json({
      success: true,
      message: `Attendance Window updated successfully (${setting.startTime} to ${setting.endTime})`,
      settings: {
        startTime: setting.startTime,
        endTime: setting.endTime,
        autoAbsentCutoff: setting.autoAbsentCutoff,
        isWindowOpen: windowStatus.isWindowOpen,
        isCutoffPassed: windowStatus.isCutoffPassed,
      },
    });
  } catch (error) {
    next(error);
  }
};
