let users = JSON.parse(localStorage.getItem("users")) || [];
let editingUserId = null; // Variable to track the ID of the user being edited

// Show or hide content based on the selected tab
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    const tabId = this.dataset.tabId;
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.toggle("hidden", section.id !== tabId);
    });
  });
});

// Toggle sidebar visibility
document.querySelector(".toggle-btn").addEventListener("click", function () {
  document.querySelector(".sidebar").classList.toggle("closed");
  document.querySelector("#main").classList.toggle("expanded");
});

// Add an event listener to the "CREATE USER" button
document.querySelector(".create-btn button").addEventListener("click", () => {
  const modal = document.querySelector("#userModal");
  modal.classList.remove("hidden");
  document.querySelector("#userModalHeading").textContent = "CREATE USER";
  document.querySelector("#addUser").textContent = "Add User";
  editingUserId = null; // Reset editingUserId to null
  document.querySelector("#addUserForm").reset(); // Reset form fields
});

// Close modal
document
  .querySelector("#closeUserModal")
  .addEventListener("click", function () {
    const modal = document.querySelector("#userModal");
    modal.classList.add("hidden");
    editingUserId = null; // Reset editingUserId to null
  });

// Handle the add/edit user form submission
document.querySelector("#addUser").addEventListener("click", function (event) {
  event.preventDefault();

  const username = document.querySelector("#username").value.trim();
  const email = document.querySelector("#email").value.trim();
  const firstName = document.querySelector("#firstname").value.trim();
  const lastName = document.querySelector("#lastname").value.trim();
  const formMessage = document.querySelector("#userFormMessage");
  const modal = document.querySelector("#userModal");

  // Validation
  if (!username || !email || !firstName || !lastName) {
    formMessage.innerHTML =
      '<i class="fa-solid fa-exclamation-circle"></i>  All fields are required.';
    formMessage.style.color = "#dc3545"; // Error message color
    setTimeout(() => (formMessage.textContent = ""), 2000); // Hide message after 2 seconds
    return;
  }

  // Check if email already exists (exclude current user if editing)
  const emailExists = users.some(
    (user) => user.email === email && user.id !== editingUserId
  );
  if (emailExists) {
    formMessage.innerHTML =
      '<i class="fa-solid fa-exclamation-circle"></i>  Email already exists.';
    formMessage.style.color = "#dc3545"; // Error message color
    setTimeout(() => (formMessage.textContent = ""), 2000); // Hide message after 2 seconds
    return;
  }

  // Check if username already exists (exclude current user if editing)
  const usernameExists = users.some(
    (user) => user.username === username && user.id !== editingUserId
  );
  if (usernameExists) {
    formMessage.innerHTML =
      '<i class="fa-solid fa-exclamation-circle"></i>  Username already exists.';
    formMessage.style.color = "#dc3545"; // Error message color
    setTimeout(() => (formMessage.textContent = ""), 2000); // Hide message after 2 seconds
    return;
  }

  if (editingUserId === null) {
    // Add new user (ID will be generated based on the array index)
    const newUser = {
      id: users.length + 1, // Sequential ID
      username,
      email,
      firstName,
      lastName,
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Show success message and hide modal
    const alertDiv = document.querySelector(".alert");
    alertDiv.innerHTML =
      '<i class="fa-solid fa-check-circle"></i>  User added successfully!';
    alertDiv.style.color = "#28a745"; // Success message color
    setTimeout(() => (alertDiv.textContent = ""), 2000); // Hide alert message after 2 seconds

    // Hide modal and update table
    setTimeout(() => {
      modal.classList.add("hidden");
      updateUserTable(); // Update the user table
    }, 0); // Modal disappears after 0 seconds
  } else {
    // Update existing user
    const userIndex = users.findIndex((user) => user.id === editingUserId);
    if (userIndex !== -1) {
      users[userIndex] = {
        id: editingUserId,
        username,
        email,
        firstName,
        lastName,
      };
      localStorage.setItem("users", JSON.stringify(users));

      // Show success message and hide modal
      const alertDiv = document.querySelector(".alert");
      alertDiv.innerHTML =
        '<i class="fa-solid fa-check-circle"></i>  User updated successfully!';
      alertDiv.style.color = "#28a745"; // Success message color
      setTimeout(() => (alertDiv.textContent = ""), 2000); // Hide alert message after 2 seconds

      // Hide modal and update table
      setTimeout(() => {
        modal.classList.add("hidden");
        updateUserTable(); // Update the user table
      }, 0); // Modal disappears after 0 seconds
    }
  }

  // Reset the form and editingUserId
  addUserForm.reset();
  editingUserId = null;
});

// Handle the reset form button click
document.querySelector("#resetUserForm").addEventListener("click", function () {
  document.querySelector("#addUserForm").reset(); // Reset the form fields
  document.querySelector("#userFormMessage").textContent = ""; // Clear any form messages
});

function updateUserTable() {
  const tbody = document.querySelector(".user-table tbody");
  tbody.innerHTML = ""; // Clear existing table rows

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td class="no-users" colspan="6">No users found</td></tr>';
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${user.id}</td> <!-- Sequential ID -->
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>
                <div class="actions">
                    <button class="edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i><span>Edit</span></button>
                    <button class="delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i><span>Delete</span></button>
                </div>
            </td>
        `;

    tbody.appendChild(row);
  });

  // Reattach event listeners
  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const userId = parseInt(this.dataset.id);
      const user = users.find((user) => user.id === userId);

      if (user) {
        // Pre-fill form fields with the user's details
        document.querySelector("#username").value = user.username;
        document.querySelector("#email").value = user.email;
        document.querySelector("#firstname").value = user.firstName;
        document.querySelector("#lastname").value = user.lastName;

        // Set modal heading and button text for editing
        document.querySelector("#userModalHeading").textContent = "UPDATE USER";
        document.querySelector("#addUser").textContent = "Update User";

        // Show the modal
        document.querySelector("#userModal").classList.remove("hidden");

        // Store the ID of the user being edited
        editingUserId = userId;
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const userId = parseInt(this.dataset.id);
      if (confirm("Are you sure you want to delete this user?")) {
        // Remove the user
        users = users.filter((user) => user.id !== userId);
        renumberUsers(); // Ensure sequential numbering
        localStorage.setItem("users", JSON.stringify(users));

        // Show success message
        const alertDiv = document.querySelector(".alert");
        alertDiv.innerHTML =
          '<i class="fa-solid fa-check-circle"></i>  User deleted successfully!';
        alertDiv.style.color = "#28a745"; // Success message color
        setTimeout(() => (alertDiv.textContent = ""), 2000); // Hide alert message after 2 seconds

        updateUserTable();
        updateGroupTable();
      }
    });
  });
}

// Renumber users to maintain sequential IDs
function renumberUsers() {
  users = users.map((user, index) => ({ ...user, id: index + 1 }));
}

// Handle the creation of a new group
document
  .querySelector("#createGroupBtn")
  .addEventListener("click", function () {
    document.querySelector("#groupModalHeading").textContent = "CREATE GROUP";
    document.querySelector("#groupName").value = "";
    document.querySelector("#groupFormMessage").textContent = "";
    document.querySelector("#groupModal").classList.remove("hidden");
  });

// Close the group modal
document
  .querySelector("#closeGroupModal")
  .addEventListener("click", function () {
    document.querySelector("#groupModal").classList.add("hidden");
  });

// Handle create group form submission
document
  .querySelector("#createGroupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const groupName = document.querySelector("#groupName").value.trim();
    const groupFormMessage = document.querySelector("#groupFormMessage");
    groupFormMessage.textContent = "";

    let groups = JSON.parse(localStorage.getItem("groups")) || [];

    if (!groupName) {
      groupFormMessage.innerHTML =
        '<i class="fa-solid fa-exclamation-circle"></i>  Group name is required.';
      groupFormMessage.style.color = "#dc3545";
      setTimeout(() => (groupFormMessage.textContent = ""), 2000);
      return;
    }

    if (groups.some((group) => group.name === groupName)) {
      groupFormMessage.innerHTML =
        '<i class="fa-solid fa-exclamation-circle"></i>  Group name already exists.';
      groupFormMessage.style.color = "#dc3545";
      setTimeout(() => (groupFormMessage.textContent = ""), 2000);
      return;
    }

    const newGroup = {
      name: groupName,
      users: [],
    };
    groups.push(newGroup);
    localStorage.setItem("groups", JSON.stringify(groups));

    const alertDiv = document.querySelector(".add-group .alert");
    alertDiv.innerHTML =
      '<i class="fa-solid fa-check-circle"></i>  Group created successfully!';
    alertDiv.style.color = "#28a745";
    setTimeout(() => (alertDiv.textContent = ""), 2000);

    document.querySelector("#groupModal").classList.add("hidden");
    updateGroupTable();
  });

function updateGroupTable() {
  const tbody = document.querySelector(".group-table tbody");
  tbody.innerHTML = "";

  // Load groups and users from local storage
  const groups = JSON.parse(localStorage.getItem("groups")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (groups.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="no-groups">No groups found</td></tr>';
    return;
  }

  groups.forEach((group) => {
    const row = document.createElement("tr");

    // Map user email IDs to their names for display
    const userNames = group.users
      .map((userEmail) => {
        const user = users.find((user) => user.email === userEmail);
        return user ? `${user.username}` : null;
      })
      .filter((name) => name !== null); // Filter out any null values

    row.innerHTML = `
        <td>${group.name}</td>
        <td>${
          userNames.length > 0 ? userNames.join(", ") : "No users present"
        }</td>
        <td >
        <div class="actions">
          <button class="add-users-btn" data-group-name="${
            group.name
          }"><i class="fas fa-user-plus"></i>
Add Users</button>
          <button class="remove-users-btn" data-group-name="${
            group.name
          }"><i class="fas fa-user-minus"></i>
