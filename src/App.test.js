import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BOOMDATA HUB heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/BOOMDATA/i);
  expect(headingElement).toBeInTheDocument();
});
