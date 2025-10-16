# Darcy AI Timeline Estimation Guidelines

This document outlines the guidelines and rules for Darcy AI when estimating project timelines and costs.

## Core Principles

### 1. Minimum Timeline: Never Under One Week
**Rule**: All project estimates must have a minimum timeline of **7 days (1 week)**.

**Rationale**: 
- Even simple projects require time for proper planning, development, testing, and deployment
- Rushed timelines lead to technical debt and quality issues
- One week allows for a complete development cycle with proper review

### 2. External Integration Complexity
**Rule**: Projects with big integrations to external services require significantly longer timelines and higher costs.

#### High Complexity Integrations (2.5x timeline, 3x cost)

These integrations add a minimum of **3 weeks** to the project timeline:

- **Brokerages**: Stock trading, investment platforms
- **Sports Betting Apps**: Gambling, odds management
- **Airlines**: Booking systems, flight management
- **Financial Services**: Banking, payment processors

**Why these are complex**:
- Extensive authentication and security requirements
- Regulatory compliance (SEC, gaming commissions, aviation authorities)
- Complex error handling and edge cases
- Real-time data synchronization
- Payment processing and PCI compliance
- Extensive testing requirements
- Detailed audit logging
- Multi-jurisdiction legal requirements

#### Medium Complexity Integrations (1.5x timeline, 1.8x cost)

These integrations add approximately **10 days** to the timeline:

- Social media APIs (OAuth flows, rate limiting)
- Email services (deliverability, templates)
- SMS providers (carrier restrictions)
- Analytics platforms (data privacy)

#### Low Complexity Integrations (1.2x timeline, 1.3x cost)

These integrations add approximately **5 days** to the timeline:

- Simple REST APIs
- Webhooks
- Basic third-party services

## Timeline Calculation Examples

### Example 1: Simple CRUD App
- **Base timeline**: 7-14 days
- **Integrations**: None
- **Final estimate**: 7-14 days

### Example 2: Chat Activity Tracker (Current Project)
- **Base timeline**: 14 days
- **Integrations**: Whop API (medium complexity)
- **Calculation**: 14 days × 1.5 = 21 days
- **Final estimate**: 14-21 days

### Example 3: Trading Platform with Brokerage Integration
- **Base timeline**: 14 days
- **Integrations**: Brokerage API (high complexity)
- **Calculation**: 14 days + 21 days (high complexity) = 35 days
- **With 20% buffer**: 35 × 1.2 = 42 days
- **Final estimate**: 45-90 days (accounting for testing and compliance)

### Example 4: Sports Betting Application
- **Base timeline**: 14 days
- **Integrations**: Sports betting API (high complexity)
- **Additional factors**:
  - Age verification system
  - Geolocation restrictions
  - Payment processing
  - Real-time odds management
  - Multi-jurisdiction compliance
- **Calculation**: 14 days + 21 days (integration) + 14 days (compliance) + 14 days (testing) = 63 days
- **With 20% buffer**: 63 × 1.2 = 76 days
- **Final estimate**: 60-120 days

### Example 5: Airline Booking System
- **Base timeline**: 14 days
- **Integrations**: Airline API (high complexity)
- **Additional factors**:
  - Complex booking flows
  - Payment processing
  - Cancellation handling
  - Real-time seat selection
  - Multiple airline standards
- **Calculation**: 14 days + 21 days (integration) + 7 days (booking flows) + 7 days (payment) = 49 days
- **With 20% buffer**: 49 × 1.2 = 59 days
- **Final estimate**: 45-90 days

## Cost Estimation

### Base Rate
- Standard hourly rate: $150/hour

### Cost Multipliers by Integration Complexity
- **High complexity**: 3.0x base rate ($450/hour)
- **Medium complexity**: 1.8x base rate ($270/hour)
- **Low complexity**: 1.3x base rate ($195/hour)

### Why Higher Rates for Complex Integrations?
1. Requires specialized expertise
2. More extensive testing and QA
3. Compliance and security review
4. Legal and regulatory consultation
5. Higher risk and liability
6. Ongoing maintenance complexity

## Checklist for Timeline Estimation

When estimating a project, consider:

- [ ] **Minimum 7-day timeline** enforced?
- [ ] **Integration count** and complexity assessed?
- [ ] **Regulatory requirements** identified?
- [ ] **Security requirements** documented?
- [ ] **Payment processing** needed?
- [ ] **Real-time features** required?
- [ ] **Multi-jurisdiction** considerations?
- [ ] **20% buffer** added for contingencies?
- [ ] **Testing time** included?
- [ ] **Documentation time** included?
- [ ] **Deployment complexity** assessed?

## Red Flags for Extended Timelines

Watch for these indicators that suggest a longer timeline:

🚩 Financial transactions or payments
🚩 Regulated industries (finance, gambling, healthcare)
🚩 Real-time data synchronization
🚩 Multi-jurisdiction compliance
🚩 Age or identity verification
🚩 High-frequency trading or odds management
🚩 PCI compliance requirements
🚩 Background checks or KYC/AML
🚩 Integration with legacy systems
🚩 Multiple third-party dependencies

## Configuration File

The complete configuration is available in `darcy-ai-config.json`, which includes:

- Detailed timeline rules
- Integration complexity multipliers
- Cost factors
- Real-world examples
- Estimation guidelines

## Updates and Maintenance

This configuration should be reviewed and updated:
- Quarterly for rate adjustments
- When new integration types emerge
- After completing projects (lessons learned)
- When regulatory requirements change

---

**Last Updated**: 2025-10-16  
**Version**: 1.0.0  
**Issue**: SPARK-373
