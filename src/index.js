import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import { BrowserRouter } from "react-router-dom";
import { UserContextProvider } from "./context/UserContext";
import { LoaderContextProvider } from "./context/LoaderContext";
import { WishContextProvider } from "./context/WishContext";
import { CommentsContextProvider } from "./context/CommentsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserContextProvider>
    <LoaderContextProvider>
      <WishContextProvider>
        <CommentsContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CommentsContextProvider>
      </WishContextProvider>
    </LoaderContextProvider>
  </UserContextProvider>
);
