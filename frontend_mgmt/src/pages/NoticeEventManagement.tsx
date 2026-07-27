import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Trash2, Megaphone, CalendarPlus, Bell } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

interface SchoolEvent {
  _id: string;
  title: string;
  desc: string;
  date: string;
  type: string;
}

const NoticeEventManagement: React.FC = () => {
  const [tabVal, setTabVal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lists
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('General');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDateStr, setEventDateStr] = useState(''); // e.g. "Aug 14"
  const [eventType, setEventType] = useState('General Event');

  const fetchNotices = async () => {
    try {
      const res = await axiosInstance.get('/api/notices');
      if (res.data.success) {
        setNotices(res.data.notices);
      }
    } catch (err: any) {
      console.error('Error fetching notices:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get('/api/events');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchNotices(), fetchEvents()]).finally(() => setLoading(false));
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      setError('Please fill in notice title and content');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/notices', {
        title: noticeTitle,
        content: noticeContent,
        category: noticeCategory,
      });
      if (res.data.success) {
        setSuccess('Notice posted successfully to school website!');
        setNoticeTitle('');
        setNoticeContent('');
        setNoticeCategory('General');
        fetchNotices();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create notice');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!eventTitle.trim() || !eventDesc.trim() || !eventDateStr.trim() || !eventType.trim()) {
      setError('Please fill in all event details');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/events', {
        title: eventTitle,
        desc: eventDesc,
        date: eventDateStr,
        type: eventType,
      });
      if (res.data.success) {
        setSuccess('Event posted successfully to school website!');
        setEventTitle('');
        setEventDesc('');
        setEventDateStr('');
        setEventType('General Event');
        fetchEvents();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await axiosInstance.delete(`/api/notices/${id}`);
      if (res.data.success) {
        setSuccess('Notice deleted successfully.');
        fetchNotices();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await axiosInstance.delete(`/api/events/${id}`);
      if (res.data.success) {
        setSuccess('Event deleted successfully.');
        fetchEvents();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Title */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Megaphone size={28} color="#EA580C" />
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Marcellus', fontWeight: 'bold' }}>
            Website Bulletins CMS
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Publish real-time notices, announcements, and school events directly to the student & parent portal.
          </Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.06)', mb: 4 }}>
        <Tabs
          value={tabVal}
          onChange={(_, val) => setTabVal(val)}
          sx={{
            '& .MuiTab-root': { color: '#94A3B8', fontWeight: 'bold', textTransform: 'none' },
            '& .Mui-selected': { color: '#EA580C !important' },
            '& .MuiTabs-indicator': { bgcolor: '#EA580C' },
          }}
        >
          <Tab icon={<Bell size={18} style={{ marginRight: 6 }} />} iconPosition="start" label="Notice Board Announcements" />
          <Tab icon={<CalendarPlus size={18} style={{ marginRight: 6 }} />} iconPosition="start" label="Events Calendar Updates" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : tabVal === 0 ? (
        /* NOTICE MANAGEMENT TAB */
        <Grid container spacing={4}>
          {/* Create Form */}
          <Grid item xs={12} md={5}>
            <Card className="glass-panel" sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.45)' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Marcellus', mb: 3, color: '#EA580C' }}>
                Publish New Notice
              </Typography>
              <form onSubmit={handleCreateNotice}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Notice Title"
                    required
                    fullWidth
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                  <TextField
                    select
                    label="Category"
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {['General', 'Admission', 'Academic', 'Exam', 'Holiday'].map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Content Body"
                    required
                    multiline
                    rows={4}
                    fullWidth
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    sx={{ textarea: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5, fontWeight: 'bold' }}>
                    Post Announcement
                  </Button>
                </Box>
              </form>
            </Card>
          </Grid>

          {/* Active Notices List */}
          <Grid item xs={12} md={7}>
            <Card className="glass-panel" sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.45)', maxHeight: 600, overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Marcellus', mb: 3 }}>
                Active Bulletins ({notices.length})
              </Typography>
              {notices.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748B', py: 4, textAlign: 'center' }}>
                  No announcements posted yet. Seeding data will fallback on website.
                </Typography>
              ) : (
                <List>
                  {notices.map((n, i) => (
                    <React.Fragment key={n._id}>
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleDeleteNotice(n._id)} sx={{ color: '#EF4444' }}>
                            <Trash2 size={18} />
                          </IconButton>
                        }
                        sx={{ px: 0, py: 2 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#FFF' }}>
                                {n.title}
                              </Typography>
                              <Box
                                sx={{
                                  px: 1.2,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(234, 88, 12, 0.1)',
                                  color: '#EA580C',
                                  fontSize: 10,
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(234, 88, 12, 0.2)',
                                }}
                              >
                                {n.category}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, lineHeight: 1.5 }}>
                                {n.content}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>
                                Published: {new Date(n.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {i < notices.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* EVENT MANAGEMENT TAB */
        <Grid container spacing={4}>
          {/* Create Form */}
          <Grid item xs={12} md={5}>
            <Card className="glass-panel" sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.45)' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Marcellus', mb: 3, color: '#EA580C' }}>
                Add Calendar Event
              </Typography>
              <form onSubmit={handleCreateEvent}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Event Title"
                    required
                    fullWidth
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Annual Sports Meet"
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                  <TextField
                    label="Event Date Label"
                    required
                    fullWidth
                    value={eventDateStr}
                    onChange={(e) => setEventDateStr(e.target.value)}
                    placeholder="e.g. Aug 14 or Sep 02"
                    helperText="String displayed in calendar date box"
                    sx={{
                      input: { color: '#FFF' },
                      label: { color: '#94A3B8' },
                      fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
                      '& .MuiFormHelperText-root': { color: '#64748B' },
                    }}
                  />
                  <TextField
                    label="Event Type/Sub-tag"
                    required
                    fullWidth
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="e.g. Technology Event, Sports Academy"
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                  <TextField
                    label="Description"
                    required
                    multiline
                    rows={3}
                    fullWidth
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Provide event brief information..."
                    sx={{ textarea: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5, fontWeight: 'bold' }}>
                    Add Event Entry
                  </Button>
                </Box>
              </form>
            </Card>
          </Grid>

          {/* Active Events List */}
          <Grid item xs={12} md={7}>
            <Card className="glass-panel" sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.45)', maxHeight: 600, overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Marcellus', mb: 3 }}>
                Scheduled Events ({events.length})
              </Typography>
              {events.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748B', py: 4, textAlign: 'center' }}>
                  No events scheduled yet. Local defaults will render on website.
                </Typography>
              ) : (
                <List>
                  {events.map((ev, i) => (
                    <React.Fragment key={ev._id}>
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleDeleteEvent(ev._id)} sx={{ color: '#EF4444' }}>
                            <Trash2 size={18} />
                          </IconButton>
                        }
                        sx={{ px: 0, py: 2 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#FFF' }}>
                                {ev.title}
                              </Typography>
                              <Box
                                sx={{
                                  px: 1.2,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(14, 165, 233, 0.1)',
                                  color: '#38BDF8',
                                  fontSize: 10,
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(14, 165, 233, 0.2)',
                                }}
                              >
                                {ev.date}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 0.5 }}>
                                {ev.desc}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 'bold' }}>
                                Tag: {ev.type}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {i < events.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default NoticeEventManagement;
