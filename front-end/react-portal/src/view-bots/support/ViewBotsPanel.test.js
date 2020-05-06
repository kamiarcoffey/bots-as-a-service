import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewBotsPanel from './ViewBotsPanel';

const testBotName = "test-bot";
const testPayload = {
  name: testBotName,
  auth: {
      "client_id": "id",
      "client_secret": "sekret",
      "password": "test",
      "user_agent": "test",
      "username": "test"
  },
  services: [
    {
      language: "english",
      invocation: {
        "symbol": "!",
        "term": "fandom",
        "query": "[[ ]]"
      },
      params: {
        "url": "https://naruto.fandom.com/"
      },
      service_name: "fandom"
    },
    {
      language: "english",
      invocation: {
        "symbol": "!",
        "term": "translate",
        "query": "[[ ]]"
      },
      params: {
        "default_language": "english"
      },
      service_name: "translate"
    }
  ],
  status: {
    online: false
  },
  subreddits: [
    "botsasaservice_test"
  ],
  version_info: {
    description: "A bot to be a test account for our bot platform",
    name: "BaaS testing bot",
    version: "v1.0"
  }
}



test('renders expected elements default unexpanded', () => {
  const payload = testPayload;
  const { container } = render(<ViewBotsPanel payload={payload} />);

  const botHeaderPanel = screen.getAllByText(testBotName)[0];

  expect(botHeaderPanel).toBeVisible();

  // Bottom row buttons are not visible when unexpanded
  expect(screen.getByRole('button', {name: 'Start'})).not.toBeVisible();
  expect(screen.getByRole('button', {name: 'Disable'})).not.toBeVisible();
  expect(screen.getByRole('button', {name: 'Delete'})).not.toBeVisible();
});

test('renders expected elements expanded', () => {
  const payload = testPayload;
  const { container } = render(<ViewBotsPanel payload={payload} />);
  const botHeaderPanel = screen.getAllByText(testBotName)[0]

  fireEvent.click(botHeaderPanel);

  // Bottom row buttons are not visible when unexpanded
  expect(screen.getByRole('button', {name: 'Start'})).toBeVisible();
  expect(screen.getByRole('button', {name: 'Disable'})).toBeVisible();
  expect(screen.getByRole('button', {name: 'Delete'})).toBeVisible();
});
