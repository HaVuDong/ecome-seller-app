import React from 'react';
import App from './app';

// Expo Router will treat this as the root route ("/").
// We reuse the existing `App` component (react-navigation stack) so
// deep links like `ecomeseller://` have a matching page and don't show
// the "Unmatched Route" screen.
export default function Index() {
  return <App />;
}
