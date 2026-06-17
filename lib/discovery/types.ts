export interface RawSignal {
  type: string;
  source: string;
  content: string;
  url?: string;
  companyName: string;
  confidence?: number;
}

export interface DiscoveryProvider {
  name: string;
  fetchSignals(): Promise<RawSignal[]>;
}
