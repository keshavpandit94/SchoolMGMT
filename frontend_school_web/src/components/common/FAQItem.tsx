import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  return (
    <Accordion
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px !important',
        mb: 2,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        overflow: 'hidden',
        '&.Mui-expanded': {
          borderColor: '#E8751A',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} color="#0F766E" />}
        sx={{ 
          px: 3, 
          py: 1,
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
          }
        }}
      >
        <Typography 
          variant="subtitle1" 
          component="h3"
          sx={{ 
            fontWeight: 700, 
            fontFamily: '"Inter", sans-serif', 
            color: '#12355B' 
          }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#5B6573', 
            lineHeight: 1.7 
          }}
        >
          {answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default FAQItem;
