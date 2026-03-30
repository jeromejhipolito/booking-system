import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import ServicesPage from '@/app/(public)/services/page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock demo mode as enabled so services load from DEMO_SERVICES
vi.mock('@/lib/demo-data', async () => {
  const actual = await vi.importActual('@/lib/demo-data');
  return { ...actual, DEMO_MODE: true };
});

// Mock api client to prevent real API calls
vi.mock('@/lib/api-client', () => ({
  api: { getServices: vi.fn().mockResolvedValue({ data: [] }) },
  apiClient: vi.fn().mockResolvedValue({ data: [] }),
}));

describe('Services Page', () => {
  it('renders heading', async () => {
    render(<ServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Browse Services')).toBeInTheDocument();
    });
  });

  it('shows service cards after loading', async () => {
    render(<ServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Balayage Highlights')).toBeInTheDocument();
    });
    expect(screen.getByText('Hilot Traditional Massage')).toBeInTheDocument();
    expect(screen.getByText('Aircon Cleaning & Check')).toBeInTheDocument();
  });

  it('search filters services', async () => {
    render(<ServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Balayage Highlights')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search services, providers...');
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Hilot' } });
    });

    expect(screen.getByText('Hilot Traditional Massage')).toBeInTheDocument();
    expect(screen.queryByText('Balayage Highlights')).not.toBeInTheDocument();
  });

  it('category filter works', async () => {
    render(<ServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Balayage Highlights')).toBeInTheDocument();
    });

    const fitnessPill = screen.getByRole('button', { name: /Fitness/i });
    act(() => {
      fireEvent.click(fitnessPill);
    });

    expect(screen.getByText('Personal Training')).toBeInTheDocument();
    expect(screen.queryByText('Balayage Highlights')).not.toBeInTheDocument();
  });

  it('empty state shown when no match', async () => {
    render(<ServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Balayage Highlights')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search services, providers...');
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
    });

    expect(screen.getByText('No services found')).toBeInTheDocument();
  });

  it('prices display in PHP (₱)', async () => {
    render(<ServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Balayage Highlights')).toBeInTheDocument();
    });

    const page = document.body.innerHTML;
    expect(page).toContain('₱');
    expect(page).not.toContain('$');
  });
});
