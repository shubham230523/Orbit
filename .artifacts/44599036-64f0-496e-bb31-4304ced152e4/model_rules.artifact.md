# AI Model Inference Rules

To ensure consistent and accurate output from the local and remote AI models, follow these rules:

## 1. JSON-Only Output
- Output MUST be a valid JSON object.
- NO introductory text, NO markdown code blocks, NO concluding remarks.
- Ensure all array fields (e.g., `constraints`, `measurableOutcomes`) are actual JSON arrays, even if they contain only one item.

## 2. Temporal Accuracy (Goal Analysis)
- When a `targetDate` is provided, calculate the `estimatedDurationWeeks` based on the difference between the current date and the `targetDate`.
- The `constraints` field should mention the deadline if one exists.
- If no `targetDate` is provided, use a reasonable default based on the goal's complexity (usually 4-12 weeks).

## 3. Actionable Roadmaps
- Breakdown goals into 3-7 logical milestones.
- Each milestone must have a clear `title` and `description`.
- `estimatedWeeks` for each milestone should sum up to the total estimated duration of the goal.

## 4. Resource Resilience
- Handle sparse user input gracefully by inferring missing context from the goal title.
- Categorize goals into broad buckets like: "Work", "Personal", "Health", "Finance", "Education", "Other".
