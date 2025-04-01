let modalInstances = [];

export class Modal { constructor({ resource, onClose, size, context }) { this.resource = resource; this.onClose = onClose; this.size = size; this.context = context; modalInstances.push(this); }

open() { this.isOpen = true; }

close(ticket = null) { this.isOpen = false; if (this.onClose) { this.onClose(ticket); } } }

export function __getModalInstances() { return modalInstances; }

export function __resetModals() { modalInstances = []; }

test("closes modal and triggers onClose with ticket", async () => {
  const mockOnClose = jest.fn();
  const modal = new Modal({ resource: "modal", onClose: mockOnClose });

  // Open and close the modal with a mock ticket
  modal.open();
  modal.close("mock_ticket");

  expect(mockOnClose).toHaveBeenCalledWith("mock_ticket");
});

import { render, screen } from "@testing-library/react";
import Edit from "../Edit";
import { __getModalInstances, __resetModals } from "../mocks/Modal"; // Adjust the path if needed

describe("Edit component - Modal Behavior", () => {
  beforeEach(() => {
    __resetModals();
  });

  test("opens modal when login button is clicked", async () => {
    render(<Edit />);
    
    // Click on Login button
    screen.getByText("Login").click();
    
    // Verify modal is created and opened
    const modals = __getModalInstances();
    expect(modals.length).toBe(1);
    expect(modals[0].isOpen).toBe(true);
  });

  test("closes modal and provides a ticket", async () => {
    render(<Edit />);
    
    // Click on Login button to open modal
    screen.getByText("Login").click();

    // Get the modal instance and close it with a mock ticket
    const modals = __getModalInstances();
    expect(modals.length).toBe(1);
    modals[0].close("mock_ticket");

    // Verify modal is closed
    expect(modals[0].isOpen).toBe(false);
  });
});
