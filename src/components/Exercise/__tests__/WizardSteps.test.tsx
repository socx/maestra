import { render, screen } from '@testing-library/react'
import WizardSteps from '../WizardSteps'

const noop = () => {}

test('step 1 shows stage options', () => {
  render(
    <WizardSteps
      step={1}
      selectedStage={'General'}
      setSelectedStage={() => {}}
      categoriesForStage={['A', 'B']}
      selectedCategory={'A'}
      setSelectedCategory={() => {}}
      numberOfWords={5}
      setNumberOfWords={() => {}}
      maxWordsInCategory={5}
      maxTimeSeconds={15}
      setMaxTimeSeconds={() => {}}
      startExercise={noop}
    />,
  )

  expect(screen.getByText('Step 1: Select Stage')).toBeInTheDocument()
  const radios = screen.getAllByRole('radio')
  expect(radios.length).toBe(4)
})
