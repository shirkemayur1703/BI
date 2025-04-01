let openModalCallback = null;
let modalCloseCallback = null;

export class Modal {
  constructor({ resource, onClose, size, context }) {
    this.resource = resource;
    this.onClose = onClose;
    this.size = size;
    this.context = context;
  }

  open() {
    openModalCallback = this.onClose;
  }

  close() {
    if (modalCloseCallback) {
      modalCloseCallback();
    }
  }

  // Simulate the modal close and trigger the onClose callback
  triggerClose(ticket) {
    if (openModalCallback) {
      openModalCallback(ticket);
    }
  }

  // Simulate setting the callback after modal close
  setModalCloseCallback(callback) {
    modalCloseCallback = callback;
  }
}

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Edit from "../Edit";

// Import mock functions from the mocked forgeBridge.js file
import {
  invoke,
  __define,
  __reset,
  __setContext,
  __resetContext,
  Modal,
} from "@forge/bridge";

describe("Edit component - Initial Scenario", () => {
  beforeEach(() => {
    // Reset mocks and context before each test
    __reset();
    __resetContext();
  });

  test("displays only baseUrl input and login button when context is empty", async () => {
    // Mock the response of invoke("getBaseUrl")
    __define("getBaseUrl", async () => ({
      payload: "https://example.com",
    }));

    // Set the initial context to an empty gadgetConfiguration
    __setContext({
      extension: {
        gadgetConfiguration: {},
      },
    });

    render(<Edit />);

    // Wait for baseUrl to be populated in the input field
    await waitFor(() => {
      const baseUrlInput = screen.getByLabelText("eQube-BI URL");
      expect(baseUrlInput.value).toBe("https://example.com");  // Assert value of input field
    });

    // Ensure invoke("getBaseUrl") was called
    expect(invoke).toHaveBeenCalledWith("getBaseUrl");

    // Ensure view.getContext was called and gadgetConfiguration is empty
    const ctx = await view.getContext();
    expect(ctx.extension.gadgetConfiguration).toEqual({});

    // Simulate the modal being opened and closed
    const modal = new Modal({
      resource: "modal",
      onClose: jest.fn(),
      size: "max",
      context: { baseUrl: "https://example.com" },
    });

    // Open modal and trigger onClose
    modal.open();
    modal.triggerClose("fake-ticket");

    // Check if the onClose callback was called
    expect(modal.onClose).toHaveBeenCalledWith("fake-ticket");
  });
});
