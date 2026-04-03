import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/modules/olympiad/components/ProtectedRoute';

// Pages
import NotFound from '@/pages/NotFound';
import ClientTestQuiz from './modules/olympiad/components/ClientTestQuiz';
import ClientTestResult from './modules/olympiad/components/ClientTestResult';

// Auth
import Login from '@/modules/olympiad/components/Login';
import Register from '@/modules/olympiad/components/Register';
import Verify from '@/modules/olympiad/components/verify'; // ← katta harf bilan

// Protected
import OlympiadDashboard from '@/modules/olympiad/components/OlympiadDashboard';
import ProfilePage from '@/modules/olympiad/components/ProfilePage';
import QuizInterface from '@/modules/olympiad/components/QuizInterface';
import OlympiadResult from '@/modules/olympiad/components/OlympiadResult';

// Public
import LandingPage from '@/modules/olympiad/components/LandingPage';
import OlympiadList from '@/modules/olympiad/components/OlympiadList';
import Registration from '@/modules/olympiad/components/Registration';
import About from '@/modules/olympiad/components/About';
import Rules from '@/modules/olympiad/components/Rules';
import BoardMembers from '@/modules/olympiad/components/BoardMembers';
import Contact from '@/modules/olympiad/components/Contact';
import Gallery from '@/modules/olympiad/components/Gallery';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 30_000,
		},
	},
});

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<TooltipProvider>
				<Toaster />
				<Sonner />

				<BrowserRouter>
					<Routes>
						{/* ── Home ── */}
						<Route path='/' element={<LandingPage />} />

						{/* ── Public ── */}
						<Route path='/about' element={<About />} />
						<Route path='/board-members' element={<BoardMembers />} />
						<Route path='/rules' element={<Rules />} />
						<Route path='/gallery' element={<Gallery />} />
						<Route path='/contact' element={<Contact />} />
						<Route path='/olympiads' element={<OlympiadList />} />
						<Route path='/register-olympiad' element={<Registration />} />

						{/* ── Tests (public — auth kerak emas ko'rish uchun, submit uchun kerak) ── */}
						<Route path='/tests/:id' element={<ClientTestQuiz />} />
						<Route path='/tests/:id/result' element={<ClientTestResult />} />

						{/* ── Auth ── */}
						<Route path='/login' element={<Login />} />
						<Route path='/register' element={<Register />} />
						<Route path='/verify' element={<Verify />} />

						{/* ── Protected ── */}
						<Route element={<ProtectedRoute />}>
							<Route path='/dashboard' element={<OlympiadDashboard />} />
							<Route path='/profile' element={<ProfilePage />} />
							<Route path='/quiz/:id' element={<QuizInterface />} />
							<Route path='/olympiad/:id/result' element={<OlympiadResult />} />
						</Route>

						{/* ── Fallback ── */}
						<Route path='*' element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
