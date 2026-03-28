import { FIIData, AIAnalysis, ReportAnalysisResult } from "@/types";
import { GoogleGenAI } from "@google/genai";

const livePrices: Record<string, number> = {};

const mockFIIs: Record<string, any> = {
  "HGLG11": {
    ticker: "HGLG11",
    name: "CGHG Logística",
    type: "Tijolo",
    segment: "Logística",
    price: 165.50,
    dy: 8.5,
    pvp: 1.05,
    liquidity: 4500000,
    vacancy: 4.2,
    shareholders: 350000,
    netWorth: 3500000000,
    managementReport: "O fundo manteve sua estratégia de alocação em galpões logísticos AAA. Neste mês, concluímos a renegociação do contrato com a locatária X, com reajuste de 5% acima da inflação. A vacância física permanece estável em 4.2%. O guidance de dividendos para o próximo semestre é de R$ 1,10 a R$ 1,15 por cota.",
    history: [
      { month: "Jan", price: 160, dividend: 1.10 },
      { month: "Fev", price: 162, dividend: 1.10 },
      { month: "Mar", price: 161, dividend: 1.10 },
      { month: "Abr", price: 164, dividend: 1.10 },
      { month: "Mai", price: 163, dividend: 1.10 },
      { month: "Jun", price: 165.50, dividend: 1.10 },
    ]
  },
  "MXRF11": {
    ticker: "MXRF11",
    name: "Maxi Renda",
    type: "Papel",
    segment: "Híbrido",
    price: 10.45,
    dy: 12.5,
    pvp: 1.02,
    liquidity: 12000000,
    vacancy: 0,
    shareholders: 1000000,
    netWorth: 2500000000,
    managementReport: "A gestão segue focada na originação de CRIs com boas garantias e taxas atrativas (IPCA + 7.5%). No mês, o fundo realizou o pré-pagamento de duas operações que geraram ganho de capital extraordinário, refletindo no leve aumento dos dividendos. A carteira de FIIs do fundo também apresentou valorização.",
    history: [
      { month: "Jan", price: 10.20, dividend: 0.11 },
      { month: "Fev", price: 10.30, dividend: 0.11 },
      { month: "Mar", price: 10.25, dividend: 0.12 },
      { month: "Abr", price: 10.40, dividend: 0.11 },
      { month: "Mai", price: 10.35, dividend: 0.11 },
      { month: "Jun", price: 10.45, dividend: 0.12 },
    ]
  },
  "KNRI11": {
    ticker: "KNRI11",
    name: "Kinea Renda Imobiliária",
    type: "Tijolo",
    segment: "Híbrido (Lajes e Logística)",
    price: 158.20,
    dy: 7.8,
    pvp: 0.98,
    liquidity: 3200000,
    vacancy: 2.5,
    shareholders: 250000,
    netWorth: 3800000000,
    managementReport: "O fundo assinou um novo contrato de locação no edifício Rochaverá, reduzindo a vacância do portfólio de lajes corporativas. No braço logístico, as operações seguem com 100% de ocupação e inadimplência zero. A gestão estuda novas aquisições no estado de São Paulo para o próximo trimestre.",
    history: [
      { month: "Jan", price: 155, dividend: 1.00 },
      { month: "Fev", price: 156, dividend: 1.00 },
      { month: "Mar", price: 154, dividend: 1.00 },
      { month: "Abr", price: 157, dividend: 1.00 },
      { month: "Mai", price: 159, dividend: 1.00 },
      { month: "Jun", price: 158.20, dividend: 1.00 },
    ]
  }
};

export async function fetchFIIData(ticker: string): Promise<FIIData> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const upperTicker = ticker.toUpperCase();
  let data = mockFIIs[upperTicker];
  
  if (data) {
    if (!livePrices[upperTicker]) livePrices[upperTicker] = data.price;
    return { ...data, price: livePrices[upperTicker] };
  } else {
    // Generate realistic mock data for unknown tickers
    const isPaper = Math.random() > 0.5;
    let price = livePrices[upperTicker];
    if (!price) {
      price = Math.random() * 100 + 10;
      livePrices[upperTicker] = parseFloat(price.toFixed(2));
    }
    
    const dy = Math.random() * 8 + 6; // 6% to 14%
    const pvp = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    const vacancy = isPaper ? 0 : Math.random() * 15;
    
    const generatedData = {
      ticker: upperTicker,
      name: "Fundo Imobiliário " + upperTicker,
      type: isPaper ? "Papel" : "Tijolo",
      segment: isPaper ? "Recebíveis" : "Lajes Corporativas",
      price: parseFloat(price.toFixed(2)),
      dy: parseFloat(dy.toFixed(2)),
      pvp: parseFloat(pvp.toFixed(2)),
      liquidity: Math.floor(Math.random() * 5000000) + 100000,
      vacancy: parseFloat(vacancy.toFixed(2)),
      shareholders: Math.floor(Math.random() * 200000) + 10000,
      netWorth: Math.floor(Math.random() * 2000000000) + 500000000,
      managementReport: "O fundo " + upperTicker + " segue focado em sua tese de investimentos no segmento de " + (isPaper ? "Recebíveis" : "Lajes Corporativas") + ". A gestão destaca a resiliência do portfólio frente ao cenário macroeconômico atual. Não houve movimentações relevantes na carteira neste mês, e a distribuição de rendimentos segue em linha com o guidance.",
      history: Array.from({ length: 6 }).map((_, i) => ({
        month: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][i],
        price: parseFloat((livePrices[upperTicker] * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2)),
        dividend: parseFloat(((livePrices[upperTicker] * (dy / 100)) / 12).toFixed(2))
      }))
    };
    return generatedData as FIIData;
  }
}

