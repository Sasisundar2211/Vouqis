# customer-quotes.md

> Verbatim quotes from engineers, organized by topic.
>
> Source each quote. Anonymous is fine, but note the channel (Reddit, interview, newsletter, etc.)
> so you can weight the signal correctly.
>
> When the same phrase appears from independent sources, it's worth more than a feature request.

Last Updated: 2026-07-17

---

## Passing evals

> "Passing evals doesn't tell me it's safe."
— Reddit, LLMDev

> "The score improved, but production still broke."
— Reddit

> "Green CI isn't enough."
— Reddit

> "Evals passed but production broke."
— Customer conversation

---

## Traces

> "I always open Langfuse before approving."
— Reddit, multiple engineers

> "I need to see the tool calls, not just the output."
— Customer interview

---

## Silent failures

> "HTTP 200 isn't evidence that the workflow succeeded."
— Reddit

> "The tool returned success. The user got nothing useful."
— Customer interview

---

## Behavior vs syntax

> "I don't care about the score. Show me where the behavior changed."
— Customer interview

> "The diff shows text changed. I need to know if the output changed."
— Reddit

---

## Prompt changes as deployments

> "Changing a prompt is a production change. I treat it the same way."
— Customer interview

> "We have a whole review process for model config changes. It's not just code."
— Tejas Bhakta

---

## Tool switching

> "I have six tabs open every time I review an AI PR."
— Reddit

> "I always end up leaving GitHub to check the traces."
— Customer interview

---

## Averages and aggregates

> "The average improved. That doesn't tell me which users broke."
— Reddit

> "P95 latency went down. One workflow is now timing out consistently."
— Reddit

---

## Human judgment

> "I'm not going to merge because a tool said it's fine."
— Customer interview

> "The package helps me think through the review. It doesn't replace my judgment."
— Product for Engineers newsletter response

---

## Add quotes below this line

<!-- 
Format:

> "Quote here."
— Source (Reddit / Interview / Newsletter / Feedback link / Observation)

-->
