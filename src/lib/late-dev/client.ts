import Late from "@getlatedev/node"

let _lateClient: Late | null = null

export function getLateClient(): Late {
  if (_lateClient) return _lateClient

  const apiKey = process.env.LATE_API_KEY

  if (!apiKey && process.env.NODE_ENV !== "test") {
    throw new Error(
      "LATE_API_KEY environment variable is required. Get it from Late.dev Dashboard -> API Keys."
    )
  }

  _lateClient = new Late({ apiKey: apiKey ?? "" })
  return _lateClient
}
