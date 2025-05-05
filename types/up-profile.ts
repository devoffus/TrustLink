export interface UPData {
  address: string
  name?: string
  profileImage?: string
  bio?: string
  links?: {
    title: string
    url: string
  }[]
  tags?: string[]
  isDevMode?: boolean
}
