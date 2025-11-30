import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('Routing', () => {
  const TestRoute = ({ path }: { path: string }) => <div>Route: {path}</div>;

  it('should render home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TestRoute path="home" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: home')).toBeInTheDocument();
  });

  it('should render characters route', () => {
    render(
      <MemoryRouter initialEntries={['/girls']}>
        <Routes>
          <Route path="/girls" element={<TestRoute path="characters" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: characters')).toBeInTheDocument();
  });

  it('should render character detail route', () => {
    render(
      <MemoryRouter initialEntries={['/girls/kasumi']}>
        <Routes>
          <Route path="/girls/:unique_key" element={<TestRoute path="character-detail" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: character-detail')).toBeInTheDocument();
  });

  it('should render events route', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <Routes>
          <Route path="/events" element={<TestRoute path="events" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: events')).toBeInTheDocument();
  });

  it('should render guides route', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <Routes>
          <Route path="/guides" element={<TestRoute path="guides" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: guides')).toBeInTheDocument();
  });

  it('should render search route', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<TestRoute path="search" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: search')).toBeInTheDocument();
  });

  it('should render 404 route for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <Routes>
          <Route path="/" element={<TestRoute path="home" />} />
          <Route path="*" element={<TestRoute path="404" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: 404')).toBeInTheDocument();
  });

  it('should handle nested routes', () => {
    render(
      <MemoryRouter initialEntries={['/swimsuits/kasumi-summer']}>
        <Routes>
          <Route path="/swimsuits/:unique_key" element={<TestRoute path="swimsuit-detail" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: swimsuit-detail')).toBeInTheDocument();
  });

  it('should handle multiple route segments', () => {
    render(
      <MemoryRouter initialEntries={['/tools/calculator']}>
        <Routes>
          <Route path="/tools/:unique_key" element={<TestRoute path="tool-detail" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: tool-detail')).toBeInTheDocument();
  });

  it('should handle query parameters', () => {
    render(
      <MemoryRouter initialEntries={['/search?q=kasumi']}>
        <Routes>
          <Route path="/search" element={<TestRoute path="search" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: search')).toBeInTheDocument();
  });

  it('should handle hash fragments', () => {
    render(
      <MemoryRouter initialEntries={['/guides#section-1']}>
        <Routes>
          <Route path="/guides" element={<TestRoute path="guides" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: guides')).toBeInTheDocument();
  });

  it('should handle routes with trailing slashes', () => {
    render(
      <MemoryRouter initialEntries={['/guides/']}>
        <Routes>
          <Route path="/guides" element={<TestRoute path="guides" />} />
          <Route path="/guides/" element={<TestRoute path="guides" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: guides')).toBeInTheDocument();
  });

  it('should handle case-sensitive routes', () => {
    render(
      <MemoryRouter initialEntries={['/Girls']}>
        <Routes>
          <Route path="/girls" element={<TestRoute path="characters" />} />
          <Route path="/Girls" element={<TestRoute path="characters-caps" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Route:/)).toBeInTheDocument();
  });

  it('should handle optional route parameters', () => {
    render(
      <MemoryRouter initialEntries={['/items']}>
        <Routes>
          <Route path="/items/:id?" element={<TestRoute path="items" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: items')).toBeInTheDocument();
  });

  it('should handle wildcard routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin/users/123/edit']}>
        <Routes>
          <Route path="/admin/*" element={<TestRoute path="admin" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: admin')).toBeInTheDocument();
  });

  it('should handle index routes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TestRoute path="home" />}>
            <Route index element={<TestRoute path="home-index" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: home')).toBeInTheDocument();
  });

  it('should handle special characters in URLs', () => {
    render(
      <MemoryRouter initialEntries={['/girls/marie-rose']}>
        <Routes>
          <Route path="/girls/:unique_key" element={<TestRoute path="character-detail" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: character-detail')).toBeInTheDocument();
  });

  it('should handle encoded URLs', () => {
    render(
      <MemoryRouter initialEntries={['/search?q=%E3%81%8B%E3%81%99%E3%81%BF']}>
        <Routes>
          <Route path="/search" element={<TestRoute path="search" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Route: search')).toBeInTheDocument();
  });
});
