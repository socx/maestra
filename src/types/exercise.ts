export type NormalisedWord = {
  word: string
  definition: string
  synonymns: string[]
  usage: string
  category: string
  'sub-category': string
  stage: 'KS3' | 'KS4' | 'General' | string
}

export type Attempt = {
  item: NormalisedWord
  attempt: string
}
