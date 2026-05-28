// =============================== ENGINE LOGIC VAT
// src/tax/engines/vat.engine.ts

// ===============================
import { TAX_TYPES } from "../constants/tax.constant.js";

import type {
	VATInput,
	TransactionType,
	TaxResult,
} from "../../types/index.js";

import { AppError } from "../../utils/AppError.js";

// =============================== VAT CONFIG
type VatConfig = {
	rate: number;
	category: "STANDARD" | "ZERO_RATED" | "EXEMPT";
	label: string;
};

// ===============================
const VAT_CONFIG: Record<TransactionType, VatConfig> = {
	DOMESTIC: {
		rate: 0.075,
		category: "STANDARD",
		label: "Domestic VAT",
	},

	DIGITAL: {
		rate: 0.075,
		category: "STANDARD",
		label: "Digital VAT",
	},

	EXPORT: {
		rate: 0,
		category: "ZERO_RATED",
		label: "Export VAT (Zero-Rated)",
	},

	EXEMPT: {
		rate: 0,
		category: "EXEMPT",
		label: "Exempt Supply",
	},
};

// ===============================
export function vatEngine(input: VATInput): TaxResult {
	const { transactionAmount, calculationType, transactionType } = input;

	// ================= VALIDATION
	if (transactionAmount == null || transactionAmount < 0) {
		throw new AppError("Transaction amount must be >= 0", 400);
	}

	// ================= CONFIG
	const config = VAT_CONFIG[transactionType];
	const vatRate = config.rate;

	let vatAmount = 0;
	let baseAmount = 0;

	// ================= ZERO VAT
	if (vatRate === 0 || transactionAmount === 0) {
		return {
			taxType: TAX_TYPES.VAT,

			grossAnnualIncome: transactionAmount,
			taxableIncome: transactionAmount,

			totalAnnualTax: 0,
			monthlyTax: 0,

			netAnnualIncome: transactionAmount,
			netMonthlyIncome: Math.round(transactionAmount / 12),

			taxBreakdown: [
				{
					label:
						config.category === "EXEMPT"
							? config.label
							: `${config.label} (0%)`,

					rate: 0,

					taxableAmount: transactionAmount,
					tax: 0,
				},
			],

			deductions: {},

			meta: {
				calculationType,
				transactionType,
				vatRate,
			},
		};
	}

	// ================= ADD VAT
	if (calculationType === "ADD") {
		baseAmount = transactionAmount;
		vatAmount = baseAmount * vatRate;
	}

	// ================= REMOVE VAT
	else {
		baseAmount = transactionAmount / (1 + vatRate);
		vatAmount = transactionAmount - baseAmount;
	}

	// ================= ROUNDING
	const roundedVat = Math.round(vatAmount);
	const roundedBase = Math.round(baseAmount);

	// ================= RESPONSE
	return {
		taxType: TAX_TYPES.VAT,

		grossAnnualIncome: transactionAmount,
		taxableIncome: roundedBase,

		totalAnnualTax: roundedVat,
		monthlyTax: Math.round(roundedVat / 12),

		netAnnualIncome: roundedBase,
		netMonthlyIncome: Math.round(roundedBase / 12),

		taxBreakdown: [
			{
				label: `${config.label} (${(vatRate * 100).toFixed(1)}%)`,

				rate: vatRate,

				taxableAmount: roundedBase,
				tax: roundedVat,
			},
		],

		deductions: {},

		meta: {
			calculationType,
			transactionType,
			vatRate,
		},
	};
}
