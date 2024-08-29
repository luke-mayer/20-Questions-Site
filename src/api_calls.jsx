import { api_host, api_paths } from "./constants.jsx";

export const endSession = ({ sessionId }) => {
  console.log(`In endSession ${sessionId}`);
  if (!sessionId) return;
  console.log("Ending current session");

  const endUrl = api_host + api_paths["end"];
  const endOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      session_id: sessionId,
      Accept: "application/json",
      mock: "false", // TODO: Set to false for real AI integration
    },
  };

  console.log("Calling DELETE %s...", endUrl);

  try {
    fetch(endUrl, endOptions)
      .then((response) => {
        if (!response) {
          throw new Error(`No response received from backend`);
        }

        console.log(`Received response from backend`);
        if (response.status == 204) {
          return response.json();
        }

        throw new Error(
          `Backend responded with status code ${response.status}`
        );
      })
      .then((data) => {
        const session_id = data["session_id"];
        console.log(
          `Successfully deleted session from Abe with Session ID ${session_id}"`
        );
      });
  } catch (error) {
    throw new Error(`Error while deleting session: ${error}`);
  }
};

export const startSession = (
  setShowStart,
  setSessionId,
  setQuestionNum,
  setShowLoading,
  setShowError,
  setShowWaking
) => {
  setShowWaking(true);
  console.log("Creating new session");

  const startUrl = api_host + api_paths["start"];
  const startOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      role: "answerer",
      mock: "false", // TODO: Set to false for real AI integration
    },
  };

  setShowStart(false);
  setShowLoading(true);
  console.log("Calling POST %s...", startUrl);

  try {
    fetch(startUrl, startOptions)
      .then((response) => {
        if (!response) {
          throw new Error(`No response received from backend`);
        }

        console.log(`Received response from backend`);
        if (response.status == 201) {
          return response.json();
        }

        throw new Error(
          `Backend responded with status code ${response.status}`
        );
      })
      .then((data) => {
        console.log("In .then(data)");
        const session_id = data["session_id"];
        const question_num = data["question_number"];
        const abe_response = data["response"];

        console.log(
          `Received initial response from DuMa for Session ID ${session_id}: "${abe_response}"`
        );
        setSessionId(session_id);
        setQuestionNum(question_num);
        setShowWaking(false);
        setShowLoading(false);
        // setShowTable(true);
      });
  } catch (error) {
    console.error(`Error while starting new session: ${error}`);
    setShowError(true);
  } finally {
    // setShowLoading(false);
  }
};
