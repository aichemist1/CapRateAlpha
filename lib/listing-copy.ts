type ListingCopyInput = {
  propertyName: string;
  address: string;
  suiteIdentifier: string;
  squareFeet: number;
  askingRentAmount: number;
  rentType: string;
  useType: string;
  highlights: string;
};

type ListingCopyResult = {
  headline: string;
  descriptionLong: string;
  descriptionShort: string;
  descriptionLoopnet: string;
  generatedBy: "openai" | "fallback";
};

export async function generateListingCopy(
  input: ListingCopyInput
): Promise<ListingCopyResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackCopy(input);
  }

  try {
    const prompt = buildPrompt(input);
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You write polished, concise commercial retail leasing copy. Return valid JSON only with keys: headline, descriptionLong, descriptionShort, descriptionLoopnet."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      return fallbackCopy(input);
    }

    const json = (await response.json()) as {
      output_text?: string;
    };

    const raw = json.output_text?.trim();

    if (!raw) {
      return fallbackCopy(input);
    }

    const parsed = JSON.parse(raw) as Partial<{
      headline: string;
      descriptionLong: string;
      descriptionShort: string;
      descriptionLoopnet: string;
    }>;

    if (
      !parsed.headline ||
      !parsed.descriptionLong ||
      !parsed.descriptionShort ||
      !parsed.descriptionLoopnet
    ) {
      return fallbackCopy(input);
    }

    return {
      headline: parsed.headline,
      descriptionLong: parsed.descriptionLong,
      descriptionShort: parsed.descriptionShort,
      descriptionLoopnet: parsed.descriptionLoopnet,
      generatedBy: "openai"
    };
  } catch {
    return fallbackCopy(input);
  }
}

function fallbackCopy(input: ListingCopyInput): ListingCopyResult {
  const rentLabel = formatRentLabel(input.askingRentAmount, input.rentType);
  const location = input.address || `${input.propertyName}`;
  const suite = input.suiteIdentifier || "Retail suite";
  const highlights = input.highlights.trim() || "Strong visibility and accessible retail frontage.";

  return {
    headline: `${suite} retail space for lease at ${input.propertyName}`,
    descriptionLong: `${input.propertyName} offers ${input.squareFeet.toLocaleString()} square feet of ${input.useType} space at ${location}. Asking ${rentLabel}. Highlights include ${highlights}`,
    descriptionShort: `${input.squareFeet.toLocaleString()} SF ${input.useType} suite for lease at ${input.propertyName} with ${rentLabel}.`,
    descriptionLoopnet: `${input.squareFeet.toLocaleString()} SF ${input.useType} retail opportunity at ${input.propertyName}. Located at ${location}. ${rentLabel}. Highlights: ${highlights}`,
    generatedBy: "fallback"
  };
}

function buildPrompt(input: ListingCopyInput) {
  return [
    `Property: ${input.propertyName}`,
    `Address: ${input.address}`,
    `Suite: ${input.suiteIdentifier}`,
    `Square feet: ${input.squareFeet}`,
    `Use type: ${input.useType}`,
    `Rent: ${formatRentLabel(input.askingRentAmount, input.rentType)}`,
    `Highlights: ${input.highlights}`,
    "",
    "Write:",
    "1. A headline under 12 words",
    "2. A polished long description under 120 words",
    "3. A short description under 30 words",
    "4. A LoopNet-style version under 80 words",
    "",
    "Return JSON only."
  ].join("\n");
}

function formatRentLabel(amount: number, rentType: string) {
  if (!amount) {
    return "rent guidance available on request";
  }

  const type =
    rentType === "nnn"
      ? "NNN"
      : rentType === "gross"
        ? "Gross"
        : rentType === "modified_gross"
          ? "Modified Gross"
          : "Rent";

  return `$${amount}/SF ${type}`;
}
