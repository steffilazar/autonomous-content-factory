# Approach Document

## Overview

The project is designed as a multi-agent AI system that converts a single input document into a multi-channel marketing campaign.

## Architecture

The system consists of three agents:

* Researcher: Extracts structured information from the input document
* Copywriter: Generates content for blog, social media, and email
* Editor: Reviews and refines the generated content

## Pipeline Flow

1. User uploads or enters a document
2. Researcher extracts key insights (factSheet)
3. Copywriter generates content based on extracted data
4. Editor refines and ensures consistency
5. Final output is displayed with options to regenerate or approve

## Key Design Decisions

* Used a multi-agent approach to simulate real-world content workflows
* Enabled section-wise regeneration to improve efficiency
* Added approval system for human-in-the-loop control
* Designed UI to visualize agent collaboration in real-time

## Scalability Considerations

* Modular API routes for each agent
* Easy to add more agents (e.g., SEO optimizer, analytics agent)
* Can integrate with CMS or social media APIs in future
