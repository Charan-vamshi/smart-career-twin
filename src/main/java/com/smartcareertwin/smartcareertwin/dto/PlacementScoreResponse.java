package com.smartcareertwin.smartcareertwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementScoreResponse {
    private double tier1Score; // Product-based
    private double tier2Score; // Service-based
    private double tier3Score; // Startup
}
