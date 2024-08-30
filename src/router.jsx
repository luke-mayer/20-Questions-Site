import { createBrowserRouter } from "react-router-dom";
import Ask from "./routes/Ask.jsx";
import Answer from "./routes/Answer.jsx";
// import App from "./App.jsx";
import Home from "./routes/Home.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/ask", element: <Ask /> },
  { path: "/answer", element: <Answer /> },
]);
