// Cluster strategies based on the optimization model
export interface ClusterStrategy {
  label: string;
  description: string;
  tactic: string;
  reason: string;
  targetGap: string;
  riskNote: string;
}

export const clusterStrategies: Record<string, ClusterStrategy> = {
  // HIGH-TICKET EFFICIENT (~46% of base)
  "HighTicket_Efficient": {
    label: "High-Ticket Efficient",
    description: "High ticket value (≥€80), gap ≈ 0 (every visit produces order).",
    tactic: "Maintain frequency; explore upselling opportunities.",
    reason: "Already maximizing margin; any visit reduction could damage relationship.",
    targetGap: "0",
    riskNote: "Low risk. Focus on value enhancement."
  },

  // LOW-TICKET EFFICIENT (~36% of base)  
  "LowTicket_Efficient": {
    label: "Low-Ticket Efficient", 
    description: "Ticket <€80, but visits well utilized (gap ≈ 0).",
    tactic: "Maintain or consolidate routes; incentivize larger baskets.",
    reason: "Each order leaves little margin; increasing value per delivery is more profitable than reducing visits.",
    targetGap: "0",
    riskNote: "Low risk. Focus on ticket size increase."
  },

  // CLOUDCASTLE SUB-CLUSTERS (~10% of base, main saving focus)
  "CloudCastle_0": {
    label: "Every-Visit Converters",
    description: "1.15 visits/month → 0.73 orders (gap 0.42). Almost 90% visits convert.",
    tactic: "Reduce 2 visits per year → gap 0.",
    reason: "Nearly 90% of visits convert; eliminating the one unproductive visit saves cost without risk.",
    targetGap: "0", 
    riskNote: "Minimal risk. Precise adjustment."
  },

  "CloudCastle_1": {
    label: "Moderate Visits",
    description: "3.96 visits/month → 3.07 orders (gap 0.89). Close to 1:1 ratio.",
    tactic: "Cut 1 visit per month → gap 0.",
    reason: "Already close to 1:1; small adjustment captures almost all opportunity cost.",
    targetGap: "0",
    riskNote: "Very low risk. Light optimization."
  },

  "CloudCastle_2": {
    label: "VIP Client", 
    description: "1.0 visits/month → 0.42 orders (gap 0.58). Ticket >€19k.",
    tactic: "On-demand visits only.",
    reason: "Very high ticket value; personalized service but without useless routine.",
    targetGap: "0",
    riskNote: "Low risk. VIP treatment maintained."
  },

  "CloudCastle_3": {
    label: "High Visits",
    description: "4.22 visits/month → 2.05 orders (gap 2.17). Maximum inefficiency.",
    tactic: "Reduce visits until gap ≤ 2; monitor closely.",
    reason: "Maximum inefficiency; partial cut balances risk of sales drop with savings.",
    targetGap: "≤2",
    riskNote: "Medium risk. Requires monitoring."
  },

  // LOW-TICKET INEFFICIENT SUB-PROFILES (~8% of base)
  "LowTicket_Inefficient_A": {
    label: "Micro-frequent",
    description: "2-4 orders/month, multiple visits, ticket €40-70.",
    tactic: "Consolidate orders, move to bi-weekly visits.",
    reason: "Increase average ticket per delivery and cut promoter cost.",
    targetGap: "≤1",
    riskNote: "Low risk. Consolidation strategy."
  },

  "LowTicket_Inefficient_B": {
    label: "Sporadic",
    description: "≤1 order/month, 2-4 visits. Low engagement.",
    tactic: "Reactive model (visit only with confirmed order).",
    reason: "Routine visits generate net loss.",
    targetGap: "≤0", 
    riskNote: "Low risk. Order-driven approach."
  },

  "LowTicket_Inefficient_C": {
    label: "Net Negative",
    description: "Negative profit after costs. Very low performance.",
    tactic: "Minimum orders or migrate to wholesale.",
    reason: "Free up promoter hours and truck space.",
    targetGap: "≤0",
    riskNote: "Low-medium risk. Strategic decision."
  },

  // GENERIC CLUSTERS (fallback for unmapped clusters)
  "HighTicket_Inefficient": {
    label: "High-Ticket Inefficient",
    description: "High ticket value but with visit-order gap inefficiencies.",
    tactic: "Optimize visit frequency to reduce gap while maintaining relationship.",
    reason: "High value clients require careful balance between efficiency and service quality.",
    targetGap: "≤1",
    riskNote: "Medium risk. Requires careful management."
  },

  "LowTicket_Inefficient": {
    label: "Low-Ticket Inefficient", 
    description: "Low ticket value with visit inefficiencies.",
    tactic: "Reduce visit frequency or implement order-driven approach.",
    reason: "Low margins require efficiency optimization to maintain profitability.",
    targetGap: "≤1",
    riskNote: "Low-medium risk. Focus on efficiency."
  },

  // CATCH-ALL FOR UNKNOWN CLUSTERS
  "N/A": {
    label: "Standard Profile",
    description: "Standard client profile under analysis.",
    tactic: "Maintain current approach while gathering more data.",
    reason: "Insufficient data for specific optimization strategy.",
    targetGap: "Current",
    riskNote: "Analysis pending."
  }
};

export function getClusterStrategy(clusterName: string | null): ClusterStrategy {
  if (!clusterName || clusterName === "N/A" || clusterName === "null") {
    return clusterStrategies["N/A"];
  }
  
  // Direct mapping first
  if (clusterStrategies[clusterName]) {
    return clusterStrategies[clusterName];
  }
  
  // Fallback mappings for common variations
  if (clusterName.includes("HighTicket") && clusterName.includes("Efficient")) {
    return clusterStrategies["HighTicket_Efficient"];
  }
  if (clusterName.includes("LowTicket") && clusterName.includes("Efficient")) {
    return clusterStrategies["LowTicket_Efficient"];
  }
  if (clusterName.includes("HighTicket") && clusterName.includes("Inefficient")) {
    return clusterStrategies["HighTicket_Inefficient"];
  }
  if (clusterName.includes("LowTicket") && clusterName.includes("Inefficient")) {
    return clusterStrategies["LowTicket_Inefficient"];
  }
  if (clusterName.includes("CloudCastle")) {
    return clusterStrategies["HighTicket_Inefficient"];
  }
  if (clusterName.includes("High Visits")) {
    return clusterStrategies["CloudCastle_3"];
  }
  if (clusterName.includes("Every Visit Converters")) {
    return clusterStrategies["CloudCastle_0"];
  }
  if (clusterName.includes("Moderate Visits")) {
    return clusterStrategies["CloudCastle_1"];
  }
  if (clusterName.includes("VIP Client")) {
    return clusterStrategies["CloudCastle_2"];
  }
  if (clusterName.includes("Occasional")) {
    return clusterStrategies["LowTicket_Inefficient_A"];
  }
  
  // Default fallback
  return clusterStrategies["N/A"];
} 