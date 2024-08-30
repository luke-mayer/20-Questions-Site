import {
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import QuestionTable from "../components/QuestionTable.jsx";
import { api_host, api_paths } from "../constants";
import { startSession, endSession } from "../api_calls.jsx";
import HeaderMain from "../components/HeaderMain.jsx";

const Ask = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showWaking, setShowWaking] = useState(true);
  const [outQuestions, setOutQuestions] = useState(false);
  const [outGuesses, setOutGuesses] = useState(false);
  const [showOutQuestions, setShowOutQuestions] = useState(false);
  const [showSendRes, setShowSendRes] = useState(false);
  const [sendResponse, setSendResponse] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [showError, setShowError] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [guess, setGuess] = useState("");
  const [showGuess, setShowGuess] = useState(false);
  const [identifyResponse, setIdentifyResponse] = useState("");
  const [questionNum, setQuestionNum] = useState(0);
  const [guessNum, setGuessNum] = useState(0);
  const [quit, setQuit] = useState(false);
  const [solution, setSolution] = useState("");
  const [correct, setCorrect] = useState(false);

  const effectRan = useRef(false); // Remove at DEPLOYMENT

  useEffect(() => {
    if (!effectRan.current) {
      startSession(
        setSessionId,
        setQuestionNum,
        setShowLoading,
        setShowError,
        setShowWaking,
        setSolution
      );
      return () => {
        // REMOVE AT DEPLOYMENT
        effectRan.current = true;
      };
    } else {
      window.addEventListener("beforeunload", alertUser);
      window.addEventListener("unload", endSession({ sessionId }));
      return () => {
        window.removeEventListener("beforeunload", alertUser);
        window.removeEventListener("unload", endSession({ sessionId }));
      };
    }
  }, []);

  const alertUser = (event) => {
    event.preventDefault();
    event.returnValue = "";
  };

  const handleSend = () => {
    if (!input) return;
    if (questionNum >= 20) {
      setOutQuestions(true);
      setShowOutQuestions(true);
      return;
    }

    setShowLoading(true);
    setShowGuess(false);

    console.log(`Received user input: "${input}" for session ID ${sessionId}`);

    const iterateUrl = api_host + api_paths["iterate"];
    const iterateOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        mock: "true", // TODO: Set to false for real AI integration
      },
      body: JSON.stringify({
        session_id: sessionId,
        prompt: input,
      }),
    };

    console.log(`Calling PUT ${iterateUrl}...`);
    try {
      fetch(iterateUrl, iterateOptions)
        .then((response) => {
          if (!response) {
            throw new Error(`No response received from backend`);
          }

          console.log(`Received response from backend`);
          if (response.status == 200) {
            return response.json();
          }

          throw new Error(
            `Backend responded with status code ${response.status}`
          );
        })
        .then((data) => {
          console.log(`In iterate get abe_response`);
          const abe_response = data["response"]; // Abe answer
          console.log(`abe_response: ${abe_response}`);
          setSendResponse(abe_response);
          const cur_question_num = Number(data["question_number"]);
          setQuestionNum(cur_question_num);

          const message = {
            // Compiling question-answer info for table
            q_num: cur_question_num,
            question: input,
            answer: abe_response,
          };

          if (cur_question_num >= 20) {
            setOutQuestions(true);
            setShowOutQuestions(true);
          }

          console.log(
            `Received response from DuMa: "${abe_response}""${cur_question_num}""${input}"`
          );

          setMessages((prevMessages) => [message, ...prevMessages]);
          setShowTable(true);
          setShowSendRes(true);
          setShowLoading(false);
        });
    } catch (error) {
      console.error(`Error while sending message to backend: ${error}`);
      setShowError(true);
    } finally {
      setInput("");
    }
  };

  const handleGuess = () => {
    if (!guess) return;

    if (guessNum >= 3) {
      setOutGuesses(true);
      return;
    }

    setShowLoading(true);

    console.log(`Received user guess: "${guess}" for session ID ${sessionId}`);

    const identifyUrl = api_host + api_paths["identify"];
    const identifyOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        mock: "true", // TODO: Set to false for real AI integration
      },
      body: JSON.stringify({
        session_id: sessionId,
        guess: guess,
      }),
    };

    console.log(`Calling PUT ${identifyUrl}...`);
    try {
      fetch(identifyUrl, identifyOptions)
        .then((response) => {
          if (!response) {
            throw new Error(`No response received from backend`);
          }

          console.log(`Received response from backend`);
          if (response.status == 200) {
            return response.json();
          }

          throw new Error(
            `Backend responded with status code ${response.status}`
          );
        })
        .then((data) => {
          console.log(`In identify get abe_response`);
          const is_correct = data["response"] === "true"; // Abe answer
          console.log(`abe_response: ${is_correct}`);

          setCorrect(is_correct);
          const identify_response = is_correct
            ? `Congratulations, "${guess}" is correct! You found the word after ${questionNum} questions. Return home to play again.`
            : `Sorry, "${guess}" is incorrect. You have ${
                2 - guessNum
              } guesses remaining`;
          setIdentifyResponse(identify_response);

          setGuessNum(guessNum + 1);

          if (guessNum >= 3) {
            setOutGuesses(true);
          }

          console.log(
            `Received response from DuMa: "${identify_response}""${guess}"`
          );

          setShowSendRes(false);
          setShowGuess(true);
          setShowLoading(false);
        });
    } catch (error) {
      console.error(`Error while sending message to backend: ${error}`);
      setShowError(true);
    } finally {
      setGuess("");
    }
  };

  const handleQuit = (event) => {
    event.preventDefault();
    console.log("In handleQuit");
    const confirmation = window.confirm(
      "Are you sure? This will end the game."
    );
    confirmation ? setQuit(true) : null;
  };

  return (
    <Flex
      h="100vh"
      direction="column"
      divider={<StackDivider borderColor="gray.200" />}
    >
      <HeaderMain />
      <Stack
        height="100%"
        align="center"
        justify="center"
        spacing={2}
        fontSize="lg"
      >
        {showError ? (
          <Flex>
            <Text fontSize="lg">Error Text</Text>
          </Flex>
        ) : null}
        {showTable ? null : (
          <VStack fontSize="lg">
            <Text>
              1. Please ask questions in a <b>yes-or-no</b> format - Failure to
              do so will forfeit a question.
            </Text>
            <Text>
              2. The word to guess will be a <b>single, concrete noun</b> (i.e.,
              an object, a body part, an animal, etc.,).
            </Text>
            <Text>
              3. You can ask up to <b>20 questions</b> and make up to{" "}
              <b>3 guesses</b>.
            </Text>
            <Text color="#3182CE">
              Note - It can take Abe several seconds of contemplation before he
              responds. He appreciates your patience.
            </Text>
            <Text color="teal">Thank you for playing and good luck!</Text>
          </VStack>
        )}
        {showWaking ? (
          <Text fontSize="lg">
            Please wait for Abe to wake up. It could take 10 - 15 seconds.
          </Text>
        ) : null}
        {showOutQuestions ? (
          <Text fontSize="lg">
            You have asked 20 questions. Please make a guess.
          </Text>
        ) : null}
        {outGuesses ? (
          <Text fontSize="lg">
            You have used all 3 guesses. Please return home to try again or
            click <q>Show Solution</q> to see the word.
          </Text>
        ) : null}
        {quit ? (
          <Text fontSize="lg">
            The word you were trying to guess was <q>{solution}</q>. Please
            return home and try again.
          </Text>
        ) : null}
        <InputGroup size="md" width="400px">
          <Input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
            placeholder={
              outQuestions || showLoading || outGuesses || quit || correct
                ? "Please wait"
                : "Ask a yes or no question"
            }
            disabled={
              outQuestions || showLoading || outGuesses || quit || correct
            }
          />
          <InputRightElement width="4.5rem">
            <Button
              onClick={handleSend}
              colorScheme="teal"
              h="1.75rem"
              size="sm"
            >
              Ask
            </Button>
          </InputRightElement>
        </InputGroup>
        {showGuess ? (
          <Text color={correct ? "#3182CE" : "red"}>{identifyResponse}</Text>
        ) : null}
        {showSendRes ? (
          <Text fontSize="lg" color="#3182CE">
            Answer: {sendResponse}
          </Text>
        ) : null}
        {showTable ? <QuestionTable messages={messages} /> : null}
        <HStack>
          <InputGroup size="md" width="300px">
            <Input
              type="text"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleGuess()}
              placeholder={
                showLoading || outGuesses || quit || correct
                  ? "Please wait"
                  : "Guess the word"
              }
              disabled={showLoading || outGuesses || quit || correct}
            />
            <InputRightElement width="4.5rem">
              <Button
                onClick={handleGuess}
                colorScheme="teal"
                h="1.75rem"
                size="sm"
              >
                Guess
              </Button>
            </InputRightElement>
          </InputGroup>
          <Button onClick={handleQuit} colorScheme="red" h="1.75rem" size="sm">
            Show Solution
          </Button>
        </HStack>
      </Stack>
    </Flex>
  );
};

export default Ask;
