import { ConvexProvider, ConvexReactClient } from "convex/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-day-picker/style.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>,
  );
}
