import { render, screen, fireEvent } from '@testing-library/react'
import { act, cleanup } from 'react-dom/test-utils'
import { vi, afterEach, describe, it, expect } from 'vitest'

// Mock the vocab data to a small deterministic set so tests can assert exact words
vi.mock('../services/data/subject-vocab-normalised.json', () => ({
  default: [
    {
      word: 'apple',
      definition: 'A fruit',
      synonymns: [],
      usage: '',
      category: 'Fruits',
      'sub-category': '',
      stage: 'General',
    },
    {
      word: 'banana',
      definition: 'A yellow fruit',
      synonymns: [],
      usage: '',
      category: 'Fruits',
      'sub-category': '',
      stage: 'General',
    },
  ],
}))

import ExercisePage from '../ExercisePage'

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

    // make shuffle deterministic
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const speakMock = vi.fn()
    const cancelMock = vi.fn()
    // @ts-ignore
    window.speechSynthesis = { speak: speakMock, cancel: cancelMock }
    // richer utterance constructor capturing properties set by speakWord
    // @ts-ignore
    global.SpeechSynthesisUtterance = function (text: any) {
      this.text = text
      this.rate = 1
      this.pitch = 1
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
    const firstUtterance = (speakMock.mock.calls[0] && speakMock.mock.calls[0][0])
    expect(firstUtterance).toBeDefined()
    // utterance created with the word text
    expect(firstUtterance.text).toBe('apple')
    // speakWord sets rate and pitch
    expect(firstUtterance.rate).toBeCloseTo(0.95)
    expect(firstUtterance.pitch).toBe(1)
  })

  it('does not speak when autoSpeak is disabled and persists preference', async () => {
    vi.useFakeTimers()

    // make shuffle deterministic
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const speakMock = vi.fn()
    const cancelMock = vi.fn()
    // @ts-ignore
    window.speechSynthesis = { speak: speakMock, cancel: cancelMock }
    // @ts-ignore
    global.SpeechSynthesisUtterance = function (text: any) {
      this.text = text
      this.rate = 1
      this.pitch = 1
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

  it('cancels ongoing speech when moving to the next question', async () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const speakMock = vi.fn()
    const cancelMock = vi.fn()
    // @ts-ignore
    window.speechSynthesis = { speak: speakMock, cancel: cancelMock }
    // @ts-ignore
    global.SpeechSynthesisUtterance = function (text: any) {
      this.text = text
      this.rate = 1
      this.pitch = 1
    }

    render(<ExercisePage />)

    // advance through wizard
    for (let i = 0; i < 4; i++) {
      const next = screen.getByRole('button', { name: /Next/i })
      fireEvent.click(next)
    }

    const start = screen.getByRole('button', { name: /Start Exercise/i })
    fireEvent.click(start)

    // first speech
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(speakMock).toHaveBeenCalledTimes(1)

    // submit to move to next question, this should schedule the next speak
    const submit = screen.getByRole('button', { name: /Submit/i })
    fireEvent.click(submit)

    // when speaking the next word, speakWord will call cancel()
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(cancelMock).toHaveBeenCalled()
    expect(speakMock).toHaveBeenCalledTimes(2)
  })
})
