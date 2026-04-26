import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useParams, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Chat from "./pages/Chat";
import Practice from "./pages/Practice";
import TeacherPicker from "./pages/TeacherPicker";
import { Suspense, useEffect } from "react";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";
import { drillById } from "@/lib/drillModes";
import { useActiveTeacher } from "@/lib/teachers";

const TitleSync = () => {
  useStudent();
  useEffect(() => {
    document.title = `המורה של ${STUDENT.name} ${themeTokens().emoji}`;
  });
  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<TeacherPicker />} />
      <Route path="/chat" element={<RequireTeacher><Chat /></RequireTeacher>} />
      <Route path="/practice" element={<RequireTeacher><Practice /></RequireTeacher>} />
      <Route path="/practice/vertical" element={<Navigate to="/practice/vertical-multiplication" replace />} />
      <Route path="/practice/:drillId" element={<RequireTeacher><DrillRoute /></RequireTeacher>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const RequireTeacher = ({ children }) => {
  const teacher = useActiveTeacher();
  if (!teacher) return <Navigate to="/" replace />;
  return children;
};

const DrillRoute = () => {
  const { drillId } = useParams();
  const drill = drillById(drillId);
  if (!drill) return <PageNotFound />;
  const Component = drill.component;
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
      <Component />
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TitleSync />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App