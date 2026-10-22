import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RoadmapsPage from './pages/RoadmapsPage';
import RoadmapDetailPage from './pages/RoadmapDetailPage';
import SessionsPage from './pages/SessionsPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import AiInsightsPage from './pages/AiInsightsPage';

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="/roadmaps" element={<ProtectedLayout><RoadmapsPage /></ProtectedLayout>} />
      <Route path="/roadmaps/:roadmapId" element={<ProtectedLayout><RoadmapDetailPage /></ProtectedLayout>} />
      <Route path="/sessions" element={<ProtectedLayout><SessionsPage /></ProtectedLayout>} />
      <Route path="/goals" element={<ProtectedLayout><GoalsPage /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>} />
      <Route path="/achievements" element={<ProtectedLayout><AchievementsPage /></ProtectedLayout>} />
      <Route path="/ai-insights" element={<ProtectedLayout><AiInsightsPage /></ProtectedLayout>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
