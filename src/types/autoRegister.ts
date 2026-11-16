
export interface GmailStatus {
 
  available: boolean
  connected: boolean
  email: string | null
  status: "ACTIVE" | "EXPIRED" | null
  lastCheckedAt: string | null
}

export interface GmailScanResult {
  read: number
  added: number
}

export interface IngestTokenStatus {
  active: boolean
  createdAt: string | null
  lastUsedAt: string | null
}

export interface NewIngestToken {
  token: string
  createdAt: string
}
