import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the api module before importing Chat
vi.mock('../lib/api', () => ({
  chatApi: {
    sendMessage: vi.fn(),
  },
}));

import Chat from '../pages/Chat';
import { chatApi } from '../lib/api';

const renderChat = () => render(<Chat />);

describe('Chat page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial bot greeting message', () => {
    renderChat();
    expect(screen.getByText(/AI Election Guide/i)).toBeInTheDocument();
  });

  it('renders the chat input field', () => {
    renderChat();
    expect(
      screen.getByPlaceholderText(/Ask about candidates/i)
    ).toBeInTheDocument();
  });

  it('renders the send button', () => {
    renderChat();
    // The send button contains an SVG icon; find by role
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('does NOT call the API when input is empty', async () => {
    renderChat();
    // Find the send button specifically (it's next to the input)
    const input = screen.getByPlaceholderText(/Ask about candidates/i);
    // Press Enter on empty input — handleSend returns early if !text.trim()
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(chatApi.sendMessage).not.toHaveBeenCalled();
  });

  it('shows user message in chat after sending', async () => {
    chatApi.sendMessage.mockResolvedValueOnce({ answer: 'Alice has a score of 92%.' });
    renderChat();

    const input = screen.getByPlaceholderText(/Ask about candidates/i);
    await userEvent.type(input, 'Tell me about Alice');
    fireEvent.keyDown(input, { key: 'Enter' });

    // Message text may be split across elements — use getAllByText or a custom matcher
    await waitFor(() => {
      expect(
        screen.getAllByText((content) => content.includes('Tell me about Alice')).length
      ).toBeGreaterThan(0);
    });
  });

  it('renders bot response after successful API call', async () => {
    chatApi.sendMessage.mockResolvedValueOnce({ answer: 'Alice has a score of 92%.' });
    renderChat();

    const input = screen.getByPlaceholderText(/Ask about candidates/i);
    await userEvent.type(input, 'Tell me about Alice');
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Alice has a score of 92%/i)).toBeInTheDocument();
    });
  });

  it('renders error message when API call fails', async () => {
    chatApi.sendMessage.mockRejectedValueOnce(new Error('Network error'));
    renderChat();

    const input = screen.getByPlaceholderText(/Ask about candidates/i);
    await userEvent.type(input, 'Failing query');
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('clears the input after sending', async () => {
    chatApi.sendMessage.mockResolvedValueOnce({ answer: 'Response' });
    renderChat();

    const input = screen.getByPlaceholderText(/Ask about candidates/i);
    await userEvent.type(input, 'My question');
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('renders suggestion buttons', () => {
    renderChat();
    expect(screen.getByText(/top candidates in my ward/i)).toBeInTheDocument();
    expect(screen.getByText(/voter registration/i)).toBeInTheDocument();
  });

  it('sends suggestion text when a suggestion button is clicked', async () => {
    chatApi.sendMessage.mockResolvedValueOnce({ answer: 'Here are the top candidates.' });
    renderChat();

    const suggestionBtn = screen.getByText(/top candidates in my ward/i);
    await userEvent.click(suggestionBtn);

    expect(chatApi.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining('top candidates')
    );
  });
});
