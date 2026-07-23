import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Avatar } from '@mui/material';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImageUrl, onUploadSuccess, label = 'Upload Photo' }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosInstance.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const uploadedUrl = response.data.url;
        setPreviewUrl(uploadedUrl);
        onUploadSuccess(uploadedUrl);
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Image upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, my: 1 }}>
      <Avatar
        src={previewUrl}
        variant="rounded"
        sx={{
          width: 64,
          height: 64,
          bgcolor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
        }}
      >
        <ImageIcon size={28} color="#94A3B8" />
      </Avatar>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Button
          variant="outlined"
          component="label"
          size="small"
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : previewUrl ? <CheckCircle2 size={16} color="#10B981" /> : <Upload size={16} />}
          sx={{
            borderColor: 'rgba(99, 102, 241, 0.4)',
            color: '#818CF8',
            '&:hover': { borderColor: '#6366F1', bgcolor: 'rgba(99, 102, 241, 0.08)' },
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
          }}
        >
          {uploading ? 'Uploading...' : previewUrl ? 'Change Photo' : label}
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>

        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ImageUploader;
