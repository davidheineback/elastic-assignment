export interface Root {
  id: number
  date: string
  countries: Country[]
}

export interface Country {
  country: string
  code: Codes.global | Codes.us | Codes.se | Codes.gb | Codes.br | Codes.au
  toplist: Song[]
}

enum Codes {
  global = 'global',
  se = 'se',
  us = 'us',
  gb = 'gb',
  br = 'br',
  au ='au'
  
}

export interface Song {
  artist: string,
  song: string,
  position: number
  streams: number
}
