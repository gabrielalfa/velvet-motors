export interface Proposal {
  id: number;
  proposalType: 'sell' | 'vehicle';
  status: string;
  source: string;
  vehicleId?: number;
  vehicleName?: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  mileage: number;
  vin: string;
  exteriorColor: string;
  interiorColor: string;
  history: string;
  videoUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  createdAt?: string;
}

export type ProposalDraft = Omit<Proposal, 'id' | 'status' | 'source' | 'createdAt'>;