Remove Users</button>
          <button class="delete-group-btn" data-group-name="${
            group.name
          }"><i class="fas fa-trash-alt"></i>
Delete Group</button>
        </div>
        </td>
      `;
    tbody.appendChild(row);
  });

  // Re-attach event listeners to the buttons after updating the table
  attachGroupEventListeners();
}

function attachGroupEventListeners() {
  document.querySelectorAll(".add-users-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const groupName = this.dataset.groupName;
      document.querySelector("#addUsersModalHeading").textContent =
        "ADD USERS TO GROUP: " + groupName;
      document.querySelector("#addUsersFormMessage").textContent = "";
      document.querySelector("#removeSelectedUsers").style.display = "none"; // Hide Remove button
      document.querySelector("#addSelectedUsers").style.display = "inline"; // Show Add button

      const userSelectContainer = document.querySelector(
        "#selectUsersContainer"
      );
      userSelectContainer.innerHTML = ""; // Clear previous checkboxes

      // Load users from local storage
      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

      // Load the group to get its current users
      const groups = JSON.parse(localStorage.getItem("groups")) || [];
      const group = groups.find((group) => group.name === groupName);

      // Display checkboxes for users not already in the group
      const existingUserEmails = group.users || [];
      const additionalUsers = storedUsers.filter(
        (user) => !existingUserEmails.includes(user.email)
      );

      if (additionalUsers.length === 0) {
        const alertDiv = document.querySelector(".add-group .alert");
        alertDiv.innerHTML =
          '<i class="fa-solid fa-exclamation-circle"></i> All users are already added to this group!';
        alertDiv.style.color = "#dc3545";
        setTimeout(() => (alertDiv.textContent = ""), 2000);
        return;
      }

      additionalUsers.forEach((user) => {
        const checkboxContainer = document.createElement("div");
        checkboxContainer.classList.add("checkboxContainer");
        checkboxContainer.innerHTML = `<div class="listItem"><span>${user.username}</span>
            <input type="checkbox" value="${user.email}" /></div>
        `;
        userSelectContainer.appendChild(checkboxContainer);
      });

      document.querySelector("#addUsersModal").classList.remove("hidden");
      document
        .querySelector("#addSelectedUsers")
        .setAttribute("data-group-name", groupName);
    });
  });

  document.querySelectorAll(".remove-users-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const groupName = this.dataset.groupName;
      document.querySelector("#addUsersModalHeading").textContent =
        "REMOVE USERS FROM GROUP: " + groupName;
      document.querySelector("#addUsersFormMessage").textContent = "";
      document.querySelector("#removeSelectedUsers").style.display = "inline"; // Show Remove button
      document.querySelector("#addSelectedUsers").style.display = "none"; // Hide Add button

      const userSelectContainer = document.querySelector(
        "#selectUsersContainer"
      );
      userSelectContainer.innerHTML = ""; // Clear previous checkboxes

      // Load users from local storage
      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

      // Load the group to get its current users
      const groups = JSON.parse(localStorage.getItem("groups")) || [];
      const group = groups.find((group) => group.name === groupName);

      if (group.users.length === 0) {
        const alertDiv = document.querySelector(".add-group .alert");
        alertDiv.innerHTML =
          '<i class="fa-solid fa-exclamation-circle"></i> No users to remove from this group!';
        alertDiv.style.color = "#dc3545";
        setTimeout(() => (alertDiv.textContent = ""), 2000);
        return;
      }

      // Display checkboxes for users in the group
      storedUsers.forEach((user) => {
        if (group.users.includes(user.email)) {
          const checkboxContainer = document.createElement("div");
          checkboxContainer.classList.add("checkboxContainer");
          checkboxContainer.innerHTML = `<div class="listItem"><span>${user.username}</span>
              <input type="checkbox" value="${user.email}" /></div>
          `;
          userSelectContainer.appendChild(checkboxContainer);
        }
      });

      document.querySelector("#addUsersModal").classList.remove("hidden");
      document
        .querySelector("#removeSelectedUsers")
        .setAttribute("data-group-name", groupName);
    });
  });

  // Close Add/Remove Users Modal
  document
    .querySelector("#closeAddUsersModal")
    .addEventListener("click", () => {
      document.querySelector("#addUsersModal").classList.add("hidden");
    });

  // Add Selected Users
  document
    .querySelector("#addSelectedUsers")
    .addEventListener("click", function () {
      const selectedUserEmails = Array.from(
        document.querySelectorAll("#selectUsersContainer input:checked")
      ).map((checkbox) => checkbox.value);

      const formMessage = document.querySelector("#addUsersFormMessage");

      if (selectedUserEmails.length === 0) {
        formMessage.innerHTML =
          '<i class="fa-solid fa-exclamation-circle"></i> Please select at least one user to add!';
        formMessage.style.color = "#dc3545"; // Same color as alertDiv
        setTimeout(() => (formMessage.textContent = ""), 2000);
        return;
      }

      const groupName = this.dataset.groupName;

      // Load groups from local storage
      let groups = JSON.parse(localStorage.getItem("groups")) || [];
      const groupIndex = groups.findIndex((group) => group.name === groupName);

      if (groupIndex !== -1) {
        // Update the group's user list with selected users
        const existingUserEmails = groups[groupIndex].users || [];
        groups[groupIndex].users = [
          ...new Set([...existingUserEmails, ...selectedUserEmails]),
        ];
        localStorage.setItem("groups", JSON.stringify(groups));

        // Refresh the group table to show updated users
        updateGroupTable();
        document.querySelector("#addUsersModal").classList.add("hidden");

        const alertDiv = document.querySelector(".add-group .alert");
        alertDiv.innerHTML =
          '<i class="fa-solid fa-check-circle"></i> Users added successfully!';
        alertDiv.style.color = "#28a745";
        setTimeout(() => (alertDiv.textContent = ""), 2000);
      }
    });

  // Remove Selected Users
  document
    .querySelector("#removeSelectedUsers")
    .addEventListener("click", function () {
      const selectedUserEmails = Array.from(
        document.querySelectorAll("#selectUsersContainer input:checked")
      ).map((checkbox) => checkbox.value);

      const formMessage = document.querySelector("#addUsersFormMessage");

      if (selectedUserEmails.length === 0) {
        formMessage.innerHTML =
          '<i class="fa-solid fa-exclamation-circle"></i> Please select at least one user to remove!';
        formMessage.style.color = "#dc3545"; // Same color as alertDiv
        setTimeout(() => (formMessage.textContent = ""), 2000);
        return;
      }

      const groupName = this.dataset.groupName;

      // Load groups from local storage
      let groups = JSON.parse(localStorage.getItem("groups")) || [];
      const groupIndex = groups.findIndex((group) => group.name === groupName);

      if (groupIndex !== -1) {
        // Update the group's user list by removing selected users
        const existingUserEmails = groups[groupIndex].users || [];
        groups[groupIndex].users = existingUserEmails.filter(
          (email) => !selectedUserEmails.includes(email)
        );
        localStorage.setItem("groups", JSON.stringify(groups));

        // Refresh the group table to show updated users
        updateGroupTable();
        document.querySelector("#addUsersModal").classList.add("hidden");

        const alertDiv = document.querySelector(".add-group .alert");
        alertDiv.innerHTML =
          '<i class="fa-solid fa-check-circle"></i> Users removed successfully!';
        alertDiv.style.color = "#28a745";
        setTimeout(() => (alertDiv.textContent = ""), 2000);
      }
    });

  document.querySelectorAll(".delete-group-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const groupName = this.dataset.groupName;
      if (confirm("Are you sure you want to delete this group?")) {
        let groups = JSON.parse(localStorage.getItem("groups")) || [];
        groups = groups.filter((group) => group.name !== groupName);
        localStorage.setItem("groups", JSON.stringify(groups));
        updateGroupTable();
        const alertDiv = document.querySelector(".add-group .alert");
        alertDiv.innerHTML =
          '<i class="fa-solid fa-check-circle"></i>  Group deleted successfully!';
        alertDiv.style.color = "#28a745";
        setTimeout(() => (alertDiv.textContent = ""), 2000);
      }
    });
  });
}

// Initialize the user and group tables
updateUserTable();
updateGroupTable();

// Handle the creation of a new role
document.querySelector("#createRoleBtn").addEventListener("click", function () {
  document.querySelector("#roleModalHeading").textContent = "CREATE ROLE";
  document.querySelector("#roleName").value = "";
  document.querySelector("#roleDescription").value = "";
  document.querySelector("#roleFormMessage").textContent = "";
  document.querySelector("#roleModal").classList.remove("hidden");
});

// Close the role modal
document
  .querySelector("#closeRoleModal")
  .addEventListener("click", function () {
    document.querySelector("#roleModal").classList.add("hidden");
  });

// Handle create role form submission
document.querySelector("#addRole").addEventListener("click", function () {
  const roleForm = document.querySelector("#createRoleForm");
  roleForm.dispatchEvent(new Event("submit")); // Trigger the form submit event
});

document
  .querySelector("#createRoleForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const roleName = document.querySelector("#roleName").value.trim();
    const roleDescription = document
      .querySelector("#roleDescription")
      .value.trim();
    const roleFormMessage = document.querySelector("#roleFormMessage");
    roleFormMessage.textContent = ""; // Clear any existing messages

    let roles = JSON.parse(localStorage.getItem("roles")) || [];

    // Validate role name
    if (!roleName) {
      roleFormMessage.innerHTML =
        '<i class="fa-solid fa-exclamation-circle"></i>  Role name is required.';
      roleFormMessage.style.color = "#dc3545";
      setTimeout(() => (roleFormMessage.textContent = ""), 2000);
      return; // Stop the submission process if validation fails
    }

    // Validate role description
    if (!roleDescription) {
      roleFormMessage.innerHTML =
        '<i class="fa-solid fa-exclamation-circle"></i>  Description is required.';
      roleFormMessage.style.color = "#dc3545";
      setTimeout(() => (roleFormMessage.textContent = ""), 2000);
      return; // Stop the submission process if validation fails
    }

    // Check for duplicate role name
    if (roles.some((role) => role.name === roleName)) {
      roleFormMessage.innerHTML =
        '<i class="fa-solid fa-exclamation-circle"></i>  Role name already exists!';
      roleFormMessage.style.color = "#dc3545";
      setTimeout(() => (roleFormMessage.textContent = ""), 2000);
      return; // Stop the submission process if validation fails
    }

    // Add the new role
    const newRole = {
      name: roleName,
      description: roleDescription,
      users: [],
      groups: [],
    };
    roles.push(newRole);
    localStorage.setItem("roles", JSON.stringify(roles));

    // Display success message
    const alertDiv = document.querySelector(".add-role .alert");
    alertDiv.innerHTML =
      '<i class="fa-solid fa-check-circle"></i>  Role created successfully!';
    alertDiv.style.color = "#28a745";
    setTimeout(() => (alertDiv.textContent = ""), 2000);

    // Close the modal and update the table
    document.querySelector("#roleModal").classList.add("hidden");
    updateRoleTable();
  });

// Handle reset button
document.querySelector("#resetRoleForm").addEventListener("click", function () {
  document.querySelector("#roleName").value = "";
  document.querySelector("#roleDescription").value = "";
  document.querySelector("#roleFormMessage").textContent = "";
});

function updateRoleTable() {
  const tbody = document.querySelector(".role-table tbody");
  tbody.innerHTML = "";

  // Load roles from local storage
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (roles.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="no-roles">No roles found</td></tr>';
    return;
  }

  roles.forEach((role) => {
    const row = document.createElement("tr");

    row.innerHTML = `
          <td>${role.name}</td>
          <td>${role.description}</td>
          <td>${
            role.users.length > 0 ? role.users.join(", ") : "No users assigned"
          }</td>
          <td>${
            role.groups.length > 0
              ? role.groups.join(", ")
              : "No groups assigned"
          }</td>
          <td>
            <div class="actions">
              <button class="assign-users-btn" data-role-name="${
                role.name
              }"><i class="fas fa-user-plus"></i> Assign Users</button>
              <button class="assign-groups-btn" data-role-name="${
                role.name
              }"><i class="fas fa-users-cog"></i> Assign Groups</button>
              <button class="remove-users-btn" data-role-name="${
                role.name
              }"><i class="fas fa-user-minus"></i> Remove Users</button>
              <button class="remove-groups-btn" data-role-name="${
                role.name
              }"><i class="fas fa-users-slash"></i> Remove Groups</button>
              <button class="delete-role-btn" data-role-name="${
                role.name
              }"><i class="fas fa-trash-alt"></i> Delete Role</button>
            </div>
          </td>
        `;
    tbody.appendChild(row);
  });

  // Re-attach event listeners to the buttons after updating the table
  attachRoleEventListeners();
}

function attachRoleEventListeners() {
  // Common function to update modal content and behavior
  function updateModalContent(
    isAssignAction,
    roleName,
    entityType,
    entityLabel,
    selectContainerId,
    formMessageId,
    assignBtnId,
    removeBtnId
  ) {
    const modalHeading = isAssignAction
      ? `ASSIGN ${entityLabel.toUpperCase()} TO ROLE: ${roleName}`
      : `REMOVE ${entityLabel.toUpperCase()} FROM ROLE: ${roleName}`;

    document.querySelector("#assignModalHeading").textContent = modalHeading;
    document.querySelector(formMessageId).textContent = "";

    // Update the label for selectRoleContainer
    const selectLabel = isAssignAction
      ? `SELECT ${entityLabel.toUpperCase()}`
      : `REMOVE ${entityLabel.toUpperCase()}`;
    document.querySelector(`#assignLabel`).innerHTML =
     `<sup>
    <i class="fa fa-asterisk" style="font-size: 10px; color: red"></i>
  </sup> ${selectLabel} :`;

    // Toggle visibility of buttons
    document.querySelector(removeBtnId).style.display = isAssignAction
      ? "none"
      : "inline";
    document.querySelector(assignBtnId).style.display = isAssignAction
      ? "inline"
      : "none";

    const selectContainer = document.querySelector(selectContainerId);
    selectContainer.innerHTML = ""; // Clear previous checkboxes

    // Load entities from local storage
    const storedEntities = JSON.parse(localStorage.getItem(entityType)) || [];

    // Load the role to get its current users/groups
    const roles = JSON.parse(localStorage.getItem("roles")) || [];
    const role = roles.find((role) => role.name === roleName);
    const existingEntities = role[entityType] || [];

    // Use a consistent property for filtering
    const availableEntities = isAssignAction
      ? storedEntities.filter(
          (entity) => !existingEntities.includes(entity.username || entity.name)
        )
      : storedEntities.filter((entity) =>
          existingEntities.includes(entity.username || entity.name)
        );

    if (availableEntities.length === 0) {
      const alertDiv = document.querySelector(".add-role .alert");
      const alertMessage = isAssignAction
        ? `All ${entityLabel.toLowerCase()} are already assigned to this role!`
        : `No ${entityLabel.toLowerCase()} to remove from this role!`;

      alertDiv.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${alertMessage}`;
      alertDiv.style.color = "#dc3545";
      alertDiv.style.display = "block";
      setTimeout(() => {
        alertDiv.textContent = "";
        alertDiv.style.display = "none";
      }, 2000);
      return;
    }

    availableEntities.forEach((entity) => {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.classList.add("checkboxContainer");
      checkboxContainer.innerHTML = `<div class="listItem"><span>${
        entity.username || entity.name
      }</span>
          <input type="checkbox" value="${
            entity.username || entity.name
          }" /></div>
      `;
      selectContainer.appendChild(checkboxContainer);
    });

    document.querySelector("#assignModal").classList.remove("hidden");
    document
      .querySelector(assignBtnId)
      .setAttribute("data-role-name", roleName);
    document
      .querySelector(removeBtnId)
      .setAttribute("data-role-name", roleName);
  }

  // Event listeners for Assign/Remove Users and Groups
  document.querySelectorAll(".assign-users-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const roleName = this.dataset.roleName;
      updateModalContent(
        true,
        roleName,
        "users",
        "Users",
        "#selectRoleContainer",
        "#assignFormMessage",
        "#assignSelected",
        "#removeSelected"
      );
    });
  });

  document.querySelectorAll(".remove-users-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const roleName = this.dataset.roleName;
      updateModalContent(
        false,
        roleName,
        "users",
        "Users",
        "#selectRoleContainer",
        "#assignFormMessage",
        "#assignSelected",
        "#removeSelected"
      );
    });
  });

  document.querySelectorAll(".assign-groups-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const roleName = this.dataset.roleName;
      updateModalContent(
        true,
        roleName,
        "groups",
        "Groups",
        "#selectRoleContainer",
        "#assignFormMessage",
        "#assignSelected",
        "#removeSelected"
      );
    });
  });

  document.querySelectorAll(".remove-groups-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const roleName = this.dataset.roleName;
      updateModalContent(
        false,
        roleName,
        "groups",
        "Groups",
        "#selectRoleContainer",
        "#assignFormMessage",
        "#assignSelected",
        "#removeSelected"
      );
    });
  });

  // Close Modal
  document.querySelector("#closeAssignModal").addEventListener("click", () => {
    document.querySelector("#assignModal").classList.add("hidden");
  });

  // Assign Selected Users/Groups
  document
    .querySelector("#assignSelected")
    .addEventListener("click", function () {
      const selectedEntities = Array.from(
        document.querySelectorAll("#selectRoleContainer input:checked")
      ).map((checkbox) => checkbox.value);

      const formMessage = document.querySelector("#assignFormMessage");

      if (selectedEntities.length === 0) {
        const entityType = document
          .querySelector("#assignModalHeading")
          .textContent.includes("USERS")
          ? "user"
          : "group";
        formMessage.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> Please select at least one ${entityType} to assign!`;
        formMessage.style.color = "#dc3545";
        setTimeout(() => (formMessage.textContent = ""), 2000);
        return;
      }

      const roleName = this.dataset.roleName;
      const entityType = document
        .querySelector("#assignModalHeading")
        .textContent.includes("USERS")
        ? "users"
        : "groups";

      // Load roles from local storage
      let roles = JSON.parse(localStorage.getItem("roles")) || [];
      const roleIndex = roles.findIndex((role) => role.name === roleName);

      if (roleIndex !== -1) {
        // Update the role's entity list with selected entities
        const existingEntities = roles[roleIndex][entityType] || [];
        roles[roleIndex][entityType] = [
          ...new Set([...existingEntities, ...selectedEntities]),
        ];
        localStorage.setItem("roles", JSON.stringify(roles));

        // Refresh the role table to show updated entities
        updateRoleTable();
        document.querySelector("#assignModal").classList.add("hidden");

        const alertDiv = document.querySelector(".add-role .alert");
        alertDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${
          entityType.charAt(0).toUpperCase() + entityType.slice(1)
        } assigned successfully!`;
        alertDiv.style.color = "#28a745";
        alertDiv.style.display = "block";
        setTimeout(() => {
          alertDiv.textContent = "";
          alertDiv.style.display = "none";
        }, 2000);
      }
    });

  // Remove Selected Users/Groups
  document
    .querySelector("#removeSelected")
    .addEventListener("click", function () {
      const selectedEntities = Array.from(
        document.querySelectorAll("#selectRoleContainer input:checked")
      ).map((checkbox) => checkbox.value);

      const formMessage = document.querySelector("#assignFormMessage");

      if (selectedEntities.length === 0) {
        const entityType = document
          .querySelector("#assignModalHeading")
          .textContent.includes("USERS")
          ? "user"
          : "group";
        formMessage.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> Please select at least one ${entityType} to remove!`;
        formMessage.style.color = "#dc3545";
        setTimeout(() => (formMessage.textContent = ""), 2000);
        return;
      }

      const roleName = this.dataset.roleName;
      const entityType = document
        .querySelector("#assignModalHeading")
        .textContent.includes("USERS")
        ? "users"
        : "groups";

      // Load roles from local storage
      let roles = JSON.parse(localStorage.getItem("roles")) || [];
      const roleIndex = roles.findIndex((role) => role.name === roleName);

      if (roleIndex !== -1) {
        // Update the role's entity list by removing selected entities
        const existingEntities = roles[roleIndex][entityType] || [];
        roles[roleIndex][entityType] = existingEntities.filter(
          (entity) => !selectedEntities.includes(entity)
        );
        localStorage.setItem("roles", JSON.stringify(roles));

        // Refresh the role table to show updated entities
        updateRoleTable();
        document.querySelector("#assignModal").classList.add("hidden");

        const alertDiv = document.querySelector(".add-role .alert");
        alertDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${
          entityType.charAt(0).toUpperCase() + entityType.slice(1)
        } removed successfully!`;
        alertDiv.style.color = "#28a745";
        alertDiv.style.display = "block";
        setTimeout(() => {
          alertDiv.textContent = "";
          alertDiv.style.display = "none";
        }, 2000);
      }
    });

  // Delete Role
  document.querySelectorAll(".delete-role-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const roleName = this.dataset.roleName;

      if (
        window.confirm(`Are you sure you want to delete the role: ${roleName}?`)
      ) {
        let roles = JSON.parse(localStorage.getItem("roles")) || [];
        roles = roles.filter((role) => role.name !== roleName);
        localStorage.setItem("roles", JSON.stringify(roles));

        updateRoleTable();

        const alertDiv = document.querySelector(".add-role .alert");
        alertDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> Role deleted successfully!`;
        alertDiv.style.color = "#28a745";
        alertDiv.style.display = "block";
        setTimeout(() => {
          alertDiv.textContent = "";
          alertDiv.style.display = "none";
        }, 2000);
      }
    });
  });
}

updateUserTable();
updateGroupTable();
updateRoleTable();

module.exports = { updateUserTable, updateGroupTable, updateRoleTable };
