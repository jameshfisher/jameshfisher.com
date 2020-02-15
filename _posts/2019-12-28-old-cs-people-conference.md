---
title: "Old people conference"
draft: true
---

Who should speak at QCon 2015?

How should speakers be picked for conferences?

My initial reaction was to use subjective criteria: 
have I seen them on YouTube? 
do I find them convincing? 
do I like the stuff they've done? 
do my friends name-drop them?

During this mental search I realized something: 
nearly all the good speakers are old. 
They are not the thirty-something upstarts from startups. 
They are the seventy-something giants who have been doing this for decades. 
Immediate corollary: many of the good speakers will soon be dead. 
These octogenarians, giants still working away in the field _that they created_, will soon never talk again.
Suddenly my subjective criteria became insignificant compared to an obvious two-axis way to rate potential speakers:

1. life expectancy.
2. influence on computer science.

If we can quantify both of these, 
we can draw a scatter plot in which the most desirable speakers are in one  corner.
First off we need a list of candidates. 
For that we can use Wikipedia, 
and find all people in the 'Computer scientists' category. 
The SPARQL endpoint on Dbpedia allows this. 
We of course restrict the candidates to ones that are still living.

To quantify life expectancy we can use the candidate's age and sex, 
and look it up in a  'life table'. 
Here's [a recent life table from the Social Security Administration](https://www.ssa.gov/oact/STATS/table4c6.html) 
which says, for example, that males aged 80 today are expected to live another 8.1 years. 
Dbpedia also records candidates' birth date which we can use to get their age.
To quantify influence on computer science - 
we've already restricted to computer scientists, 
so we just need to quantify influence in general.

As assets, humans follow a strange depreciation pattern: 
they get progressively more valuable with age, 
and then they suddenly die. 

For a list of candidates along with their age, we can use Dbpedia. 
It has a SPARQL endpoint that we can query.

```sparql
select distinct ?person, ?birthDate where {
  ?person a dbpedia-owl:Person.
  ?subcategory skos:broader?/skos:broader?/skos:broader category:Computer_scientists.
  ?person dcterms:subject ?subcategory.
  ?person dbpedia-owl:birthDate ?birthDate.
  optional { ?person dbpedia-owl:deathDate ?deathDate }.
  filter(!bound(?deathDate)).
}
order by ?birthDate
```

(I tried to use SPARQL to get the sex of the returned people, 
but the `dbpedia-owl:sex` property doesn't work.)


(This was originally planned back in 2015.)

https://docs.google.com/spreadsheets/d/1FGwhT4P5QsmEStopM3NY1RG-j9vO7qFSVdmQqsd-buw/edit?usp=sharing