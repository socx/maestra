import { render, screen } from '@testing-library/react'
import WizardProgress from '../WizardProgress'

test('renders progress with correct step label', () => {
  render(<WizardProgress currentStep={2} />)
  expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
  expect(screen.getAllByText(/Select Category/).length).toBeGreaterThan(0)
})
