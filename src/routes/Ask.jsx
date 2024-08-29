import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import QuestionTable from "./components/QuestionTable";
import { api_host, api_paths } from "../constants";
import { startSession, endSession } from "../api_calls.jsx";

const Ask = () => {
  const [showStart, setShowStart] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showWaking, setShowWaking] = useState(true);
  const [outQuestions, setOutQuestions] = useState(false);
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

  const effectRan = useRef(false); // Remove at DEPLOYMENT

  useEffect(() => {
    if (!effectRan.current) {
      startSession(
        setShowStart,
        setSessionId,
        setQuestionNum,
        setShowLoading,
        setShowError,
        setShowWaking
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
    }

    setShowLoading(true);

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

    setShowGuess(false);
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
          const identify_response = data["response"]; // Abe answer
          console.log(`abe_response: ${identify_response}`);
          setIdentifyResponse(identify_response);

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
      setShowLoading(false);
      setGuess("");
    }
  };

  return (
    <Stack height="100vh" align="center" justify="center" spacing={2}>
      {showError ? <Text>Error Text</Text> : null}
      {showWaking ? (
        <Text>
          Please wait for Abe to wake up. It could take 10 - 15 seconds.
        </Text>
      ) : null}
      {showOutQuestions ? (
        <Text>You have asked 20 questions. Please make a guess.</Text>
      ) : null}
      <InputGroup size="md" width="400px">
        <Input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          placeholder={
            outQuestions || showLoading
              ? "Please wait"
              : "Ask a yes or no question"
          }
          disabled={outQuestions || showLoading}
        />
        <InputRightElement width="4.5rem">
          <Button onClick={handleSend} colorScheme="teal" h="1.75rem" size="sm">
            Ask
          </Button>
        </InputRightElement>
      </InputGroup>
      {showGuess ? <Text color="blue">{identifyResponse}</Text> : null}
      {showSendRes ? <Text color="teal">Answer: {sendResponse}</Text> : null}
      {showTable ? <QuestionTable messages={messages} /> : null}
      <InputGroup size="md" width="300px">
        <Input
          type="text"
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleGuess()}
          placeholder={showLoading ? "Please wait" : "Guess the word"}
          disabled={showLoading}
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
    </Stack>
  );
};

export default Ask;
