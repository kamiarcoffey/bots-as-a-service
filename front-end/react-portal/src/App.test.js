import React from 'react';
import ReactDOM from 'react-dom';
import { render, act } from '@testing-library/react';
import App from './App';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

test('renders properly', async () => {
  fetch.mockResponse(JSON.stringify(
    [{
        "auth": {
            "client_id": null,
            "client_secret": null,
            "password": "test",
            "user_agent": "baas/1.0",
            "username": "test"
        },
        "name": "totally-a-human",
        "services": [
            {
                "invocation": {
                    "query": "{{ }}",
                    "symbol": "!",
                    "term": "fandom"
                },
                "language": "english",
                "params": {
                    "url": "https://cookie.fandom.com/"
                },
                "service_name": "fandom"
            }
        ],
        "status": {
            "online": false
        },
        "subreddits": [
            "botsasaservice_test"
        ],
        "version_info": {
            "description": "A cool bot!",
            "name": "totally-a-human",
            "version": "1.0"
        }
    }]
  ));

  await act(async () => {
    ReactDOM.render(<App />, container);
  });
});
