import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Wrap with MemoryRouter since Home uses <Link>
const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe('Home page', () => {
  it('renders the hero title with "Election Intelligence"', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Election Intelligence/i)).toBeInTheDocument();
  });

  it('renders the "Ask the AI Guide" CTA link pointing to /chat', () => {
    renderHome();
    const link = screen.getByRole('link', { name: /open ai election guide chat/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/chat');
  });

  it('renders the "View Candidates" link pointing to /candidates', () => {
    renderHome();
    const link = screen.getByRole('link', { name: /browse candidate leaderboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/candidates');
  });

  it('renders all 4 feature cards', () => {
    renderHome();
    expect(screen.getByText(/Candidate Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Video Proof Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/AI RAG Chatbot/i)).toBeInTheDocument();
    expect(screen.getByText(/Smart Notifications/i)).toBeInTheDocument();
  });

  it('renders the upcoming election badge', () => {
    renderHome();
    expect(screen.getByText(/Upcoming Elections/i)).toBeInTheDocument();
  });

  it('renders the "Smart Democracy Platform" section heading', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { name: /Smart Democracy Platform/i })
    ).toBeInTheDocument();
  });

  it('renders feature card descriptions', () => {
    renderHome();
    expect(screen.getByText(/Gemini/i)).toBeInTheDocument();
    expect(screen.getByText(/moderated seamlessly by AI/i)).toBeInTheDocument();
  });
});
