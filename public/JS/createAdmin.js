async function createAdmin() {
  try {
    const res = await fetch("/api/auth/create-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Admin",
        email: "envaclothings@gmail.com",
        password: "Enva@123",
        role: "admin"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create admin");
      return;
    }

    alert("✅ Admin created successfully");
    console.log(data);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
