const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "index.html");
const html = fs.readFileSync(filePath, "utf-8");

beforeAll(() => {
  const mockLocalStorage = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => (store[key] = value.toString()),
      clear: () => (store = {}),
      removeItem: (key) => delete store[key],
    };
  })();
  Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
});

beforeEach(() => {
  document.documentElement.innerHTML = html.toString();
  ({
    updateUserTable,
    updateGroupTable,
    updateRoleTable,
  } = require("./main.js"));
  jest.resetModules();
  localStorage.clear();
});

afterEach(() => {
  jest.resetModules();
  localStorage.clear();
});

function verifySidebarComponents() {
  const sidebar = document.querySelector(".sidebar");
  const sidebarHeader = document.querySelector(".sidebar-header");
  const sidebarHeading = document.querySelector("#sidebar-heading");
  const menuicon = document.querySelector(".fas.fa-bars");
  const toggleBtn = document.querySelector(".toggle-btn");

  expect(sidebar).toBeTruthy();
  expect(sidebarHeader).toBeTruthy();
  expect(sidebarHeading).toBeTruthy();
  expect(sidebarHeading.textContent).toBe("MENU");
  expect(menuicon).not.toBeNull();
  expect(toggleBtn.disabled).toBeFalsy();
}

function verifySidebarTabs() {
  const usersTab = document.querySelector("#users-tab");
  const groupsTab = document.querySelector("#groups-tab");
  const rolesTab = document.querySelector("#roles-tab");

  expect(usersTab).toBeTruthy();
  expect(usersTab.disabled).toBeFalsy();
  expect(groupsTab).toBeTruthy();
  expect(groupsTab.disabled).toBeFalsy();
  expect(rolesTab).toBeTruthy();
  expect(rolesTab.disabled).toBeFalsy();

  expect(usersTab.querySelector("span").textContent).toBe("USERS");
  expect(groupsTab.querySelector("span").textContent).toBe("GROUPS");
  expect(rolesTab.querySelector("span").textContent).toBe("ROLES");

  expect(document.querySelector(".fas.fa-user")).not.toBeNull();
  expect(document.querySelector(".fas.fa-users")).not.toBeNull();
  expect(document.querySelector(".fas.fa-user-shield")).not.toBeNull();
}

function testSidebarToggle(tabId) {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector("#main");
  const tab = document.querySelector(`#${tabId}`);

  // Click on the tab to activate it
  tab.click();

  // Initially, the sidebar should be open
  expect(sidebar.classList.contains("closed")).toBe(false);
  expect(mainContent.classList.contains("expanded")).toBe(false);

  // Toggle the sidebar
  document.querySelector(".toggle-btn").click();

  // After toggle, sidebar should be closed and main content expanded
  expect(sidebar.classList.contains("closed")).toBe(true);
  expect(mainContent.classList.contains("expanded")).toBe(true);

  // Toggle again to open the sidebar
  document.querySelector(".toggle-btn").click();

  // After toggle, sidebar should be open and main content not expanded
  expect(sidebar.classList.contains("closed")).toBe(false);
  expect(mainContent.classList.contains("expanded")).toBe(false);
}

test("should verify the presence of title and container", () => {
  const title = document.querySelector("title");
  const container = document.querySelector(".container");

  expect(title).toBeTruthy();
  expect(title.textContent).toBe("Management System");
  expect(container).toBeTruthy();
});

