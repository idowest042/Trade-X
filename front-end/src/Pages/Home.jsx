import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CryptoCarousel from '../components/CryptoCarousel'
import HowItWorks from '../components/HowItWorks'
import TrustSecurity from '../components/TrustSecurity'
import InvestmentPlans from '../components/InvestmentPlans'
import WhyChooseTradeX from '../components/WhyChooseTradeX'
import MediaTrust from '../components/MediaTrust'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import Testimonials from '../components/Testimonials'
import Services from '../components/Services'
import ChatWidget from '../components/ChatWidget'
const Home = () => {
  return (
    <div>
      <ChatWidget />
        <Navbar />
        <Hero />
        <CryptoCarousel />
        <HowItWorks />
        <Services />
        <TrustSecurity />
        <InvestmentPlans />
        <WhyChooseTradeX />
        <MediaTrust />
        <Testimonials />
        <FAQ />
        <Footer />
    </div>
  )
}

export default Home