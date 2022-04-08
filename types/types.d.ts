export interface Root {
  id: number
  Day: Date
  Countries: Country[]
}

export interface Country {
  country: string
  toplist: Song[]
}

export interface Song {
  artist: string,
  song: string,
  position: number
  streams: number
}
