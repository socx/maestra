import { render, screen } from '@testing-library/react'
import ExerciseReport from '../ExerciseReport'

const mockAttempts = [
  { item: { word: 'one', definition: '', synonymns: [], usage: '', category: 'C', 'sub-category': 'C', stage: 'General' }, attempt: 'one' },
  { item: { word: 'two', definition: '', synonymns: [], usage: '', category: 'C', 'sub-category': 'C', stage: 'General' }, attempt: 'tw' },
]

test('renders report and totals', () => {
  render(
    <ExerciseReport
      attempts={mockAttempts}
      correctCount={1}
      resetToWizard={() => {}}
      speakWord={() => {}}
      isSpeakingAvailable={false}
    />,
  )

  expect(screen.getByText(/Out of a total of 2 questions/)).toBeInTheDocument()
  const ones = screen.getAllByText('one')
  expect(ones.length).toBeGreaterThanOrEqual(1)
  const twos = screen.getAllByText('two')
  expect(twos.length).toBeGreaterThanOrEqual(1)
})
