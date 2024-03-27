---
title: What is a business? What is a company?
justification: >-
  one day, I want to have ownership of a company. I want to understand the
  legalities when I get to that point. I'm going to work through [the gov.uk
  guide](https://www.gov.uk/browse/business).
tags: []
---

There are multiple types of "business". These businesses all have in common that they _trade_ - that is, they sell goods and/or services. We often use the word "business" interchangeably with "company", but a company is just one type of business. Other types of business include "sole traders" and "partnerships". (Everything I'm writing here is specific to UK law.)

Different business types are registered with different bodies. Companies are registered with Companies House. Sole traders are registered with Her Majesty's Revenue and Customs (HMRC). Partnerships are also registered with HMRC.

The special thing about _companies_ is that they are legally similar to _people_. A limited company is classed as a "legal person". For example, the partners in a partnership are usually _people_, but since companies are legal persons, companies can be partners in a partnership too.

Companies are not flesh-and-blood people. They don't have brains or hands or bowel troubles. Companies do things because there are flesh-and-blood people related to that company. The company has directors, an optional secretary, and shareholders.

[Guidance says that "Another company can be a director, but at least one of your company’s directors must be a person."](https://www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries) By "person" here, they presumably mean "real, flesh-and-blood, non-company person". This inheritance relationship `class Company extends Person` soon becomes rather awkward! What this wants is an interface- or trait-based design, but I suppose the law was written during the 1990s OO madness.

Because a company is a person, its finances are like those of a person: the company can pay, be paid, and make profit. It can own things and owe things.

Because a company is not its directors or shareholders, those directors and shareholders are not _liable_ for things that the company is liable for. If the company is sued, the directors are not being sued. If the company has debt, this is not the debt of the directors.
