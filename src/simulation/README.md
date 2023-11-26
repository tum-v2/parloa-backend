# Simulation

Sumulation backend service is dedicated to crafting lifelike conversation simulations for service agents and user agents across various domains like flight booking and insurance, aligning with diverse conversation scenarios such as sequence, slot filling and call forward to the right category.

## File Structure

```plaintext
.
├── agents
│   ├── Agents configurations, models, and related logic.
│   └── ...
├── API
│   ├── Backend API controllers.
│   └── ...
├── db
│   ├── Database configurations, models and connection logic.
│   └── ...
├── docs
│   ├── Documentation files and API specifications.
│   └── ...
├── mockedAPI
│   ├── Mocked API data and utility functions for agent's tools.
│   └── ...
├── router
│   ├── Express route definitions and middleware.
│   └── ...
├── service
│   ├── Business logic services and external integrations.
│   └── ...
├── util
│   ├── Utility functions and helper modules.
│   └── ...
└── validator
    ├── Data validation schemas and validation logic.
    └── ...
