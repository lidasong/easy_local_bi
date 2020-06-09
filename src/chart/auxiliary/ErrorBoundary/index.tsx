import React from "react";
import Placeholder from "./Placeholder";

interface Props {
  placeholder?: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<Props> {
  state = { hasError: false };

  static getDerivedStateFromProps(_: any, state: any) {
    if (!state.hasError) {
      return null;
    }
    return {
      hasError: false,
    };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  unstable_handleError() {
    this.setState({ hasError: true });
  }

  render() {
    const { placeholder = Placeholder, children } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      return placeholder;
    }
    return children;
  }
}
