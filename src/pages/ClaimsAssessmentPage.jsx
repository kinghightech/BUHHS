import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DisclaimerBanner from '../components/DisclaimerBanner'
import ClaimsPage from '../components/ClaimsPage'

export default function ClaimsAssessmentPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ds-bg)' }}>
      <Navbar />
      <div style={{ padding: '1rem 1rem 0', maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
        <DisclaimerBanner type="disaster" position="top" />
      </div>
      <ClaimsPage embedded={true} />
      <div style={{ padding: '0 1rem 1rem', maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
        <DisclaimerBanner type="disaster" position="bottom" />
      </div>
      <Footer />
    </div>
  )
}
