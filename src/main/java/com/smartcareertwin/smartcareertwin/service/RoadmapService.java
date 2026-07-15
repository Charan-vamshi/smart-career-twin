package com.smartcareertwin.smartcareertwin.service;

import com.smartcareertwin.smartcareertwin.dto.PlacementScoreResponse;
import com.smartcareertwin.smartcareertwin.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RoadmapService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final PredictionService predictionService;

    public RoadmapService(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    public String generateRoadmap(User user) {
        PlacementScoreResponse scores = predictionService.calculateScores(user);
        
        String prompt = String.format("Generate a personalized career roadmap for a student with the following placement prediction scores: " +
                "Tier 1 (Product-based): %.2f%%, Tier 2 (Service-based): %.2f%%, Tier 3 (Startup): %.2f%%. " +
                "Focus on improving their chances for Tier 1 companies. Keep it actionable and concise.",
                scores.getTier1Score(), scores.getTier2Score(), scores.getTier3Score());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(
            Map.of("parts", List.of(
                Map.of("text", prompt)
            ))
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
            return "Could not generate roadmap at this time.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Gemini API: " + e.getMessage();
        }
    }
}
