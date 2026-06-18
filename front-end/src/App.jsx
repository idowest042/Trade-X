import React from 'react'
import { Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"

// Public pages
import Home from "./Pages/Home"
import AboutUs from './Pages/AboutUs'
import WhatWeDo from './Pages/WhatWeDo'
import OurApproach from './Pages/OurApproach'
import HowItWorks from './Pages/HowItWorks'
import Pricing from './Pages/Pricing'
import Learn from './Pages/Learn'
import FAQPage from './Pages/FAQPage'
import TermsConditions from './Pages/TermsConditions'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import KycAmlPolicy from './Pages/KycAmlPolicy'
import RiskDisclosure from './Pages/RiskDisclosure'
import KycPage from "./Pages/dashboard/KycPage";
import DepositPage from "./Pages/dashboard/DepositPage";
import WithdrawPage from "./Pages/dashboard/WithdrawPage";
import PlansPage from "./Pages/dashboard/PlansPage";
import MyInvestments  from "./Pages/dashboard/MyInvestments";
import TransactionsPage from "./Pages/dashboard/TransactionsPage";
import SwapPage     from "./Pages/dashboard/SwapPage";
import TransferPage from "./Pages/dashboard/TransferPage";
import ReferralPage from "./Pages/dashboard/ReferralPage";
import TradePage        from './Pages/dashboard/TradePage'
import Settingpage     from './Pages/dashboard/Settingpage'


// Auth pages
import Login from './Pages/Login'
import Register from './Pages/Register'

// Dashboard
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './Pages/dashboard/DashboardHome'

// Dashboard placeholder pages (build these out later)
import PlaceholderPage from './Pages/dashboard/PlaceholderPage'

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif" },
        }}
      />

      <Routes>
        {/* ── Public routes ────────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/our-approach" element={<OurApproach />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/kyc" element={<KycAmlPolicy />} />
        <Route path="/risk" element={<RiskDisclosure />} />

        {/* ── Auth routes ──────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected dashboard routes ───────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="kyc" element={<KycPage />} />
         <Route path="deposit" element={<DepositPage />} />
         <Route path="withdraw" element={<WithdrawPage />} />
         <Route path="plans" element={<PlansPage />} />
         <Route path="investments"  element={<MyInvestments />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="swap"     element={<SwapPage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="referral" element={<ReferralPage />} />
         <Route path="trade"       element={<TradePage />} />
          <Route path="settings" element={<Settingpage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App