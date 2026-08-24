export type QuoteInput = {
    monthlyConsumptionKwh: number;
    systemSizeKw: number;
    downPayment?: number;
};

export type Offer = {
    termYears: number;
    apr: number;
    principalUsed: number;
    monthlyPayment: number;
};

export type QuoteCalculation = {
    systemPrice: number;
    principal: number;
    riskBand: "A" | "B" | "C";
    offers: Offer[];
};


const aprMap = {
    A: 0.069,
    B: 0.089,
    C: 0.119,
} as const;
const terms = [5, 10, 15];

function round(value: number) {
    return Math.round(value * 100) / 100;
}

export function calculateQuote(input: QuoteInput): QuoteCalculation {
    const systemPrice = input.systemSizeKw * 1200;
    const downPayment = input.downPayment ?? 0;
    const principal = Math.max(systemPrice - downPayment, 0);

    let riskBand: "A" | "B" | "C";

    if (input.monthlyConsumptionKwh >= 400 && input.systemSizeKw <= 6) {
        riskBand = "A";
    } else if (input.monthlyConsumptionKwh >= 250) {
        riskBand = "B";
    } else {
        riskBand = "C";
    }

    const apr = aprMap[riskBand];
    const offers = terms.map((termYears) => {
        const numberOfPayments = termYears * 12;
        const monthlyRate = apr / 12;

        const intrestRate = Math.pow(1 + monthlyRate, numberOfPayments);
        const monthlyPayment = principal === 0 ? 0 : principal * (monthlyRate * intrestRate) / (intrestRate - 1);

        return {
            termYears,
            apr,
            principalUsed: round(principal),
            monthlyPayment: round(monthlyPayment),
        };
    });

    return {
        systemPrice: round(systemPrice),
        principal: round(principal),
        riskBand,
        offers,
    };
}