---
title: "Naturalness"
excerpt: "Computing and Tuning N-Gram entropy<br/><img src='/images/nature.jpeg'>"
collection: portfolio
---
# [Tuna](https://github.com/electricalwind/tuna/)

TUNA’ can retrieve Java source code contained in a public GitHub repository. As such, the module tuna-gitUtils includes a class GitClonePull, where one can specify a source repository and a destination folder before cloning or updating this repository.

TUNA can tokenize Java source code based on multiple representations (e.g., as UTF8 tokens, as programming language grammar’s lexical units, as sequences of nodes of the abstract syntax tree visited in depth-first or breadth-first order). To achieve this, the module tuna-tokenizer provide a factory named JavaFileTokenizerFactory, which provides methods to instantiate any tokenizer mentioned in our work.

With TUNA, one can parameterize n-gram models, train them based on tokenized source code, and compute the cross-entropy of one or more source files. To this end, the module tuna-modelling provides an interface NgramModel and an implementation of it, based on Kylm and named NgramModelKylmImpl. Following the interface segregation principle, alternative implementations can easily be added in the future.