import register from 'preact-custom-element';
import Widget from './App';

register(
  Widget,
  'donations-widget',
  [
    'start-date',
    'total-contribution',
    'total-contributors',
    'currency',
    'contribution-options',
    'lang',
    'recurrent',
  ],
  { shadow: false }
);
