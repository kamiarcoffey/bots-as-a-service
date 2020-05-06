import React from 'react';
import { render } from '@testing-library/react';
import Attribution from './Attribution';

test('attribution rendered with expected text', () => {
  const { getByText } = render(<Attribution />);
  const attrText = getByText('created and maintained for csci-5828, team 10');
  expect(attrText).toBeInTheDocument();
});