export async function fetchLiveQuote(ticker: string): Promise<{ ticker: string, price: number, timestamp: string }> {
  const upperTicker = ticker.toUpperCase();
  let currentPrice = livePrices[upperTicker];
  
  if (!currentPrice) {
    currentPrice = mockFIIs[upperTicker]?.price || (Math.random() * 100 + 10);
    livePrices[upperTicker] = currentPrice;
  }

  // Simulate real-time market fluctuation (-0.5% to +0.5%)
  const fluctuation = currentPrice * (Math.random() * 0.01 - 0.005);
  const newPrice = parseFloat((currentPrice + fluctuation).toFixed(2));
  livePrices[upperTicker] = newPrice;

  return {
    ticker: upperTicker,
    price: newPrice,
    timestamp: new Date().toISOString()
  };
}

export async function generateAIAnalysis(fii: FIIData): Promise<AIAnalysis> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Fallback if no API key is set, we'll generate a programmatic analysis
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return generateProgrammaticAnalysis(fii);
    }

    const prompt = "Atue como um analista sênior de Fundos Imobiliários (FIIs).\n" +
      "Analise os seguintes dados do FII " + fii.ticker + " (" + fii.name + "):\n" +
      "- Tipo: " + fii.type + "\n" +
      "- Segmento: " + fii.segment + "\n" +
      "- Preço: R$ " + fii.price + "\n" +
      "- Dividend Yield (DY): " + fii.dy + "%\n" +
      "- P/VP: " + fii.pvp + "\n" +
      "- Liquidez Diária: R$ " + fii.liquidity + "\n" +
      "- Vacância: " + fii.vacancy + "%\n" +
      "- Trecho do Relatório Gerencial: \"" + fii.managementReport + "\"\n\n" +
      "Retorne a análise ESTRITAMENTE no seguinte formato JSON, sem marcação markdown e sem texto adicional:\n" +
      "{\n" +
      "  \"pros\": [\"ponto positivo 1\", \"ponto positivo 2\", \"ponto positivo 3\"],\n" +
      "  \"cons\": [\"ponto negativo 1\", \"ponto negativo 2\"],\n" +
      "  \"diagnosis\": \"FII Forte\" | \"FII Moderado\" | \"FII Arriscado\",\n" +
      "  \"recommendation\": \"Sua recomendação detalhada aqui...\",\n" +
      "  \"explanation\": \"Explicação simples sobre a estratégia do fundo e riscos...\",\n" +
      "  \"reportAnalysis\": \"Análise crítica do trecho do relatório gerencial, destacando a visão da gestão e perspectivas...\",\n" +
      "  \"score\": 8.5\n" +
      "}";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let text = response.text || "{}";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      text = jsonMatch[1];
    } else {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(text);
    
    return {
      pros: parsed.pros || [],
      cons: parsed.cons || [],
      diagnosis: parsed.diagnosis || "FII Moderado",
      recommendation: parsed.recommendation || "",
      explanation: parsed.explanation || "",
      reportAnalysis: parsed.reportAnalysis || "",
      score: parsed.score || 5
    } as AIAnalysis;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return generateProgrammaticAnalysis(fii);
  }
}

