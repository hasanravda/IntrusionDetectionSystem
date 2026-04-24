import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Alerts } from './components/Alerts';
import { Analysis } from './components/Analysis';
import { Dashboard } from './components/Dashboard';
import { LiveMonitor } from './components/Dashboard/LiveMonitor';
import { History } from './components/History';
import { HowItWorks } from './components/HowItWorks';
import { Layout } from './components/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'monitoring',
        element: <LiveMonitor />,
      },
      {
        path: 'alerts',
        element: <Alerts />,
      },
      {
        path: 'analysis',
        element: <Analysis />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'how-it-works',
        element: <HowItWorks />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
