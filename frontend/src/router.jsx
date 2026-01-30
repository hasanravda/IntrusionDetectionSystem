import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LiveMonitoring } from './components/LiveMonitoring';
import { Alerts } from './components/Alerts';
import { Analysis } from './components/Analysis';
import { History } from './components/History';
import { Settings } from './components/Settings';

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
        element: <LiveMonitoring />,
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
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
