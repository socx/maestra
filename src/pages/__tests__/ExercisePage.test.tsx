import { render, screen, fireEvent } from '@testing-library/react'
import { act, cleanup } from 'react-dom/test-utils'
import ExercisePage from '../ExercisePage'
import { vi, afterEach, describe, it, expect } from 'vitest'

describe('ExercisePage auto-speak behaviour', () => {
  afterEach(() => {
    try {
      // restore timers and clean DOM
      vi.useRealTimers()
      cleanup()
      // remove globals we set
      // @ts-ignore
      delete (global as any).SpeechSynthesisUtterance
      // @ts-ignore
      delete (window as any).speechSynthesis
      localStorage.clear()
      vi.resetAllMocks()
    } catch (e) {
      // ignore
    }
  })

  it('speaks when autoSpeak is enabled', async () => {
    vi.useFakeTimers()

    const speakMock = vi.fn()
    const cancelMock = vi.fn()
    // @ts-ignore
    window.speechSynthesis = { speak: speakMock, cancel: cancelMock }
    // minimal utterance constructor for the environment
    // @ts-ignore
    global.SpeechSynthesisUtterance = function (text: any) {
      this.text = text
    }

    render(<ExercisePage />)

    const autoSpeakCheckbox = screen.getByLabelText(/Auto-speak/i)
    expect(autoSpeakCheckbox).toBeChecked()

    // advance through wizard to Start Exercise
    for (let i = 0; i < 4; i++) {
      const next = screen.getByRole('button', { name: /Next/i })
      fireEvent.click(next)
    }

    const start = screen.getByRole('button', { name: /Start Exercise/i })
    fireEvent.click(start)

    // speech scheduled after 1s
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(speakMock).toHaveBeenCalled()
  })

  it('does not speak when autoSpeak is disabled and persists preference', async () => {
    vi.useFakeTimers()

    const speakMock = vi.fn()
    const cancelMock = vi.fn()
    // @ts-ignore
    window.speechSynthesis = { speak: speakMock, cancel: cancelMock }
    // @ts-ignore
    global.SpeechSynthesisUtterance = function (text: any) {
      this.text = text
    }

    render(<ExercisePage />)

    const autoSpeakCheckbox = screen.getByLabelText(/Auto-speak/i)
    // toggle off
    fireEvent.click(autoSpeakCheckbox)
    expect(autoSpeakCheckbox).not.toBeChecked()
    expect(localStorage.getItem('exercise:autoSpeak')).toBe('0')

    // advance through wizard
    for (let i = 0; i < 4; i++) {
      const next = screen.getByRole('button', { name: /Next/i })
      fireEvent.click(next)
    }

    const start = screen.getByRole('button', { name: /Start Exercise/i })
    fireEvent.click(start)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(speakMock).not.toHaveBeenCalled()
    expect(localStorage.getItem('exercise:autoSpeak')).toBe('0')
  })
})
