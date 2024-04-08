var signInButton = document.getElementById("signInBtn");
var signOutButton = document.getElementById("signOutBtn");
var username = document.getElementById("username");
var pass = document.getElementById("password");
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
        window.location.href = "admin-employee.html";
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
      localStorage.removeItem("isLoggedIn");
      updateContentVisibility();
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
