import { createBrowserRouter } from "react-router-dom";
import Ask from "./routes/Ask.jsx";
import Answer from "./routes/Answer.jsx";
import App from "./App.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/ask", element: <Ask /> },
  { path: "/answer", element: <Answer /> },
]);