function generateProgrammaticAnalysis(fii: FIIData): AIAnalysis {
  const pros: string[] = [];
  const cons: string[] = [];
  let score = 5;

  if (fii.dy > 10) {
    pros.push("Dividend Yield (DY) alto, indicando boa distribuição de rendimentos.");
    score += 1.5;
  } else if (fii.dy > 7) {
    pros.push("Dividend Yield (DY) atrativo e consistente.");
    score += 1;
  } else {
    cons.push("Dividend Yield (DY) abaixo da média do mercado.");
    score -= 1;
  }

  if (fii.pvp < 0.95) {
    pros.push("Negociado com desconto patrimonial (P/VP < 1).");
    score += 1.5;
  } else if (fii.pvp <= 1.05) {
    pros.push("Preço justo em relação ao valor patrimonial.");
    score += 0.5;
  } else {
    cons.push("Negociado com ágio (P/VP > 1.05), o que pode limitar o potencial de valorização.");
    score -= 1;
  }

  if (fii.vacancy < 5) {
    pros.push("Baixa vacância, demonstrando resiliência e boa gestão.");
    score += 1.5;
  } else if (fii.vacancy > 10) {
    cons.push("Vacância alta, o que pode impactar os rendimentos futuros.");
    score -= 1.5;
  }

  if (fii.liquidity > 1000000) {
    pros.push("Alta liquidez diária, facilitando a entrada e saída do fundo.");
    score += 0.5;
  } else {
    cons.push("Liquidez diária baixa, pode ser difícil vender grandes volumes.");
    score -= 1;
  }

  score = Math.max(0, Math.min(10, score));

  let diagnosis: "FII Forte" | "FII Moderado" | "FII Arriscado" = "FII Moderado";
  if (score >= 8) diagnosis = "FII Forte";
  else if (score < 5) diagnosis = "FII Arriscado";

  return {
    pros,
    cons,
    diagnosis,
    recommendation: score >= 8 
      ? "Excelente opção para compor carteira focada em renda passiva. O fundo apresenta fundamentos sólidos e boa relação risco-retorno."
      : score >= 5 
        ? "Fundo com fundamentos razoáveis, mas exige acompanhamento. Pode ser uma opção secundária na carteira."
        : "Fundo apresenta riscos elevados no momento. Recomendado cautela e análise aprofundada antes de investir.",
    explanation: `O ${fii.ticker} é um fundo do tipo ${fii.type} focado no segmento de ${fii.segment}. Sua estratégia principal é gerar renda através da exploração de seus ativos. Os principais riscos envolvem a vacância (atualmente em ${fii.vacancy}%) e oscilações na taxa de juros (Selic).`,
    reportAnalysis: `Análise automática do relatório: A gestão reportou o seguinte: "${fii.managementReport.substring(0, 150)}...". Em geral, o fundo demonstra foco na manutenção da rentabilidade e controle de riscos operacionais.`,
    score: parseFloat(score.toFixed(1))
  };
}

export async function analyzeManagementReport(reportText: string): Promise<ReportAnalysisResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return generateProgrammaticReportAnalysis(reportText);
    }

    const prompt = "Atue como um analista sênior de Fundos Imobiliários (FIIs).\n" +
      "Leia o seguinte texto extraído de um Relatório Gerencial e faça uma análise crítica.\n\n" +
      "TEXTO DO RELATÓRIO:\n" +
      "\"" + reportText + "\"\n\n" +
      "Retorne a análise ESTRITAMENTE no seguinte formato JSON, sem marcação markdown e sem texto adicional:\n" +
      "{\n" +
      "  \"summary\": \"Resumo executivo do relatório em 2 ou 3 frases...\",\n" +
      "  \"managementTone\": \"Otimista\" | \"Neutro\" | \"Pessimista\",\n" +
      "  \"dividendGuidance\": \"O que a gestão fala sobre os próximos dividendos...\",\n" +
      "  \"risks\": [\"risco 1 citado\", \"risco 2 citado\"],\n" +
      "  \"highlights\": [\"destaque positivo 1\", \"destaque positivo 2\"]\n" +
      "}";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let text = response.text || "{}";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      text = jsonMatch[1];
    } else {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(text);
    
    return {
      summary: parsed.summary || "",
      managementTone: parsed.managementTone || "Neutro",
      dividendGuidance: parsed.dividendGuidance || "",
      risks: parsed.risks || [],
      highlights: parsed.highlights || []
    } as ReportAnalysisResult;
  } catch (error) {
    console.error("Error generating report analysis:", error);
    return generateProgrammaticReportAnalysis(reportText);
  }
}

function generateProgrammaticReportAnalysis(text: string): ReportAnalysisResult {
  const lowerText = text.toLowerCase();
  let tone: "Otimista" | "Neutro" | "Pessimista" = "Neutro";
  
  if (lowerText.includes("crescimento") || lowerText.includes("aumento") || lowerText.includes("positivo") || lowerText.includes("superou")) {
    tone = "Otimista";
  } else if (lowerText.includes("queda") || lowerText.includes("desafio") || lowerText.includes("impacto negativo") || lowerText.includes("vacância aumentou")) {
    tone = "Pessimista";
  }

  return {
    summary: "A gestão apresenta os resultados do período focando na resiliência do portfólio. Foram destacadas as movimentações recentes e o impacto no resultado caixa do fundo.",
    managementTone: tone,
    dividendGuidance: "A expectativa é manter o patamar atual de distribuição, sujeito às condições macroeconômicas e recebimento dos aluguéis/juros.",
    risks: ["Risco de inadimplência de locatários/devedores", "Oscilação da taxa Selic impactando o custo de oportunidade"],
    highlights: ["Manutenção da taxa de ocupação", "Gestão ativa na renegociação de contratos"]
  };
}
