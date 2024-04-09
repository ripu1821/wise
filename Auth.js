var signInButton = document.getElementById("signInBtn");
var signOutButton = document.getElementById("signOutBtn");
var username = document.getElementById("username");
var pass = document.getElementById("password");
var addEmployeeBtn = document.getElementById("addEmployeeBtn");
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwa3Jlc2hya3RvZ3VxdndsYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI1NzU3ODIsImV4cCI6MjAyODE1MTc4Mn0.AD5Oh1ya3N_r6LumXEEjhqZj72nTbyWftReAmZNEO4s";
const supabaseUrl = "https://bpkreshrktoguqvwlaii.supabase.co";
const database = supabase.createClient(supabaseUrl, supabaseKey);
const { auth } = database;

// signig in the user
signInButton.addEventListener("click", async () => {
  // const email = 'codingwizardsolution@gmail.com';
  // const password = 'Direct@portal29';

  const email = username.value;
  const password = pass.value;

  try {
    const { data, error } = await auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error("Error signing in:", error.message);
      alert("Invalid email or password.");
    } else {
      console.log("User signed in successfully:", data?.user);
      console.log("Session:", data?.session);
      if (data?.user && data?.session) {
        localStorage.setItem("isLoggedIn", "true");
        document.getElementById("signOutBtn").style.display = "block";
        updateContentVisibility();
      }
    }
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
});

// signing out the user
signOutButton.addEventListener("click", async () => {
  try {
    const { error } = await auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out successfully");
      window.location.href = "os-admin.html";
      localStorage.removeItem("isLoggedIn");
      updateContentVisibility();
      document.getElementById("signOutBtn").style.display = "none";
      alert("Logged out successfully.");
    }
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
});

// Function to check if the user is authenticated
function isAuthenticated() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// Function to show/hide content based on authentication status
function updateContentVisibility() {
  if (isAuthenticated()) {
    document.getElementById("content").style.display = "block";
    document.getElementById("loginFormdiv").style.display = "none";
  } else {
    document.getElementById("content").style.display = "none";
    document.getElementById("loginFormdiv").style.display = "block";
  }
}

// Initial setup: Update content visibility based on authentication status
updateContentVisibility();
async function addEmployee(name, role) {
  try {
    const { error } = await database.from("employee").insert([{ name, role }]);
    if (error) {
      console.error("Error adding employee:", error.message);
      return null;
    }
    const { data, error: fetchError } = await database
      .from("employee")
      .select("*")
      .eq("name", name)
      .single();

    if (fetchError) {
      console.error("Error fetching employee data:", fetchError.message);
      return null;
    }
    console.log("Employee added successfully:", data);
    return data;
  } catch (error) {
    console.error("Error adding employee:", error.message);
    return null;
  }
}

// Add event listener for Add Employee button
addEmployeeBtn.addEventListener("click", async () => {
  const name = document.getElementById("employeeName").value;
  const role = document.getElementById("employeeRole").value;
  if (!name || !role) {
    alert("Please enter employee name and role.");
    return;
  }
  const result = await addEmployee(name, role);
  console.log("result", result);
  if (result) {
    alert("Employee added successfully.");
    displayEmployees();
  } else {
    alert("Failed to add employee.");
  }
});

async function getEmployees() {
  try {
    const { data, error } = await database.from("employee").select("*");

    if (error) {
      console.error("Error getting employees:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting employees:", error.message);
    return null;
  }
}

async function displayEmployees() {
  const employees = await getEmployees();
  if (employees) {
    const employeeTableBody = document.getElementById("employeeTableBody");
    employeeTableBody.innerHTML = "";

    employees.forEach((employee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>
          <div class="row justify-content-center">
              <div class="col-lg-6 col-md-6 col-sm-12 text-center">
                  <div class="employee-card">
                      <img src="img/employee.jpg" alt="Employee Image">
                      <h3>${employee.name}</h3>
                      <h4>${employee.role}</h4>
                      <button class="edit-btn" data-id="${employee.id}">Edit</button>
                      <button class="delete-btn" data-id="${employee.id}">Delete</button>
                  </div>
              </div>
          </div>
      </td>
  `;

      employeeTableBody.appendChild(row);
    });
  } else {
    console.log("Failed to retrieve employee data.");
  }
}
// Call displayEmployees function to initially populate the employee list
displayEmployees();

document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const employeeId = event.target.dataset.id;
    const confirmation = confirm(
      "Are you sure you want to delete this employee?"
    );
    if (confirmation) {
      const success = await deleteEmployee(employeeId);
      if (success) {
        const employeeCard = document.getElementById(`employee-${employeeId}`);
        if (employeeCard) {
          employeeCard.remove();
        }
        alert("Employee deleted successfully.");
        displayEmployees();
      } else {
        alert("Failed to delete employee.");
      }
    }
  }
});

async function deleteEmployee(id) {
  try {
    const { error } = await database.from("employee").delete().eq("id", id);
    if (error) {
      console.error("Error deleting employee:", error.message);
      return false;
    }
    console.log("Employee deleted successfully.");
    return true;
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    return false;
  }
}

// Get the modal
const modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("edit-btn")) {
    const employeeId = event.target.dataset.id;
    const employee = await getEmployeeById(employeeId);
    if (employee) {
      document.getElementById("name").value = employee.name;
      document.getElementById("role").value = employee.role;
      modal.style.display = "block";

      // When the user clicks on <span> (x), close the modal
      span.onclick = function () {
        modal.style.display = "none";
      };

      // Update the employee when the update button is clicked
      document.getElementById("updateBtn").onclick = async function () {
        const name = document.getElementById("name").value;
        const role = document.getElementById("role").value;
        if (name && role) {
          const success = await updateEmployee(employeeId, name, role);
          if (success) {
            alert("Employee updated successfully.");
            displayEmployees();
            modal.style.display = "none";
          } else {
            alert("Failed to update employee.");
          }
        } else {
          alert("Please enter both name and role.");
        }
      };
    } else {
      alert("Employee not found.");
    }
  }
});

async function getEmployeeById(id) {
  try {
    const { data, error } = await database
      .from("employee")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting employee:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting employee:", error.message);
    return null;
  }
}

async function updateEmployee(id, name, role) {
  try {
    const { error } = await database
      .from("employee")
      .update({ name, role })
      .eq("id", id);

    if (error) {
      console.error("Error updating employee:", error.message);
      return false;
    }

    console.log("Employee updated successfully.");
    return true;
  } catch (error) {
    console.error("Error updating employee:", error.message);
    return false;
  }
}

async function employeeList() {
  try {
    const { data, error } = await database.from("employee").select("*");

    if (error) {
      console.error("Error getting employees:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting employees:", error.message);
    return null;
  }
}

async function displayEmployeeList() {
  const employees = await getEmployees();
  if (employees) {
    const employeeTableBody = document.getElementById("employeeList");
    employeeTableBody.innerHTML = "";

    employees.forEach((employee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
            <div class="row justify-content-center">
                <div class="col-lg-6 col-md-6 col-sm-12 text-center">
                    <div class="employee-card">
                        <img src="img/employee.jpg" alt="Employee Image">
                        <h3>${employee.name}</h3>
                        <h4>${employee.role}</h4>
                    </div>
                </div>
            </div>
        </td>
    `;

      employeeTableBody.appendChild(row);
    });
  } else {
    console.log("Failed to retrieve employee data.");
  }
}
// Call displayEmployees function to initially populate the employee list
displayEmployeeList();