describe("User Management System", () => {
  test("should verify the presence of sidebar, main content, and user table structure", () => {
    // Verify Sidebar Components
    verifySidebarComponents();
    verifySidebarTabs();
    testSidebarToggle("users-tab");

    // Verify Main Content Area and Headings
    const mainContent = document.querySelector("#main");
    const mainHeading = document.querySelector("#main-heading");
    const addUserSection = document.querySelector(".add-user");
    const usersList = document.querySelector(".users-list");

    expect(mainContent).toBeTruthy();
    expect(mainHeading).toBeTruthy();
    expect(mainHeading.textContent).toBe("USER MANAGEMENT");
    expect(addUserSection).toBeTruthy();
    expect(usersList).toBeTruthy();
    expect(usersList.querySelector("h2").textContent).toBe("Users List");

    // Verify Alert and 'Create User' Button
    const alert = document.querySelector(".alert");
    const createButton = document.querySelector(".create-btn");
    const createButtonText = createButton.querySelector("button");

    expect(alert).toBeTruthy();
    expect(createButton).toBeTruthy();
    expect(createButton.disabled).toBeFalsy();
    expect(createButtonText.textContent.trim()).toBe("CREATE USER");
    expect(document.querySelector(".fas.fa-user-plus")).not.toBeNull();

    // Verify User Table Structure and Headers
    const tableContainer = document.querySelector(".table");
    const userTable = document.querySelector(".user-table");

    expect(tableContainer).toBeTruthy();
    expect(userTable).toBeTruthy();
    expect(userTable.querySelector("thead")).toBeTruthy();
    expect(userTable.querySelector("tbody")).toBeTruthy();

    const headers = document.querySelectorAll(".user-table th");
    const headerTexts = [
      "USER ID",
      "USERNAME",
      "EMAIL ID",
      "FIRST NAME",
      "LAST NAME",
      "ACTIONS",
    ];
    expect(headers.length).toBe(headerTexts.length);
    headers.forEach((header, index) => {
      expect(header.textContent).toBe(headerTexts[index]);
    });

    // Verify Empty User Table Displays 'No users found'
    const table = document.querySelector(".user-table tbody");
    const rows = table.querySelectorAll("tr");

    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll("td");
    expect(cells[0].textContent.trim()).toBe("No users found");
  });

  test("should open and close the modal and verify the presence and correct attributes of modal and form elements", () => {
    // Open the modal
    const openModalButton = document.querySelector(".create-btn button");
    const modal = document.querySelector("#userModal");

    openModalButton.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    // Check modal presence and attributes
    expect(modal).toBeTruthy();

    const modalHead = document.querySelector("#userManagement .modal-head");
    const modalHeading = document.querySelector(
      "#userManagement .modal-heading"
    );
    const closeIcon = document.querySelector(
      "#userManagement .fa-regular.fa-circle-xmark"
    );

    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent.trim()).toBe("CREATE USER");
    expect(closeIcon).not.toBeNull();

    // Check form presence
    const form = document.querySelector("#addUserForm");
    expect(form).toBeTruthy();

    // Check form fields and their attributes
    const fields = {
      username: { selector: "#username", type: "text", required: true },
      email: { selector: "#email", type: "email", required: true },
      firstname: { selector: "#firstname", type: "text", required: true },
      lastname: { selector: "#lastname", type: "text", required: true },
    };

    for (const key in fields) {
      const field = document.querySelector(fields[key].selector);
      expect(field).toBeTruthy();
      expect(field.getAttribute("type")).toBe(fields[key].type);
      expect(field.hasAttribute("required")).toBe(fields[key].required);
      expect(field.value).toBe("");
    }

    // Check form field labels and mandatory indicators
    const labels = {
      username: "USERNAME :",
      email: "EMAIL ID :",
      firstName: "FIRST NAME :",
      lastName: "LAST NAME :",
    };

    for (const key in labels) {
      const label = document.querySelector(`label[for="${key}"]`);
      expect(label).not.toBeNull();

      const expectedLabel =
        `<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>${labels[key]}`.replace(
          /\s+/g,
          ""
        );
      const receivedLabel = label.innerHTML.replace(/\s+/g, "");

      expect(receivedLabel).toBe(expectedLabel);
    }

    // Check the presence and state of 'Add User' and 'Reset' buttons
    const addUserButton = document.querySelector("#addUser");
    const resetFormButton = document.querySelector("#resetUserForm");
    expect(addUserButton).toBeTruthy();
    expect(addUserButton.disabled).toBeFalsy();
    expect(resetFormButton).toBeTruthy();
    expect(resetFormButton.disabled).toBeFalsy();

    // Close the modal
    const closeModalButton = document.querySelector("#closeUserModal");

    closeModalButton.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  describe("Form Validation Tests", () => {
    const fillFormFields = ({ username, email, firstname, lastname }) => {
      document.querySelector("#username").value = username || "";
      document.querySelector("#email").value = email || "";
      document.querySelector("#firstname").value = firstname || "";
      document.querySelector("#lastname").value = lastname || "";
    };

    const formMessageCheck = async (expectedMessage) => {
      const formMessage = document.querySelector("#userFormMessage");
      document.querySelector("#addUser").click();
      expect(formMessage.textContent).toContain(expectedMessage);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(formMessage.textContent).toBe("");
    };

    test("should show error message for missing all fields", async () => {
      fillFormFields({ username: "", email: "", firstname: "", lastname: "" });
      await formMessageCheck("All fields are required.");
    });

    test("should show error message for missing username", async () => {
      fillFormFields({
        username: "",
        email: "alice.jones@example.com",
        firstname: "Alice",
        lastname: "Jones",
      });
      await formMessageCheck("All fields are required.");
    });

    test("should show error message for missing email", async () => {
      fillFormFields({
        username: "alicej",
        email: "",
        firstname: "Alice",
        lastname: "Jones",
      });
      await formMessageCheck("All fields are required.");
    });

    test("should show error message for missing first name", async () => {
      fillFormFields({
        username: "alicej",
        email: "alice.jones@example.com",
        firstname: "",
        lastname: "Jones",
      });
      await formMessageCheck("All fields are required.");
    });

    test("should show error message for missing last name", async () => {
      fillFormFields({
        username: "alicej",
        email: "alice.jones@example.com",
        firstname: "Alice",
        lastname: "",
      });
      await formMessageCheck("All fields are required.");
    });

    test("should not show any error message when all fields are valid", async () => {
      const formMessage = document.querySelector("#userFormMessage");

      fillFormFields({
        username: "alicej",
        email: "alice.jones@example.com",
        firstname: "Alice",
        lastname: "Jones",
      });
      document.querySelector("#addUser").click();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(formMessage.textContent).toBe("");
    });

    test("should show error message for existing email", async () => {
      // First user with a unique email
      fillFormFields({
        username: "Jackie",
        email: "jack@gmail.com",
        firstname: "Jackie",
        lastname: "Chan",
      });
      document.querySelector("#addUser").click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const formMessage = document.querySelector("#userFormMessage");

      // Second user with a duplicate email
      fillFormFields({
        username: "Jack",
        email: "jack@gmail.com",
        firstname: "Jack",
        lastname: "Ma",
      });
      document.querySelector("#addUser").click();

      // Expecting an error message for duplicate email
      expect(formMessage.textContent).toContain("Email already exists.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(formMessage.textContent).toBe(""); // Message should disappear after 2 seconds
    });

    test("should show error message for existing username", async () => {
      // First user with a unique username
      fillFormFields({
        username: "Jackie",
        email: "jackie@gmail.com",
        firstname: "Jackie",
        lastname: "Chan",
      });
      document.querySelector("#addUser").click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const formMessage = document.querySelector("#userFormMessage");

      // Second user with a duplicate username
      fillFormFields({
        username: "Jackie",
        email: "jack@gmail.com",
        firstname: "Jack",
        lastname: "Ma",
      });
      document.querySelector("#addUser").click();

      // Expecting an error message for duplicate username
      expect(formMessage.textContent).toContain("Username already exists.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(formMessage.textContent).toBe(""); // Message should disappear after 2 seconds
    });
  });

  test("should reset form fields after user submission", async () => {
    // Fill in and submit the form
    document.querySelector("#username").value = "Jackie";
    document.querySelector("#email").value = "jackie@gmail.com";
    document.querySelector("#firstname").value = "Jackie";
    document.querySelector("#lastname").value = "Chan";
    document.querySelector("#addUser").click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check form reset
    document.querySelector("#resetUserForm").click();
    expect(document.querySelector("#username").value).toBe("");
    expect(document.querySelector("#email").value).toBe("");
    expect(document.querySelector("#firstname").value).toBe("");
    expect(document.querySelector("#lastname").value).toBe("");
  });

  test("should successfully add a user, update localStorage, and display Edit and Delete buttons", async () => {
    // Fill in and submit the form
    document.querySelector("#username").value = "Jackie";
    document.querySelector("#email").value = "jackie@gmail.com";
    document.querySelector("#firstname").value = "Jackie";
    document.querySelector("#lastname").value = "Chan";
    document.querySelector("#addUser").click();

    // Check alert message
    const alertDiv = document.querySelector(".alert");
    expect(alertDiv.innerHTML).toContain("User added successfully!");

    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");

    // Check localStorage
    const users = JSON.parse(localStorage.getItem("users"));
    expect(users.length).toBeGreaterThan(0);
    const newUser = users.find((user) => user.email === "jackie@gmail.com");
    expect(newUser).toBeTruthy();
    expect(newUser.username).toBe("Jackie");
    expect(newUser.firstName).toBe("Jackie");
    expect(newUser.lastName).toBe("Chan");

    // Check UI update
    const table = document.querySelector(".user-table tbody");
    const rows = table.querySelectorAll("tr");
    expect(rows.length).toBeGreaterThan(0);

    const cells = rows[0].querySelectorAll("td");
    expect(cells[1].textContent.trim()).toBe("Jackie");
    expect(cells[2].textContent.trim()).toBe("jackie@gmail.com");
    expect(cells[3].textContent.trim()).toBe("Jackie");
    expect(cells[4].textContent.trim()).toBe("Chan");

    // Check Edit and Delete buttons
    rows.forEach((row, index) => {
      const editButton = row.querySelector(".edit-btn");
      const deleteButton = row.querySelector(".delete-btn");

      expect(editButton).not.toBeNull();
      expect(deleteButton).not.toBeNull();
      expect(editButton.disabled).toBeFalsy();
      expect(deleteButton.disabled).toBeFalsy();
      expect(editButton.dataset.id).toBe((index + 1).toString());
      expect(deleteButton.dataset.id).toBe((index + 1).toString());
      expect(editButton.innerHTML).toContain(
        '<i class="fas fa-edit"></i><span>Edit</span>'
      );
      expect(deleteButton.innerHTML).toContain(
        '<i class="fas fa-trash"></i><span>Delete</span>'
      );
    });
  });

  test("should handle user edits correctly", async () => {
    // Add a user
    document.querySelector("#username").value = "Jackie";
    document.querySelector("#email").value = "jackie@gmail.com";
    document.querySelector("#firstname").value = "Jackie";
    document.querySelector("#lastname").value = "Chan";
    document.querySelector("#addUser").click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check that user is added to local storage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const addedUser = users.find((user) => user.email === "jackie@gmail.com");
    expect(addedUser).toBeDefined();
    expect(addedUser.username).toBe("Jackie");
    expect(addedUser.firstName).toBe("Jackie");
    expect(addedUser.lastName).toBe("Chan");

    // Click the edit button
    const editButton = document.querySelector('.edit-btn[data-id="1"]');
    editButton.click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check pre-filled values in the form
    expect(document.querySelector("#username").value).toBe("Jackie");
    expect(document.querySelector("#email").value).toBe("jackie@gmail.com");
    expect(document.querySelector("#firstname").value).toBe("Jackie");
    expect(document.querySelector("#lastname").value).toBe("Chan");

    // Update user information
    document.querySelector("#username").value = "Jackie Updated";
    document.querySelector("#email").value = "jackieupdated@gmail.com";
    document.querySelector("#firstname").value = "Jackie";
    document.querySelector("#lastname").value = "Chan Updated";
    document.querySelector("#addUser").textContent = "Update User";
    document.querySelector("#addUser").click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify updated user in the UI
    const userRow = document.querySelector(".user-table tbody tr");
    expect(userRow.cells[1].textContent).toBe("Jackie Updated");
    expect(userRow.cells[2].textContent).toBe("jackieupdated@gmail.com");
    expect(userRow.cells[3].textContent).toBe("Jackie");
    expect(userRow.cells[4].textContent).toBe("Chan Updated");

    // Check that user information is updated in local storage
    const updatedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUser = updatedUsers.find(
      (user) => user.email === "jackieupdated@gmail.com"
    );
    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe("Jackie Updated");
    expect(updatedUser.firstName).toBe("Jackie");
    expect(updatedUser.lastName).toBe("Chan Updated");

    // Verify success alert message for update
    const alertDiv = document.querySelector(".alert");
    expect(alertDiv.innerHTML).toContain("User updated successfully!");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");
  });

  test("should handle user deletions correctly", async () => {
    // Ensure a user is added for deletion testing
    document.querySelector("#username").value = "Jackie";
    document.querySelector("#email").value = "jackie@gmail.com";
    document.querySelector("#firstname").value = "Jackie";
    document.querySelector("#lastname").value = "Chan";
    document.querySelector("#addUser").click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click the delete button
    window.confirm = jest.fn().mockImplementation(() => true);
    const deleteButton = document.querySelector('.delete-btn[data-id="1"]');
    deleteButton.click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify deletion in the UI
    const userRowAfterDelete = document.querySelector(".user-table tbody tr");
    expect(userRowAfterDelete.textContent).toBe("No users found");

    // Check that user information is removed from local storage
    const usersAfterDelete = JSON.parse(localStorage.getItem("users")) || [];
    const deletedUser = usersAfterDelete.find(
      (user) => user.email === "jackie@gmail.com"
    );
    expect(deletedUser).toBeUndefined();

    // Verify success alert message for deletion
    const alertDiv = document.querySelector(".alert");
    expect(alertDiv.innerHTML).toContain("User deleted successfully!");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");
  });

  test("should renumber user IDs sequentially after a deletion", async () => {
    document.querySelector("#username").value = "CharlieBrown";
    document.querySelector("#email").value = "charlie.brown@example.com";
    document.querySelector("#firstname").value = "Charlie";
    document.querySelector("#lastname").value = "Brown";
    document.querySelector("#addUser").click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    document.querySelector("#username").value = "DavidWilliams";
    document.querySelector("#email").value = "david.williams@example.com";
    document.querySelector("#firstname").value = "David";
    document.querySelector("#lastname").value = "Williams";
    document.querySelector("#addUser").click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate deleting the first user
    window.confirm = jest.fn().mockImplementation(() => true);
    const deleteButton = document.querySelector('.delete-btn[data-id="1"]');
    deleteButton.click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Re-check user IDs in the localStorage
    const updatedUsers = JSON.parse(localStorage.getItem("users"));
    expect(updatedUsers[0].id).toBe(1);
  });
});

describe("Group Management System", () => {
  beforeEach(() => {
    const groupsTab = document.querySelector("#groups-tab");
    groupsTab.click();
  });
  test("should verify the sidebar, main content area, and group table structure comprehensively", () => {
    // Verify the presence of sidebar and its components
    verifySidebarComponents();
    verifySidebarTabs();

    // Test sidebar toggle for the Users tab
    testSidebarToggle("users-tab");

    // Switch to Groups tab and verify main content area and headings
    const groupsTab = document.querySelector("#groups-tab");
    groupsTab.click();

    const mainContent = document.querySelector("#groupManagement");
    const mainHeading = document.querySelector(
      ".group-management #main-heading"
    );
    const addGroupSection = document.querySelector(".add-group");
    const groupsList = document.querySelector(".groups-list");

    expect(mainContent).toBeTruthy();
    expect(mainHeading).toBeTruthy();
    expect(mainHeading.textContent).toBe("GROUP MANAGEMENT");
    expect(addGroupSection).toBeTruthy();
    expect(groupsList).toBeTruthy();
    expect(groupsList.querySelector("h2").textContent).toBe("Groups List");

    // Verify the presence of alert and 'Create Group' button
    const alert = document.querySelector(".alert");
    const createButton = document.querySelector("#createGroupBtn");

    expect(alert).toBeTruthy();
    expect(createButton).toBeTruthy();
    expect(createButton.disabled).toBeFalsy();
    expect(createButton.textContent).toContain("CREATE GROUP");
    expect(document.querySelector(".fas.fa-users")).not.toBeNull();

    // Verify the group table structure and headers
    const tableContainer = document.querySelector(".table");
    const groupTable = document.querySelector(".group-table");

    expect(tableContainer).toBeTruthy();
    expect(groupTable).toBeTruthy();
    expect(groupTable.querySelector("thead")).toBeTruthy();
    expect(groupTable.querySelector("tbody")).toBeTruthy();

    const headers = document.querySelectorAll(".group-table th");
    const headerTexts = ["GROUP NAME", "USERS", "ACTIONS"];
    expect(headers.length).toBe(headerTexts.length);
    headers.forEach((header, index) => {
      expect(header.textContent).toBe(headerTexts[index]);
    });

    // Verify that 'No groups found' is displayed in the empty table
    const tableBody = document.querySelector(".group-table tbody");
    const rows = tableBody.querySelectorAll("tr");

    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll("td");

    expect(cells[0].textContent.trim()).toBe("No groups found");
  });

  test("should open and close the 'Create Group' modal and verify its elements", () => {
    // Open the modal
    const openModalButton = document.querySelector("#createGroupBtn");
    const modal = document.querySelector("#groupModal");

    openModalButton.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    // Verify modal presence and attributes
    expect(modal).toBeTruthy();

    const modalHead = document.querySelector("#groupModal .modal-head");
    const modalHeading = document.querySelector("#groupModalHeading");
    const closeIcon = document.querySelector("#closeGroupModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain("CREATE GROUP");
    expect(closeIcon).not.toBeNull();

    // Check form presence and attributes
    const form = document.querySelector("#createGroupForm");
    expect(form).toBeTruthy();

    // Check form fields and their attributes
    const groupNameField = document.querySelector("#groupName");
    expect(groupNameField).toBeTruthy();
    expect(groupNameField.getAttribute("type")).toBe("text");
    expect(groupNameField.hasAttribute("required")).toBe(true);

    // Check form field label and mandatory indicator
    const label = document.querySelector("label[for='groupName']");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("GROUP NAME :");

    // Check the presence and state of 'Create Group' button
    const createGroupButton = document.querySelector(
      "#createGroupForm button[type='submit']"
    );
    expect(createGroupButton).toBeTruthy();
    expect(createGroupButton.disabled).toBeFalsy();

    // Close the modal
    const closeModalButton = document.querySelector("#closeGroupModal");

    closeModalButton.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  describe("Group Name Validation", () => {
    test("should display an error if the group name is empty", async () => {
      // Set up the form with an empty group name
      document.querySelector("#groupName").value = " ";
      document
        .querySelector("#createGroupForm")
        .dispatchEvent(new Event("submit"));

      const groupFormMessage = document.querySelector("#groupFormMessage");
      const messageText = groupFormMessage.textContent.trim();

      expect(messageText).toBe("Group name is required.");
      expect(groupFormMessage.innerHTML).toContain(
        '<i class="fa-solid fa-exclamation-circle"></i>'
      );

      // Wait for the message to be cleared
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the message is cleared
      expect(groupFormMessage.textContent.trim()).toBe("");
    });

    test("should display an error if the group name already exists", async () => {
      // Set up initial groups in localStorage
      localStorage.setItem(
        "groups",
        JSON.stringify([{ name: "Interns", users: [] }])
      );

      // Set up the form with a duplicate group name
      document.querySelector("#groupName").value = "Interns";
      document
        .querySelector("#createGroupForm")
        .dispatchEvent(new Event("submit"));

      const groupFormMessage = document.querySelector("#groupFormMessage");
      const messageText = groupFormMessage.textContent.trim();

      expect(messageText).toBe("Group name already exists.");
      expect(groupFormMessage.innerHTML).toContain(
        '<i class="fa-solid fa-exclamation-circle"></i>'
      );

      // Wait for the message to be cleared
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the message is cleared
      expect(groupFormMessage.textContent.trim()).toBe("");
    });
  });

  test("should successfully create a New group, update localStorage, and reflect changes in the group table", async () => {
    // Set up the form with a unique group name
    document.querySelector("#groupName").value = "Freshers";
    document
      .querySelector("#createGroupForm")
      .dispatchEvent(new Event("submit"));

    // Check the success message and icon
    const alertDiv = document.querySelector(".add-group .alert");
    const alertText = alertDiv.textContent.trim();
    const alertHTML = alertDiv.innerHTML.trim();

    expect(alertText).toBe("Group created successfully!");
    expect(alertHTML).toContain('<i class="fa-solid fa-check-circle"></i>');

    // Verify that the Freshers is added to localStorage
    const groups = JSON.parse(localStorage.getItem("groups"));
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("Freshers");

    // Ensure the modal is hidden after submission
    const groupModal = document.querySelector("#groupModal");
    expect(groupModal.classList.contains("hidden")).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the success message is cleared
    expect(alertDiv.textContent.trim()).toBe("");

    updateGroupTable();

    // Wait for the table update to be reflected
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the table has been updated correctly
    const tableRows = document.querySelectorAll(".group-table tbody tr");

    // Verify that the table has the expected number of rows
    expect(tableRows).toHaveLength(1);

    // Verify that the Freshers is displayed in the table
    const groupNameCell = tableRows[0].querySelector("td:nth-child(1)");
    expect(groupNameCell.textContent.trim()).toBe("Freshers");

    // Verify that the user column displays "No users present" for the Freshers
    const userColumn = tableRows[0].querySelector("td:nth-child(2)");
    expect(userColumn.textContent.trim()).toBe("No users present");

    // Verify that the action buttons are displayed and have correct text
    const actionButtons = tableRows[0].querySelectorAll(
      "td:nth-child(3) button"
    );

    expect(actionButtons).toHaveLength(3); // Ensure there are three action buttons
    expect(actionButtons.disabled).toBeFalsy();

    const addUsersButton = actionButtons[0];
    expect(addUsersButton.textContent.trim()).toBe("Add Users");
    expect(addUsersButton.classList.contains("add-users-btn")).toBe(true);

    const removeUsersButton = actionButtons[1];
    expect(removeUsersButton.textContent.trim()).toBe("Remove Users");
    expect(removeUsersButton.classList.contains("remove-users-btn")).toBe(true);

    const deleteGroupButton = actionButtons[2];
    expect(deleteGroupButton.textContent.trim()).toBe("Delete Group");
    expect(deleteGroupButton.classList.contains("delete-group-btn")).toBe(true);
  });

  test("should open the 'Add Users to Group' modal correctly and handle its functionalities", async () => {
    // Setup initial group and user data in localStorage
    const groups = [
      { name: "Team Lead", users: [] },
      { name: "Freshers", users: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Call the function to update the group table to ensure the button is present
    updateGroupTable();

    // Retrieve the button and modal
    const addUsersButton = document.querySelector(".add-users-btn");
    const modal = document.querySelector("#addUsersModal");

    // Ensure the button exists before clicking
    expect(addUsersButton).not.toBeNull();

    // Open the modal for the 'Freshers' group
    addUsersButton.dataset.groupName = "Freshers"; // Set the group name in the button dataset
    addUsersButton.click();

    // Wait for modal to be fully visible
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(modal.classList.contains("hidden")).toBe(false);

    // Check modal attributes
    const modalHead = document.querySelector("#addUsersModal .modal-head");
    const modalHeading = document.querySelector("#addUsersModalHeading");
    const closeIcon = document.querySelector("#closeAddUsersModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain("ADD USERS TO GROUP: Freshers");
    expect(closeIcon).not.toBeNull();

    // Check form presence and fields
    const form = document.querySelector("#addUsersForm");
    expect(form).toBeTruthy();

    const selectUsersContainer = document.querySelector(
      "#selectUsersContainer"
    );
    expect(selectUsersContainer).toBeTruthy();

    const label = document.querySelector("label[for='selectUsers']");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("SELECT USERS :");

    const addUsersButtonElement = document.querySelector("#addSelectedUsers");
    const removeUsersButton = document.querySelector("#removeSelectedUsers");
    expect(addUsersButtonElement).toBeTruthy();
    expect(addUsersButtonElement.disabled).toBeFalsy();
    expect(removeUsersButton).toBeTruthy();
    expect(removeUsersButton.style.display).toBe("none");

    // Verify that the available users are displayed as checkboxes
    const checkboxes = document.querySelectorAll(
      "#selectUsersContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBe(1); // Only one user is available to add
    expect(checkboxes[0].value).toBe("jamesmathew@gmail.com"); // Verify the correct user is listed

    // Verify the correct username is displayed next to the checkbox
    const usernameText =
      checkboxes[0].parentElement.querySelector("span").textContent;
    expect(usernameText).toBe("james"); // Verify the correct username is displayed

    // Close the modal
    const closeModalButton = document.querySelector("#closeAddUsersModal");
    expect(closeModalButton).toBeTruthy();
    closeModalButton.click();

    // Verify that the modal is hidden
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("should display an alert when the 'Add Users' button is clicked without selecting any user", async () => {
    // Mocking a group and users in local storage
    const groups = [{ name: "Group 1", users: [] }];
    const users = [
      { email: "user1@example.com", username: "User 1" },
      { email: "user2@example.com", username: "User 2" },
    ];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function
    updateGroupTable();

    // Open the Add Users modal
    const addUsersButton = document.querySelector(".add-users-btn");
    addUsersButton.dataset.groupName = "Group 1"; // Ensure the group name is set
    addUsersButton.click();

    // Verify that the modal is visible
    const modal = document.querySelector("#addUsersModal");
    expect(modal).not.toBeNull(); // Ensure the modal is present
    expect(modal.classList.contains("hidden")).toBe(false); // Ensure the modal is not hidden

    // Click the Add Users button in the modal without selecting any checkboxes
    const addUsersButtonElement = document.querySelector("#addSelectedUsers");
    expect(addUsersButtonElement).not.toBeNull(); // Ensure the Add Users button is present
    addUsersButtonElement.click();

    // Verify the error alert message
    const alertDiv = document.querySelector("#addUsersFormMessage");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain(
      "Please select at least one user to add!"
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the modal remains open
    expect(modal.classList.contains("hidden")).toBe(false); // Ensure the modal is still visible
  });

  test("should update the group table with the selected user after adding to the group and verify local storage", async () => {
    // Mocking a newly created group in local storage
    const groups = [
      {
        name: "Freshers",
        users: [], // No users initially
      },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "New User" }];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Simulating the 'Add Users' button click
    const addButton = document.querySelector(".add-users-btn");
    addButton.dataset.groupName = "Freshers";
    addButton.click();

    // Verify that the modal is visible
    const modal = document.querySelector("#addUsersModal");
    expect(modal.classList.contains("hidden")).toBe(false);

    // Select the user checkbox
    const checkbox = document.querySelector(
      "#selectUsersContainer input[type='checkbox']"
    );
    checkbox.checked = true;

    // Simulate adding the selected user to the group
    const addSelectedUsersButton = document.querySelector("#addSelectedUsers");
    addSelectedUsersButton.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users added successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the group table is updated
    const groupTableRow = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Freshers"
    );

    expect(groupTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = groupTableRow.querySelector("td:nth-child(2)");
    expect(usersCell.textContent).toContain("New User"); // Verify the username is displayed in the table

    // Verify that the user is added in local storage
    const updatedGroups = JSON.parse(localStorage.getItem("groups"));
    const newGroup = updatedGroups.find((group) => group.name === "Freshers");
    expect(newGroup).not.toBeNull(); // Ensure the group exists
    expect(newGroup.users).toContain("jamesmathew@gmail.com"); // Check that the user's email is in the group's user list
  });

  test("should update the group table with the new user after adding to a group that already has users", async () => {
    // Mocking an Interns with users in local storage
    const groups = [
      {
        name: "Interns",
        users: ["samanderson@gmail.com"], // Initial users in the group
      },
    ];
    const users = [
      { email: "samanderson@gmail.com", username: "sam" },
      { email: "jamesmathew@gmail.com", username: "james" },
    ];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Simulating the 'Add Users' button click
    const addButton = document.querySelector(".add-users-btn");
    addButton.dataset.groupName = "Interns";
    addButton.click();

    // Verify that the modal is visible
    const modal = document.querySelector("#addUsersModal");
    expect(modal.classList.contains("hidden")).toBe(false);

    // Select the new user checkbox
    const checkbox = document.querySelector(
      "#selectUsersContainer input[type='checkbox']"
    );
    checkbox.checked = true;

    // Simulate adding the selected user to the group
    const addSelectedUsersButton = document.querySelector("#addSelectedUsers");
    addSelectedUsersButton.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users added successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the group table is updated
    const groupTableRow = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Interns"
    );

    expect(groupTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = groupTableRow.querySelector("td:nth-child(2)");
    expect(usersCell.textContent).toContain("sam"); // Verify the existing username is still displayed
    expect(usersCell.textContent).toContain("james"); // Verify the new username is now displayed
  });

  test("should display an alert if all users are already added to the group", async () => {
    // Mocking groups and users in local storage
    const groups = [
      {
        name: "Team Lead",
        users: ["test1@example.com"],
      },
    ];
    const users = [{ email: "test1@example.com", username: "Test User 1" }];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Simulating the 'Add Users' button click
    const addButton = document.querySelector(".add-users-btn");
    addButton.dataset.groupName = "Team Lead";
    addButton.click();

    // Verify that the alert is displayed
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.innerHTML).toContain(
      '<i class="fa-solid fa-exclamation-circle"></i> All users are already added to this group!'
    ); // Check if the alert message contains the correct text and icon

    // Ensure the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Ensure modal does not open
    const modal = document.querySelector("#addUsersModal");
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("should open the 'Remove Users from Group' modal correctly, verify attributes, display the correct group name and available users, and close the modal", async () => {
    // Setup initial group data in localStorage with users
    const groups = [{ name: "Interns", users: ["mohansundar@gmail.com"] }];
    const users = [{ email: "mohansundar@gmail.com", username: "Mohan" }];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Call the function to update the group table to ensure the button is present
    updateGroupTable();

    // Retrieve the button and modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    const modal = document.querySelector("#addUsersModal");

    // Ensure the button exists before clicking
    expect(removeUsersButton).not.toBeNull();

    // Click the button to open the modal
    removeUsersButton.click();

    // Check if the modal is displayed (i.e., the hidden class is removed)
    expect(modal.classList.contains("hidden")).toBe(false);

    // Check modal presence and attributes
    const modalHead = document.querySelector("#addUsersModal .modal-head");
    const modalHeading = document.querySelector("#addUsersModalHeading");
    const closeIcon = document.querySelector("#closeAddUsersModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain("REMOVE USERS FROM GROUP");
    expect(closeIcon).not.toBeNull();

    // Verify modal heading updates with the correct group name
    expect(modalHeading.textContent).toContain(
      "REMOVE USERS FROM GROUP: Interns"
    );

    // Check form presence
    const form = document.querySelector("#addUsersForm");
    expect(form).toBeTruthy();

    // Check form fields and their attributes
    const selectUsersContainer = document.querySelector(
      "#selectUsersContainer"
    );
    expect(selectUsersContainer).toBeTruthy();

    // Check form field label and mandatory indicator
    const label = document.querySelector("label[for='selectUsers']");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("SELECT USERS :");

    // Verify that the available users are displayed as checkboxes
    const checkboxes = document.querySelectorAll(
      "#selectUsersContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBe(1); // One user to remove
    expect(checkboxes[0].value).toBe("mohansundar@gmail.com"); // Verify the correct user is listed

    // Verify the correct username is displayed next to the checkbox
    const usernameText =
      checkboxes[0].parentElement.querySelector("span").textContent;
    expect(usernameText).toBe("Mohan"); // Verify the correct username is displayed

    // Check the presence and state of 'Remove Users' button
    const removeUsersButtonElement = document.querySelector(
      "#removeSelectedUsers"
    );
    expect(removeUsersButtonElement).toBeTruthy();
    expect(removeUsersButtonElement.disabled).toBeFalsy();
    expect(removeUsersButtonElement.style.display).toBe("inline"); // Ensure button is visible

    // Close the modal
    const closeModalButton = document.querySelector("#closeAddUsersModal");
    expect(closeModalButton).toBeTruthy();
    closeModalButton.click();

    // Verify that the modal is hidden
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("should display an alert when the 'Remove Users' button is clicked without selecting any user", async () => {
    // Mocking a group with users in local storage
    const groups = [
      { name: "Group 1", users: ["user1@example.com", "user2@example.com"] },
    ];
    const users = [
      { email: "user1@example.com", username: "User 1" },
      { email: "user2@example.com", username: "User 2" },
    ];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Open the Remove Users modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    removeUsersButton.click();

    // Click the Remove Users button in the modal without selecting any checkboxes
    const removeUsersButtonElement = document.querySelector(
      "#removeSelectedUsers"
    );
    expect(removeUsersButtonElement).not.toBeNull(); // Ensure the Remove Users button is present
    removeUsersButtonElement.click();

    // Verify the error alert message
    const alertDiv = document.querySelector("#addUsersFormMessage");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain(
      "Please select at least one user to remove!"
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the modal remains open
    const modal = document.querySelector(".modal");
    expect(modal).not.toBeNull(); // Ensure the modal is still present

    // Optionally verify that no changes are made to the group table
    const groupTableRow = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Group 1"
    );
    expect(groupTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = groupTableRow.querySelector("td:nth-child(2)");
    expect(usersCell.textContent).toContain("User 1, User 2"); // Ensure no users are removed
  });

  test("should update the group table and local storage after removing a user from the group", async () => {
    // Mocking a group with users in local storage
    const groups = [
      {
        name: "Group 1",
        users: ["user1@example.com", "user2@example.com"],
      },
    ];
    const users = [
      { email: "user1@example.com", username: "User 1" },
      { email: "user2@example.com", username: "User 2" },
    ];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Open the Remove Users modal
    const removeButton = document.querySelector(".remove-users-btn");
    removeButton.click();

    // Select the checkbox for User 1
    const checkboxes = document.querySelectorAll(
      "#selectUsersContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBeGreaterThan(0); // Ensure there are checkboxes
    const removeButtonElement = Array.from(checkboxes).find(
      (checkbox) => checkbox.value === "user1@example.com"
    );
    expect(removeButtonElement).not.toBeUndefined(); // Ensure the checkbox is found
    removeButtonElement.click();

    // Click the Remove button in the modal
    const removeUsersButtonElement = document.querySelector(
      "#removeSelectedUsers"
    );
    expect(removeUsersButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeUsersButtonElement.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users removed successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the group table is updated
    const groupTableRow = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Group 1"
    );

    expect(groupTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = groupTableRow.querySelector("td:nth-child(2)");
    expect(usersCell.textContent).toContain("User 2"); // Verify User 2 is still displayed
    expect(usersCell.textContent).not.toContain("User 1"); // Verify User 1 is removed from the table

    // Verify local storage updates
    const updatedGroups = JSON.parse(localStorage.getItem("groups"));
    expect(updatedGroups).not.toBeNull();
    const group = updatedGroups.find((group) => group.name === "Group 1");
    expect(group).not.toBeNull();
    expect(group.users).not.toContain("user1@example.com"); // Verify User 1 is removed from the group
    expect(group.users).toContain("user2@example.com"); // Verify User 2 is still in the group
  });

  test("should display an alert and update the table when the last user is removed from the group", async () => {
    // Mocking a group with a single user in local storage
    const groups = [
      {
        name: "Group 1",
        users: ["user1@example.com"],
      },
    ];
    const users = [{ email: "user1@example.com", username: "User 1" }];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Open the Remove Users modal
    const removeButton = document.querySelector(".remove-users-btn");
    removeButton.click();

    // Select the checkbox for User 1
    const checkboxes = document.querySelectorAll(
      "#selectUsersContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBeGreaterThan(0); // Ensure there are checkboxes
    const removeButtonElement = Array.from(checkboxes).find(
      (checkbox) => checkbox.value === "user1@example.com"
    );
    expect(removeButtonElement).not.toBeUndefined(); // Ensure the checkbox is found
    removeButtonElement.click();

    // Click the Remove button in the modal
    const removeUsersButtonElement = document.querySelector(
      "#removeSelectedUsers"
    );
    expect(removeUsersButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeUsersButtonElement.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users removed successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the group table is updated
    const groupTableRow = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Group 1"
    );

    expect(groupTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = groupTableRow.querySelector("td:nth-child(2)");
    expect(usersCell.textContent).toBe("No users present"); // Verify 'No users found' is displayed in the table
  });

  test("should display an alert and not update the group table if no users are left to remove", async () => {
    // Mocking a group with no users in local storage
    const groups = [
      {
        name: "Empty Group",
        users: [],
      },
    ];
    const users = [{ email: "user1@example.com", username: "User 1" }];
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateGroupTable();

    // Open the Remove Users modal
    const removeButton = document.querySelector(".remove-users-btn");
    removeButton.click();

    // Simulate clicking the Remove button when no users are left
    const removeUsersButtonElement = document.querySelector(
      "#removeSelectedUsers"
    );
    expect(removeUsersButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeUsersButtonElement.click();

    // Verify the error alert message
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain(
      "No users to remove from this group!"
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the group table remains unchanged
    const groupTableRow = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Empty Group"
    );

    expect(groupTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = groupTableRow.querySelector("td:nth-child(2)");
    expect(usersCell.textContent).toBe("No users present"); // Ensure 'No users found' is displayed
  });

  test("should delete a group and display a success alert", async () => {
    // Mocking initial groups in local storage
    const groups = [
      { name: "Group 1", users: [] },
      { name: "Group 2", users: [] },
    ];
    localStorage.setItem("groups", JSON.stringify(groups));

    // Simulate table update function
    updateGroupTable();

    // Trigger the delete button click for "Group 1"
    const deleteButton = document.querySelector(
      ".delete-group-btn[data-group-name='Group 1']"
    );
    expect(deleteButton).not.toBeNull(); // Ensure the delete button for "Group 1" exists

    // Mock confirm dialog to automatically return true
    window.confirm = jest.fn().mockReturnValue(true);

    deleteButton.click();

    // Wait for the alert to appear
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify that "Group 1" is deleted from local storage
    const updatedGroups = JSON.parse(localStorage.getItem("groups"));
    expect(updatedGroups).toEqual([{ name: "Group 2", users: [] }]); // Verify the remaining group

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-group .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.innerHTML).toContain(
      '<i class="fa-solid fa-check-circle"></i>  Group deleted successfully!'
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify that the table is updated and "Group 1" is removed
    const groupTableRows = Array.from(
      document.querySelectorAll(".group-table tbody tr")
    );
    expect(
      groupTableRows.some(
        (row) => row.querySelector("td:first-child").textContent === "Group 1"
      )
    ).toBe(false); // Ensure "Group 1" is not present
  });
});

describe("Role Management System", () => {
  beforeEach(() => {
    const rolesTab = document.querySelector("#roles-tab");
    rolesTab.click();
  });

  test("should verify the sidebar, main content area, and role table structure comprehensively", () => {
    // Verify the presence of sidebar and its components
    verifySidebarComponents();
    verifySidebarTabs();

    // Test sidebar toggle for the Groups tab
    testSidebarToggle("groups-tab");

    // Switch to Roles tab and verify main content area and headings
    const rolesTab = document.querySelector("#roles-tab");
    rolesTab.click();

    const mainContent = document.querySelector("#roleManagement");
    const mainHeading = document.querySelector(
      ".role-management #main-heading"
    );
    const addRoleSection = document.querySelector(".add-role");
    const rolesList = document.querySelector(".roles-list");

    expect(mainContent).toBeTruthy();
    expect(mainHeading).toBeTruthy();
    expect(mainHeading.textContent).toBe("ROLE MANAGEMENT");
    expect(addRoleSection).toBeTruthy();
    expect(rolesList).toBeTruthy();
    expect(rolesList.querySelector("h2").textContent).toBe("Roles List");

    // Verify the presence of alert and 'Create Role' button
    const alert = document.querySelector(".alert");
    const createButton = document.querySelector("#createRoleBtn");

    expect(alert).toBeTruthy();
    expect(createButton).toBeTruthy();
    expect(createButton.disabled).toBeFalsy();
    expect(createButton.textContent).toContain("CREATE ROLE");
    expect(document.querySelector(".fas.fa-user-shield")).not.toBeNull();

    // Verify the role table structure and headers
    const tableContainer = document.querySelector(".table");
    const roleTable = document.querySelector(".role-table");

    expect(tableContainer).toBeTruthy();
    expect(roleTable).toBeTruthy();
    expect(roleTable.querySelector("thead")).toBeTruthy();
    expect(roleTable.querySelector("tbody")).toBeTruthy();

    const headers = document.querySelectorAll(".role-table th");
    const headerTexts = [
      "ROLE NAME",
      "DESCRIPTION",
      "USERS",
      "GROUPS",
      "ACTIONS",
    ];
    expect(headers.length).toBe(headerTexts.length);
    headers.forEach((header, index) => {
      expect(header.textContent).toBe(headerTexts[index]);
    });

    // Verify that 'No roles present' is displayed in the empty table
    const tableBody = document.querySelector(".role-table tbody");
    const rows = tableBody.querySelectorAll("tr");

    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll("td");

    expect(cells[0].textContent.trim()).toBe("No roles found");
  });

  test("should open and close the 'Create Role' modal and verify its elements", () => {
    // Open the modal
    const openModalButton = document.querySelector("#createRoleBtn");
    const modal = document.querySelector("#roleModal");

    openModalButton.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    // Verify modal presence and attributes
    expect(modal).toBeTruthy();

    const modalHead = document.querySelector("#roleModal .modal-head");
    const modalHeading = document.querySelector("#roleModalHeading");
    const closeIcon = document.querySelector("#closeRoleModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain("CREATE ROLE");
    expect(closeIcon).not.toBeNull();

    // Check form presence and attributes
    const form = document.querySelector("#createRoleForm");
    expect(form).toBeTruthy();

    // Check form fields and their attributes
    const roleNameField = document.querySelector("#roleName");
    const roleDescField = document.querySelector("#roleDescription");
    expect(roleNameField).toBeTruthy();
    expect(roleDescField).toBeTruthy();
    expect(roleNameField.getAttribute("type")).toBe("text");
    expect(roleDescField.getAttribute("rows")).toBe("3");
    expect(roleNameField.hasAttribute("required")).toBe(true);
    expect(roleDescField.hasAttribute("required")).toBe(true);

    // Check form field labels and mandatory indicators
    const nameLabel = document.querySelector("label[for='roleName']");
    const descLabel = document.querySelector("label[for='roleDescription']");
    expect(nameLabel).not.toBeNull();
    expect(descLabel).not.toBeNull();
    expect(nameLabel.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(descLabel.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(nameLabel.textContent.trim()).toContain("ROLE NAME :");
    expect(descLabel.textContent.trim()).toContain("DESCRIPTION :");

    // Check the presence and state of 'Create Role' and 'Reset' buttons
    const createRoleButton = document.querySelector("#addRole");
    const resetButton = document.querySelector("#resetRoleForm");
    expect(createRoleButton).toBeTruthy();
    expect(createRoleButton.disabled).toBeFalsy();
    expect(resetButton).toBeTruthy();
    expect(resetButton.disabled).toBeFalsy();

    // Close the modal
    const closeModalButton = document.querySelector("#closeRoleModal");
    closeModalButton.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  describe("Role Name Validation", () => {
    test("should display an error if the role name is empty", async () => {
      // Open the modal
      document.querySelector("#createRoleBtn").click();

      // Set up the form with an empty role name
      document.querySelector("#roleName").value = "";
      document.querySelector("#roleDescription").value = "Test Description";
      document.querySelector("#addRole").click(); // Trigger the form submit event

      const roleFormMessage = document.querySelector("#roleFormMessage");
      const messageText = roleFormMessage.textContent.trim();

      expect(messageText).toBe("Role name is required.");
      expect(roleFormMessage.innerHTML).toContain(
        '<i class="fa-solid fa-exclamation-circle"></i>'
      );

      // Wait for the message to be cleared
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the message is cleared
      expect(roleFormMessage.textContent.trim()).toBe("");
    });

    test("should display an error if the description is empty", async () => {
      // Open the modal
      document.querySelector("#createRoleBtn").click();

      // Set up the form with an empty role name
      document.querySelector("#roleName").value = "Test";
      document.querySelector("#roleDescription").value = "";
      document.querySelector("#addRole").click(); // Trigger the form submit event

      const roleFormMessage = document.querySelector("#roleFormMessage");
      const messageText = roleFormMessage.textContent.trim();

      expect(messageText).toBe("Description is required.");
      expect(roleFormMessage.innerHTML).toContain(
        '<i class="fa-solid fa-exclamation-circle"></i>'
      );

      // Wait for the message to be cleared
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the message is cleared
      expect(roleFormMessage.textContent.trim()).toBe("");
    });

    test("should display an error if role name and description is empty", async () => {
      // Open the modal
      document.querySelector("#createRoleBtn").click();

      // Set up the form with an empty role name
      document.querySelector("#roleName").value = "";
      document.querySelector("#roleDescription").value = "";
      document.querySelector("#addRole").click(); // Trigger the form submit event

      const roleFormMessage = document.querySelector("#roleFormMessage");
      const messageText = roleFormMessage.textContent.trim();

      expect(messageText).toBe("Role name is required.");
      expect(roleFormMessage.innerHTML).toContain(
        '<i class="fa-solid fa-exclamation-circle"></i>'
      );

      // Wait for the message to be cleared
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the message is cleared
      expect(roleFormMessage.textContent.trim()).toBe("");
    });

    test("should display an error if the role name already exists", async () => {
      // Open the modal
      document.querySelector("#createRoleBtn").click();

      // Set up initial roles in localStorage
      localStorage.setItem(
        "roles",
        JSON.stringify([{ name: "Admin", description: "Administrator" }])
      );

      // Set up the form with a duplicate role name
      document.querySelector("#roleName").value = "Admin";
      document.querySelector("#roleDescription").value = "Another Description";
      document.querySelector("#addRole").click(); // Trigger the form submit event

      const roleFormMessage = document.querySelector("#roleFormMessage");
      const messageText = roleFormMessage.textContent.trim();

      expect(messageText).toBe("Role name already exists!");
      expect(roleFormMessage.innerHTML).toContain(
        '<i class="fa-solid fa-exclamation-circle"></i>'
      );

      // Wait for the message to be cleared
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the message is cleared
      expect(roleFormMessage.textContent.trim()).toBe("");
    });
  });

  test("should reset the role creation form fields and message when clicking the Reset button", () => {
    // Set initial values in the form fields
    const roleNameInput = document.querySelector("#roleName");
    const roleDescriptionInput = document.querySelector("#roleDescription");
    const roleFormMessage = document.querySelector("#roleFormMessage");
    roleNameInput.value = "Test Role";
    roleDescriptionInput.value = "Test Description";
    roleFormMessage.textContent = "This is a form message";

    // Trigger the Reset button
    document.querySelector("#resetRoleForm").click();

    // Verify that the form fields are reset
    expect(roleNameInput.value).toBe("");
    expect(roleDescriptionInput.value).toBe("");

    // Verify that the form message is cleared
    expect(roleFormMessage.textContent).toBe("");
  });

  test("should successfully create a new role and update the table", async () => {
    // Set up form inputs for valid role creation
    document.querySelector("#roleName").value = "New Role";
    document.querySelector("#roleDescription").value = "New Role Description";
    document
      .querySelector("#createRoleForm")
      .dispatchEvent(new Event("submit"));

    // Check the success message and icon
    const roleFormMessage = document.querySelector(".add-role .alert");
    const successMessage = roleFormMessage.textContent.trim();
    const successHTML = roleFormMessage.innerHTML.trim();

    expect(successMessage).toBe("Role created successfully!");
    expect(successHTML).toContain('<i class="fa-solid fa-check-circle"></i>');

    // Verify that the role is added to localStorage
    const roles = JSON.parse(localStorage.getItem("roles"));
    expect(roles).toHaveLength(1);
    expect(roles[0].name).toBe("New Role");
    expect(roles[0].description).toBe("New Role Description");

    // Ensure the modal is hidden after submission
    const roleModal = document.querySelector("#roleModal");
    expect(roleModal.classList.contains("hidden")).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the success message is cleared
    expect(roleFormMessage.textContent.trim()).toBe("");

    updateRoleTable();

    // Wait for the table update to be reflected
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the table has been updated correctly
    const tableRows = document.querySelectorAll(".role-table tbody tr");

    // Verify that the table has the expected number of rows
    expect(tableRows).toHaveLength(1);

    // Verify that the new role is displayed in the table
    const roleNameCell = tableRows[0].querySelector("td:nth-child(1)");
    expect(roleNameCell.textContent.trim()).toBe("New Role");

    const roleDescriptionCell = tableRows[0].querySelector("td:nth-child(2)");
    expect(roleDescriptionCell.textContent.trim()).toBe("New Role Description");

    // Verify that the user column displays "No users assigned" for the new role
    const userColumn = tableRows[0].querySelector("td:nth-child(3)");
    expect(userColumn.textContent.trim()).toBe("No users assigned");

    // Verify that the groups column displays "No groups assigned" for the new role
    const groupsColumn = tableRows[0].querySelector("td:nth-child(4)");
    expect(groupsColumn.textContent.trim()).toBe("No groups assigned");

    // Verify that the action buttons are displayed and have correct text
    const actionButtons = tableRows[0].querySelectorAll(
      "td:nth-child(5) .actions button"
    );

    expect(actionButtons).toHaveLength(5); // Ensure there are five action buttons

    const assignUsersButton = actionButtons[0];
    expect(assignUsersButton.textContent.trim()).toBe("Assign Users");
    expect(assignUsersButton.classList.contains("assign-users-btn")).toBe(true);

    const assignGroupsButton = actionButtons[1];
    expect(assignGroupsButton.textContent.trim()).toBe("Assign Groups");
    expect(assignGroupsButton.classList.contains("assign-groups-btn")).toBe(
      true
    );

    const removeUsersButton = actionButtons[2];
    expect(removeUsersButton.textContent.trim()).toBe("Remove Users");
    expect(removeUsersButton.classList.contains("remove-users-btn")).toBe(true);

    const removeGroupsButton = actionButtons[3];
    expect(removeGroupsButton.textContent.trim()).toBe("Remove Groups");
    expect(removeGroupsButton.classList.contains("remove-groups-btn")).toBe(
      true
    );

    const deleteRoleButton = actionButtons[4];
    expect(deleteRoleButton.textContent.trim()).toBe("Delete Role");
    expect(deleteRoleButton.classList.contains("delete-role-btn")).toBe(true);

    // Verify the updated role is stored in localStorage correctly
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles).toHaveLength(1);
    expect(updatedRoles[0].name).toBe("New Role");
    expect(updatedRoles[0].description).toBe("New Role Description");
    expect(updatedRoles[0].users).toEqual([]); // Ensure the users list is still empty
    expect(updatedRoles[0].groups).toEqual([]); // Ensure the groups list is still empty
  });

  test("should open the 'Assign Users to Role' modal correctly and handle its functionalities", async () => {
    // Setup initial role and user data in localStorage
    const roles = [
      {
        name: "Developer",
        description: "Develops software",
        users: [],
        groups: [],
      },
      { name: "Tester", description: "Tests software", users: [], groups: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Call the function to update the role table to ensure the button is present
    updateRoleTable();

    // Retrieve the button and modal
    const assignUsersButton = document.querySelector(".assign-users-btn");
    const modal = document.querySelector("#assignModal");

    // Ensure the button exists before clicking
    expect(assignUsersButton).not.toBeNull();

    // Open the modal for the 'Developer' role
    assignUsersButton.dataset.roleName = "Developer"; // Set the role name in the button dataset
    assignUsersButton.click();

    // Wait for modal to be fully visible
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(modal.classList.contains("hidden")).toBe(false);

    // Check modal attributes
    const modalHead = document.querySelector("#assignModal .modal-head");
    const modalHeading = document.querySelector("#assignModalHeading");
    const closeIcon = document.querySelector("#closeAssignModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain(
      "ASSIGN USERS TO ROLE: Developer"
    );
    expect(closeIcon).not.toBeNull();

    // Check form presence and fields
    const form = document.querySelector("#assignForm");
    expect(form).toBeTruthy();

    const selectUsersContainer = document.querySelector(
      "#selectUsersContainer"
    );
    expect(selectUsersContainer).toBeTruthy();

    const label = document.querySelector("label[for='selectUsers']");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("SELECT USERS :");

    const addUsersButtonElement = document.querySelector("#assignSelected");
    const removeUsersButton = document.querySelector("#removeSelected");
    expect(addUsersButtonElement).toBeTruthy();
    expect(addUsersButtonElement.textContent).toContain("Assign");
    expect(addUsersButtonElement.disabled).toBeFalsy();
    expect(removeUsersButton).toBeTruthy();
    expect(removeUsersButton.textContent).toContain("Remove");
    expect(removeUsersButton.style.display).toBe("none");

    // Verify that the available users are displayed as checkboxes
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBe(1); // Only one user is available to add
    expect(checkboxes[0].value).toBe("james"); // Verify the correct user is listed

    // Verify the correct username is displayed next to the checkbox
    const usernameText =
      checkboxes[0].parentElement.querySelector("span").textContent;
    expect(usernameText).toBe("james"); // Verify the correct username is displayed

    // Close the modal
    const closeModalButton = document.querySelector("#closeAssignModal");
    expect(closeModalButton).toBeTruthy();
    closeModalButton.click();

    // Verify that the modal is hidden
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("should display an alert when the 'Assign' button is clicked without selecting any user", async () => {
    // Mocking roles and users in local storage
    const roles = [
      { name: "Management", description: "HR", users: [], groups: [] },
    ];
    const users = [
      { email: "johndoe@gmail.com", username: "Johnny" },
      { email: "sam@gmail.com", username: "Sammy" },
    ];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function
    updateRoleTable();

    // Open the Assign Users modal
    const assignUsersButton = document.querySelector(".assign-users-btn");
    assignUsersButton.dataset.roleName = "Management"; // Ensure the role name is set
    assignUsersButton.click();

    // Verify that the modal is visible
    const modal = document.querySelector("#assignModal");
    expect(modal).not.toBeNull(); // Ensure the modal is present
    expect(modal.classList.contains("hidden")).toBe(false); // Ensure the modal is not hidden

    // Click the Assign button in the modal without selecting any checkboxes
    const assignButtonElement = document.querySelector("#assignSelected");
    expect(assignButtonElement).not.toBeNull(); // Ensure the Assign button is present
    assignButtonElement.click();

    // Verify the error alert message
    const alertDiv = document.querySelector("#assignFormMessage");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain(
      "Please select at least one user to assign!"
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the modal remains open
    expect(modal.classList.contains("hidden")).toBe(false); // Ensure the modal is still visible

    // Verify that the roles in local storage have not been modified
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles).toHaveLength(1);
    expect(updatedRoles[0].name).toBe("Management");
    expect(updatedRoles[0].description).toBe("HR");
    expect(updatedRoles[0].users).toEqual([]); // Ensure the users array is still empty
    expect(updatedRoles[0].groups).toEqual([]); // Ensure the groups array is still empty
  });

  test("should update the role table with the selected user after assigning to the role and verify local storage", async () => {
    // Mocking a newly created role in local storage
    const roles = [
      {
        name: "Manager",
        description: "Admin",
        users: [], // No users initially
        groups: [],
      },
    ];
    const users = [{ email: "michaeljohnson@gmail.com", username: "Michael" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();

    // Simulating the 'Assign Users' button click
    const assignButton = document.querySelector(".assign-users-btn");
    assignButton.dataset.roleName = "Manager";
    assignButton.click();

    // Verify that the modal is visible
    const modal = document.querySelector("#assignModal");
    expect(modal.classList.contains("hidden")).toBe(false);

    // Select the user checkbox
    const checkbox = document.querySelector(
      "#selectRoleContainer input[type='checkbox']"
    );
    checkbox.checked = true;

    // Simulate assigning the selected user to the role
    const assignSelectedUsersButton = document.querySelector("#assignSelected");
    assignSelectedUsersButton.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users assigned successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the role table is updated
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Manager"
    );

    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = roleTableRow.querySelector("td:nth-child(3)");
    expect(usersCell.textContent).toContain("Michael"); // Verify the username is displayed in the table

    // Verify that the user is added in local storage
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    const newRole = updatedRoles.find((role) => role.name === "Manager");
    expect(newRole).not.toBeNull(); // Ensure the role exists
    expect(newRole.users).toContain("Michael"); // Check that the user's email is in the role's user list
  });

  test("should update the role table with the new user after assigning to a role that already has users", async () => {
    // Mocking a role with users in local storage
    const roles = [
      {
        name: "Admin",
        description: "Manager",
        users: ["sam"], // Initial users in the role (using usernames)
        groups: [],
      },
    ];
    const users = [
      { email: "samanderson@gmail.com", username: "sam" },
      { email: "jamesmathew@gmail.com", username: "james" },
    ];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function
    updateRoleTable();

    // Simulate the 'Assign Users' button click
    const assignButton = document.querySelector(".assign-users-btn");
    assignButton.dataset.roleName = "Admin";
    assignButton.click();

    // Verify that the modal is visible
    const modal = document.querySelector("#assignModal");
    expect(modal.classList.contains("hidden")).toBe(false);

    // Select the new user checkbox
    const checkbox = document.querySelector(
      "#selectRoleContainer input[type='checkbox'][value='james']"
    );
    checkbox.checked = true;

    // Simulate assigning the selected user to the role
    const assignSelectedUsersButton = document.querySelector("#assignSelected");
    assignSelectedUsersButton.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.textContent).toContain("Users assigned successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");

    // Verify the role table is updated correctly in the UI
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Admin"
    );

    expect(roleTableRow).not.toBeNull();

    const usersCell = roleTableRow.querySelector("td:nth-child(3)");
    expect(usersCell.textContent).toContain("sam");
    expect(usersCell.textContent).toContain("james");

    // Verify that local storage is updated correctly
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    const adminRole = updatedRoles.find((role) => role.name === "Admin");

    expect(adminRole).not.toBeUndefined();
    expect(adminRole.users).toContain("sam");
    expect(adminRole.users).toContain("james");
  });

  test("should display an alert if all users are already assigned to the role", async () => {
    // Mocking roles and users in local storage
    const roles = [
      {
        name: "Manager",
        description: "Admin",
        users: ["sam"],
        groups: [],
      },
    ];
    const users = [{ email: "sam@gmail.com", username: "sam" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function
    updateRoleTable();

    // Simulate opening the 'Assign Users' modal
    const assignButton = document.querySelector(".assign-users-btn");
    assignButton.dataset.roleName = "Manager";
    assignButton.click();

    await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay to ensure UI updates

    // Verify that the alert is displayed
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.innerHTML).toContain(
      '<i class="fa-solid fa-exclamation-circle"></i> All users are already assigned to this role!'
    );

    // Ensure the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent.trim()).toBe("");

    // Ensure modal is not displayed
    const modal = document.querySelector("#assignModal");
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("should open the 'Remove Users from Role' modal correctly and handle its functionalities", async () => {
    // Setup initial role and user data in localStorage
    const roles = [
      {
        name: "Developer",
        description: "Develops software",
        users: ["james"], // User to be removed
        groups: [],
      },
      { name: "Tester", description: "Tests software", users: [], groups: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Call the function to update the role table to ensure the button is present
    updateRoleTable();

    // Retrieve the button and modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    const modal = document.querySelector("#assignModal");

    // Ensure the button exists before clicking
    expect(removeUsersButton).not.toBeNull();

    // Open the modal for the 'Developer' role
    expect(removeUsersButton.dataset.roleName).toBe("Developer");
    removeUsersButton.click();

    expect(modal.classList.contains("hidden")).toBe(false);

    // Check modal attributes
    const modalHead = document.querySelector("#assignModal .modal-head");
    const modalHeading = document.querySelector("#assignModalHeading");
    const closeIcon = document.querySelector("#closeAssignModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain(
      "REMOVE USERS FROM ROLE: Developer"
    );
    expect(closeIcon).not.toBeNull();

    // Check form presence and fields
    const form = document.querySelector("#assignForm");
    expect(form).toBeTruthy();

    const selectUsersContainer = document.querySelector(
      "#selectUsersContainer"
    );
    expect(selectUsersContainer).toBeTruthy();

    const label = document.querySelector("label[for='selectUsers']");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("SELECT USERS :");

    const removeUsersButtonElement = document.querySelector("#removeSelected");
    const assignUsersButtonElement = document.querySelector("#assignSelected");

    expect(removeUsersButtonElement).toBeTruthy();
    expect(removeUsersButtonElement.textContent).toContain("Remove");
    expect(removeUsersButtonElement.disabled).toBeFalsy();
    expect(assignUsersButtonElement).toBeTruthy();
    expect(assignUsersButtonElement.textContent).toContain("Assign");
    expect(assignUsersButtonElement.style.display).toBe("none");

    // Verify that the available users are displayed as checkboxes
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBe(1);
    expect(checkboxes[0].value).toBe("james");

    // Verify the correct username is displayed next to the checkbox
    const usernameText =
      checkboxes[0].parentElement.querySelector("span").textContent;
    expect(usernameText).toBe("james");

    // Close the modal
    const closeModalButton = document.querySelector("#closeAssignModal");
    expect(closeModalButton).toBeTruthy();
    closeModalButton.click();

    // Verify that the modal is hidden
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("should display an alert when the 'Remove Users' button is clicked without selecting any user", async () => {
    // Mocking a role with users in local storage
    const roles = [
      { name: "Developer", description: "TDD", users: ["james"], groups: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function
    updateRoleTable();

    // Open the Remove Users modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    removeUsersButton.click();

    // Click the Remove Users button in the modal without selecting any checkboxes
    const removeUsersButtonElement = document.querySelector("#removeSelected");
    expect(removeUsersButtonElement).not.toBeNull();
    removeUsersButtonElement.click();

    // Verify the error alert message
    const alertDiv = document.querySelector("#assignFormMessage");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.textContent).toContain(
      "Please select at least one user to remove!"
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the modal remains open
    const modal = document.querySelector("#assignModal");
    expect(modal).not.toBeNull();

    // Verify that no changes are made to the role table
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );
    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = roleTableRow.querySelector("td:nth-child(3)");
    expect(usersCell.textContent).toContain("james"); // Ensure no users are removed
  });

  test("should update the role table and local storage after removing a user from the role", async () => {
    // Mocking a role with users in local storage
    const roles = [
      { name: "Developer", description: "Unity", users: ["james"], groups: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();

    // Open the Remove Users modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    removeUsersButton.click();

    // Select the checkbox for User 1
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBeGreaterThan(0); // Ensure there are checkboxes
    const checkboxElement = Array.from(checkboxes).find(
      (checkbox) => checkbox.value === "james"
    );
    expect(checkboxElement).not.toBeUndefined(); // Ensure the checkbox is found
    checkboxElement.click();

    // Click the Remove button in the modal
    const removeUsersButtonElement = document.querySelector("#removeSelected");
    expect(removeUsersButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeUsersButtonElement.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users removed successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the role table is updated
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );

    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = roleTableRow.querySelector("td:nth-child(3)");
    expect(usersCell.textContent).toBe("No users assigned"); // Verify 'No users present' is displayed
    expect(usersCell.textContent).not.toContain("james"); // Verify User is removed from the table

    // Verify local storage updates
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles).not.toBeNull();
    const role = updatedRoles.find((role) => role.name === "Developer");
    expect(role).not.toBeNull();
    expect(role.users).not.toContain("james"); // Verify User is removed from the role
  });

  test("should display an alert and update the table when the last user is removed from the role", async () => {
    // Mocking a role with a single user in local storage
    const roles = [
      { name: "Developer", description: "Unity", users: ["james"], groups: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();

    // Open the Remove Users modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    removeUsersButton.click();

    // Select the checkbox for User 1
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBeGreaterThan(0); // Ensure there are checkboxes
    const checkboxElement = Array.from(checkboxes).find(
      (checkbox) => checkbox.value === "james"
    );
    expect(checkboxElement).not.toBeUndefined(); // Ensure the checkbox is found
    checkboxElement.click();

    // Click the Remove button in the modal
    const removeUsersButtonElement = document.querySelector("#removeSelected");
    expect(removeUsersButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeUsersButtonElement.click();

    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Users removed successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the role table is updated
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );

    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = roleTableRow.querySelector("td:nth-child(3)");
    expect(usersCell.textContent).toBe("No users assigned"); // Verify 'No users present' is displayed in the table
  });

  test("should display an alert and not update the role table if no users are left to remove", async () => {
    // Mocking a role with no users in local storage
    const roles = [
      { name: "Developer", description: "Unity", users: [], groups: [] },
    ];
    const users = [{ email: "jamesmathew@gmail.com", username: "james" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("users", JSON.stringify(users));

    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();

    // Open the Remove Users modal
    const removeUsersButton = document.querySelector(".remove-users-btn");
    removeUsersButton.click();

    // Verify the error alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain(
      "No users to remove from this role!"
    );

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared

    // Verify the role table remains unchanged
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );

    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists

    const usersCell = roleTableRow.querySelector("td:nth-child(3)");
    expect(usersCell.textContent).toBe("No users assigned"); // Verify that no users are displayed
  });

  test("should open the 'Assign Groups to Role' modal correctly and handle its functionalities", async () => {
    // Setup initial role and group data in localStorage
    const roles = [
      {
        name: "Developer",
        description: "Develops software",
        users: [],
        groups: [],
      },
      { name: "Tester", description: "Tests software", users: [], groups: [] },
    ];
    const groups = [{ id: 1, name: "Frontend Team" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Call the function to update the role table to ensure the button is present
    updateRoleTable();
  
    // Retrieve the button and modal
    const assignGroupsButton = document.querySelector(".assign-groups-btn");
    const modal = document.querySelector("#assignModal");
  
    // Ensure the button exists before clicking
    expect(assignGroupsButton).not.toBeNull();
  
    // Open the modal for the 'Developer' role
    assignGroupsButton.dataset.roleName = "Developer"; // Set the role name in the button dataset
    assignGroupsButton.click();
  
    // Wait for modal to be fully visible
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(modal.classList.contains("hidden")).toBe(false);
  
    // Check modal attributes
    const modalHead = document.querySelector("#assignModal .modal-head");
    const modalHeading = document.querySelector("#assignModalHeading");
    const closeIcon = document.querySelector("#closeAssignModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain(
      "ASSIGN GROUPS TO ROLE: Developer"
    );
    expect(closeIcon).not.toBeNull();
  
    // Check form presence and fields
    const form = document.querySelector("#assignForm");
    expect(form).toBeTruthy();
  
    const selectGroupsContainer = document.querySelector(
      "#selectRoleContainer"
    );
    expect(selectGroupsContainer).toBeTruthy();
  
    const label = document.querySelector("label[for='selectRoleContainer']");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("SELECT GROUPS :");
  
    const addGroupsButtonElement = document.querySelector("#assignSelected");
    const removeGroupsButton = document.querySelector("#removeSelected");
    expect(addGroupsButtonElement).toBeTruthy();
    expect(addGroupsButtonElement.textContent).toContain("Assign");
    expect(addGroupsButtonElement.disabled).toBeFalsy();
    expect(removeGroupsButton).toBeTruthy();
    expect(removeGroupsButton.textContent).toContain("Remove");
    expect(removeGroupsButton.style.display).toBe("none");
  
    // Verify that the available groups are displayed as checkboxes
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBe(1); // Only one group is available to add
    expect(checkboxes[0].value).toBe("Frontend Team"); // Verify the correct group is listed
  
    // Verify the correct group name is displayed next to the checkbox
    const groupNameText =
      checkboxes[0].parentElement.querySelector("span").textContent;
    expect(groupNameText).toBe("Frontend Team"); // Verify the correct group name is displayed
  
    // Close the modal
    const closeModalButton = document.querySelector("#closeAssignModal");
    expect(closeModalButton).toBeTruthy();
    closeModalButton.click();
  
    // Verify that the modal is hidden
    expect(modal.classList.contains("hidden")).toBe(true);
  });
  
  test("should display an alert when the 'Assign' button is clicked without selecting any group", async () => {
    // Mocking roles and groups in local storage
    const roles = [{ name: "Management", description: "HR", users: [], groups: [] }];
    const groups = [{ name: "Developers" }, { name: "Designers" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function
    updateRoleTable();
  
    // Open the Assign Groups modal
    const assignGroupsButton = document.querySelector(".assign-groups-btn");
    assignGroupsButton.dataset.roleName = "Management"; // Ensure the role name is set
    assignGroupsButton.click();
  
    // Verify that the modal is visible
    const modal = document.querySelector("#assignModal");
    expect(modal).not.toBeNull();
    expect(modal.classList.contains("hidden")).toBe(false);
  
    // Click the Assign button in the modal without selecting any checkboxes
    const assignButtonElement = document.querySelector("#assignSelected");
    expect(assignButtonElement).not.toBeNull();
    assignButtonElement.click();
  
    // Verify the error alert message
    const alertDiv = document.querySelector("#assignFormMessage");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.textContent).toContain("Please select at least one group to assign!");
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");
  
    // Verify the modal remains open
    expect(modal.classList.contains("hidden")).toBe(false);
  
    // Verify that the roles in local storage have not been modified
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles).toHaveLength(1);
    expect(updatedRoles[0].name).toBe("Management");
    expect(updatedRoles[0].description).toBe("HR");
    expect(updatedRoles[0].groups).toEqual([]);
  });
  
  test("should update the role table with the selected group after assigning to the role and verify local storage", async () => {
    // Mocking a newly created role in local storage
    const roles = [{ name: "Manager", description: "Admin", users: [], groups: [] }];
    const groups = [{ name: "Finance" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function
    updateRoleTable();
  
    // Simulating the 'Assign Groups' button click
    const assignButton = document.querySelector(".assign-groups-btn");
    assignButton.dataset.roleName = "Manager";
    assignButton.click();
  
    // Verify that the modal is visible
    const modal = document.querySelector("#assignModal");
    expect(modal.classList.contains("hidden")).toBe(false);
  
    // Select the group checkbox
    const checkbox = document.querySelector(
      "#selectRoleContainer input[type='checkbox']"
    );
    checkbox.checked = true;
  
    // Simulate assigning the selected group to the role
    const assignSelectedGroupsButton = document.querySelector("#assignSelected");
    assignSelectedGroupsButton.click();
  
    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.textContent).toContain("Groups assigned successfully!");
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");
  
    // Verify the role table is updated
    const roleTableRow = Array.from(document.querySelectorAll(".role-table tbody tr")).find(
      (row) => row.querySelector("td:first-child").textContent === "Manager"
    );
  
    expect(roleTableRow).not.toBeNull();
  
    const groupsCell = roleTableRow.querySelector("td:nth-child(4)"); // Assuming Groups column is the 4th column
    expect(groupsCell.textContent).toContain("Finance");
  
    // Verify that the group is added in local storage
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    const newRole = updatedRoles.find((role) => role.name === "Manager");
    expect(newRole).not.toBeNull();
    expect(newRole.groups).toContain("Finance");
  });
  
  test("should update the role table with the new group after assigning to a role that already has groups", async () => {
    // Mocking a role with groups in local storage
    const roles = [{ name: "Admin", description: "Manager", users: [], groups: ["Marketing"] }];
    const groups = [{ name: "Marketing" }, { name: "Sales" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function
    updateRoleTable();
  
    // Simulate the 'Assign Groups' button click
    const assignButton = document.querySelector(".assign-groups-btn");
    assignButton.dataset.roleName = "Admin";
    assignButton.click();
  
    // Verify that the modal is visible
    const modal = document.querySelector("#assignModal");
    expect(modal.classList.contains("hidden")).toBe(false);
  
    // Select the new group checkbox
    const checkbox = document.querySelector(
      "#selectRoleContainer input[type='checkbox'][value='Sales']"
    );
    checkbox.checked = true;
  
    // Simulate assigning the selected group to the role
    const assignSelectedGroupsButton = document.querySelector("#assignSelected");
    assignSelectedGroupsButton.click();
  
    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.textContent).toContain("Groups assigned successfully!");
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe("");
  
    // Verify the role table is updated correctly in the UI
    const roleTableRow = Array.from(document.querySelectorAll(".role-table tbody tr")).find(
      (row) => row.querySelector("td:first-child").textContent === "Admin"
    );
  
    expect(roleTableRow).not.toBeNull();
  
    const groupsCell = roleTableRow.querySelector("td:nth-child(4)");
    expect(groupsCell.textContent).toContain("Marketing");
    expect(groupsCell.textContent).toContain("Sales");
  
    // Verify that local storage is updated correctly
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    const adminRole = updatedRoles.find((role) => role.name === "Admin");
  
    expect(adminRole).not.toBeUndefined();
    expect(adminRole.groups).toContain("Marketing");
    expect(adminRole.groups).toContain("Sales");
  });
  
  test("should display an alert if all groups are already assigned to the role", async () => {
    // Mocking roles and groups in local storage
    const roles = [{ name: "Manager", description: "Admin", users: [], groups: ["Developers"] }];
    const groups = [{ name: "Developers" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function
    updateRoleTable();
  
    // Simulate opening the 'Assign Groups' modal
    const assignButton = document.querySelector(".assign-groups-btn");
    assignButton.dataset.roleName = "Manager";
    assignButton.click();
  
    await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay to ensure UI updates
  
    // Verify that the alert is displayed
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.innerHTML).toContain(
      '<i class="fa-solid fa-exclamation-circle"></i> All groups are already assigned to this role!'
    );
  
    // Ensure the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent.trim()).toBe("");
  
    // Ensure modal is not displayed
    const modal = document.querySelector("#assignModal");
    expect(modal.classList.contains("hidden")).toBe(true);
  });
  
  test("should open the 'Remove Groups from Role' modal correctly and handle its functionalities", async () => {
    // Setup initial role and group data in localStorage
    const roles = [
      {
        name: "Developer",
        description: "Develops software",
        users: [],
        groups: ["backend"], // Group to be removed
      },
      { name: "Tester", description: "Tests software", users: [], groups: [] },
    ];
    const groups = [{ name: "backend", description: "Backend team" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Call the function to update the role table to ensure the button is present
    updateRoleTable();
  
    // Retrieve the button and modal
    const removeGroupsButton = document.querySelector(".remove-groups-btn");
    const modal = document.querySelector("#assignModal");
  
    // Ensure the button exists before clicking
    expect(removeGroupsButton).not.toBeNull();
  
    // Open the modal for the 'Developer' role
    expect(removeGroupsButton.dataset.roleName).toBe("Developer");
    removeGroupsButton.click();
  
    expect(modal.classList.contains("hidden")).toBe(false);
  
    // Check modal attributes
    const modalHead = document.querySelector("#assignModal .modal-head");
    const modalHeading = document.querySelector("#assignModalHeading");
    const closeIcon = document.querySelector("#closeAssignModal");
    expect(modalHead).toBeTruthy();
    expect(modalHeading.textContent).toContain(
      "REMOVE GROUPS FROM ROLE: Developer"
    );
    expect(closeIcon).not.toBeNull();
  
    // Check form presence and fields
    const form = document.querySelector("#assignForm");
    expect(form).toBeTruthy();
  
    const selectGroupsContainer = document.querySelector(
      "#selectRoleContainer"
    );
    expect(selectGroupsContainer).toBeTruthy();
  
    const label = document.querySelector("#assignLabel");
    expect(label).not.toBeNull();
    expect(label.innerHTML.replace(/\s+/g, "")).toContain(
      '<sup><i class="fa fa-asterisk" style="font-size:10px;color:red"></i></sup>'.replace(
        /\s+/g,
        ""
      )
    );
    expect(label.textContent.trim()).toContain("REMOVE GROUPS :");
  
    const removeGroupsButtonElement = document.querySelector("#removeSelected");
    const assignGroupsButtonElement = document.querySelector("#assignSelected");
  
    expect(removeGroupsButtonElement).toBeTruthy();
    expect(removeGroupsButtonElement.textContent).toContain("Remove");
    expect(removeGroupsButtonElement.disabled).toBeFalsy();
    expect(assignGroupsButtonElement).toBeTruthy();
    expect(assignGroupsButtonElement.textContent).toContain("Assign");
    expect(assignGroupsButtonElement.style.display).toBe("none");
  
    // Verify that the available groups are displayed as checkboxes
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBe(1);
    expect(checkboxes[0].value).toBe("backend");
  
    // Verify the correct group name is displayed next to the checkbox
    const groupNameText =
      checkboxes[0].parentElement.querySelector("span").textContent;
    expect(groupNameText).toBe("backend");
  
    // Close the modal
    const closeModalButton = document.querySelector("#closeAssignModal");
    expect(closeModalButton).toBeTruthy();
    closeModalButton.click();
  
    // Verify that the modal is hidden
    expect(modal.classList.contains("hidden")).toBe(true);
  });
  
  test("should display an alert when the 'Remove Groups' button is clicked without selecting any group", async () => {
    // Mocking a role with groups in local storage
    const roles = [
      { name: "Developer", description: "TDD", users: [], groups: ["backend"] },
    ];
    const groups = [{ name: "backend", description: "Backend team" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function
    updateRoleTable();
  
    // Open the Remove Groups modal
    const removeGroupsButton = document.querySelector(".remove-groups-btn");
    removeGroupsButton.click();
  
    // Click the Remove Groups button in the modal without selecting any checkboxes
    const removeGroupsButtonElement = document.querySelector("#removeSelected");
    expect(removeGroupsButtonElement).not.toBeNull();
    removeGroupsButtonElement.click();
  
    // Verify the error alert message
    const alertDiv = document.querySelector("#assignFormMessage");
    expect(alertDiv).not.toBeNull();
    expect(alertDiv.textContent).toContain(
      "Please select at least one group to remove!"
    );
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared
  
    // Verify the modal remains open
    const modal = document.querySelector("#assignModal");
    expect(modal).not.toBeNull();
  
    // Verify that no changes are made to the role table
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );
    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists
  
    const groupsCell = roleTableRow.querySelector("td:nth-child(4)");
    expect(groupsCell.textContent).toContain("backend"); // Ensure no groups are removed
  });
  
  test("should update the role table and local storage after removing a group from the role", async () => {
    // Mocking a role with groups in local storage
    const roles = [
      { name: "Developer", description: "Unity", users: [], groups: ["backend"] },
    ];
    const groups = [{ name: "backend", description: "Backend team" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();
  
    // Open the Remove Groups modal
    const removeGroupsButton = document.querySelector(".remove-groups-btn");
    removeGroupsButton.click();
  
    // Select the checkbox for Group 'backend'
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBeGreaterThan(0); // Ensure there are checkboxes
    const checkboxElement = Array.from(checkboxes).find(
      (checkbox) => checkbox.value === "backend"
    );
    expect(checkboxElement).not.toBeUndefined(); // Ensure the checkbox is found
    checkboxElement.click();
  
    // Click the Remove button in the modal
    const removeGroupsButtonElement = document.querySelector("#removeSelected");
    expect(removeGroupsButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeGroupsButtonElement.click();
  
    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Groups removed successfully!");
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared
  
    // Verify the role table is updated
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );
  
    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists
  
    const groupsCell = roleTableRow.querySelector("td:nth-child(4)");
    expect(groupsCell.textContent).toBe("No groups assigned"); // Verify 'No groups present' is displayed
    expect(groupsCell.textContent).not.toContain("backend"); // Verify Group is removed from the table
  
    // Verify local storage updates
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles).not.toBeNull();
    const role = updatedRoles.find((role) => role.name === "Developer");
    expect(role).not.toBeNull();
    expect(role.groups).not.toContain("backend"); // Verify Group is removed from the role
  });
  
  test("should display an alert and update the table when the last group is removed from the role", async () => {
    // Mocking a role with a single group in local storage
    const roles = [
      { name: "Developer", description: "Unity", users: [], groups: ["backend"] },
    ];
    const groups = [{ name: "backend", description: "Backend team" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();
  
    // Open the Remove Groups modal
    const removeGroupsButton = document.querySelector(".remove-groups-btn");
    removeGroupsButton.click();
  
    // Select the checkbox for Group 'backend'
    const checkboxes = document.querySelectorAll(
      "#selectRoleContainer input[type='checkbox']"
    );
    expect(checkboxes.length).toBeGreaterThan(0); // Ensure there are checkboxes
    const checkboxElement = Array.from(checkboxes).find(
      (checkbox) => checkbox.value === "backend"
    );
    expect(checkboxElement).not.toBeUndefined(); // Ensure the checkbox is found
    checkboxElement.click();
  
    // Click the Remove button in the modal
    const removeGroupsButtonElement = document.querySelector("#removeSelected");
    expect(removeGroupsButtonElement).not.toBeNull(); // Ensure the Remove button is present
    removeGroupsButtonElement.click();
  
    // Verify the success alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain("Groups removed successfully!");
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared
  
    // Verify the role table is updated
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );
  
    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists
  
    const groupsCell = roleTableRow.querySelector("td:nth-child(4)");
    expect(groupsCell.textContent).toBe("No groups assigned"); // Verify 'No groups present' is displayed
    expect(groupsCell.textContent).not.toContain("backend"); // Verify Group is removed from the table
  
    // Verify local storage updates
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles).not.toBeNull();
    const role = updatedRoles.find((role) => role.name === "Developer");
    expect(role).not.toBeNull();
    expect(role.groups).not.toContain("backend"); // Verify Group is removed from the role
  });
  
  test("should display an alert and not update the role table if no groups are left to remove", async () => {
    // Mocking a role with no groups in local storage
    const roles = [
      { name: "Developer", description: "Unity", users: [], groups: [] },
    ];
    const groups = [{ name: "backend", description: "Backend Team" }];
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("groups", JSON.stringify(groups));
  
    // Simulate table update function (ensure this updates the table as needed)
    updateRoleTable();
  
    // Open the Remove Groups modal
    const removeGroupsButton = document.querySelector(".remove-groups-btn");
    removeGroupsButton.click();
  
    // Verify the error alert message
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv).not.toBeNull(); // Ensure the alert div exists
    expect(alertDiv.textContent).toContain(
      "No groups to remove from this role!"
    );
  
    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); // The alert message should be cleared
  
    // Verify the role table remains unchanged
    const roleTableRow = Array.from(
      document.querySelectorAll(".role-table tbody tr")
    ).find(
      (row) => row.querySelector("td:first-child").textContent === "Developer"
    );
  
    expect(roleTableRow).not.toBeNull(); // Ensure that the row exists
  
    const groupsCell = roleTableRow.querySelector("td:nth-child(4)");
    expect(groupsCell.textContent).toBe("No groups assigned"); // Verify that no groups are displayed
  });
  
  test("should delete the role when the user confirms the deletion", async() => {
    // Setup initial roles in localStorage
    const roles = [
      {
        name: "Developer",
        description: "Develops software",
        users: [],
        groups: [],
      },
      { name: "Tester", description: "Tests software", users: [], groups: [] },
    ];
    localStorage.setItem("roles", JSON.stringify(roles));

    // Spy on window.confirm and return true to simulate a user confirming the deletion
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValueOnce(true);

    // Call updateRoleTable to render buttons
    updateRoleTable();

    // Get the delete button for the Developer role
    const deleteButton = document.querySelector(
      ".delete-role-btn[data-role-name='Developer']"
    );
    expect(deleteButton).not.toBeNull();

    // Click the delete button
    deleteButton.click();

    // Ensure confirm was called with the correct message
    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete the role: Developer?"
    );

    // Check that the role was deleted from localStorage
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles.length).toBe(1);
    expect(updatedRoles[0].name).toBe("Tester");

    // Check that the table was updated to reflect the deletion
    const roleRows = document.querySelectorAll("#roleTable tbody tr");
    expect(roleRows.length).toBe(1);
    expect(roleRows[0].querySelector("td:first-child").textContent).toBe(
      "Tester"
    );

    // Check that the alert message is displayed correctly
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv.style.display).toBe("block");
    expect(alertDiv.textContent).toContain("Role deleted successfully!");

    // Verify that the alert message disappears after a specified time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(alertDiv.textContent).toBe(""); 

    // Restore the original confirm method
    confirmSpy.mockRestore();
  });

  test("should not delete the role when the user cancels the deletion", () => {
    // Setup initial roles in localStorage
    const roles = [
      {
        name: "Developer",
        description: "Develops software",
        users: [],
        groups: [],
      },
      { name: "Tester", description: "Tests software", users: [], groups: [] },
    ];
    localStorage.setItem("roles", JSON.stringify(roles));

    // Spy on window.confirm and return false to simulate a user canceling the deletion
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValueOnce(false);

    // Call updateRoleTable to render buttons
    updateRoleTable();

    // Get the delete button for the Developer role
    const deleteButton = document.querySelector(
      ".delete-role-btn[data-role-name='Developer']"
    );
    expect(deleteButton).not.toBeNull();

    // Click the delete button
    deleteButton.click();

    // Ensure confirm was called with the correct message
    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete the role: Developer?"
    );

    // Check that the role was not deleted from localStorage
    const updatedRoles = JSON.parse(localStorage.getItem("roles"));
    expect(updatedRoles.length).toBe(2);
    expect(updatedRoles.some((role) => role.name === "Developer")).toBe(true);

    // Check that the table still has both roles displayed
    const roleRows = document.querySelectorAll("#roleTable tbody tr");
    expect(roleRows.length).toBe(2);
    expect(roleRows[0].querySelector("td:first-child").textContent).toBe(
      "Developer"
    );
    expect(roleRows[1].querySelector("td:first-child").textContent).toBe(
      "Tester"
    );

    // Check that no alert message is shown since the deletion was canceled
    const alertDiv = document.querySelector(".add-role .alert");
    expect(alertDiv.textContent).toBe("");

    // Restore the original confirm method
    confirmSpy.mockRestore();
  });
  
});