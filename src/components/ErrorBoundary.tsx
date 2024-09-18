import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: "",
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { message: _.message, hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="video-container error-container">
          <img
            className="error-image"
            src="https://raw.githubusercontent.com/an678-mhg/tiktok-clone/main/public/error.png"
          />
          <h1 className="text-sm font-semibold error-message line-clamp-1">
            <span style={{ color: "#fff" }}>Error: </span> {this.state.message}
          </h1>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
