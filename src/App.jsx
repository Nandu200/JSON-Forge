import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import JsonFormatter from './pages/JsonFormatter';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import HelpDocs from './components/HelpDocs';
import CookieConsent from './components/CookieConsent';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<JsonFormatter />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="help" element={<HelpDocs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
      <CookieConsent />
    </BrowserRouter>
  )
}

export default App
