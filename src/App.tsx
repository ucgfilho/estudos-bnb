import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewScreen } from './screens/OverviewScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { StudyNowScreen } from './screens/StudyNowScreen';
import { QuestionsScreen } from './screens/QuestionsScreen';
import { ErrorNotebookScreen } from './screens/ErrorNotebookScreen';
import { ReviewsScreen } from './screens/ReviewsScreen';
import { MockExamsScreen } from './screens/MockExamsScreen';
import { DisciplinesScreen } from './screens/DisciplinesScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ensureSeed } from './db/db';
import { LoadingState } from './components/ui/Display';
import { ToastProvider } from './components/ui/Toast';

export function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    ensureSeed()
      .then(() => setInitialized(true))
      .catch((err) => {
        console.error('Falha ao inicializar o banco de dados:', err);
        setInitialized(true);
      });
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-dvh items-center justify-center bg-canvas text-fg">
        <LoadingState label="Inicializando ambiente de estudos BNB..." />
      </div>
    );
  }

  return (
    <ToastProvider>
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewScreen />} />
          <Route path="/calendario" element={<CalendarScreen />} />
          <Route path="/cronograma" element={<ScheduleScreen />} />
          <Route path="/estudar-agora" element={<StudyNowScreen />} />
          <Route path="/questoes" element={<QuestionsScreen />} />
          <Route path="/erros" element={<ErrorNotebookScreen />} />
          <Route path="/revisoes" element={<ReviewsScreen />} />
          <Route path="/simulados" element={<MockExamsScreen />} />
          <Route path="/disciplinas" element={<DisciplinesScreen />} />
          <Route path="/relatorios" element={<ReportsScreen />} />
          <Route path="/configuracoes" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
    </ToastProvider>
  );
}

export default App;
