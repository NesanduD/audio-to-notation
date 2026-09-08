import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the recording controls', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  expect(screen.getByText(/metro assistance/i)).toBeInTheDocument();
});
