import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/js/ConsoleTable';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
