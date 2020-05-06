import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TopNavigationBar from './TopNavigationBar';

test('expected menu buttons rendered', () => {
  const { getByText } = render(<TopNavigationBar />);

  const botsButton = getByText('bots');
  const createButton = getByText('create');

  expect(botsButton).toBeInTheDocument();
  expect(createButton).toBeInTheDocument();
});

test('bots button deactivated on own page', () => {
  delete window.location;
  window.location = {
    hash: '#/bots'
  };

  render(<TopNavigationBar />);
  const botsButton = screen.getByRole('link', {name: 'bots'});
  expect(botsButton).toHaveAttribute('aria-disabled', 'true');
});


test('create button deactivated on own page', () => {
  delete window.location;
  window.location = {
    hash: '#/create'
  };

  render(<TopNavigationBar />);
  const createButton = screen.getByRole('link', {name: 'create'});
  expect(createButton).toHaveAttribute('aria-disabled', 'true');
});

test('clicking buttons changes window location', () => {
  render(<TopNavigationBar />);
  const botsButton = screen.getByRole('link', {name: 'bots'});
  const createButton = screen.getByRole('link', {name: 'create'});

  fireEvent.click(createButton);
  expect(window.location.hash).toBe('#/create')
});
