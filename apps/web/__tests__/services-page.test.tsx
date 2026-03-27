import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServicesPage from '@/app/(public)/services/page';

// Mock next/link to render a simple anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Services Page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders as a client component with loading skeleton initially', () => {
    render(<ServicesPage />);

    // During loading, we should see "Loading..." text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows service cards after loading completes', async () => {
    render(<ServicesPage />);

    // Advance timer past the 500ms loading delay, wrapped in act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // Should show the services now
    expect(screen.getByText('Haircut & Styling')).toBeInTheDocument();
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByText('House Cleaning')).toBeInTheDocument();
  });

  it('search input filters services — typing "Haircut" shows only matching services', async () => {
    render(<ServicesPage />);

    // Advance past loading and wrap in act to flush state updates
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    const searchInput = screen.getByPlaceholderText('Search services, providers...');

    // Use fireEvent.change wrapped in act for state update
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Haircut' } });
    });

    // Haircut & Styling should be visible
    expect(screen.getByText('Haircut & Styling')).toBeInTheDocument();

    // Dog Grooming also matches because its description contains "haircut"
    expect(screen.getByText('Dog Grooming')).toBeInTheDocument();

    // Other services that don't mention "haircut" should NOT be visible
    expect(screen.queryByText('Deep Tissue Massage')).not.toBeInTheDocument();
    expect(screen.queryByText('House Cleaning')).not.toBeInTheDocument();
    expect(screen.queryByText('Yoga Class')).not.toBeInTheDocument();

    // Count reflects matched services (name + description search)
    expect(screen.getByText('2 services found')).toBeInTheDocument();
  });

  it('category pill click changes selectedCategory and filters results', async () => {
    render(<ServicesPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // Click on the "Fitness" category pill
    const fitnessPill = screen.getByRole('button', { name: 'Fitness' });
    act(() => {
      fireEvent.click(fitnessPill);
    });

    // Fitness services should be visible
    expect(screen.getByText('Personal Training Session')).toBeInTheDocument();
    expect(screen.getByText('Yoga Class')).toBeInTheDocument();

    // Non-fitness services should NOT be visible
    expect(screen.queryByText('Haircut & Styling')).not.toBeInTheDocument();
    expect(screen.queryByText('House Cleaning')).not.toBeInTheDocument();

    // Count should reflect filtered results
    expect(screen.getByText('2 services found')).toBeInTheDocument();
  });

  it('empty state shown when no services match search', async () => {
    render(<ServicesPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    const searchInput = screen.getByPlaceholderText('Search services, providers...');
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
    });

    // Empty state message
    expect(screen.getByText('No services found')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Try adjusting your search or filter to find what you/,
      ),
    ).toBeInTheDocument();

    // Clear Filters button should be present
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('loading skeleton shown initially before data loads', () => {
    const { container } = render(<ServicesPage />);

    // Skeleton cards have the animate-pulse class
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    // We render 6 skeleton cards
    expect(skeletons.length).toBe(6);
  });
});
