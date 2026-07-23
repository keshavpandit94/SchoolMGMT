import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

test('renders a simple greeting element', () => {
  render(
    <div data-testid="greet">
      Welcome to EduManage
    </div>
  );
  const element = screen.getByTestId('greet');
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent('Welcome to EduManage');
});
