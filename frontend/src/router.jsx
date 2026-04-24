import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LiveMonitor } from './components/Dashboard/LiveMonitor';
import { PacketMonitor } from './components/Dashboard/PacketMonitor';
import { History } from './components/History';
import { HowItWorks } from './components/HowItWorks';

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
        path: 'packets',
        element: <PacketMonitor />,
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
