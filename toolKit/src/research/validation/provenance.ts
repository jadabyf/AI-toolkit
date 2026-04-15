import { ResearchClaim } from "../../core/models";

export interface ProvenanceValidationResult {
  isValid: boolean;
  missingCitationClaimIds: string[];
  inferredWithoutEvidence: string[];
}

export function validateClaimProvenance(claims: ResearchClaim[]): ProvenanceValidationResult {
  const missingCitationClaimIds: string[] = [];
  const inferredWithoutEvidence: string[] = [];

  claims.forEach((claim) => {
    if (!claim.citations || claim.citations.length === 0) {
      missingCitationClaimIds.push(claim.id);
    }

    if (claim.inferred && claim.citations.length === 0) {
      inferredWithoutEvidence.push(claim.id);
    }
  });

  return {
    isValid: missingCitationClaimIds.length === 0,
    missingCitationClaimIds,
    inferredWithoutEvidence
  };
}
