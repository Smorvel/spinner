import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Spin Wheel App', () => {
  it('renders the spin wheel app correctly', () => {
    render(<App />);

    // Check for main title
    expect(screen.getByText('Колесо Фортуны')).toBeInTheDocument();

    // Check for settings panel
    expect(screen.getByText('Настройки')).toBeInTheDocument();

    // Check for input label
    expect(screen.getByText('Пункты колеса:')).toBeInTheDocument();

    // Check for canvas element (spin wheel)
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('renders the textarea with default items', () => {
    render(<App />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Пункт 1\nПункт 2\nПункт 3\nПункт 4');
  });

  it('renders instructions correctly', () => {
    render(<App />);

    expect(screen.getByText('Инструкция:')).toBeInTheDocument();
    expect(screen.getByText('Каждая строка = новый пункт')).toBeInTheDocument();
    expect(
      screen.getByText('Добавьте % для веса: "Пункт1 30%"')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Вращайте мышью или кнопкой в центре')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Сила вращения зависит от движения мыши')
    ).toBeInTheDocument();
  });

  it('allows user to update wheel items', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByRole('textbox');

    // Clear and type new content
    await user.clear(textarea);
    await user.type(textarea, 'Приз 1 50%\nПриз 2 30%\nПриз 3 20%');

    expect(textarea).toHaveValue('Приз 1 50%\nПриз 2 30%\nПриз 3 20%');
  });

  it('has proper dark theme styling', () => {
    render(<App />);

    const mainContainer = screen.getByText('Колесо Фортуны').closest('div');
    expect(mainContainer?.parentElement?.parentElement).toHaveStyle({
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
    });
  });
});
