import { render, screen } from '@testing-library/react'
import InProgressQuestion from '../InProgressQuestion'

const mockItem = {
  word: 'testword',
  definition: 'a definition',
  synonymns: [],
  usage: '',
  category: 'Test',
  'sub-category': 'Test',
  stage: 'General',
}

test('renders question with definition and input', () => {
  render(
    <InProgressQuestion
      item={mockItem}
      currentInput={''}
      setCurrentInput={() => {}}
      submitCurrent={() => {}}
      cancel={() => {}}
      speakWord={() => {}}
      isSpeakingAvailable={false}
    />,
  )

  expect(screen.getByText('Spell the word')).toBeInTheDocument()
  expect(screen.getByText('a definition')).toBeInTheDocument()
  expect(screen.getByLabelText('Your spelling')).toBeInTheDocument()
})
