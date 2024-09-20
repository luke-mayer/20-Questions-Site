<div align="center">
<h2> Abe - The Honest 20 Questions Bot </h2>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#overview">Overview</a>
    </li>
    <li>
      <a href="#how-it-works">How It Works</a>
    </li>
    <li>
      <a href="#tech-stack">Tech Stack</a>
      <ul>
        <li><a href="#front-end">Front-End</a></li>
        <li><a href="#backend">Backend</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## Overview

Did you know, ChatGPT and other large language models are no good cheats!? At least when it comes
down to good old-fashioned 20 Questions, the game in which one person thinks of an object and another
person asks them 20 yes-or-no questions with the goal of being able to deduce what that object is. Well,
if you play this game with ChatGPT, they will answer your questions and they'll even tell you the object
they were thinking of at the end. However, they are actually incapable of choosing an object to begin with.
If you roll back the conversation a little bit after they have revealed their object and ask them different questions, they will tell you a different object. In short, they cheat.

I'll tell you who doesn't cheat though: Abe, the Honest 20 Questions Bot. Abe actually chooses an object,
remembers it for the whole game, and is honest and consistent about what it is at the end of the game. Think
you can deduce what object Abe is thinking of? Then ask him your 20 questions at the link below.

Link - [https://abe20questions.com](https://abe20questions.com)

## How It Works

Abe is powered by OpenAI API, however, there are few key tweaks and additions that allow Abe to do what regular ChatGPT cannot. The main reason that ChatGPT and other LLMs are incapable of fairly playing 20 Questions is that they rely on their conversation history for context. It is basically the only "memory" they have. This means that they aren't able to pick an object and remember it unless they say what it is at the outset of the conversation (which would ruin the whole premise of the game).

In Abe's case, one change is that the OpenAI model does not actually choose the object. Instead, a
an object is selected from a list of over 500 concrete nouns at random. This allows the object
to be stored independently of the model. In order to allow Abe to accurately answer yes-or-no
questions concerning the nature of the object, the noun is told to the model behind the scenes in
order to prevent the user from prematurely knowing what the object is. This allows the OpenAI model
to have the object in its conversational history without the game being spoiled.

When the user is ready to guess the object, their input is compared against the object stored
in the independent backend memory as an extra layer of protection to ensure that the model does
not change the object or tell the user they are correct when they are not in an effort to be
agreeable.

Prompt engineering is also utilized to instruct the model to never disclose the object, even if the user explicitely asks it to, and to only answer "yes" or "no" to yes-or-no questions. In the case that the user asks questions that are not in the yes-or-no format, the model is instructed to
correct the user and request that they ask only yes-or-no questions. In this instance, the user would forfiet one of their 20 questions.

## Tech Stack

This was developed as a full-stack web application utilizing AWS serverless cloud computing. The used languages, frameworks, libraries, and APIs are outlined below:

### Front-End

- React.js + Vite
- Chakra UI (React component library)
- AWS Amplify (site hosting)
- AWS Route 53 (custom domain name)

### Back-End

- AWS API Gateway (Restful HTTP API endpoints)
- Python (hosted with AWS Lambda)
- AWS DynamoDB (NoSQL database used to store session data and the object)
- OpenAI API

## Contact

LinkedIn - [https://www.linkedin.com/in/luke-mayer316/](https://www.linkedin.com/in/luke-mayer316/)  
HandShake - [https://umd.joinhandshake.com/profiles/50652472](https://umd.joinhandshake.com/profiles/50652472)  
Portfolio Site - [https://www.lukemayer.com](https://www.lukemayer.com)

## Acknowledgments

This project was inspired by the episode ["There are monsters in your LLM."](https://youtu.be/ztNdagyT8po?si=fHDZF8ycAWKt5xG1&t=666) of the Machine Learning Street Talk podcast with guest, Professor Murray Shanahan. This episode discussed how ChatGPT and other LLMs were incapable of fairly playing the 20 Questions game. I created this project to try to remedy this inability.
