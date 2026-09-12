package com.generated.ldmurdergame.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.generated.ldmurdergame.model.OverviewResponse;
import com.generated.ldmurdergame.service.OverviewService;

@RestController
public class OverviewController {
  private final OverviewService overviewService;

  public OverviewController(OverviewService overviewService) {
    this.overviewService = overviewService;
  }

  @GetMapping({"/overview", "/api/overview"})
  public OverviewResponse overview() {
    return overviewService.getOverview();
  }
}
