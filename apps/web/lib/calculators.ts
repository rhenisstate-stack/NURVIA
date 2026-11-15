export interface IvRateInput {
  volume: number;
  timeHours: number;
  dropFactor: number;
}

export interface IvRateResult {
  valid: boolean;
  dripRate: number | null;
  hourlyRate: number | null;
  error: string | null;
}

export function calculateIvRates(input: IvRateInput): IvRateResult {
  const { volume, timeHours, dropFactor } = input;

  if (!Number.isFinite(volume) || volume < 0) {
    return {
      valid: false,
      dripRate: null,
      hourlyRate: null,
      error: "Volume (mL) must be a valid non-negative number.",
    };
  }

  if (!Number.isFinite(timeHours) || timeHours <= 0) {
    return {
      valid: false,
      dripRate: null,
      hourlyRate: null,
      error: "Infusion time (hours) must be greater than 0.",
    };
  }

  if (!Number.isFinite(dropFactor) || dropFactor <= 0) {
    return {
      valid: false,
      dripRate: null,
      hourlyRate: null,
      error: "Drop factor (gtt/mL) must be greater than 0.",
    };
  }

  const dripRate = Math.round((volume * dropFactor) / (timeHours * 60));
  const hourlyRate = Math.round(volume / timeHours);

  if (!Number.isFinite(dripRate) || !Number.isFinite(hourlyRate)) {
    return {
      valid: false,
      dripRate: null,
      hourlyRate: null,
      error: "Unable to calculate infusion rate with the provided values.",
    };
  }

  return {
    valid: true,
    dripRate,
    hourlyRate,
    error: null,
  };
}

export interface DosageInput {
  desired: number;
  onHand: number;
  vehicle: number;
}

export interface DosageResult {
  valid: boolean;
  amount: number | null;
  error: string | null;
}

export function calculateDosage(input: DosageInput): DosageResult {
  const { desired, onHand, vehicle } = input;

  if (!Number.isFinite(desired) || desired < 0) {
    return { valid: false, amount: null, error: "Desired dose must be 0 or greater." };
  }
  if (!Number.isFinite(onHand) || onHand <= 0) {
    return { valid: false, amount: null, error: "Dose on hand must be greater than 0." };
  }
  if (!Number.isFinite(vehicle) || vehicle <= 0) {
    return { valid: false, amount: null, error: "Vehicle quantity must be greater than 0." };
  }

  const raw = (desired / onHand) * vehicle;
  if (!Number.isFinite(raw)) {
    return { valid: false, amount: null, error: "Invalid dosage calculation." };
  }

  return { valid: true, amount: Math.round(raw * 100) / 100, error: null };
}
