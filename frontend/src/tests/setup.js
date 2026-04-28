// Global test setup for Vitest + React Testing Library
import '@testing-library/jest-dom';

// jsdom doesn't implement scrollIntoView — mock it globally
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock Firebase entirely — tests don't need real cloud credentials
vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  googleProvider: {},
  db: {},
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  storage: {},
}));

// Mock react-router-dom's Link so Home.jsx can render without a Router in simple tests
// (tests that need routing will wrap with MemoryRouter themselves)
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Keep the real MemoryRouter available; just ensure Link renders an <a>
  };
});
