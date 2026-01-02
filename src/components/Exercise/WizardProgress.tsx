import { useMemo } from 'react'

export default function WizardProgress({ currentStep }: { currentStep: number }) {
  const steps = useMemo(
    () => [
      { id: 1, name: 'Select Stage' },
      { id: 2, name: 'Select Category' },
      { id: 3, name: 'Select Number of Words' },
      { id: 4, name: 'Set maximum time per word' },
      { id: 5, name: 'Start Exercise' },
    ],
    [],
  )

  const percent = ((Math.max(1, Math.min(5, currentStep)) - 1) / 4) * 100

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Step {currentStep} of 5</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{steps[currentStep - 1]?.name}</p>
      </div>

      <div className="mt-3" aria-hidden="true">
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="mt-4 space-y-2" aria-label="Progress">
        {steps.map((step) => {
          const status = step.id < currentStep ? 'complete' : step.id === currentStep ? 'current' : 'upcoming'
          return (
            <li key={step.id} className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span
                  className={
                    status === 'complete'
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white'
                      : status === 'current'
                        ? 'flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-600 text-xs font-semibold text-indigo-600'
                        : 'flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300'
                  }
                >
                  {step.id}
                </span>
                <span
                  className={
                    status === 'current'
                      ? 'text-sm font-semibold text-gray-900 dark:text-gray-100'
                      : 'text-sm text-gray-700 dark:text-gray-200'
                  }
                >
                  {step.name}
                </span>
              </span>
              <span
                className={
                  status === 'complete'
                    ? 'text-xs font-medium text-indigo-600'
                    : status === 'current'
                      ? 'text-xs font-medium text-gray-900 dark:text-gray-100'
                      : 'text-xs text-gray-500 dark:text-gray-400'
                }
              >
                {status === 'complete' ? 'Done' : status === 'current' ? 'In progress' : 'Upcoming'}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
